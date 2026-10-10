import { one, SVG_NS } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import type { Shared } from '../../motion/types';
import { knots, untie, type Knot, type Pair } from './knots';
import { drawStroke } from './people.strands';
import {
  ARRIVAL,
  CARD_SIZE,
  FROWN,
  HANG,
  HEIGHT,
  OPACITY_RATE,
  RELIEF,
  SHOWN,
  STRAIGHT_AT,
  TILT,
} from './people.tuning';

// One person's card: its knot, the thread it hangs on, and the words that give way as it arrives.

type Ease = (share: number) => number;
type Words = (target: Element) => Element[];

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const MIDDLE = 0.5; // a grab starts in the middle of the knot

interface CardState {
  arrival: number; // 0 to 1: the card has arrived
  auto: number; // the knot unties by itself, in the middle of the screen
  hover: number; // the knot unties on hover or focus
  pull: number; // the knot is being pulled
  pulled: boolean; // the knot was pulled straight and stays straight
  dx: number;
  dy: number;
  at: number; // where along the knot it was grabbed
  untied: number; // the untying in use, 0 to 1
  width: number;
  height: number;
  scale: number; // the knot's scale to fit its card
  top: Pair; // the card's top and bottom centre, in the section
  bottom: Pair;
  focused: boolean;
  pointing: boolean;
  wanted: boolean;
  dragging: boolean;
}

export interface Card {
  el: HTMLElement;
  index: number;
  box: HTMLElement;
  tangle: SVGSVGElement;
  knot: Knot;
  line: SVGPathElement;
  loose: SVGPathElement[];
  mouth: SVGPathElement;
  smile: string; // the mouth as it was drawn, which the page puts back on cleanup
  arrive: gsap.core.Timeline;
  relief: gsap.core.Timeline;
  shared: Shared;
  hang: Ease;
  state: CardState;
}

function freshState(): CardState {
  return {
    arrival: 0,
    auto: 0,
    hover: 0,
    pull: 0,
    pulled: false,
    dx: 0,
    dy: 0,
    at: MIDDLE,
    untied: 0,
    width: 1,
    height: 1,
    scale: 1,
    top: [0, 0],
    bottom: [0, 0],
    focused: false,
    pointing: false,
    wanted: false,
    dragging: false,
  };
}

// The card arrives: its face pops in, its name rises, and its quote follows.
function arrivalOf(element: HTMLElement, shared: Shared, words: Words): gsap.core.Timeline {
  const { gsap, ease } = shared;
  const face = one(element, '.person-face');
  return gsap
    .timeline({ paused: true, defaults: { ease: ease.out } })
    .from(face, { scale: 0.5, autoAlpha: 0, duration: 0.35, ease: 'back.out(2)' }, ARRIVAL.face)
    .from(words(one(element, 'h3')), { yPercent: 110, stagger: 0.04, duration: 0.4 }, ARRIVAL.name)
    .from(
      words(one(element, 'blockquote')),
      { yPercent: 110, stagger: 0.015, duration: 0.4 },
      ARRIVAL.quote,
    );
}

// Once untied, the quote gives way to the change, the card warms, and the mouth turns to a smile.
function reliefOf(element: HTMLElement, shared: Shared, words: Words): gsap.core.Timeline {
  const { gsap } = shared;
  const box = one(element, '.person-knot');
  const mouth = one<SVGPathElement>(element, '.person-mouth');
  const quote = words(one(element, 'blockquote'));
  const smile = mouth.getAttribute('d') ?? '';
  return gsap
    .timeline({ paused: true, defaults: { ease: 'power2.out' } })
    .to(box, { backgroundColor: '#edf4e7', duration: 0.7, ease: 'none' }, 0)
    .to(quote, { y: -14, opacity: 0, stagger: 0.012, duration: 0.3 }, RELIEF.quote)
    .from(
      words(one(element, '.person-say p')),
      { yPercent: 110, stagger: 0.035, duration: 0.4 },
      RELIEF.change,
    )
    .fromTo(
      mouth,
      { attr: { d: FROWN[element.dataset.person ?? ''] } },
      { attr: { d: smile }, duration: 0.35 },
      RELIEF.mouth,
    );
}

// A stroke inside the knot's own svg.
function strokeIn(svg: SVGSVGElement): SVGPathElement {
  const node = svg.appendChild(document.createElementNS(SVG_NS, 'path'));
  node.setAttribute('pathLength', '1');
  return node;
}

// Builds a card: its tangle svg in the knot, the strokes it draws with, and its two timelines.
export function buildCard(element: HTMLElement, index: number, shared: Shared, words: Words): Card {
  const box = one(element, '.person-knot');
  const tangle = box.appendChild(document.createElementNS(SVG_NS, 'svg'));
  tangle.setAttribute('class', 'person-tangle');
  const knot = knots[element.dataset.person as keyof typeof knots];
  const mouth = one<SVGPathElement>(element, '.person-mouth');
  return {
    el: element,
    index,
    box,
    tangle,
    knot,
    line: strokeIn(tangle),
    loose: (knot.extras ?? []).map(() => strokeIn(tangle)),
    mouth,
    smile: mouth.getAttribute('d') ?? '',
    arrive: arrivalOf(element, shared, words),
    relief: reliefOf(element, shared, words),
    shared,
    hang: shared.gsap.parseEase(HANG),
    state: freshState(),
  };
}

// The card's scale to fit its knot, measured again on each refresh.
export function sizeCard(card: Card): void {
  const { state } = card;
  state.width = card.box.clientWidth;
  state.height = card.box.clientHeight;
  state.scale = Math.min(1, (state.width - CARD_SIZE.fit) / CARD_SIZE.base);
  card.tangle.setAttribute('viewBox', `0 0 ${state.width} ${state.height}`);
}

// The knot's share of untying: a pull, a hover or the timer, and the whole of it once it was pulled straight.
function shareOf(state: CardState): number {
  return state.pulled ? 1 : Math.max(state.auto, state.hover, state.pull);
}

// One frame of a card: its knot, drawn untied by its share, and its place on its strand.
export function renderCard(card: Card): void {
  const { state, knot } = card;
  const share = shareOf(state);
  const scaleY = state.height / HEIGHT;
  const { line, loose, fade } = untie(knot, share, {
    x: state.dx / state.scale,
    y: state.dy / scaleY,
    at: state.at,
  });
  const toPath = (points: Pair[]) =>
    points
      .map(
        ([left, top], step) =>
          `${step ? 'L' : 'M'}${(state.width / 2 + left * state.scale).toFixed(1)},${(top * scaleY).toFixed(1)}`,
      )
      .join('');
  card.line.setAttribute('d', toPath(line));
  const shown = clamp((state.arrival - SHOWN.from) / SHOWN.span);
  drawStroke(card.line, shown);
  card.loose.forEach((node, index) => {
    node.setAttribute('d', toPath(loose[index]));
    drawStroke(node, shown);
    node.style.opacity = String(fade);
  });
  card.shared.gsap.set(card.el, {
    rotation: TILT[card.index].degrees * (1 - card.hang(state.arrival)),
    opacity: clamp(state.arrival * OPACITY_RATE),
  }); // opacity, not autoAlpha: the card stays focusable
  card.arrive.progress(state.arrival);
  card.relief.progress(share);
  state.untied = share;
}

// A knot is straight once it has passed the untying that makes it so.
export const isStraight = (card: Card): boolean => card.state.untied >= STRAIGHT_AT;
