// Every number the four knots and their motion use, named by what it means. The values are the vanilla
// ones from ../landing/src/sections/05-for-each-person/index.js and knots.js. Shapes are in a 200 unit
// box, centred on x = 0; a knot runs from (0, 0) to (0, HEIGHT).

export const HEIGHT = 120; // the height of a tangle, and of a straight line through it
export const POINTS = 160; // every tangle is this many points, so every part unties at the same pace
export const TAU = Math.PI * 2;
export const HALF = 0.5; // the middle

// The easing of a curve, and of the ends of a tangle.
export const SMOOTH_CUBIC = 3; // smooth(t) = t * t * (3 - 2t)
export const SMOOTH_LINEAR = 2;
export const ENDS_POWER = 0.7; // a tangle fades out towards both ends along sin(pi t) ** this
export const CURVE_STEPS = 720; // the default number of steps in a sampled curve
export const SPLINE_STEPS = 30; // a smooth line draws this many steps between two points
export const QUAD_STEPS = 60; // a quadratic curve draws this many steps
export const EVEN_STEPS = 40; // an extra thread is spaced this many points

// The Catmull-Rom spline's coefficients.
export const SPLINE = { cut: 5, lead: 4, cubic: 3 };

// Rina: a loop that keeps returning. Budi: the same question stacked on itself. Both are sine shapes.
export const RINA = { turns: 4, sway: 34, loop: 17 };
export const BUDI = { turns: 4, sway: 72, wave: 14 };

// Untying: the ends straighten first and the middle last. Each step is a share of the progress.
export const UNTIE = {
  spread: 1.6, // the ends are ahead by this much
  bias: 0.6, // ...and the middle lags by this much
  pull: 0.22, // a pull stretches the thread this far around the point that was grabbed
  extrasAt: 1.8, // the extra threads are taken in by this point
  extrasFade: { from: 0.35, span: 0.4 }, // and fade between these shares of the untying
  extrasSpan: 0.2, // the extra threads' ends sit in this band of the card
  extrasOffset: 0.4, // ...starting this far down it
};

// Siti: the line goes the long way round. Mr. Hendra: many threads, snarled where they meet.
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

// The motion: how a knot is drawn in, untied, pulled and joined, and how the cards hang and arrive.
export const DRAW = { hidden: 0.002 }; // a stroke below this share is hidden, so its round cap leaves no dot
export const ENTRY = {
  stem: 0.4,
  strandFrom: 0.3,
  strandSpan: 0.3,
  cardFrom: 0.45,
  cardStep: 0.06,
  cardSpan: 0.35,
};
export const SHOWN = { from: 0.3, span: 0.6 }; // a knot draws in from its strand as its card arrives
export const HANG = 'elastic.out(1, 0.55)'; // a card swings into place on its strand
export const SPRING = 'elastic.out(1, 0.28)'; // a released knot springs back toward the tangle
export const OPACITY_RATE = 2.5; // a card fades in over this share of its arrival
export const STRAIGHT_AT = 0.999; // a knot is straight once it has passed this untying
export const CARD_SIZE = { fit: 24, base: 200 }; // a card's knot is scaled to fit the card, never past 1
export const RAIL = {
  inset: 12,
  dropA: 28,
  dropB: 14,
  dropC: 48,
  lift: 70,
  lowerA: 30,
  lowerB: 46,
};
export const STRAND = { stemShare: 0.55, pull: 0.62 }; // the stem meets the cards at this share; each strand bends by this
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
export const TRUNK = { deskFrom: 0.5, deskSpan: 0.5, phoneFrom: 0, phoneSpan: 1 };
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

// The mouth of each person, frowning until their knot is untied, and smiling after.
export const FROWN: Record<string, string> = {
  rina: 'M21 26 Q24 23.8 27 26',
  budi: 'M21 26.2 Q24 24.2 27 26.2',
  siti: 'M21.4 26.4 Q24 24.6 26.6 26.4',
  hendra: 'M21.4 26.2 Q24 24.4 26.6 26.2',
};

// How far each card swings as it is hung on its strand, in degrees.
export const TILT = [{ degrees: -7 }, { degrees: 5 }, { degrees: -4 }, { degrees: 8 }];

// How many threads there are: four strands and four tails on a desktop, three links on a phone.
export const STRANDS = 4;
export const LINKS = 3;
export const ARRIVAL = { face: 0.3, name: 0.38, quote: 0.5 }; // when each part of a card arrives, in its timeline
export const RELIEF = { quote: 0.3, change: 0.55, mouth: 0.6 }; // when each part gives way once the knot is untied
