// Every number section 6 uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/06-quiet-by-design/{index.js,heap.js}. Values inside a GSAP vars object
// (duration, ease, stagger) stay with their tween, as they are in the vanilla code.

// A stretch of a share (0 to 1), or of the clock.
export interface Span {
  from: number;
  to: number;
}

// ---- The heap: the storm is recorded ahead of time and played back by scroll ----
export const LIMIT = 6; // notifications per person per hour, the SRS default
// Cards each commitment takes, in order. Object.values() gives the array the physics wants.
export const TAKE = {
  desktop: { waits: 3, limit: 9, sleeps: 4, asks: 1, reads: 3 },
  phone: { waits: 1, limit: 8, sleeps: 1, asks: 1, reads: 1 },
};
export const STORM = 2.4; // seconds of storm before gravity switches on
export const SETTLED = 5.4; // the heap is still by now
export const RESETTLE = 1.8; // seconds for the heap to settle again after a commitment takes its cards
export const SEED = 11; // the same storm on every visit
export const FPS = 60; // the physics is recorded at this many frames a second
export const MS_PER_SECOND = 1000;
export const GRAVITY = 1.6; // once the storm has passed
export const POSE_SIZE = 3; // x, y and angle, per frame
export const SIDES = 4; // the storm is thrown in from four sides
export const CENTRED = 0.5; // random() - CENTRED runs from -0.5 to 0.5
export const BORN = { first: 0.05, spread: 1.3 }; // cards are thrown in one after another
export const BAND = { from: 0.15, span: 0.7 }; // a throw starts in this band of the height
export const SPEED = { base: 7, span: 7 }; // throw speed
export const HEADING = 1.3; // how far a throw fans out, in radians
export const SPIN = 0.24; // how fast a card turns as it is thrown
export const WALL = { depth: 100, thick: 200, span: 3, tall: 3 }; // the walls, out of sight
export const CARD = { chamfer: 10, restitution: 0.86, friction: 0.04, air: 0.004 };
export const SURVIVOR_CHAMFER = 16; // the one card that stays, on the floor
export const START = { edge: 0.6, drop: 0.7, low: 1.2, mid: 0.5 }; // where a throw starts, per side

export const COLUMNS = { min: 3, pitch: 0.42, leftInset: 4, rightInset: 8 }; // the piles in settle()
export const SCORE_JITTER = 10; // which pile a card lands on is a little random
export const PILE_GAP = 6; // a pile rises this much above the card under it
export const SPOT = { jitter: 16, spin: 0.5 }; // where a settled card lands, sideways and turned
export const FLIGHT = {
  from: 0.8, // thrown in from the sides, at this share of the height
  drop: 0.55, // ...then falls to this share of the stage
  turn: 2, // a card turns this much in the air
  spin: 1.6, // and keeps spinning this fast
  storm: 1.1, // seconds a card takes to arrive in the storm
  stagger: 0.07, // each card waits this much longer to settle
  cycle: 7, // ...the waits repeat every this many cards
  settle: 1.2, // seconds to settle onto the heap
};
export const BOUNCE = { n: 7.5625, d: 2.75 }; // the bounce: n and d of the classic formula
export const BOUNCE_REACH = { second: 2, third: 2.5 }; // where the second and third arcs end, in 1/d
export const BOUNCE_STEP = { second: 1.5, third: 2.25, last: 2.625 }; // each arc's shift, in 1/d
export const BOUNCE_LIFT = { second: 0.75, third: 0.9375, last: 0.984375 }; // each arc's height

// ---- The board ----
// A commitment plays while its centre travels between these heights of the screen.
export const WINDOW = {
  desktop: { from: 0.75, to: 0.3 },
  phone: { from: 0.95, to: 0.6 },
};
// How much of each window plays before the heap is let go to settle into the gaps.
export const HOLD = { waits: 0.5, limit: 0.5, sleeps: 0.6, asks: 0.3, reads: 0.86 };
export const RULE = { waits: 0, limit: 1, sleeps: 2, asks: 3, reads: 4 }; // the order of the commitments
export const FEEL = {
  ease: 0.08, // the board's restlessness eases towards its count this much a frame
  shake: 1.5, // how far the board trembles
  freqX: 31, // ...in these frequencies
  freqY: 27,
  digits: 3, // decimal places of the custom property it writes
  full: 16, // the count at which the board is fully restless
  seen: 0.5, // a card counts as seen above this opacity
};
export const HUE = { step: 53, turn: 360 }; // each note's colour
export const DARK = { in: { from: 0, to: 0.18 }, out: { from: 0.7, to: 0.86 }, dim: 0.4 }; // the night
export const MORNING = 0.72; // the night has turned to morning from here
export const SCRUB = 0.6; // the scroll clock trails the scrollbar by this much
export const FLOOR_INSET = 14; // the floor sits this far above the bottom of the stage
export const NEAR_MARGIN = '0px 0px 100% 0px'; // Matter.js loads one screen before the section
export const PERCENT = 100; // window edges are written as percentages in ScrollTrigger
export const RULE_REVEAL = { title: 0.05, text: 0.15 }; // a commitment's heading and sentence, after its tile
export const VISIBLE = 0.005; // an element with less opacity than this is hidden
export const LAYER = { note: 2, lifted: 20 }; // stacking: a card on the stage, a card being moved

