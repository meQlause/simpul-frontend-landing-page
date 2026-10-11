// Every number section 8's motion uses, named by what it means. The values are the vanilla ones from
// ../landing/src/sections/08-your-data/index.js. A share is of the clock (0 to 1) unless it says otherwise.
// Values inside a GSAP vars object (duration, stagger, ease, scrub) stay with their tween in the motion file.

// The stack's own drawing (its viewBox is 300 by 600): the thread goes in at its top corner and out at its foot.
export const STACK = { height: 600, top: 4, foot: 587 };
// How far down its own drawing one of Simpul's layers has its centre: 100 of 192.
export const STAND = { centre: 100, drawn: 192 };
// The fork sits this far above the top layer, and no lower than this under the headline.
export const FORK = { above: 90, under: 26 };
// The knot: this share of the way from the foot of the stack to the bottom of the section; its radius.
export const KNOT = { share: 0.6, radius: 7 };
// The S from the fork down to a layer, and the S from a layer's foot to the knot: their two handles.
export const CURVE_IN = { first: 0.58, second: 0.42 };
export const CURVE_OUT = { first: 0.6, second: 0.4 };
// The phone's rail, down the right: 12 in from the edge, its handles at 30 and 12, reaching 52, and
// stopping 40 above the foot.
export const RAIL = { inset: 12, first: 30, second: 12, reach: 52, foot: 40 };
// The bits of data on the right line: a square that is a quarter as rounded as it is wide.
export const BIT = { size: 8, corner: 4, half: 4 };
export const BITS = 7;

// The clock: both lines have reached their sides at FORKED; the last layer is full and the left line has
// reached the bottom at FULL.
export const FORKED = 0.23;
export const FULL = 0.84;
export const EVERY = 0.11; // a layer starts this long after the one above
export const TAKES = 0.15;

// The thread's own draw: the stem reaches the fork, the fork starts, and the knot is tied at the end.
export const DRAW = { stemTo: 0.1, forkFrom: 0.08, tieFrom: 0.97, tieTo: 0.98 };
// The bits run down the right line for FLOW.laps passes, from FLOW.from until the layers are full (FULL
// less FLOW.stop), fading in over FLOW.fadeIn of each pass and out from FLOW.fadeOut.
export const FLOW = { laps: 7, from: 0.16, stop: 0.06, fadeIn: 0.12, fadeOut: 0.88 };
// A line is drawn with no dash while it is shorter than this: a round cap at zero length would leave a dot.
export const LINE = { hidden: 0.002 };

// The phone draws the layers and things without the fork: each thing starts a little after the one above.
export const PHONE = { layersFrom: 0.3, thingFrom: 0.08, thingTo: 0.2, thingEvery: 0.07 };
// The cells of a layer start filling FILL.after past the fork; each layer's name lights at FILL.nameAt.
export const FILL = { after: 0.03, nameAt: 0.3 };
// A cell fills from its far corner: it starts CELL.spread times its far share and takes CELL.takes.
// It grows from CELL.small to full size as it fills.
export const CELL = { spread: 0.62, takes: 0.3, small: 0.4, grow: 0.6 };

// A thing set down on its layer: it is seen from THING.shows, lifted THING.lift px and grows from
// THING.small to full size, its shadow comes from THING.shadowFrom and its name lights past THING.inAt.
// The left line sets it down from THING.before before the line reaches its layer to THING.after past it.
export const THING = {
  shows: 0.3,
  lift: 46,
  small: 0.72,
  grow: 0.28,
  shadowFrom: 0.2,
  inAt: 0.55,
  before: 0.03,
  after: 0.09,
};
