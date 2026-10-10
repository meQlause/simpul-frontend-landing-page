// Every number the problem's motion uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/02-problem/index.js. Scroll numbers are scroll units: the pin is measured in
// viewport heights, the timeline in the units below.

export const HALF = 0.5; // the middle: random values are centred on it

export const QUESTIONS = ['udah?', 'udah??', 'yg kemarin gimana?']; // as people actually type them

// The three hand-overs along the chain, as the span of scroll each one takes.
export const HOPS = [
  { from: 1.2, to: 1.9 }, // Customer → Sales
  { from: 2.1, to: 2.8 }, // Sales → Admin
  { from: 3, to: 3.6 }, // Admin → nobody
];

export const TIME = {
  snap: 3.72, // the hand-off breaks: the link snaps
  fall: 4.2, // the order has fallen, and the physics takes over
  close: 9.6, // the closing line rises
  end: 11, // the timeline's length
};

// Each failure label surfaces at its own point, and starts at its own tilt.
export const LABELS = [
  { at: 5.2, tilt: -3 },
  { at: 6.1, tilt: 2 },
  { at: 7, tilt: -2 },
  { at: 7.9, tilt: 3 },
  { at: 8.8, tilt: -1 },
];
export const LABEL_TYPE_DELAY = 0.1; // a failure types out this long after it surfaces

// The tiles that go red after the break: Warehouse, Finance and the last Sales.
export const LOST_TILES = [{ tile: 3 }, { tile: 4 }, { tile: 5 }];
export const WAREHOUSE = 3; // the tile the hand-off breaks in front of: the order docks on it last

// The pin: the scroll it takes, in viewport heights.
export const PIN = { phone: 3.4, desk: 4 };

// The chain's own motion: a hand-over is held for a beat before and after.
export const HAND = {
  rise: { desk: -7, phone: -4 }, // the tile lifts to take the order
  leadIn: 0.2, // it lifts this long before the order arrives
  settle: 0.1, // and settles this long after it leaves
  tickFade: 0.2, // the tick and the name colour take this long
  lostFade: 0.35, // a lost tile turns red over this long
  lostStep: 0.22, // each lost tile follows the last by this much
  lostStart: 0.55, // the first lost tile follows the snap by this much
  lostDelay: 0.1, // its link turns after its tile does
  lostOver: 0.7, // the thread turns red over this much scroll, from the snap
  breakLink: 0.35, // the broken link's halves fall away over this long
  breakHalf: 0.05, // the second half starts this much after the first
  breakRed: 0.15, // the broken link turns red this long after the snap
  reset: 0.3, // the warehouse tile settles back this long after the snap
  wardOff: 0.35, // the warehouse tile begins to rise this long before the last hand-over
};

// The order's path before it falls: it drops from the header onto the dock row, then slides tile to tile.
export const PATH = {
  tilt: 0.1, // leans back as it drops
  lean: 0.12, // and forward as it sets off
  wobbleRate: 16, // the hang after the break swings this fast
  wobbleLift: 3, // ...and this far down
  wobbleTilt: 0.14, // and tilts this much
};

// The questions' settled spots: a row from the right edge, leftwards, starting a new row when full.
export const SPOT = {
  edge: 12, // the row starts this far from the edge
  jitter: 40, // and each new row starts this far in, at random
  rowLift: 0.9, // each new row sits this far above the last
  tilt: 0.3, // a settled question leans by up to this much
  gap: 4, // questions in a row sit this far apart
  spread: 16, // and each gap grows by up to this much
};

// The questions drop in one after another. Each takes this long to settle on the settle path.
export const SPAWN = { first: 0.9, desk: 0.15, phone: 0.3, settleFor: 0.9 };
export const SETTLE = { order: 0.85, lean: 0.05 }; // the order lands in this long on the settle path, and leans this much

// The physics: a recorded run, and one scroll unit is `rate` seconds of it.
export const SIM = {
  rate: 1.2, // physics seconds per scroll unit
  seconds: 7.2, // the length of the recorded run
  fps: 60, // frames recorded per second
  pose: 3, // x, y and angle per recorded frame
  gravity: 1.1,
  seed: 7,
  spawnRange: 30, // the questions start up to this far left of the far end
  chamfer: 12, // a question's corner, at most
  designWidth: 1440, // the speed scales with the width against this
  speed: { base: 2, across: 22, up: 5 }, // the questions' starting push
  order: { restitution: 0.32, friction: 1, category: 2 },
  question: { restitution: 0.12, friction: 0.7, air: 0.012, category: 4 },
  wall: { category: 1, depth: 100, thick: 200, span: 3, tall: 4 },
  floorGap: { phone: 18, desk: 26 }, // the floor sits this far above the bottom of the section
};

export const LAYOUT = {
  dock: 10, // the order docks this far above the tile
  tabletBreak: 1200, // below this width the pile is a little smaller
  bubbles: { phone: 14, tablet: 20, desk: 30 },
  tilt: 0.22, // each question's drawn tilt is up to this much either way
  tiltSeed: 3,
  tail: 14, // the thread behind the order is this many points long
  tailStep: 0.025, // each point of it is this far back in time
  slackCurve: { reach: 80, sag: 6, pull: 60 }, // the slack end's bezier
  slackDelay: 1.1, // the slack end starts to draw this far in
  slackLength: 0.8, // and takes this long to draw
  edge: 6, // the thread leaves the order this far in from its edge
};

export const INTRO = { start: 'top 92%', end: 'top top', scrub: 0.6 }; // the arrival, scrubbed as the section comes in
export const INTRO_AT = { headline: 0.05, faces: 0.35, drawn: 0.45, links: 0.55, names: 0.5 }; // when each part of the arrival starts
export const HANDOFF_AT = 'top 35%'; // the hero hands the order on when its bottom edge reaches here
