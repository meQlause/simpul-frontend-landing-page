import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { all, one, SVG_NS, segment } from '../../motion/dom';
import { SEAM, stitch } from '../../motion/thread';
import type { SectionMotion, Shared } from '../../motion/types';
import {
  BIT,
  BITS,
  CELL,
  CURVE_IN,
  CURVE_OUT,
  DRAW,
  EVERY,
  FILL,
  FLOW,
  FORK,
  FORKED,
  FULL,
  KNOT,
  LINE,
  PHONE,
  RAIL,
  STACK,
  STAND,
  TAKES,
  THING,
} from './your-data.tuning';

type Curve = (progress: number) => number;
interface Lines {
  in: SVGPathElement;
  out: SVGPathElement;
}
interface Cell {
  el: SVGRectElement;
  far: number;
}
interface Layer {
  group: SVGGElement;
  name: HTMLLIElement;
  cells: Cell[];
}
interface Kept {
  li: HTMLLIElement;
  drawing: SVGSVGElement;
  thing: SVGGElement;
  shadow: SVGEllipseElement;
  at: number;
}
interface Route {
  flow: number[][];
  turn: number;
}
interface Lay {
  mid: number;
  reach: number;
  fork: number;
  top: number;
  foot: number;
  knot: number;
}

interface Scene {
  root: HTMLElement;
  handoff: Shared['handoff'];
  phone: boolean;
  curves: { inOut: Curve; out: Curve; land: Curve };
  clock: { p: number };
  flow: { at: number; p: number };
  splits: SplitText[];
  chapter: HTMLElement;
  chapterText: string;
  svg: SVGSVGElement;
  stack: SVGSVGElement;
  stem: SVGPathElement;
  right: Lines;
  left: Lines & { down: SVGPathElement };
  bits: SVGRectElement[];
  tail: SVGPathElement;
  end: SVGCircleElement;
  kept: Kept[];
  layers: Layer[];
  route: Route;
}

const ARRIVED = 'is-in';
const EARLY = 'top 80%';
const TITLE_AT = 'top 70%';
const LEAD_AT = 'top 62%';
const DRAWINGS_AT = 'top 78%';
const BODY = '.data-body';
const STAND_SHARE = STAND.centre / STAND.drawn;

const when = (trigger: Element, start: string) => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

function hideStubCopy(root: HTMLElement, shared: Shared): void {
  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }
}

function pathIn(svg: SVGSVGElement): SVGPathElement {
  const node = svg.appendChild(document.createElementNS(SVG_NS, 'path'));

  node.setAttribute('pathLength', '1');

  return node;
}

function squareIn(svg: SVGSVGElement): SVGRectElement {
  const node = svg.appendChild(document.createElementNS(SVG_NS, 'rect'));

  node.setAttribute('width', String(BIT.size));
  node.setAttribute('height', String(BIT.size));
  node.setAttribute('rx', String(BIT.size / BIT.corner));

  return node;
}

function drawingOf(root: HTMLElement, bitCount: number) {
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('class', 'data-threads');
  svg.setAttribute('aria-hidden', 'true');
  root.insertBefore(svg, root.firstChild);
  const stem = pathIn(svg);
  const right = { in: pathIn(svg), out: pathIn(svg) };
  const left = { in: pathIn(svg), down: pathIn(svg), out: pathIn(svg) };
  const bits = Array.from({ length: bitCount }, () => squareIn(svg));
  const tail = pathIn(svg);
  const end = svg.appendChild(document.createElementNS(SVG_NS, 'circle'));

  end.setAttribute('r', String(KNOT.radius));
  end.dataset.handoffObject = '';

  return { svg, stem, right, left, bits, tail, end };
}

function keptOf(root: HTMLElement): Kept[] {
  return all<HTMLLIElement>(root, '.data-kept li').map((node) => ({
    li: node,
    drawing: one<SVGSVGElement>(node, 'svg'),
    thing: one<SVGGElement>(node, '[data-thing]'),
    shadow: one<SVGEllipseElement>(node, '[data-shadow]'),
    at: 0,
  }));
}

function layersOf(root: HTMLElement): Layer[] {
  const names = all<HTMLLIElement>(root, '.data-layers li');

  return all<SVGGElement>(root, '[data-layer]')
    .reverse()
    .map((group, index) => ({
      group,
      name: names[index],
      cells: all<SVGRectElement>(group, '.cell').map((node) => ({
        el: node,
        far: Number(node.dataset.far),
      })),
    }));
}

