import type { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import type { gsap } from '../../motion/gsap';
import type { Shared } from '../../motion/types';
import type { Geo, Plan, Pose } from './heap';

// Everything the motion holds between frames, in one place. The render reads it; the refresh rewrites
// the layout and the plan; the cleanup takes the DOM back.
type RawPath = ReturnType<typeof MotionPathPlugin.getRawPath>;

// One notification card on the stage: the card, its words (faded at the last commitment), its summary
// lines, and the tick that pops when it goes out through the limit.
export interface Note {
  el: HTMLElement;
  words: HTMLElement[];
  sum: HTMLElement;
  tick: HTMLElement;
}

// A card's part in the story: the commitment (step) that takes it, its place among those taken (slot),
// and how many that commitment takes in all (size).
export interface Role {
  step: number;
  slot: number;
  size: number;
}

// The scroll window of one commitment, in pixels of the section's clock: a to b, with m where it holds.
export interface Window {
  a: number;
  b: number;
  m: number;
}

// The stage's geometry: the heap's sizes plus where things sit in the section.
export interface Layout extends Geo {
  W: number;
  H: number;
  lift: number;
  final: { x: number; y: number };
  windows: Window[];
  knots: [number, number][];
  release: number;
  rideRaw: RawPath;
  rise: [number, number];
  rest: number;
  fold: [number, number];
  count: [number, number];
  ask: [number, number];
  chips: [number, number][];
  reach: number;
  cell: number;
}

// One commitment on the desktop index: its tile, drawing, heading, sentence and loop.
export interface Slide {
  li: HTMLElement;
  tile: HTMLElement;
  strokes: SVGElement[];
  loop: gsap.core.Timeline;
  title: Element[];
  text: Element[];
  mark: HTMLElement;
  tl: gsap.core.Timeline | null;
}

export interface Carousel {
  index: HTMLElement | null;
  slides: Slide[];
  bars: HTMLElement[];
  opened: number;
}

// Every DOM node the motion moves. Built once, by buildBoard, and removed by the cleanup.
export interface Board {
  root: HTMLElement;
  body: HTMLElement;
  stage: HTMLElement;
  panel: HTMLElement;
  survivor: HTMLElement;
  rules: HTMLElement[];
  notes: Note[];
  hold: HTMLElement;
  ring: SVGCircleElement;
  held: HTMLElement;
  fix: HTMLElement;
  counter: HTMLElement;
  counted: HTMLElement;
  summary: HTMLElement;
  night: HTMLElement;
  hour: HTMLElement;
  queue: HTMLElement;
  chips: HTMLElement[];
  ask: HTMLElement;
  tallied: HTMLElement;
  tallyLabel: HTMLElement;
  extras: HTMLElement[];
  svg: SVGSVGElement;
  thread: SVGPathElement;
}

// How restless the board is: what it should feel (from the count) and what it feels now.
export interface Feel {
  noise: number;
  felt: number;
}

// The easing curves the frames use, made once from GSAP's own parsers.
export interface Curves {
  inOut: (progress: number) => number;
  out: (progress: number) => number;
  takeoff: (progress: number) => number;
  pop: (progress: number) => number;
  sky: (progress: number) => string;
  glow: (progress: number) => string;
}

export interface Scene {
  board: Board;
  shared: Shared;
  curves: Curves;
  phone: boolean;
  take: number[];
  layout: Layout;
  plan: Plan;
  roles: Role[];
  starts: Pose[];
  clock: { p: number };
  feel: Feel;
  carousel: Carousel;
}