// The layout: where things sit as shares of the stage, and offsets in pixels.
export const SPOTS = {
  fold: { x: 0.75, y: 0.17 }, // where the summary folds in
  count: { x: 0.22, y: 0.15 }, // the counter
  ask: { y: 0.4 }, // the question, between the two people
  chips: { inset: 22, left: 0.11, right: 0.89, y: 0.4 },
  reach: { min: 18, right: 0.89, inset: 56 }, // how far the hesitation reaches
  slot: { width: 0.62, gap: 8 }, // one card's place in the queue
  lift: { share: 0.36, room: 64 }, // the card lifted to be sent
  rise: 0.3, // the survivor rises this far (in view heights) after the last window
  hold: { x: 6, y: 2 }, // the 60-second counter sits on the card
  fix: 26, // and the correction sits this far under it
};
export const RIDE = { lift: 12, bendFirst: 0.62, bendSecond: 0.38 }; // the thread down the stage's side
export const INTO = { bend: 0.55, handle: 0.45 }; // the thread into the stage, on desktop
export const PHONE = { inset: 12, top: 12, bend: 30, rail: 52, hop: 46, handle: 14, reach: 30 }; // the rail
export const KNOT = { storm: 0.15, settled: 0.3 }; // the scroll clock: when the storm and the settling are reached
export const SURVIVOR = { grow: 0.08, shrink: 0.2 }; // the survivor grows as it rises and shrinks as it rides
export const SURVIVOR_FADE = 0.5; // the card reads as clean past this share of its rise
export const SURVIVOR_LAYER = { up: 40, rest: 1 }; // stacking: over the stage once it rises, under it before

// ---- Each commitment's own timing (shares of its window) ----
export const WAITS = {
  lift: { from: 0.04, to: 0.3 }, // the card is lifted to be sent...
  liftStep: 0.08, // ...each card a little later than the one before
  back: { from: 0.7, to: 0.9 }, // the correction pulls it back
  pullBack: 0.7, // ...by this share of its way
  inset: 40, // the first card's place keeps this far from the stage's edge
  beside: 46, // the others hang this far above their place
  grow: 0.05,
  shrink: 0.06,
  fade: { from: 0.74, to: 0.92 },
  ring: { from: 0.28, to: 0.66 }, // the 60-second ring sweeps
  full: 0.75, // ...a full sweep is this share of the ring
  stopped: 0.66, // a correction stops the ring here
  show: { from: 0.24, to: 0.3 },
  hide: { from: 0.74, to: 0.9 },
  fixShow: { from: 0.52, to: 0.58 },
  fixHide: { from: 0.84, to: 0.94 },
  fixPop: { from: 0.52, to: 0.6 },
  fixScale: 0.85,
  fixGrow: 0.15,
};
export const LIMIT_MOVE = {
  go: { from: 0.08, to: 0.22 }, // each card goes out through the limit...
  step: 0.075, // ...one after another
  tick: { from: 0.08, to: 0.13 }, // its tick pops as it goes
  drift: 0.2, // it heads this far towards the stage's centre
  fade: { from: 0.55, to: 1 },
  gather: { from: 0.58, to: 0.76 }, // the cards past the limit gather...
  gatherStep: 0.025,
  fold: 3, // ...and fold into one summary
  foldShrink: 0.1,
  foldFade: { from: 0.8, to: 0.86 },
  sent: { from: 0.16, step: 0.075 }, // the counter climbs to the limit
  count: { from: 0, to: 0.06 },
  countOut: { from: 0.9, to: 0.98 },
  pulse: { from: 0.56, to: 0.62 },
  pulseSize: 0.12,
  summary: { from: 0.78, to: 0.84 },
  summaryOut: { from: 0.92, to: 0.99 },
  summaryPop: { from: 0.78, to: 0.86 },
  summaryBase: 0.8, // the summary grows from this size...
  summaryGrow: 0.2, // ...to full size
};
export const SLEEP = {
  line: { from: 0.16, to: 0.46 }, // the cards that can wait line up for the morning...
  lineStep: 0.04,
  away: { from: 0.76, to: 0.95 }, // ...and go at 07:00
  awayStep: 0.03,
  drift: 70, // how far the ones going at 07:00 drift
  shrink: 0.38,
  height: 0.27, // the queue sits this far down the stage
  night: { from: 0.02, to: 0.16 }, // night falls
  nightOut: { from: 0.86, to: 0.96 },
  nightX: 0.08,
  nightY: 0.1,
  nightInset: 46,
  queue: { from: 0.42, to: 0.5 },
  queueOut: { from: 0.72, to: 0.78 },
  queueLong: { x: 50, y: 0.31, gap: 22 }, // under a long queue, clear of the thread
  queueShort: { x: 62 }, // beside a short one
  tiles: 0.31, // half a queue card's width
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
  near: { from: 0, to: 0.32 }, // one lobe of the hesitation: out, a pause, back
  nearOut: { from: 0.64, to: 1 },
  wobble: 0.04,
  wobbleFreq: 48,
  split: 0.5, // the first lobe is the first half of the hesitation
};
export const READS = {
  summed: { from: 0.06, to: 0.3 },
  summedStep: 0.06,
  gone: { from: 0.5, to: 0.78 },
  goneStep: 0.06,
  drop: 14,
};

// ---- The desktop index: one commitment at a time ----
export const READS_MOVE = { lidAt: 1.4 }; // the reading one's eye starts to move once its lid has blinked
export const SLIDE = {
  after: 0.26, // the next one comes in this long after the last goes out
  strokeIn: 0.12, // its drawing is drawn...
  titleIn: 0.08,
  textIn: 0.24,
  markIn: 0.6,
  loopIn: 0.95, // ...then it starts to move
  out: 110, // the outgoing words leave this far up
  titleRise: 115, // the heading rises this far
  textRise: 105,
  tilt: 14, // the tile turns this far in
  tiltTitle: 4,
  tileScale: 0.5,
};
