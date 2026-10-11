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

type Ease = (share: number) => number;
type Words = (target: Element) => Element[];

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const MIDDLE = 0.5;

interface CardState {
  arrival: number;
  auto: number;
  hover: number;
  pull: number;
  pulled: boolean;
  dx: number;
  dy: number;
  at: number;
  untied: number;
  width: number;
  height: number;
  scale: number;
  top: Pair;
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
  smile: string;
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

function strokeIn(svg: SVGSVGElement): SVGPathElement {
  const node = svg.appendChild(document.createElementNS(SVG_NS, 'path'));

  node.setAttribute('pathLength', '1');

  return node;
}

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

export function sizeCard(card: Card): void {
  const { state } = card;

  state.width = card.box.clientWidth;
  state.height = card.box.clientHeight;
  state.scale = Math.min(1, (state.width - CARD_SIZE.fit) / CARD_SIZE.base);
  card.tangle.setAttribute('viewBox', `0 0 ${state.width} ${state.height}`);
}

function shareOf(state: CardState): number {
  return state.pulled ? 1 : Math.max(state.auto, state.hover, state.pull);
}

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
  });
  card.arrive.progress(state.arrival);
  card.relief.progress(share);
  state.untied = share;
}

export const isStraight = (card: Card): boolean => card.state.untied >= STRAIGHT_AT;
