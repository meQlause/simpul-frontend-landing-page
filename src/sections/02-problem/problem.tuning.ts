export const HALF = 0.5;

export const QUESTIONS = ['udah?', 'udah??', 'yg kemarin gimana?'];

export const HOPS = [
  { from: 1.2, to: 1.9 },
  { from: 2.1, to: 2.8 },
  { from: 3, to: 3.6 },
];

export const TIME = {
  snap: 3.72,
  fall: 4.2,
  close: 9.6,
  end: 11,
};

export const LABELS = [
  { at: 5.2, tilt: -3 },
  { at: 6.1, tilt: 2 },
  { at: 7, tilt: -2 },
  { at: 7.9, tilt: 3 },
  { at: 8.8, tilt: -1 },
];

export const LABEL_TYPE_DELAY = 0.1;

export const LOST_TILES = [{ tile: 3 }, { tile: 4 }, { tile: 5 }];

export const WAREHOUSE = 3;

export const PIN = { phone: 3.4, desk: 4 };

export const HAND = {
  rise: { desk: -7, phone: -4 },
  leadIn: 0.2,
  settle: 0.1,
  tickFade: 0.2,
  lostFade: 0.35,
  lostStep: 0.22,
  lostStart: 0.55,
  lostDelay: 0.1,
  lostOver: 0.7,
  breakLink: 0.35,
  breakHalf: 0.05,
  reset: 0.3,
  wardOff: 0.35,
};

export const PATH = {
  tilt: 0.1,
  lean: 0.12,
  wobbleRate: 16,
  wobbleLift: 3,
  wobbleTilt: 0.14,
};

export const SPOT = {
  edge: 12,
  jitter: 40,
  rowLift: 0.9,
  tilt: 0.3,
  gap: 4,
  spread: 16,
};

export const SPAWN = { first: 0.9, desk: 0.15, phone: 0.3, settleFor: 0.9 };

export const SETTLE = { order: 0.85, lean: 0.05 };

export const SIM = {
  rate: 1.2,
  seconds: 7.2,
  fps: 60,
  pose: 3,
  gravity: 1.1,
  seed: 7,
  spawnRange: 30,
  chamfer: 12,
  designWidth: 1440,
  speed: { base: 2, across: 22, up: 5 },
  order: { restitution: 0.32, friction: 1, category: 2 },
  question: { restitution: 0.12, friction: 0.7, air: 0.012, category: 4 },
  wall: { category: 1, depth: 100, thick: 200, span: 3, tall: 4 },
  floorGap: { phone: 18, desk: 26 },
};

export const LAYOUT = {
  dock: 10,
  tabletBreak: 1200,
  bubbles: { phone: 14, tablet: 20, desk: 30 },
  tilt: 0.22,
  tiltSeed: 3,
  tail: 14,
  tailStep: 0.025,
  slackDelay: 1.1,
  slackLength: 0.8,
};

export const INTRO = { start: 'top 92%', end: 'top top', scrub: 0.6 };

export const INTRO_AT = { headline: 0.05, faces: 0.35, drawn: 0.45, links: 0.55, names: 0.5 };

export const HANDOFF_AT = 'top 35%';
