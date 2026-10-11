export interface Span {
  from: number;
  to: number;
}

export const LIMIT = 6;

export const TAKE = {
  desktop: { waits: 3, limit: 9, sleeps: 4, asks: 1, reads: 3 },
  phone: { waits: 1, limit: 8, sleeps: 1, asks: 1, reads: 1 },
};

export const STORM = 2.4;

export const SETTLED = 5.4;

export const RESETTLE = 1.8;

export const SEED = 11;

export const FPS = 60;

export const MS_PER_SECOND = 1000;

export const GRAVITY = 1.6;

export const POSE_SIZE = 3;

export const SIDES = 4;

export const CENTRED = 0.5;

export const BORN = { first: 0.05, spread: 1.3 };

export const BAND = { from: 0.15, span: 0.7 };

export const SPEED = { base: 7, span: 7 };

export const HEADING = 1.3;

export const SPIN = 0.24;

export const WALL = { depth: 100, thick: 200, span: 3, tall: 3 };

export const CARD = { chamfer: 10, restitution: 0.86, friction: 0.04, air: 0.004 };

export const SURVIVOR_CHAMFER = 16;

export const START = { edge: 0.6, drop: 0.7, low: 1.2, mid: 0.5 };

export const COLUMNS = { min: 3, pitch: 0.42, leftInset: 4, rightInset: 8 };

export const SCORE_JITTER = 10;

export const PILE_GAP = 6;

export const SPOT = { jitter: 16, spin: 0.5 };

export const FLIGHT = {
  from: 0.8,
  drop: 0.55,
  turn: 2,
  spin: 1.6,
  storm: 1.1,
  stagger: 0.07,
  cycle: 7,
  settle: 1.2,
};

export const BOUNCE = { n: 7.5625, d: 2.75 };

export const BOUNCE_REACH = { second: 2, third: 2.5 };

export const BOUNCE_STEP = { second: 1.5, third: 2.25, last: 2.625 };

export const BOUNCE_LIFT = { second: 0.75, third: 0.9375, last: 0.984375 };

export const WINDOW = {
  desktop: { from: 0.75, to: 0.3 },
  phone: { from: 0.95, to: 0.6 },
};

export const HOLD = { waits: 0.5, limit: 0.5, sleeps: 0.6, asks: 0.3, reads: 0.86 };

export const RULE = { waits: 0, limit: 1, sleeps: 2, asks: 3, reads: 4 };

export const FEEL = {
  ease: 0.08,
  shake: 1.5,
  freqX: 31,
  freqY: 27,
  digits: 3,
  full: 16,
  seen: 0.5,
};

export const HUE = { step: 53, turn: 360 };

export const DARK = { in: { from: 0, to: 0.18 }, out: { from: 0.7, to: 0.86 }, dim: 0.4 };

export const MORNING = 0.72;

export const SCRUB = 0.6;

export const FLOOR_INSET = 14;

export const NEAR_MARGIN = '0px 0px 100% 0px';

export const PERCENT = 100;

export const RULE_REVEAL = { title: 0.05, text: 0.15 };

export const VISIBLE = 0.005;

export const LAYER = { note: 2, lifted: 20 };

export const SPOTS = {
  fold: { x: 0.75, y: 0.17 },
  count: { x: 0.22, y: 0.15 },
  ask: { y: 0.4 },
  chips: { inset: 22, left: 0.11, right: 0.89, y: 0.4 },
  reach: { min: 18, right: 0.89, inset: 56 },
  slot: { width: 0.62, gap: 8 },
  lift: { share: 0.36, room: 64 },
  rise: 0.3,
  hold: { x: 6, y: 2 },
  fix: 26,
};

export const RIDE = { lift: 12, bendFirst: 0.62, bendSecond: 0.38 };

export const INTO = { bend: 0.55, handle: 0.45 };

export const PHONE = { inset: 12, drop: 120, hop: 46, handle: 14, reach: 30 };

export const KNOT = { storm: 0.15, settled: 0.3 };

