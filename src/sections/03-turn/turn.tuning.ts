// Every number the turn's motion uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/03-turn/index.js. Shares are of the thing named: a run, a band, a width.

export const HALF = 0.5; // the middle: where the order is picked up, and where the thread turns
export const MS_PER_SECOND = 1000;

// The order's route. The thread reaches down from the stage to the order where it fell, then reels it
// in toward the layer; later it runs taut from the layer on to section 4.
export const DOCK = { edge: 24, drop: 3 }; // the order docks this far in from the layer's edge, and this far above it
export const ROUTE = {
  climbAbove: 90, // the climb starts this far below the start point...
  climbLift: 70, // ...and no lower than this far above the dock
  bend: 30, // each leg bends this far off the straight
  lift: 70, // and this far from its end
  reachBelow: 50, // the reach comes up under the order
  reachSide: 40, // and sweeps this far to the side
  reachOver: 120, // ...over the top of it
  reachDip: 60, // and lands this far above the start point
  onBend: 30, // the taut thread leaves the dock with this bend
  onLift: 70, // and runs this far down
  onFoot: 110, // it stays this far above the foot of the stage
  onFootBend: 30, // and bends in toward the out-anchor from there
  onFootIn: 80, // ...over this much of the way
};
export const LEVEL = { ends: 0.08, desk: 0.12 }; // the order is level at both ends of a leg; on desktop it leans this much
export const UPRIGHT = { turn: 90, period: 180 }; // a tangent is folded back into a range of 180 degrees, centred on zero
export const LEAN = { from: 0.9, span: 0.1 }; // the order straightens over the last tenth of the reach

// The layer and the chat. The layer slides across the window, and the chat runs on its own pace too.
export const LAYER = { edge: 1.5, slide: 112 }; // the layer's own edge, and how far it starts off to the side (per cent)
export const CHAT = {
  speed: 16, // the chat's own pace, in pixels per second
  scrollRate: 1.5, // the scroll moves the chat this far faster than its own pace
  locked: 0.98, // the layer has landed: messages can be read now
  maxFrame: 100, // a stalled frame counts for at most this many milliseconds
  scramble: { duration: 0.9, speed: 0.6 }, // the meaning decodes over this long
};
export const DOT = { inset: 18 }; // the reading dot sits this far in from a message's edge
export const LOCK = { phone: 0.62, desk: 0.76 }; // the payment message reaches the reading line as the layer lands
export const PHASE = { lead: 30, pad: 48 }; // the loop's starting place, so the first meaning lands on the line
export const BLIP = {
  signal: { scale: 2.6, duration: 1.1, colour: '#176448' }, // a message that matters: a green pulse
  other: { scale: 1.6, duration: 0.7, colour: '#a9b5a6' }, // one that passes: a faint grey one
  start: { scale: 0.4, alpha: 0.9 },
};
export const SHEEN = { duration: 1.8, repeatDelay: 5 }; // the glass catches the light, then waits

// The three scroll ranges, and the reveals.
export const PICK = {
  desk: { start: 'top 78%', end: 'top 22%' },
  phone: { start: 'top 78%', end: 'top 30%' },
};
export const LAYER_RUN = {
  desk: { start: 'top 62%', end: 'top 24%' },
  phone: { start: 'top 80%', end: 'top 38%' },
};
export const EXIT_RUN = { start: 'top 10%', end: 'bottom 32%' }; // the taut thread runs on to the next section
export const REVEAL = {
  copy: 'top 80%',
  headline: 'top 86%',
  row: 'top 92%',
  icon: 0.1, // a row's drawing pops in this far into the row's reveal
  words: 0.2, // and its words rise this far in
  asks: { start: 'top 85%', end: 'bottom 45%' },
};
export const OUTLINE = { after: 0.8, span: 0.2 }; // the order's outline appears once the layer has nearly landed
export const CHAT_RUN = { start: 'top bottom', end: 'bottom top' }; // the chat moves with the page, across the whole section

// The three gestures, in the timeline's own units. Each gesture plays at its own point in the scroll.
export const ASKS = {
  formFields: 0, // the form's lines close up
  formShrink: 0.1, // the form folds away
  formStrike: 0.3, // and is struck through
  appGrow: 0.4, // the app icon pushes out
  appShrink: 0.5, // and settles back
  ringDraw: 0.44, // a ring is drawn round it
  ringAway: 0.6, // ...and runs off
  ringGone: 0.72, // and fades out
  appDim: 0.62, // the app icon dims
  appStrike: 0.66, // and is struck through
  keys: 0.62, // the keys light up one by one
  keysOk: 0.9, // then a tick says the keyboard stayed the same
};
