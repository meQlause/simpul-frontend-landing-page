// Every number the hero's motion uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/01-hero/index.js. A share is of the thing named: a width, a height, a run.

export const HALF = 0.5; // the middle: random values are centred on it

// The knot the threads gather into, as a share of the mark's width.
export const KNOT = 0.6;

// How many threads there are. A phone runs them down a narrower screen, so it has fewer.
export const THREADS = { deskIn: 30, phoneIn: 14, out: 3, seed: 19 };

// Desktop: the tangle that brings messages in from the left, in a band around the busy words.
export const TANGLE = {
  reach: 0.55, // the band goes this far above and below the busy words, as a share of their height
  under: 18, // ...and starts this far under the eyebrow
  above: 48, // ...and stops this far above the actions
  left: -20, // each line starts this far past the left edge
  gap: 5, // neighbouring lines sit this far apart where they meet the knot
  segments: 3, // each line has this many bends across the screen
  bend: { first: 0.9, second: 1.9 }, // the two bends sit at these steps along the run
  jitter: 0.2, // and each moves by this much of a step
  drift: 0.45, // a line wanders this far up or down from one bend to the next (share of the band)
  lift: 0.18, // its segments swing this far up or down (share of the band)
  control: 0.45, // their control points sit this far from each end (share of a step)
};

// Phone: the tangle comes in from both sides, between the busy words and the mark.
export const PHONE = {
  gap: 10, // below the busy words
  bottomGap: 6, // above the mark
  edge: 20, // the lines start this far off the screen's side
  reach: 0.95, // and end this far in, as a share of the knot's radius
  pull: 0.35, // the far end is pulled toward the knot's centre (share of the distance)
  spread: 0.5, // each control point wanders by up to this much of the band
  bezier: { near: 0.4, far: 0.7 }, // the control points sit at these shares of the run
};

// The straight threads that carry messages out on the clear side.
export const STRAND = {
  start: 0.55, // leave the knot this far out, as a share of its radius
  bend: 0.9, // bend out to this share of the radius
  reach: 1.5, // then run straight from there
  lead: 22, // sit this far below the clear words (desktop)
  gap: 14, // and this far apart (desktop)
  tail: 20, // run this far past the mark's side (desktop)
  phoneGap: 16, // phone: this far apart across the screen
  phoneTop: 10, // start this far below the wordmark
  phoneMin: 8, // and run at least this far
  phoneClear: 12, // stop this far above the clear words
};

// The opening, in seconds on its own timeline.
export const OPENING = {
  fly: 1, // the chat cards fly into the knot
  links: 1.1, // the two links draw
  lock: 2.9, // the knot locks: the outline fills
  breathe: 3.05, // a small settle
  wordmark: 3.25, // the word sets beside it
  threads: 3.1, // the threads run out of the knot
  busy: 3.3, // the busy letters arrive
  clear: 3.7, // the clear words rise
  kicker: 4.4, // the eyebrow
  actions: 4.6, // the three actions
  foot: 5, // the foot
};

export const CHAT = { deskX: 50, phoneX: 20 }; // the chat cards come in from this far right
export const ARRIVE = { x: 140, y: 90, rotation: 45 }; // the busy letters arrive from this far out
export const WANDER = { x: 3, y: 11, rotation: 14, scale: { low: 0.88, high: 1.12 } }; // the restless range

// The same disorder every time: each letter's offset comes from its index.
export const LEAN = {
  y: { step: 37, modulo: 19, offset: 9 },
  rotation: { step: 53, modulo: 25, offset: 12 },
  scale: { base: 0.9, step: 29, modulo: 21, divisor: 100 },
};

// The lights: one in along each tangled thread; every second one leaves on a straight thread.
export const FLOW = {
  desktopPeriod: 5.2, // the whole loop, on a desktop
  phonePeriod: 3.6, // and on a phone
  reachedAt: 1.42, // a light fades as it reaches the knot
  leaveAt: 1.5, // a strand lights up this long after its light starts
  leaveFadeAt: 2.4, // and fades this long after
};

// The thread that leaves the knot at the bottom of the stage, into section 2.
export const RELEASE = { startAt: 0.8, bend: 65, drop: 80, reach: 110 };
export const TILT = { degrees: 8 }; // how far the mark leans toward the pointer
export const SKIP_AFTER = 0.02; // once the scroll has moved this far through the exit, the opening is finished
export const ASLEEP_AFTER = 0.9; // past this share of the exit, the loops stop
