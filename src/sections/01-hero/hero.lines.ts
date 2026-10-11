import { one } from '../../motion/dom';
import { seeded } from '../../motion/random';
import { HALF, KNOT, PHONE, RELEASE, STRAND, TANGLE, THREADS } from './hero.tuning';

export interface LineNodes {
  lines: SVGSVGElement;
  symbol: HTMLElement;
  busy: HTMLElement;
  kicker: HTMLElement;
  below: HTMLElement;
  wordmark: HTMLElement;
  clear: HTMLElement;
  tangled: SVGPathElement[];
  straight: SVGPathElement[];
}

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Geometry {
  phone: boolean;
  count: number;
  width: number;
  height: number;
  centreX: number;
  centreY: number;
  radius: number;
  busy: Box;
  kicker: Box;
  below: Box;
  mark: Box;
  clearTop: number;
  clearBottom: number;
}

type Point = readonly [number, number];
type Random = () => number;

function boxIn(node: Element, origin: DOMRect): Box {
  const box = node.getBoundingClientRect();

  return {
    top: box.top - origin.top,
    bottom: box.bottom - origin.top,
    left: box.left - origin.left,
    right: box.right - origin.left,
  };
}

function readGeometry(nodes: LineNodes, phone: boolean): Geometry {
  const box = nodes.lines.getBoundingClientRect();
  const symbol = nodes.symbol.getBoundingClientRect();
  const clear = nodes.clear.getBoundingClientRect();

  return {
    phone,
    count: phone ? THREADS.phoneIn : THREADS.deskIn,
    width: box.width,
    height: box.height,
    centreX: symbol.left + symbol.width / 2 - box.left,
    centreY: symbol.top + symbol.height / 2 - box.top,
    radius: symbol.width * KNOT,
    busy: boxIn(nodes.busy, box),
    kicker: boxIn(nodes.kicker, box),
    below: boxIn(nodes.below, box),
    mark: boxIn(nodes.wordmark, box),
    clearTop: clear.top - box.top,
    clearBottom: clear.bottom - box.top,
  };
}

function pointAt(geo: Geometry, along: number, across: number): string {
  return geo.phone
    ? `${geo.centreX + across},${geo.centreY + along}`
    : `${geo.centreX + along},${geo.centreY + across}`;
}

const pair = (point: Point): string => `${point[0]},${point[1]}`;

const wobble = (random: Random, size: number): number => (random() - HALF) * size;

function phoneTangle(thread: SVGPathElement, index: number, geo: Geometry, random: Random): void {
  const side = index % 2 ? 1 : -1;
  const top = geo.busy.bottom + PHONE.gap;
  const bottom = geo.mark.top - PHONE.bottomGap;
  const lineY = top + ((index >> 1) / Math.max(1, Math.ceil(geo.count / 2) - 1)) * (bottom - top);
  const startX = side > 0 ? geo.width + PHONE.edge : -PHONE.edge;
  const endX = geo.centreX + side * geo.radius * PHONE.reach;
  const endY = geo.centreY + (lineY - geo.centreY) * PHONE.pull;
  const band = (share: number) => top + (bottom - top) * Math.min(1, Math.max(0, share));
  const share = (lineY - top) / Math.max(1, bottom - top);
  const bendA = share + wobble(random, PHONE.spread);
  const bendB = share + wobble(random, PHONE.spread);
  const run = endX - startX;
  const near = startX + run * PHONE.bezier.near;
  const far = startX + run * PHONE.bezier.far;

  thread.setAttribute(
    'd',
    `M${startX},${lineY} C${near},${band(bendA)} ${far},${band(bendB)} ${endX},${endY}`,
  );
}

function deskTangle(thread: SVGPathElement, index: number, geo: Geometry, random: Random): void {
  const band = deskBand(geo);
  const points = deskPoints(index, geo, band, random);

  thread.setAttribute('d', deskPath(points, deskStep(geo), band.span, random));
}

interface Band {
  top: number;
  span: number;
}