function buildScene(root: HTMLElement, shared: Shared): Scene {
  const { gsap, conditions } = shared;
  const chapter = one(root, '.data-chapter');
  const drawing = drawingOf(root, conditions.phone ? 0 : BITS);
  const layers = layersOf(root);

  layers.forEach((layer) =>
    layer.cells.forEach(({ el }) => {
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = '50% 50%';
    }),
  );

  return {
    root,
    handoff: shared.handoff,
    phone: conditions.phone,
    curves: {
      inOut: gsap.parseEase('power2.inOut'),
      out: gsap.parseEase('power3.out'),
      land: gsap.parseEase('back.out(1.6)'),
    },
    clock: { p: 0 },
    flow: { at: 0, p: 0 },
    splits: [],
    chapter,
    chapterText: chapter.textContent ?? '',
    ...drawing,
    stack: one<SVGSVGElement>(root, '[data-stack] svg'),
    kept: keptOf(root),
    layers,
    route: { flow: [], turn: 0 },
  };
}

function wordsOf(scene: Scene, target: Element): Element[] {
  const result = SplitText.create(target, { type: 'words', mask: 'words' });

  scene.splits.push(result);

  return result.words;
}

function revealCopy(scene: Scene, shared: Shared): void {
  const { gsap, ease } = shared;
  const { root, chapter, chapterText } = scene;

  gsap.fromTo(
    chapter,
    { scrambleText: '' },
    {
      scrambleText: { text: chapterText, chars: 'upperCase', speed: 0.5 },
      duration: 1.4,
      scrollTrigger: when(root, EARLY),
    },
  );
  gsap.from(one(root, '.data .eyebrow'), {
    autoAlpha: 0,
    x: -14,
    duration: 0.6,
    scrollTrigger: when(root, EARLY),
  });
  gsap.from(wordsOf(scene, one(root, '.data-title')), {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.06,
    duration: 0.95,
    ease: 'power4.out',
    scrollTrigger: when(root, TITLE_AT),
  });
  gsap.from(wordsOf(scene, one(root, '.data-lead')), {
    yPercent: 100,
    stagger: 0.012,
    duration: 0.7,
    ease: ease.out,
    scrollTrigger: when(root, LEAD_AT),
  });
}

function revealHeadings(scene: Scene, shared: Shared): void {
  const body = one(scene.root, BODY);
  const words = all(scene.root, '.data h3').flatMap((heading) => wordsOf(scene, heading));

  shared.gsap.from(words, {
    yPercent: 110,
    stagger: 0.03,
    duration: 0.6,
    scrollTrigger: when(body, EARLY),
  });
}

function revealDrawings(scene: Scene, shared: Shared): void {
  const { gsap, ease } = shared;
  const body = one(scene.root, BODY);
  const scrollTrigger = when(body, DRAWINGS_AT);

  gsap.from(
    scene.kept.map((item) => item.drawing),
    { autoAlpha: 0, y: -46, stagger: 0.12, duration: 1, ease: ease.long, scrollTrigger },
  );
  gsap.from(scene.layers.map((layer) => layer.group).reverse(), {
    autoAlpha: 0,
    y: -46,
    stagger: 0.09,
    duration: 1,
    ease: ease.long,
    scrollTrigger,
  });
}

function boxIn(root: HTMLElement, node: Element) {
  const box = node.getBoundingClientRect();
  const origin = root.getBoundingClientRect();

  return { x: box.left - origin.left, y: box.top - origin.top, w: box.width, h: box.height };
}

function tieAt(scene: Scene, posX: number, posY: number): void {
  const height = scene.root.offsetHeight;

  scene.end.setAttribute('cx', String(posX));
  scene.end.setAttribute('cy', String(posY));
  scene.tail.setAttribute('d', `M${posX},${posY} L${posX},${height}`);
  Object.assign(scene.end.dataset, { exitX: posX, exitY: height, exitAngle: 0 });
}

function measureRail(scene: Scene, width: number, height: number): void {
  const entry = scene.handoff.incoming(scene.root)?.x ?? width / 2;
  const rail = width - RAIL.inset;
  const foot = height - RAIL.foot;

  scene.stem.setAttribute(
    'd',
    `M${entry},0 ${stitch([entry, 0], [rail, RAIL.reach])} L${rail},${foot}`,
  );
  tieAt(scene, rail, foot);
}

function forkLines(scene: Scene, width: number, height: number): Lay {
  const { root, stack } = scene;
  const mid = width / 2;
  const box = boxIn(root, stack);
  const top = box.y + STACK.top * (box.h / STACK.height);
  const foot = box.y + STACK.foot * (box.h / STACK.height);
  const head = boxIn(root, one(root, '[data-top]'));

  return {
    mid,
    reach: box.x + box.w / 2 - mid,
    fork: Math.min(top - FORK.above, head.y + head.h + FORK.under),
    top,
    foot,
    knot: foot + (height - foot) * KNOT.share,
  };
}