export const SURVIVOR = { grow: 0.08, shrink: 0.2 };

export const SURVIVOR_FADE = 0.5;

export const SURVIVOR_LAYER = { up: 40, rest: 1 };

export const WAITS = {
  lift: { from: 0.04, to: 0.3 },
  liftStep: 0.08,
  back: { from: 0.7, to: 0.9 },
  pullBack: 0.7,
  inset: 40,
  beside: 46,
  grow: 0.05,
  shrink: 0.06,
  fade: { from: 0.74, to: 0.92 },
  ring: { from: 0.28, to: 0.66 },
  full: 0.75,
  stopped: 0.66,
  show: { from: 0.24, to: 0.3 },
  hide: { from: 0.74, to: 0.9 },
  fixShow: { from: 0.52, to: 0.58 },
  fixHide: { from: 0.84, to: 0.94 },
  fixPop: { from: 0.52, to: 0.6 },
  fixScale: 0.85,
  fixGrow: 0.15,
};

export const LIMIT_MOVE = {
  go: { from: 0.08, to: 0.22 },
  step: 0.075,
  tick: { from: 0.08, to: 0.13 },
  drift: 0.2,
  fade: { from: 0.55, to: 1 },
  gather: { from: 0.58, to: 0.76 },
  gatherStep: 0.025,
  fold: 3,
  foldShrink: 0.1,
  foldFade: { from: 0.8, to: 0.86 },
  sent: { from: 0.16, step: 0.075 },
  count: { from: 0, to: 0.06 },
  countOut: { from: 0.9, to: 0.98 },
  pulse: { from: 0.56, to: 0.62 },
  pulseSize: 0.12,
  summary: { from: 0.78, to: 0.84 },
  summaryOut: { from: 0.92, to: 0.99 },
  summaryPop: { from: 0.78, to: 0.86 },
  summaryBase: 0.8,
  summaryGrow: 0.2,
};

export const SLEEP = {
  line: { from: 0.16, to: 0.46 },
  lineStep: 0.04,
  away: { from: 0.76, to: 0.95 },
  awayStep: 0.03,
  drift: 70,
  shrink: 0.38,
  height: 0.27,
  night: { from: 0.02, to: 0.16 },
  nightOut: { from: 0.86, to: 0.96 },
  nightX: 0.08,
  nightY: 0.1,
  nightInset: 46,
  queue: { from: 0.42, to: 0.5 },
  queueOut: { from: 0.72, to: 0.78 },
  queueLong: { x: 50, y: 0.31, gap: 22 },
  queueShort: { x: 62 },
  tiles: 0.31,
};

export const ASK = {
  rise: { from: 0.06, to: 0.2 },
  hesitate: { from: 0.2, to: 0.7 },
  shrink: { from: 0.7, to: 0.8 },
  shrinkBy: 0.8,
  fade: { from: 0.72, to: 0.8 },
  chipIn: { from: 0.04, to: 0.14 },
  chipOut: { from: 0.84, to: 0.94 },
  mark: { from: 0.72, to: 0.78 },
  markOut: { from: 0.88, to: 0.97 },
  lift: 34,
  liftAt: { from: 0.8, to: 0.97 },
  pop: { from: 0.72, to: 0.82 },
  near: { from: 0, to: 0.32 },
  nearOut: { from: 0.64, to: 1 },
  wobble: 0.04,
  wobbleFreq: 48,
  split: 0.5,
};

export const READS = {
  summed: { from: 0.06, to: 0.3 },
  summedStep: 0.06,
  gone: { from: 0.5, to: 0.78 },
  goneStep: 0.06,
  drop: 14,
};

export const READS_MOVE = { lidAt: 1.4 };

export const SLIDE = {
  after: 0.26,
  strokeIn: 0.12,
  titleIn: 0.08,
  textIn: 0.24,
  markIn: 0.6,
  loopIn: 0.95,
  out: 110,
  titleRise: 115,
  textRise: 105,
  tilt: 14,
  tiltTitle: 4,
  tileScale: 0.5,
};
