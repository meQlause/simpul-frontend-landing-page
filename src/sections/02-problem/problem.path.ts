import { seeded } from '../../motion/random';
import { HALF, HOPS, PATH, SETTLE, SIM, SPAWN, SPOT, TIME } from './problem.tuning';

export type Point = readonly [number, number];

export type Pose = [number, number, number];

export type Track = (index: number, seconds: number) => Pose | null;

export interface Geo {
  width: number;
  height: number;
  entry: Point;
  exit: Point;
  stops: Point[];
  gap: Point;
  floor: number;
  spawn: Point;
  order: [number, number];
  sizes: [number, number][];
}

export interface Eases {
  inOut: (share: number) => number;
  bounce: (share: number) => number;
  out: (share: number) => number;
}

const wobble = (random: () => number, size: number): number => (random() - HALF) * size;

export function spawnAt(index: number, phone: boolean): number {
  return SPAWN.first + index * (phone ? SPAWN.phone : SPAWN.desk);
}

function drop(geo: Geo, eases: Eases, progress: number): Pose {
  const eased = eases.inOut(progress);
  const [fromLeft, fromTop] = geo.entry;
  const [toLeft, toTop] = geo.stops[0];
  const rest = 1 - eased;

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

function legsOf(geo: Geo): Leg[] {
  const [first, second, third] = geo.stops;

  return [
    { start: 1, end: 1, from: first, to: first },
    { start: HOPS[0].from, end: HOPS[0].to, from: first, to: second },
    { start: HOPS[1].from, end: HOPS[1].to, from: second, to: third },
    { start: HOPS[2].from, end: HOPS[2].to, from: third, to: geo.gap },
  ];
}

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

export function carry(geo: Geo, eases: Eases, progress: number): Pose {
  return progress < 1 ? drop(geo, eases, progress) : travel(geo, eases, progress);
}

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