function intoPath(lay: Lay, lineX: number): string {
  const { mid, fork, top } = lay;
  const first = fork + (top - fork) * CURVE_IN.first;
  const second = fork + (top - fork) * CURVE_IN.second;

  return `M${mid},${fork} C${mid},${first} ${lineX},${second} ${lineX},${top}`;
}

function awayPath(lay: Lay, lineX: number): string {
  const { mid, foot, knot } = lay;
  const first = foot + (knot - foot) * CURVE_OUT.first;
  const second = foot + (knot - foot) * CURVE_OUT.second;

  return `M${lineX},${foot} C${lineX},${first} ${mid},${second} ${mid},${knot}`;
}

function drawLines(scene: Scene, lay: Lay): void {
  const { mid, fork, top, foot, knot, reach } = lay;
  const rightX = mid + reach;
  const leftX = mid - reach;

  scene.stem.setAttribute('d', `M${mid},0 L${mid},${fork}`);
  scene.right.in.setAttribute('d', intoPath(lay, rightX));
  scene.right.out.setAttribute('d', awayPath(lay, rightX));
  scene.left.in.setAttribute('d', intoPath(lay, leftX));
  scene.left.down.setAttribute('d', `M${leftX},${top} L${leftX},${foot}`);
  scene.left.out.setAttribute('d', awayPath(lay, leftX));
  tieAt(scene, mid, knot);
}

function routeOf(scene: Scene, lay: Lay): Route {
  const { mid, fork, top, foot, reach } = lay;
  const intoRight = intoPath(lay, mid + reach).replace(/^M[^C]*/, '');
  const flow = MotionPathPlugin.getRawPath(`M${mid},0 L${mid},${fork} ${intoRight}`);

  MotionPathPlugin.cacheRawPathMeasurements(flow);
  const curve = scene.left.in.getTotalLength();

  return { flow, turn: curve / (curve + foot - top) };
}

function placeKept(scene: Scene, lay: Lay, turn: number): void {
  const { top, foot } = lay;

  scene.kept.forEach((item) => {
    const box = boxIn(scene.root, item.li);

    item.at = turn + (1 - turn) * segment(box.y + box.h * STAND_SHARE - top, 0, foot - top);
  });
}

function measureFork(scene: Scene, width: number, height: number): void {
  scene.root.style.removeProperty('--reach');
  const lay = forkLines(scene, width, height);

  scene.root.style.setProperty('--reach', `${lay.reach}px`);
  drawLines(scene, lay);
  scene.route = routeOf(scene, lay);
  placeKept(scene, lay, scene.route.turn);
}

function measure(scene: Scene): void {
  const { root, svg } = scene;
  const width = root.offsetWidth;
  const height = root.offsetHeight;

  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  if (scene.phone) {
    measureRail(scene, width, height);
  } else {
    measureFork(scene, width, height);
  }
}

function drawLine(line: SVGPathElement, share: number): void {
  line.style.strokeDasharray = `${share} 2`;
  line.style.visibility = share > LINE.hidden ? 'visible' : 'hidden';
}

function landThing(scene: Scene, item: Kept, share: number): void {
  const lands = scene.curves.land(share);

  item.thing.style.opacity = String(segment(share, 0, THING.shows));
  item.thing.style.transform = `translateY(${-THING.lift * (1 - lands)}px) scale(${THING.small + THING.grow * lands})`;
  item.shadow.style.opacity = String(segment(share, THING.shadowFrom, 1));
  item.li.classList.toggle(ARRIVED, share > THING.inAt);
}

function landKept(scene: Scene, tip: number): void {
  scene.kept.forEach((item) => {
    landThing(scene, item, segment(tip, item.at - THING.before, item.at + THING.after));
  });
}

// A fast scroll speeds the bits up instead of letting them jump a whole spacing per frame.
function flowOf(scene: Scene, progress: number): number {
  const { flow } = scene;
  const step = (progress - flow.p) * FLOW.laps;

  flow.p = progress;
  flow.at += Math.max(-FLOW.maxStep, Math.min(FLOW.maxStep, step));

  return flow.at;
}

function runBits(scene: Scene, progress: number): void {
  const flowing =
    segment(progress, FLOW.from, FORKED) * (1 - segment(progress, FULL - FLOW.stop, FULL));
  const along = flowOf(scene, progress);

  scene.bits.forEach((bit, index) => {
    const time = (((along + index / BITS) % 1) + 1) % 1;
    const spot = MotionPathPlugin.getPositionOnPath(scene.route.flow, time);

    bit.setAttribute('x', String(spot.x - BIT.half));
    bit.setAttribute('y', String(spot.y - BIT.half));
    const fade = segment(time, 0, FLOW.fadeIn) * (1 - segment(time, FLOW.fadeOut, 1));

    bit.style.opacity = String(flowing * fade);
  });
}