function deskBand(geo: Geometry): Band {
  const reach = (geo.busy.bottom - geo.busy.top) * TANGLE.reach;
  const top = Math.max(geo.kicker.bottom + TANGLE.under, geo.busy.top - reach);
  const bottom = Math.min(geo.below.top - TANGLE.above, geo.busy.bottom + reach);

  return { top, span: bottom - top };
}

const deskStep = (geo: Geometry): number =>
  (geo.centreX - geo.radius - TANGLE.left) / TANGLE.segments;

function deskPoints(index: number, geo: Geometry, band: Band, random: Random): Point[] {
  const drift = (from: number) => Math.min(1, Math.max(0, from + wobble(random, TANGLE.drift)));
  const yAt = (share: number) => band.top + band.span * share;
  const step = deskStep(geo);
  const left = TANGLE.left;
  const shareA = random();
  const shareB = drift(shareA);
  const shareC = drift(shareB);

  return [
    [left, yAt(shareA)],
    [left + step * (TANGLE.bend.first + TANGLE.jitter * random()), yAt(shareB)],
    [left + step * (TANGLE.bend.second + TANGLE.jitter * random()), yAt(shareC)],
    [geo.centreX - geo.radius, geo.centreY + (index - (geo.count - 1) / 2) * TANGLE.gap],
  ];
}

function deskPath(points: Point[], step: number, span: number, random: Random): string {
  let pathData = `M${pair(points[0])}`;

  for (let leg = 1; leg < points.length; leg++) {
    const from = points[leg - 1];
    const to = points[leg];
    const lift = wobble(random, TANGLE.lift) * span;

    pathData += ` C${from[0] + step * TANGLE.control},${from[1] + lift} ${to[0] - step * TANGLE.control},${to[1] - lift} ${pair(to)}`;
  }

  return pathData;
}

function phoneStrand(index: number, geo: Geometry): string {
  const across = (index - (THREADS.out - 1) / 2) * STRAND.phoneGap;
  const start = geo.mark.bottom - geo.centreY + STRAND.phoneTop;
  const end = Math.max(start + STRAND.phoneMin, geo.clearTop - geo.centreY - STRAND.phoneClear);

  return `M${pointAt(geo, start, across)} L${pointAt(geo, end, across)}`;
}

function deskStrand(index: number, geo: Geometry): string {
  const across =
    Math.max(geo.radius * STRAND.bend, geo.clearBottom - geo.centreY + STRAND.lead) +
    index * STRAND.gap;
  const run = geo.width - geo.centreX + STRAND.tail;
  const start = pointAt(geo, geo.radius * STRAND.start, geo.radius * STRAND.start);
  const bend = pointAt(geo, geo.radius * STRAND.bend, across);
  const reach = pointAt(geo, geo.radius * STRAND.reach, across);

  return `M${start} Q${bend} ${reach} L${pointAt(geo, run, across)}`;
}

export function placeLines(nodes: LineNodes, phone: boolean): void {
  const geo = readGeometry(nodes, phone);
  const random = seeded(THREADS.seed);
  const tangle = phone ? phoneTangle : deskTangle;
  const strand = phone ? phoneStrand : deskStrand;

  nodes.lines.setAttribute('viewBox', `0 0 ${geo.width} ${geo.height}`);
  nodes.tangled.forEach((thread, index) => tangle(thread, index, geo, random));
  nodes.straight.forEach((thread, index) => thread.setAttribute('d', strand(index, geo)));
}

export function placeRelease(
  root: HTMLElement,
  lockup: HTMLElement,
  release: SVGSVGElement,
  releasePath: SVGPathElement,
): void {
  const origin = root.getBoundingClientRect();
  const markBox = lockup.getBoundingClientRect();
  const anchor = one(root, '[data-thread-out]').getBoundingClientRect();
  const startX = markBox.left + markBox.width / 2 - origin.left;
  const startY = markBox.top + markBox.width * RELEASE.startAt - origin.top;
  const endX = anchor.left - origin.left;
  const endY = anchor.top - origin.top;

  release.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
  releasePath.setAttribute(
    'd',
    `M${startX} ${startY} C${startX - RELEASE.bend} ${startY + RELEASE.drop}, ${endX + RELEASE.reach} ${endY - RELEASE.reach}, ${endX} ${endY}`,
  );
}
