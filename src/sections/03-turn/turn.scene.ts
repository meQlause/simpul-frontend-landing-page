import type { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { createCarried } from '../../motion/carried';
import { all, one } from '../../motion/dom';
import type { Shared } from '../../motion/types';

interface Spot {
  x: number;
  y: number;
}

interface Start extends Spot {
  angle: number;
}

export interface Route {
  width: number;
  height: number;
  solo: boolean;
  start: Start;
  out: Spot;
  lane: number;
  dock: Spot;
}

export interface Item {
  el: HTMLElement;
  meaning: HTMLElement | null;
  text: string;
  signal: boolean;
  read: boolean;
  centre: number;
  top: number;
  h: number;
  dotX: number;
}

export interface ChatGeo {
  cycle: number;
  lineY: number;
  phase: number;
}

type RawPath = ReturnType<typeof MotionPathPlugin.getRawPath>;

export interface Scene {
  root: HTMLElement;
  shared: Shared;
  phone: boolean;
  inOut: (share: number) => number;
  clamp: (value: number) => number;
  stage: HTMLElement;
  feed: HTMLElement;
  list: HTMLElement;
  layer: HTMLElement;
  reading: HTMLElement;
  dot: HTMLElement;
  svg: SVGSVGElement;
  reach: SVGPathElement;
  onward: SVGPathElement;
  button: HTMLButtonElement;
  order: HTMLElement;
  outline: HTMLElement;
  originals: HTMLElement[];
  clones: HTMLElement[];
  items: Item[];
  clock: { t: number; exit: number };
  chat: { time: number; scroll: number };
  layerP: number;
  receiving: boolean | null;
  lastOffset: number;
  paused: boolean;
  onScreen: boolean;
  route: Route | null;
  raw: { reach: RawPath; out: RawPath } | null;
  chatGeo: ChatGeo | null;
}

function buildOrder(): { order: HTMLElement; outline: HTMLElement } {
  const order = createCarried().el;

  order.classList.add('turn-order');
  order.dataset.handoffObject = '';
  const outline = order.appendChild(document.createElement('span'));

  outline.className = 'turn-order-outline';

  return { order, outline };
}

function itemOf(node: HTMLElement): Item {
  const meaning = node.querySelector<HTMLElement>('.turn-meaning span');

  return {
    el: node,
    meaning,
    text: meaning?.textContent ?? '',
    signal: node.hasAttribute('data-turn-signal'),
    read: false,
    centre: Infinity,
    top: 0,
    h: 0,
    dotX: 0,
  };
}

function cloneChat(list: HTMLElement): { originals: HTMLElement[]; clones: HTMLElement[] } {
  const originals = all(list, 'li');

  originals.forEach((item) => item.classList.remove('is-read'));
  const clones = originals.map((item) => list.appendChild(item.cloneNode(true) as HTMLElement));

  return { originals, clones };
}

export function buildTurn(root: HTMLElement, shared: Shared): Scene {
  const { order, outline } = buildOrder();

  root.append(order);
  const list = one(root, '.turn-messages');
  const { originals, clones } = cloneChat(list);

  return {
    root,
    shared,
    phone: shared.conditions.phone,
    inOut: shared.gsap.parseEase('power2.inOut'),
    clamp: shared.gsap.utils.clamp(0, 1),
    stage: one(root, '.turn-stage'),
    feed: one(root, '.turn-feed'),
    list,
    layer: one(root, '.turn-layer'),
    reading: one(root, '.turn-reading'),
    dot: one(root, '.turn-reading-dot'),
    svg: one<SVGSVGElement>(root, '.turn-thread'),
    reach: one<SVGPathElement>(root, '.turn-thread-reach'),
    onward: one<SVGPathElement>(root, '.turn-thread-out'),
    button: one<HTMLButtonElement>(root, '.turn-pause'),
    order,
    outline,
    originals,
    clones,
    items: [...originals, ...clones].map(itemOf),
    clock: { t: 0, exit: 0 },
    chat: { time: 0, scroll: 0 },
    layerP: 0,
    receiving: null,
    lastOffset: 0,
    paused: false,
    onScreen: false,
    route: null,
    raw: null,
    chatGeo: null,
  };
}
