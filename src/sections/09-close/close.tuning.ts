export const PIECES: readonly string[] = [
  'Order · Mrs. Sri',
  '<i>1</i>Understand',
  '<i>2</i>Decide',
  '<i>3</i>Route',
  '<i>R</i>Rina',
  '<i>B</i>Budi',
  '<i>S</i>Siti',
  '<i>H</i>Mr. Hendra',
  'ORD-0091 · Mrs. Sri',
];

export const CENTRE = '627 627';

export const HEAD = { from: 0.06, step: 0.025, to: 0.5 };

export const TAIL = { from: 0.46, step: 0.02, to: 0.76 };

export const SHOW = { from: 0.02, to: 0.1 };

export const HIDE = { from: 0.84, to: 0.98 };

export const SHRINK = { from: 0.8, by: 0.55 };

export const BEND = 70;

export const CURVE = { reachX: 0.45, reachY: 0.1, pullX: 0.25, pullY: 0.5, seamDrop: 0.4 };

export const STARTS = {
  margin: 30,
  topFrom: -0.55,
  topStep: 0.42,
  topShift: 60,
  rightFrom: 0.12,
  rightStep: 0.19,
  phoneFrom: 0.02,
  phoneSpan: 0.96,
  topRow: 4,
};

export const LINKS = {
  drawFrom: 0.48,
  drawTo: 0.8,
  apartFrom: 0.72,
  apartTo: 0.94,
  filledFrom: 0.9,
  shift: { x: 150, y: 100, turn: 12 },
};

export const PULL = { press: 0.93, pressFor: 0.16, rest: 0.972, restFor: 1 };

export const SCRIBBLE = {
  height: 20,
  inset: 12,
  trace: [
    { cmd: 'M', share: 0.01, y: 12 },
    { cmd: 'C', share: 0.18, y: 7 },
    { share: 0.3, y: 14 },
    { share: 0.5, y: 10 },
    { cmd: 'S', share: 0.82, y: 6 },
    { share: 0.99, y: 9 },
    { cmd: 'C', share: 0.8, y: 13 },
    { share: 0.6, y: 9 },
    { share: 0.38, y: 14 },
    { cmd: 'S', share: 0.12, y: 13 },
    { share: 0.04, y: 10 },
  ],
};

export const FOOT = { signAt: 0.05, lineAt: 0.3, streamAt: 0.75, navAt: 0.95 };

export const STAND_IN = { waitMs: 600, failWord: 'fail' };

export const VISIBLE = { line: 0.002, piece: 0.01 };

export const NOT = { every: 0.24, rise: 0.04, scribbleAt: 0.4, stepBackAt: 0.85, fade: 0.38 };

export const SWEEP = { at: 0.55, every: 0.28 };

export const WAVE = { lift: 4, drop: -5, each: 0.11, stream: 30 };
