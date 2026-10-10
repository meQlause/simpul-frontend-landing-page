import { seeded } from '../../motion/random';
import { HALF, HOPS, PATH, SETTLE, SIM, SPAWN, SPOT, TIME } from './problem.tuning';

// The order's path before the physics takes over, and the questions' settled spots. Everything here is
// a pure function of the scroll, so scrolling back up un-drops the order exactly.

export type Point = readonly [number, number];
export type Pose = [number, number, number]; // x, y and angle
export type Track = (index: number, seconds: number) => Pose | null;

// Where everything sits, in the section's own coordinates. Measured again on every refresh.
export interface Geo {
  width: number;
  height: number;
  entry: Point; // the hero's thread end, where the order comes in
  exit: Point; // the out-anchor, where the slack thread ends
  stops: Point[]; // the four tiles, with the order docked on top of each
  gap: Point; // the hand-off nobody takes: where the order finally lies
  floor: number;
  spawn: Point; // the questions come from the far end of the chain
  order: [number, number];
  sizes: [number, number][]; // each question's width and height
}

export interface Eases {
  inOut: (share: number) => number;
  bounce: (share: number) => number;
  out: (share: number) => number;
}

// Random in a band of `size`, centred on zero.
const wobble = (random: () => number, size: number): number => (random() - HALF) * size;

// When question `index` starts to drop, in scroll units.
export function spawnAt(index: number, phone: boolean): number {
  return SPAWN.first + index * (phone ? SPAWN.phone : SPAWN.desk);
}

// The first move: the order drops from the header onto the dock row, curving.
function drop(geo: Geo, eases: Eases, progress: number): Pose {
  const eased = eases.inOut(progress);
  const [fromLeft, fromTop] = geo.entry;
  const [toLeft, toTop] = geo.stops[0];
  const rest = 1 - eased; // a curve that drops first, then sweeps along the row
  return [
    rest * rest * fromLeft + 2 * rest * eased * fromLeft + eased * eased * toLeft,
    rest * rest * fromTop + 2 * rest * eased * toTop + eased * eased * toTop,
    -PATH.tilt * Math.sin(2 * Math.PI * eased),
  ];
}

interface Leg {
  start: number;
  end: number;
  from: Point;
  to: Point;
}

// Tile to tile, each hand-over a leg. The last leg ends where the hand-off broke.
function legsOf(geo: Geo): Leg[] {
  const [first, second, third] = geo.stops;
  return [
    { start: 1, end: 1, from: first, to: first },
    { start: HOPS[0].from, end: HOPS[0].to, from: first, to: second },
    { start: HOPS[1].from, end: HOPS[1].to, from: second, to: third },
    { start: HOPS[2].from, end: HOPS[2].to, from: third, to: geo.gap },
  ];
}

// After the first move: slides from tile to tile, leaning as it goes, then hangs where the hand-off broke.
function travel(geo: Geo, eases: Eases, progress: number): Pose {
  const leg = legsOf(geo).findLast((item) => progress >= item.start) ?? legsOf(geo)[0];
  const share =
    leg.end > leg.start ? Math.min((progress - leg.start) / (leg.end - leg.start), 1) : 1;
  const eased = eases.inOut(share);
  const lean = -PATH.lean * Math.sin(2 * Math.PI * share) * Math.sign(leg.to[0] - leg.from[0]);
  const hang = Math.max(0, progress - HOPS[2].to);
  const sway = hang ? Math.sin(hang * PATH.wobbleRate) * (1 - hang / (TIME.fall - HOPS[2].to)) : 0;
  return [
    leg.from[0] + (leg.to[0] - leg.from[0]) * eased,
    leg.from[1] + sway * PATH.wobbleLift,
    lean + sway * PATH.wobbleTilt,
  ];
}

// The order before it falls, as a pure function of the scroll.
export function carry(geo: Geo, eases: Eases, progress: number): Pose {
  return progress < 1 ? drop(geo, eases, progress) : travel(geo, eases, progress);
}

// The questions' settled spots: a row from the right edge, leftwards, starting a new row when full.
function spotsOf(geo: Geo, random: () => number): Pose[] {
  const cursor = { x: geo.width - SPOT.edge, y: geo.floor, row: 0 };
  return geo.sizes.map(([width, height]) => {
    if (cursor.x - width < SPOT.edge) {
      cursor.x = geo.width - SPOT.edge - random() * SPOT.jitter;
      cursor.y -= cursor.row * SPOT.rowLift;
      cursor.row = 0;
    }
    const spot: Pose = [cursor.x - width / 2, cursor.y - height / 2, wobble(random, SPOT.tilt)];
    cursor.x -= width + SPOT.gap + random() * SPOT.spread;
    cursor.row = Math.max(cursor.row, height);
    return spot;
  });
}

// Phones, and the moment before Matter.js arrives: the same story, with the questions placed by hand.
export function settle(geo: Geo, eases: Eases, phone: boolean): Track {
  const random = seeded(SIM.seed);
  const spots = spotsOf(geo, random);
  const restY = geo.floor - geo.order[1] / 2;
  return (index, seconds) => {
    if (!index) {
      const landed = Math.min(seconds / SETTLE.order, 1);
      return [
        geo.gap[0],
        geo.gap[1] + (restY - geo.gap[1]) * eases.bounce(landed),
        -SETTLE.lean * landed,
      ];
    }
    const progress = (seconds - spawnAt(index - 1, phone)) / SPAWN.settleFor;
    if (progress < 0) {
      return null;
    }
    const [targetLeft, targetTop, targetAngle] = spots[index - 1];
    const moved = Math.min(progress, 1);
    return [
      geo.spawn[0] + (targetLeft - geo.spawn[0]) * eases.out(moved),
      geo.spawn[1] + (targetTop - geo.spawn[1]) * eases.bounce(moved),
      targetAngle * moved,
    ];
  };
}
