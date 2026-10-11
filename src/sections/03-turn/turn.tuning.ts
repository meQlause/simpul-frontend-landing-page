export const HALF = 0.5;

export const MS_PER_SECOND = 1000;

export const DOCK = { edge: 24, drop: 3 };

export const ROUTE = {
  onBend: 30,
  onLift: 70,
  onFoot: 110,
  onFootBend: 30,
  onFootIn: 80,
};

export const LEVEL = { ends: 0.08, desk: 0.12 };

export const UPRIGHT = { turn: 90, period: 180 };

export const LEAN = { from: 0.9, span: 0.1 };

export const LAYER = { edge: 1.5, slide: 112 };

export const CHAT = {
  speed: 16,
  scrollRate: 1.5,
  locked: 0.98,
  maxFrame: 100,
  scramble: { duration: 0.9, speed: 0.6 },
};

export const DOT = { inset: 18 };

export const LOCK = { phone: 0.62, desk: 0.76 };

export const PHASE = { lead: 30, pad: 48 };

export const BLIP = {
  signal: { scale: 2.6, duration: 1.1, colour: '#176448' },
  other: { scale: 1.6, duration: 0.7, colour: '#a9b5a6' },
  start: { scale: 0.4, alpha: 0.9 },
};

export const SHEEN = { duration: 1.8, repeatDelay: 5 };

export const PICK = {
  desk: { start: 'top 78%', end: 'top 22%' },
  phone: { start: 'top 78%', end: 'top 30%' },
};

export const LAYER_RUN = {
  desk: { start: 'top 62%', end: 'top 24%' },
  phone: { start: 'top 80%', end: 'top 38%' },
};

export const EXIT_RUN = { start: 'top 10%', end: 'bottom 32%' };

export const REVEAL = {
  copy: 'top 80%',
  headline: 'top 86%',
  row: 'top 92%',
  icon: 0.1,
  words: 0.2,
  asks: { start: 'top 85%', end: 'bottom 45%' },
};

export const OUTLINE = { after: 0.8, span: 0.2 };

export const CHAT_RUN = { start: 'top bottom', end: 'bottom top' };

export const ASKS = {
  formFields: 0,
  formShrink: 0.1,
  formStrike: 0.3,
  appGrow: 0.4,
  appShrink: 0.5,
  ringDraw: 0.44,
  ringAway: 0.6,
  ringGone: 0.72,
  appDim: 0.62,
  appStrike: 0.66,
  keys: 0.62,
  keysOk: 0.9,
};
