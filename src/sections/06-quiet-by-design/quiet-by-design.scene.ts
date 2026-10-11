import type { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import type { gsap } from '../../motion/gsap';
import type { Shared } from '../../motion/types';
import type { Geo, Plan, Pose } from './heap';

type RawPath = ReturnType<typeof MotionPathPlugin.getRawPath>;

export interface Note {
  el: HTMLElement;
  words: HTMLElement[];
  sum: HTMLElement;
  tick: HTMLElement;
}

export interface Role {
  step: number;
  slot: number;
  size: number;
}

export interface Window {
  a: number;
  b: number;
  m: number;
}

export interface Layout extends Geo {
  W: number;
  H: number;
  lift: number;
  final: { x: number; y: number };
  windows: Window[];
  knots: [number, number][];
  release: number;
  rideRaw: RawPath;
  into: { top: number; length: number; total: number };
  rise: [number, number];
  rest: number;
  fold: [number, number];
  count: [number, number];
  ask: [number, number];
  chips: [number, number][];
  reach: number;
  cell: number;
}

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

export interface Feel {
  noise: number;
  felt: number;
}

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