function renderFork(scene: Scene, progress: number): void {
  const { inOut } = scene.curves;
  const { stem, right, left, route } = scene;
  const forked = inOut(segment(progress, DRAW.forkFrom, FORKED));
  const parted = inOut(segment(progress, FULL, 1));
  const tip = route.turn * forked + (1 - route.turn) * segment(progress, FORKED, FULL);

  drawLine(stem, inOut(segment(progress, 0, DRAW.stemTo)));
  drawLine(right.in, forked);
  drawLine(left.in, forked);
  drawLine(left.down, segment(progress, FORKED, FULL));
  drawLine(right.out, parted);
  drawLine(left.out, parted);
  runBits(scene, progress);
  landKept(scene, tip);
}

function renderRail(scene: Scene, progress: number): void {
  drawLine(scene.stem, progress);
  scene.kept.forEach((item, index) => {
    const from = PHONE.thingFrom + PHONE.thingEvery * index;

    landThing(scene, item, segment(progress, from, PHONE.thingTo + PHONE.thingEvery * index));
  });
}

function fillLayer(scene: Scene, layer: Layer, share: number): void {
  layer.cells.forEach(({ el, far }) => {
    const begin = far * CELL.spread;
    const alpha = scene.curves.out(segment(share, begin, begin + CELL.takes));

    el.style.opacity = String(alpha);
    el.style.transform = `scale(${CELL.small + CELL.grow * alpha})`;
  });
}

function renderLayers(scene: Scene, progress: number): void {
  const from = scene.phone ? PHONE.layersFrom : FORKED + FILL.after;

  scene.layers.forEach((layer, index) => {
    const start = from + EVERY * index;
    const share = segment(progress, start, start + TAKES);

    fillLayer(scene, layer, share);
    layer.name.classList.toggle(ARRIVED, share > FILL.nameAt);
  });
}

function render(scene: Scene): void {
  const { p } = scene.clock;
  const tied = scene.curves.land(segment(p, DRAW.tieFrom, 1));

  scene.end.style.opacity = String(segment(p, DRAW.tieFrom, DRAW.tieTo));
  scene.end.style.transform = `scale(${tied})`;

  if (scene.phone) {
    renderRail(scene, p);
  } else {
    renderFork(scene, p);
  }

  renderLayers(scene, p);
}

function followScroll(scene: Scene, shared: Shared): () => void {
  const { gsap, ScrollTrigger } = shared;

  gsap.to(scene.clock, {
    p: 1,
    ease: 'none',
    onUpdate: () => render(scene),
    scrollTrigger: { trigger: scene.root, start: 'top 70%', end: 'bottom 98%', scrub: 0.6 },
  });
  const seam = { share: 0 };

  drawLine(scene.tail, 0);
  gsap.to(seam, {
    share: 1,
    ease: 'none',
    onUpdate: () => drawLine(scene.tail, seam.share),
    scrollTrigger: {
      trigger: scene.root,
      start: () => `top+=${scene.end.cy.baseVal.value} ${SEAM.line}`,
      end: `bottom ${SEAM.line}`,
      scrub: SEAM.scrub,
      invalidateOnRefresh: true,
    },
  });
  const onRefresh = () => {
    measure(scene);
    render(scene);
  };

  ScrollTrigger.addEventListener('refresh', onRefresh);

  return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
}

function restore(scene: Scene): void {
  scene.splits.forEach((result) => result.revert());
  scene.svg.remove();
  all<Element>(scene.root, '.cell, [data-thing], [data-shadow]').forEach((node) =>
    node.removeAttribute('style'),
  );
  const lit = [...scene.layers.map((layer) => layer.name), ...scene.kept.map((item) => item.li)];

  lit.forEach((node) => node.classList.remove(ARRIVED));
  scene.root.style.removeProperty('--reach');
  scene.chapter.textContent = scene.chapterText;
  delete scene.root.dataset.motion;
}

export const initYourData: SectionMotion['init'] = (root, shared) => {
  if (shared.conditions.reduce) {
    return undefined;
  }

  shared.gsap.registerPlugin(MotionPathPlugin, SplitText, ScrambleTextPlugin);
  root.dataset.motion = '';
  hideStubCopy(root, shared);
  const scene = buildScene(root, shared);

  revealCopy(scene, shared);
  revealHeadings(scene, shared);
  revealDrawings(scene, shared);
  measure(scene);
  const stopScroll = followScroll(scene, shared);

  render(scene);

  return () => {
    stopScroll();
    restore(scene);
  };
};
