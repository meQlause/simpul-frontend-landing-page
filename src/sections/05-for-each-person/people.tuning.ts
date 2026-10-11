export const HEIGHT = 120;

export const POINTS = 160;

export const TAU = Math.PI * 2;

export const HALF = 0.5;

export const SMOOTH_CUBIC = 3;

export const SMOOTH_LINEAR = 2;

export const ENDS_POWER = 0.7;

export const CURVE_STEPS = 720;

export const SPLINE_STEPS = 30;

export const QUAD_STEPS = 60;

export const EVEN_STEPS = 40;

export const SPLINE = { cut: 5, lead: 4, cubic: 3 };

export const RINA = { turns: 4, sway: 34, loop: 17 };

export const BUDI = { turns: 4, sway: 72, wave: 14 };

export const UNTIE = {
  spread: 1.6,
  bias: 0.6,
  pull: 0.22,
  extrasAt: 1.8,
  extrasFade: { from: 0.35, span: 0.4 },
  extrasSpan: 0.2,
  extrasOffset: 0.4,
};

export const SITI = {
  main: [
    { x: 0, y: 0 },
    { x: 22, y: 10 },
    { x: 52, y: 26 },
    { x: 70, y: 54 },
    { x: 62, y: 88 },
    { x: 34, y: 108 },
    { x: -6, y: 112 },
    { x: -46, y: 100 },
    { x: -72, y: 72 },
    { x: -70, y: 38 },
    { x: -46, y: 16 },
    { x: -12, y: 18 },
    { x: 10, y: 36 },
    { x: 12, y: 60 },
    { x: -4, y: 72 },
    { x: -18, y: 60 },
    { x: -8, y: 46 },
    { x: 4, y: 58 },
    { x: 0, y: 84 },
    { x: 0, y: HEIGHT },
  ],
};

export const HENDRA = {
  main: [
    { x: 0, y: 0 },
    { x: 0, y: 30 },
    { x: 10, y: 42 },
    { x: 20, y: 58 },
    { x: 8, y: 74 },
    { x: -14, y: 72 },
    { x: -20, y: 54 },
    { x: -6, y: 42 },
    { x: 14, y: 48 },
    { x: 16, y: 66 },
    { x: 0, y: 78 },
    { x: -16, y: 66 },
    { x: -10, y: 50 },
    { x: 6, y: 54 },
    { x: 4, y: 68 },
    { x: 0, y: 86 },
    { x: 0, y: HEIGHT },
  ],
  extras: [
    [
      { x: -100, y: 8 },
      { x: -50, y: 20 },
      { x: -14, y: 52 },
    ],
    [
      { x: 100, y: 16 },
      { x: 56, y: 30 },
      { x: 16, y: 50 },
    ],
    [
      { x: -100, y: 58 },
      { x: -60, y: 50 },
      { x: -18, y: 62 },
    ],
    [
      { x: 100, y: 66 },
      { x: 58, y: 74 },
      { x: 18, y: 62 },
    ],
    [
      { x: -100, y: 112 },
      { x: -56, y: 96 },
      { x: -12, y: 72 },
    ],
    [
      { x: 100, y: 106 },
      { x: 54, y: 100 },
      { x: 12, y: 74 },
    ],
  ],
};

export const DRAW = { hidden: 0.002 };

export const ENTRY = {
  stem: 0.4,
  strandFrom: 0.3,
  strandSpan: 0.3,
  cardFrom: 0.45,
  cardStep: 0.06,
  cardSpan: 0.35,
};

export const SHOWN = { from: 0.3, span: 0.6 };

export const HANG = 'elastic.out(1, 0.55)';

export const SPRING = 'elastic.out(1, 0.28)';

export const OPACITY_RATE = 2.5;

export const STRAIGHT_AT = 0.999;

export const CARD_SIZE = { fit: 24, base: 200 };

export const RAIL = {
  inset: 12,
  reach: 120,
  lift: 70,
  lowerA: 30,
  lowerB: 46,
};

export const STRAND = { stemShare: 0.55, pull: 0.62 };

export const JOIN = {
  duration: 1.6,
  stagger: 0.05,
  span: 0.5,
  at: 0.52,
  tailPull: 0.7,
  tailSway: 0.12,
  beadRadius: 5,
  beadAt: 0.45,
  beadSpan: 0.2,
};

export const AUTO = {
  inDuration: 1.4,
  outDuration: 0.8,
  ease: 'power2.inOut',
  startDesk: 66,
  startStep: 6,
  startPhone: 'center 58%',
};

export const HOVER = { inDuration: 1.1, outDuration: 0.7, ease: 'power2.inOut' };

export const PULL = {
  far: 260,
  start: 16,
  span: 170,
  straightAbove: 0.6,
  straightDuration: 0.45,
  slackDuration: 0.9,
  springDuration: 1.5,
};

export const SCROLL = {
  entryStart: 'top 95%',
  entryEnd: { phone: 'top 30%', desk: 'top 15%' },
  cardStart: 'top 98%',
  cardEnd: 'top 62%',
  scrub: 0.6,
  cardScrub: 0.5,
};

export const CHAPTER = { copy: 'top 80%', title: 'top 72%', hint: 'top 45%' };

export const FROWN: Record<string, string> = {
  rina: 'M21 26 Q24 23.8 27 26',
  budi: 'M21 26.2 Q24 24.2 27 26.2',
  siti: 'M21.4 26.4 Q24 24.6 26.6 26.4',
  hendra: 'M21.4 26.2 Q24 24.4 26.6 26.2',
};

export const TILT = [{ degrees: -7 }, { degrees: 5 }, { degrees: -4 }, { degrees: 8 }];

export const STRANDS = 4;

export const LINKS = 3;

export const ARRIVAL = { face: 0.3, name: 0.38, quote: 0.5 };

export const RELIEF = { quote: 0.3, change: 0.55, mouth: 0.6 };
