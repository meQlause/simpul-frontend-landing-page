import { seeded } from '../../motion/random';
import {
  BAND,
  BORN,
  BOUNCE,
  BOUNCE_LIFT,
  BOUNCE_REACH,
  BOUNCE_STEP,
  CENTRED,
  COLUMNS,
  FLIGHT,
  PILE_GAP,
  RESETTLE,
  SCORE_JITTER,
  SEED,
  SETTLED,
  SPOT,
  STORM,
} from './quiet-by-design.tuning';

export interface Geo {
  Wp: number;
  Hp: number;
  floor: number;
  cx: number;
  cw: number;
  ch: number;
  sw: number;
  sh: number;
}

export type Pose = readonly [number, number, number];

export interface Plan {
  track: (index: number, seconds: number) => Pose | null;
  chosen: number[][];
}

export const pose = (posX: number, posY: number, angle: number): Pose => [posX, posY, angle];

export const stepAt = (step: number): number => SETTLED + step * RESETTLE;

export function poseAt(plan: Plan, index: number, seconds: number): Pose {
  const found = plan.track(index, seconds);

  if (!found) {
    throw new Error(`Card ${index} is not in the air at ${seconds}s`);
  }

  return found;
}

export const total = (take: readonly number[]): number =>
  take.reduce((sum, count) => sum + count, 0);

export const born = (index: number, count: number): number =>
  BORN.first + (index * BORN.spread) / count;

const easeOut = (time: number): number => 1 - (1 - time) ** 2;

function bounce(time: number): number {
  if (time < 1 / BOUNCE.d) {
    return BOUNCE.n * time * time;
  }

  if (time < BOUNCE_REACH.second / BOUNCE.d) {
    const shift = time - BOUNCE_STEP.second / BOUNCE.d;

    return BOUNCE.n * shift * shift + BOUNCE_LIFT.second;
  }

  if (time < BOUNCE_REACH.third / BOUNCE.d) {
    const shift = time - BOUNCE_STEP.third / BOUNCE.d;

    return BOUNCE.n * shift * shift + BOUNCE_LIFT.third;
  }

  const shift = time - BOUNCE_STEP.last / BOUNCE.d;

  return BOUNCE.n * shift * shift + BOUNCE_LIFT.last;
}

function columns(geo: Geo): { colX: number[]; top: number[] } {
  const { Wp, floor, cx, cw, sw, sh } = geo;
  const cols = Math.max(COLUMNS.min, Math.round((Wp - cw) / (cw * COLUMNS.pitch)) + 1);
  const colX = Array.from(
    { length: cols },
    (_unused, column) =>
      cw / 2 + COLUMNS.leftInset + (column * (Wp - cw - COLUMNS.rightInset)) / (cols - 1),
  );
  const top = colX.map((spotX) => (Math.abs(spotX - cx) < sw / 2 ? floor - sh : floor));

  return { colX, top };
}

function landings(geo: Geo, count: number, random: () => number): [number, number, number][] {
  const { ch } = geo;
  const { colX, top } = columns(geo);

  return Array.from({ length: count }, (): [number, number, number] => {
    const score = top.map((height) => height + random() * SCORE_JITTER);
    const column = score.indexOf(Math.max(...score));
    const spotY = top[column] - ch / 2;

    for (const near of [-1, 0, 1]) {
      if (top[column + near] !== undefined) {
        top[column + near] = Math.min(top[column + near], spotY - ch / 2 + PILE_GAP);
      }
    }

    return [
      colX[column] + (random() - CENTRED) * SPOT.jitter,
      spotY,
      (random() - CENTRED) * SPOT.spin,
    ];
  });
}

interface Flight {
  from: [number, number];
  to: [number, number, number];
  spin: number;
}

function flightsOf(geo: Geo, count: number, random: () => number): Flight[] {
  const { Wp, Hp, cw, ch } = geo;

  return Array.from({ length: count }, (_unused, index) => {
    const share = BAND.from + random() * BAND.span;

    return {
      from: [index % 2 ? Wp + cw / 2 : -cw / 2, Hp * share * FLIGHT.from],
      to: [
        cw / 2 + random() * (Wp - cw),
        ch + random() * Hp * FLIGHT.drop,
        (random() - CENTRED) * FLIGHT.turn,
      ],
      spin: (random() - CENTRED) * FLIGHT.spin,
    };
  });
}

export function settle(geo: Geo, take: readonly number[]): Plan {
  const count = total(take);
  const random = seeded(SEED);
  const spots = landings(geo, count, random);
  const flights = flightsOf(geo, count, random);
  const storm = (index: number, seconds: number): Pose => {
    const { from, to, spin } = flights[index];
    const share = easeOut(Math.min((seconds - born(index, count)) / FLIGHT.storm, 1));

    return pose(
      from[0] + (to[0] - from[0]) * share,
      from[1] + (to[1] - from[1]) * share,
      to[2] * share + spin * seconds,
    );
  };

  const track = (index: number, seconds: number): Pose | null => {
    if (seconds < born(index, count)) {
      return null;
    }

    if (seconds < STORM) {
      return storm(index, seconds);
    }

    const [anchorX, anchorY, anchorAngle] = storm(index, STORM);
    const [spotX, spotY, spotAngle] = spots[index];
    const share = Math.min(
      Math.max((seconds - STORM - (index % FLIGHT.cycle) * FLIGHT.stagger) / FLIGHT.settle, 0),
      1,
    );

    return pose(
      anchorX + (spotX - anchorX) * easeOut(share),
      anchorY + (spotY - anchorY) * bounce(share),
      anchorAngle + (spotAngle - anchorAngle) * easeOut(share),
    );
  };

  const left = spots
    .map((_unused, index) => index)
    .sort((first, second) => spots[first][1] - spots[second][1]);

  return { track, chosen: take.map((size) => left.splice(0, size)) };
}

export function along(knots: readonly (readonly [number, number])[], position: number): number {
  if (position <= knots[0][0]) {
    return knots[0][1];
  }

  for (let index = 1; index < knots.length; index++) {
    const [knotTop, knotSeconds] = knots[index];

    if (position <= knotTop) {
      const [prevTop, prevSeconds] = knots[index - 1];

      return knotTop > prevTop
        ? prevSeconds + ((knotSeconds - prevSeconds) * (position - prevTop)) / (knotTop - prevTop)
        : knotSeconds;
    }
  }

  return knots[knots.length - 1][1];
}
