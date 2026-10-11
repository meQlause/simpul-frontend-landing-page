export interface Span {
  from: number;
  to: number;
}

export const END = 7;

export const RESOLVE = 3.1;

export const LABEL = { home: 1.6, attention: 3.4, rule: 6.05 };

export const PIN_SCREENS = 2.9;

export const SPAN = {
  glance: { from: 0, to: 0.5 },
  counted: { from: 0.5, to: 1.4 },
  review: { from: 1.8, to: 2.3 },
  strip: { from: 2.3, to: 2.9 },
  itemIn: { from: 2.9, to: 3 },
  itemOut: { from: 3.3, to: 3.5 },
  cursorIn: { from: 2.5, to: 2.65 },
  cursorOut: { from: 6.1, to: 6.3 },
  release: { from: 6.2, to: 6.9 },
};

export const SHOT_LIGHT = [
  { from: 0, to: 1.6 },
  { from: 1.75, to: 3.4 },
  { from: 3.5, to: 6 },
];

export const STAGE_FROM = { second: 1.75, third: 3.5 };

export const RULE_FRAMES: Span[] = [
  { from: 3.6, to: 3.9 },
  { from: 4.45, to: 4.6 },
  { from: 4.98, to: 5.12 },
  { from: 5.6, to: 5.78 },
];

export const FOCUS_FADE = 0.08;

export const FOCUS_PAD = 6;

export const FOCUS = [
  { from: 4.3, to: 4.65, spot: 'category' },
  { from: 5, to: 5.2, spot: 'recipient' },
  { from: 5.2, to: 5.5, spot: 'estimate' },
  { from: 5.8, to: 6.15, spot: 'toggle' },
] as const;

const TAP_LEAD = 0.05;

export const TAP_WIDTH = 0.06;

export const TAP_TIMES = {
  resolve: RESOLVE - TAP_LEAD,
  category: 4.45,
  recipient: 4.98,
  save: 5.6,
};

export const CURSOR = { scale: 1.25, squeeze: 0.22 };

export const REACH = 120;

export const TOGGLE_NUDGE = { dx: 14, dy: 8 };

export const CARD = {
  start: 0.88,
  shrink: 0.2,
  share: 0.4,
};

export const PHONE_FADE: Span = { from: 0.8, to: 1 };

export const FLY = { from: 0.2, to: 0.96 };

export const CARD_FADE = { from: 0.86, to: 0.98 };

export const DRAW_VISIBLE = 0.002;

export const CHIP_BEND = { near: 0.6, far: 0.3 };

export const ENTRY = {
  thread: { from: 0, to: 0.5 },
  rise: { from: 0.1, to: 0.8 },
  ring: { from: 0.88, to: 0.98 },
  ringOut: { from: 0.15, to: 0.45 },
  lit: 0.5,
};

export const RISE_PX = 70;

export const RISE_OPACITY = 1.6;

export const TILT_X = 4;

export const STRIP_GLOW = 0.9;

export const GLANCE_GAP = 30;

export const REVIEW_LIFT = 70;

export const WINDOW_FRAME = 18;

export const WINDOW_EDGE = 9;

export const NUMBER_BOX = { x: 3, y: 2, width: 8, height: 4 };

export const RING_PAD = { order: 4, strip: 8, item: 6 };

export const LEAN = { centre: 0.5, x: 5, y: 3 };

export const RAIL = {
  inset: 12,
  bow: 30,
  turn: 12,
  drop: 52,
  foot: 70,
  pull: 24,
  base: 46,
};

export const SHOT_STEP = 0.08;

export const SHOT_TITLE_AT = 0.05;

export const SHOT_TEXT_AT = 0.1;

export const DASH_GAP = 2;
