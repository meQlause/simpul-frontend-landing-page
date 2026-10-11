export const HALF = 0.5;

export const PALE = '#c3cfbf';

export const LEGS = [
  { t0: 0, t1: 0.8, from: 'message', to: 'understand' },
  { t0: 2.4, t1: 3.2, from: 'understand', to: 'decide' },
  { t0: 4.6, t1: 5.2, from: 'decide', to: 'role' },
  { t0: 5.8, t1: 6.5, from: 'role', to: 'backup' },
  { t0: 7.0, t1: 7.5, from: 'backup', to: 'hold' },
  { t0: 8.4, t1: 9.0, from: 'hold', to: 'phone' },
] as const;

export const TAP = 9.3;

export const GREEN = 9.5;

export const END = 10.6;

export const PIN = 4.2;

export const FIT = { max: 1.4, height: 600, heightShare: 0.96, width: 290, widthShare: 0.44 };

export const DOCK = { gap: 28, handX: 0.27, handY: 0.5 };

export const ROUTE = { minReach: 48, bend: 0.9, lift: 0.4 };

export const ENTRY = { bend: 0.7, reach: 190 };

export const STACK_RAIL = { inset: 12, reach: 120 };

export const EVIDENCE = { tieAt: 2, tieSpan: 0.4, leaves: 2.4, offset: 7 };

export const CLOCK = { green: 0.8, greenStop: 0.15, greenRun: 0.5 };

export const ARRIVED = 0.97;

export const HIDE_AT = 9.1;

export const HOLD_SECONDS = 60;

export const ENTRY_RUN = { start: 'top 85%', end: 'top top', scrub: 0.6 };

export const STACK_RUN = { start: 'top 78%', end: 'center 62%', scrub: 0.5 };

export const ARRIVE_RUN = { start: 'top 78%', end: 'bottom 85%', scrub: 0.5 };

export const SNAP = {
  snapTo: 'labelsDirectional',
  inertia: false,
  duration: { min: 0.25, max: 0.8 },
  delay: 0.1,
  ease: 'power1.inOut',
} as const;

export const REVEAL = { copy: 'top 78%', title: 'top 72%', principle: 'top 60%', head: 'top 82%' };

export const BEAT = {
  understandOn: 0.1,
  understandHead: 0.15,
  glow: 0.2,
  traveller: 0,
  halo: 0.5,
  words: 0.8,
  messageOut: 1.25,
  labelIn: 1.3,
  fields: 1.5,
  decideOn: 2.6,
  decideHead: 2.55,
  decideHalo: 2.75,
  gate: 2.78,
  rules: 3.2,
  rulesDim: 3.32,
  hand: 3.5,
  match: 3.55,
  ruleRow: 3.9,
  routeOn: 4.8,
  routeHead: 4.75,
  flipFront: 5.2,
  flipBack: 5.2,
  roleFade: 5.85,
  backupLit: 6.35,
  toRow: 6.4,
  holdNote: 7.1,
  ringIn: 7.35,
  ringSweep: 7.5,
  arrivedOut: 8.45,
  shrink: 8.5,
  fade: 8.95,
  notice: 8.95,
  buzz: 9.02,
  primaryDim: 10.1,
  tapFill: 0.1,
  understandLabel: 2.4,
  decideLabel: 4.6,
  routeLabel: 7,
  holdLabel: 8.4,
};

export const FIELD_STEP = 0.18;

export const RULE_STEP = 0.13;

export const BUZZ = [{ x: 0 }, { x: -3 }, { x: 3 }, { x: -2 }, { x: 2 }, { x: 0 }];

export const WORD_JITTER = [
  { x: -16, y: -12 },
  { x: 12, y: 9 },
  { x: -9, y: -15 },
  { x: 15, y: 6 },
  { x: -13, y: 12 },
  { x: 10, y: -9 },
  { x: -7, y: 14 },
  { x: 13, y: -6 },
];

export const WORD_TILT = { odd: 6, even: -5 };

export const STACKED = {
  label: 0.2,
  fields: 0.4,
  fieldStep: 0.2,
  rules: 0.3,
  rulesDim: 0.42,
  rulesStep: 0.12,
  match: 0.62,
};

export const STACK_ROUTE = { front: 0.2, back: 0.5, dim: 0.85, backup: 0.95 };

export const STACK_ARRIVE = { note: 0.1, notice: 0.65, tap: 1.05, primary: 1.15, green: 1.2 };

export const COLOUR = {
  ink: '#163f32',
  green: '#176448',
  ruleLit: '#9cc58a',
  ruleIdle: '#e6eae4',
  matchFill: '#eaf5df',
  backupFill: '#f1f8eb',
};
