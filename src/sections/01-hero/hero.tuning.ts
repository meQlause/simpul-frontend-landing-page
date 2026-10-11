export const HALF = 0.5;

export const KNOT = 0.6;

export const THREADS = { deskIn: 30, phoneIn: 14, out: 3, seed: 19 };

export const TANGLE = {
  reach: 0.55,
  under: 18,
  above: 48,
  left: -20,
  gap: 5,
  segments: 3,
  bend: { first: 0.9, second: 1.9 },
  jitter: 0.2,
  drift: 0.45,
  lift: 0.18,
  control: 0.45,
};

export const PHONE = {
  gap: 10,
  bottomGap: 6,
  edge: 20,
  reach: 0.95,
  pull: 0.35,
  spread: 0.5,
  bezier: { near: 0.4, far: 0.7 },
};

export const STRAND = {
  start: 0.55,
  bend: 0.9,
  reach: 1.5,
  lead: 22,
  gap: 14,
  tail: 20,
  phoneGap: 16,
  phoneTop: 10,
  phoneMin: 8,
  phoneClear: 12,
};

export const OPENING = {
  fly: 1,
  links: 1.1,
  lock: 2.9,
  breathe: 3.05,
  wordmark: 3.25,
  threads: 3.1,
  busy: 3.3,
  clear: 3.7,
  kicker: 4.4,
  actions: 4.6,
  foot: 5,
};

export const CHAT = { deskX: 50, phoneX: 20 };

export const ARRIVE = { x: 140, y: 90, rotation: 45 };

export const WANDER = { x: 3, y: 11, rotation: 14, scale: { low: 0.88, high: 1.12 } };

export const LEAN = {
  y: { step: 37, modulo: 19, offset: 9 },
  rotation: { step: 53, modulo: 25, offset: 12 },
  scale: { base: 0.9, step: 29, modulo: 21, divisor: 100 },
};

export const FLOW = {
  desktopPeriod: 5.2,
  phonePeriod: 3.6,
  reachedAt: 1.42,
  leaveAt: 1.5,
  leaveFadeAt: 2.4,
};

export const RELEASE = { startAt: 0.8, bend: 65, drop: 80, reach: 110 };

export const TILT = { degrees: 8 };

export const SKIP_AFTER = 0.02;

export const ASLEEP_AFTER = 0.9;
