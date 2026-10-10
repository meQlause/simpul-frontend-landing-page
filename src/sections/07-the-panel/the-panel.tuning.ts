// Every number section 7 uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/07-the-panel/index.js. Values inside a GSAP vars object (duration, ease, stagger,
// scrub) and the object data of the pointer's route stay with their tween, as they are in the vanilla code.

// A stretch of the clock, or of a share (0 to 1).
export interface Span {
  from: number;
  to: number;
}

// ---- The pinned clock: seconds from 0 to END, scrubbed by the scroll ----
export const END = 7; // the pinned timeline's last second
export const RESOLVE = 3.1; // the moment the pointer resolves one item (its count drops from 04 to 03)
export const LABEL = { home: 1.6, attention: 3.4, rule: 6.05 }; // the snap points between the screens
export const PIN_SCREENS = 2.9; // the pinned stretch, in screen heights of scrolling
export const SPAN = {
  glance: { from: 0, to: 0.5 }, // the page scrolls up to today's figures...
  counted: { from: 0.5, to: 1.4 }, // ...and the figures count up
  review: { from: 1.8, to: 2.3 }, // the page scrolls on to the three areas to review
  strip: { from: 2.3, to: 2.9 }, // the review's ring breathes
  itemIn: { from: 2.9, to: 3 }, // the item's ring appears
  itemOut: { from: 3.3, to: 3.5 }, // ...and goes once it is resolved
  cursorIn: { from: 2.5, to: 2.65 }, // the pointer of an unseen hand arrives
  cursorOut: { from: 6.1, to: 6.3 }, // ...and leaves
  release: { from: 6.2, to: 6.9 }, // on release the thread leaves the window and the window straightens
};
// The three captures the screens show, and the share of each one's reveal over the clock.
export const SHOT_LIGHT = [
  { from: 0, to: 1.6 },
  { from: 1.75, to: 3.4 },
  { from: 3.5, to: 6 },
];
export const STAGE_FROM = { second: 1.75, third: 3.5 }; // the screen the stage is on, by the clock
// Each rule frame fades in as the rule is written: category, who needs to know, the estimate, saved.
export const RULE_FRAMES: Span[] = [
  { from: 3.6, to: 3.9 },
  { from: 4.45, to: 4.6 },
  { from: 4.98, to: 5.12 },
  { from: 5.6, to: 5.78 },
];
// The rule form's focus ring sits on each field in turn: [from, to] of the clock, and the field's spot.
export const FOCUS_FADE = 0.08; // the ring fades in and out over this much of a field's time
export const FOCUS_PAD = 6; // the ring sits this far outside the field
export const FOCUS = [
  { from: 4.3, to: 4.65, spot: 'category' },
  { from: 5, to: 5.2, spot: 'recipient' },
  { from: 5.2, to: 5.5, spot: 'estimate' },
  { from: 5.8, to: 6.15, spot: 'toggle' },
] as const;
// The pointer taps at these times, and each tap squeezes the cursor for this long either side.
const TAP_LEAD = 0.05; // the first tap lands this much before the item resolves
export const TAP_WIDTH = 0.06;
export const TAP_TIMES = {
  resolve: RESOLVE - TAP_LEAD,
  category: 4.45,
  recipient: 4.98,
  save: 5.6,
};
export const CURSOR = { scale: 1.25, squeeze: 0.22 }; // the cursor's size, and how far a tap squeezes it
export const REACH = 120; // the pointer reaches this far into a field from its centre
export const TOGGLE_NUDGE = { dx: 14, dy: 8 }; // the pointer rests on the toggle's knob, not its centre

// ---- The card: section 6's card, flying into this section ----
export const CARD = {
  start: 0.88, // its scale when it arrives...
  shrink: 0.2, // ...and how far it shrinks on a phone
  share: 0.4, // on a phone it lands this far down the first capture
};
export const PHONE_FADE: Span = { from: 0.8, to: 1 }; // on a phone the card fades as it lands
export const FLY = { from: 0.2, to: 0.96 }; // desktop: the card flies into the window
export const CARD_FADE = { from: 0.86, to: 0.98 }; // ...and is gone once it has become the record
export const DRAW_VISIBLE = 0.002; // a thread shows once it is drawn past this share
export const CHIP_BEND = { near: 0.6, far: 0.3 }; // the card's path bends toward the order's chip

// ---- The window's entry: rising into place before the pin ----
export const ENTRY = {
  thread: { from: 0, to: 0.5 }, // the thread reaches the window
  rise: { from: 0.1, to: 0.8 }, // the window rises into place
  ring: { from: 0.88, to: 0.98 }, // the order's ring lights, as the card becomes it
  ringOut: { from: 0.15, to: 0.45 }, // ...and goes out as the home screen scrolls
  lit: 0.5, // the window's frame lights above this entry
};
export const RISE_PX = 70; // the window rises this far (px) and fades in
export const RISE_OPACITY = 1.6; // it reaches full opacity sooner than its rise
export const TILT_X = 4; // the window is tilted back this many degrees, straightened on release
export const STRIP_GLOW = 0.9; // the review's ring breathes up to this opacity

// ---- The home screen's scroll and the figures ----
export const GLANCE_GAP = 30; // px below today's figures, where the home screen stops
export const REVIEW_LIFT = 70; // px above the stats row, where the review list starts

// ---- The window's frame and the live numbers laid over the captures ----
export const WINDOW_FRAME = 18; // the frame's padding and border, both sides together
export const WINDOW_EDGE = 9; // the frame's padding and border on one side
export const NUMBER_BOX = { x: 3, y: 2, width: 8, height: 4 }; // a live number is this much larger than its capture
export const RING_PAD = { order: 4, strip: 8, item: 6 }; // each ring sits this far outside its spot

// ---- The lean towards the pointer ----
export const LEAN = { centre: 0.5, x: 5, y: 3 }; // the window turns this many degrees toward the pointer

// ---- Phones: the card rides down the rail to the first capture ----
export const RAIL = {
  inset: 12, // the rail runs this far in from the right edge
  bow: 30, // the top of the rail bows out by this much
  turn: 12, // ...and turns in here, under the heading
  drop: 52, // the rail is straight from here
  foot: 70, // ...until this far above the bottom
  pull: 24, // then curves back toward the middle
  base: 46, // and reaches the centre this far above the bottom
};

// ---- The captions: each one's reveal, staggered down the list ----
export const SHOT_STEP = 0.08; // each screen's caption starts this much after the one above
export const SHOT_TITLE_AT = 0.05; // its heading arrives this long after the screen's icon
export const SHOT_TEXT_AT = 0.1; // its sentence arrives this long after the screen's icon

// ---- Drawing the thread ----
export const DASH_GAP = 2; // the drawn part of a thread is followed by this much of a gap
