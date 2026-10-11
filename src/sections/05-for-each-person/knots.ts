import {
  BUDI,
  CURVE_STEPS,
  ENDS_POWER,
  EVEN_STEPS,
  HEIGHT,
  HALF,
  HENDRA,
  POINTS,
  QUAD_STEPS,
  RINA,
  SITI,
  SMOOTH_CUBIC,
  SMOOTH_LINEAR,
  SPLINE,
  SPLINE_STEPS,
  TAU,
  UNTIE,
} from './people.tuning';

export type Pair = [number, number];

export interface Knot {
  main: Pair[];
  extras?: Pair[][];
}

export interface Pull {
  x: number;
  y: number;
  at: number;
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const smooth = (share: number): number => share * share * (SMOOTH_CUBIC - SMOOTH_LINEAR * share);
const lerp = (from: number, to: number, share: number): number => from + (to - from) * share;

const ends = (share: number): number => Math.sin(Math.PI * share) ** ENDS_POWER;

const curve = (point: (share: number) => Pair, count = CURVE_STEPS): Pair[] =>
  Array.from({ length: count + 1 }, (_unused, index) => point(index / count));

function splineAxis(values: [number, number, number, number], share: number): number {
  const [before, start, end, after] = values;
  const { cut, lead, cubic } = SPLINE;

  return (
    HALF *
    (2 * start +
      (end - before) * share +
      (2 * before - cut * start + lead * end - after) * share * share +
      (cubic * start - before - cubic * end + after) * share ** cubic)
  );
}

function through(points: Pair[]): Pair[] {
  const out: Pair[] = [];

  for (let index = 0; index < points.length - 1; index++) {
    const before = points[index - 1] ?? points[index];
    const [start, end] = [points[index], points[index + 1]];
    const after = points[index + 2] ?? points[index + 1];

    for (let step = 0; step < SPLINE_STEPS; step++) {
      const share = step / SPLINE_STEPS;

      out.push(
        [0, 1].map((axis) =>
          splineAxis([before[axis], start[axis], end[axis], after[axis]], share),
        ) as Pair,
      );
    }
  }

  out.push(points[points.length - 1]);

  return out;
}

function even(points: Pair[], count = POINTS): Pair[] {
  const along = [0];

  for (let index = 1; index < points.length; index++) {
    const [deltaX, deltaY] = [
      points[index][0] - points[index - 1][0],
      points[index][1] - points[index - 1][1],
    ];

    along.push(along[index - 1] + Math.hypot(deltaX, deltaY));
  }

  const total = along[along.length - 1];
  const out: Pair[] = [];
  let cursor = 1;

  for (let step = 0; step < count; step++) {
    const distance = (total * step) / (count - 1);

    while (cursor < points.length - 1 && along[cursor] < distance) {
      cursor++;
    }

    const share = clamp((distance - along[cursor - 1]) / (along[cursor] - along[cursor - 1] || 1));

    out.push([
      lerp(points[cursor - 1][0], points[cursor][0], share),
      lerp(points[cursor - 1][1], points[cursor][1], share),
    ]);
  }

  return out;
}

function quad([start, bend, end]: Pair[]): Pair[] {
  return curve((share) => {
    const rest = 1 - share;

    return [0, 1].map(
      (axis) =>
        rest * rest * start[axis] + 2 * rest * share * bend[axis] + share * share * end[axis],
    ) as Pair;
  }, QUAD_STEPS);
}

const toPairs = (points: { x: number; y: number }[]): Pair[] =>
  points.map(({ x: left, y: top }) => [left, top]);

export const knots: Record<'rina' | 'budi' | 'siti' | 'hendra', Knot> = {
  rina: {
    main: even(
      curve((share) => {
        const angle = TAU * RINA.turns * share;

        return [
          RINA.sway * Math.sin(angle) * ends(share),
          HEIGHT * share + RINA.loop * (Math.cos(angle) - 1) * ends(share),
        ];
      }),
    ),
  },
  budi: {
    main: even(
      curve((share) => {
        const angle = TAU * BUDI.turns * share;

        return [
          BUDI.sway * Math.sin(angle) * ends(share),
          HEIGHT * share - BUDI.wave * Math.sin(2 * angle) * ends(share),
        ];
      }),
    ),
  },
  siti: { main: even(through(toPairs(SITI.main))) },
  hendra: {
    main: even(through(toPairs(HENDRA.main))),
    extras: HENDRA.extras.map((points) => even(quad(toPairs(points)), EVEN_STEPS)),
  },
};

export function untie(knot: Knot, progress: number, pull: Pull = { x: 0, y: 0, at: HALF }) {
  const last = knot.main.length - 1;
  const line = knot.main.map(([left, top], index): Pair => {
    const share = index / last;
    const bias = UNTIE.bias * (1 - Math.abs(2 * share - 1));
    const weight = smooth(clamp(progress * UNTIE.spread - bias));
    const grab = Math.exp(-(((share - pull.at) / UNTIE.pull) ** 2)) * Math.sin(Math.PI * share);

    return [
      lerp(left, 0, weight) + pull.x * grab,
      lerp(top, HEIGHT * share, weight) + pull.y * grab,
    ];
  });
  const weight = smooth(clamp(progress * UNTIE.extrasAt));
  const loose = (knot.extras ?? []).map((points) =>
    points.map(([left, top], index): Pair => [
      lerp(left, 0, weight),
      lerp(
        top,
        HEIGHT * (UNTIE.extrasOffset + (UNTIE.extrasSpan * index) / (points.length - 1)),
        weight,
      ),
    ]),
  );
  const fade = 1 - clamp((progress - UNTIE.extrasFade.from) / UNTIE.extrasFade.span);

  return { line, loose, fade };
}
