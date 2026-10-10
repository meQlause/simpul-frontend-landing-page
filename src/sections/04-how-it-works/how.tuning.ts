// Every number the how-it-works motion uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/04-how-it-works/index.js. Timeline numbers are in the journey's own units.

export const HALF = 0.5; // the middle: a share of a box, a centre
export const PALE = '#c3cfbf'; // a station not yet reached

// The journey: each leg runs from one dock to the next, while the timeline runs from t0 to t1.
export const LEGS = [
  { t0: 0, t1: 0.8, from: 'message', to: 'understand' },
  { t0: 2.4, t1: 3.2, from: 'understand', to: 'decide' },
  { t0: 4.6, t1: 5.2, from: 'decide', to: 'role' },
  { t0: 5.8, t1: 6.5, from: 'role', to: 'backup' },
  { t0: 7.0, t1: 7.5, from: 'backup', to: 'hold' },
  { t0: 8.4, t1: 9.0, from: 'hold', to: 'phone' },
] as const;
export const TAP = 9.3; // the tap on "Already shipped"
export const GREEN = 9.5; // from here the whole thread turns green
export const END = 10.6; // the timeline's end
export const PIN = 4.2; // the pin takes this many viewport heights

// The camera and the fit of the phone mockup.
export const FIT = { max: 1.4, height: 600, heightShare: 0.96, width: 290, widthShare: 0.44 };
export const DOCK = { gap: 28, handX: 0.27, handY: 0.5 }; // a dock sits this far before the panel's edge
export const ROUTE = { minReach: 48, bend: 0.9, lift: 0.4 }; // the re-route's bend, to the backup
export const ENTRY = { bend: 0.7, reach: 190 }; // the order's entry curve
export const EXIT = { lift: 60, drop: 40 }; // the taut thread's curve to the out-anchor
export const EVIDENCE = { tieAt: 2, tieSpan: 0.4, leaves: 2.4, offset: 7 }; // the evidence line ties back at 2 to 2.4
export const CLOCK = { green: 0.8, greenStop: 0.15, greenRun: 0.5 }; // the green runs back along the thread
export const ARRIVED = 0.97; // the order has reached the message
export const HIDE_AT = 9.1; // the traveller leaves the screen after this
export const HOLD_SECONDS = 60; // the hold counts down from this

// The three stations' scroll, as ScrollTrigger ranges.
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

// The reveals of the text.
export const REVEAL = { copy: 'top 78%', title: 'top 72%', principle: 'top 60%', head: 'top 82%' };

// The timeline's positions, in its own units: each beat of the journey.
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
  tapFill: 0.1, // the primary button fills this long after the tap
  understandLabel: 2.4, // the stations start and end at these points on the timeline
  decideLabel: 4.6,
  routeLabel: 7,
  holdLabel: 8.4,
};
export const FIELD_STEP = 0.18; // each field of the label decodes after the one before
export const RULE_STEP = 0.13; // each rule is checked after the one above it
export const BUZZ = [{ x: 0 }, { x: -3 }, { x: 3 }, { x: -2 }, { x: 2 }, { x: 0 }]; // the phone buzzes once

// The words of the message scatter, then settle. Eight jitters, looped by index.
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

// The phone's own stacked version: each station plays as it scrolls through the screen.
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

// The colours the stations use, by what they mean: the ink of a lit station, the green of the thread.
export const COLOUR = {
  ink: '#163f32', // a lit station, and the primary button when pressed
  green: '#176448', // the rule that matched, the route, the notice's edge
  ruleLit: '#9cc58a', // a rule being checked
  ruleIdle: '#e6eae4', // a rule that did not match, once checked
  matchFill: '#eaf5df', // the rule that matched, lit
  backupFill: '#f1f8eb', // the backup role, taken
};
