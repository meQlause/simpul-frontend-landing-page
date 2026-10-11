import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { createCarried } from '../../motion/carried';
import { all, one, SVG_NS } from '../../motion/dom';
import type { Shared } from '../../motion/types';
import {
  ARRIVED,
  CLOCK,
  DOCK,
  ENTRY,
  EVIDENCE,
  FIT,
  GREEN,
  HALF,
  HIDE_AT,
  LEGS,
  ROUTE,
} from './how.tuning';

type Dock = 'message' | 'understand' | 'decide' | 'role' | 'backup' | 'hold' | 'phone';
type Point = [number, number];
type RawPath = ReturnType<typeof MotionPathPlugin.getRawPath>;
type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number };

const PATH_CLASS = 'how-path';
const GREEN_CLASS = 'how-path how-path--green';
const FIT_DIGITS = 3;

const STATION: Record<Dock, string> = {
  message: 'message',
  understand: 'understand',
  decide: 'decide',
  role: 'route',
  backup: 'route',
  hold: 'arrive',
  phone: 'arrive',
};

interface Leg {
  from: Dock;
  to: Dock;
  start: number;
  end: number;
  raw: RawPath;
  share0: number;
  share1: number;
}

interface Geo {
  docks: Record<Dock, Point>;
  view: Record<Dock, number>;
  legs: Leg[];
  entryRaw: RawPath;
  start: { x: number; y: number; angle: number };
  understandAt: number;
}

export interface Journey {
  root: HTMLElement;
  shared: Shared;
  phone: boolean;
  stage: HTMLElement;
  track: HTMLElement;
  message: HTMLElement;
  label: HTMLElement;
  labelFields: HTMLElement[];
  ruleRow: HTMLElement;
  toRow: HTMLElement;
  ring: HTMLElement;
  traveller: HTMLElement;
  halo: HTMLElement;
  order: HTMLElement;
  svg: SVGSVGElement;
  paths: Record<
    'entry' | 'journey' | 'evidence' | 'greenJourney' | 'greenEntry' | 'exit',
    SVGPathElement
  >;
  clock: { t: number; entry: number };
  geo: Geo | null;
  received: boolean | null;
  inOut: (share: number) => number;
  clamp: (value: number) => number;
}

function buildTraveller(
  root: HTMLElement,
  track: HTMLElement,
): { traveller: HTMLElement; halo: HTMLElement; message: HTMLElement; label: HTMLElement } {
  const traveller = document.createElement('div');

  traveller.className = 'how-traveler';
  traveller.setAttribute('aria-hidden', 'true');
  const halo = traveller.appendChild(document.createElement('span'));

  halo.className = 'how-traveler-halo';
  const message = traveller.appendChild(one(root, '.how-msg').cloneNode(true) as HTMLElement);

  message.className = 'how-traveler-message';
  const label = traveller.appendChild(one(root, '.how-label').cloneNode(true) as HTMLElement);

  label.className = 'how-label how-traveler-label';
  track.append(traveller);

  return { traveller, halo, message, label };
}

function addRows(
  label: HTMLElement,
  hold: HTMLElement,
): { ruleRow: HTMLElement; toRow: HTMLElement; ring: HTMLElement } {
  const row = (name: string, value: string) => {
    const div = label.appendChild(document.createElement('div'));

    div.className = 'how-label-extra';
    div.innerHTML = `<dt>${name}</dt><dd><b>✓</b> ${value}</dd>`;

    return div;
  };

  const ruleRow = row('Rule', 'Ready to ship, notify sales');
  const toRow = row('To', 'Siti Aminah');
  const ring = label.appendChild(hold.cloneNode(true) as HTMLElement);

  ring.classList.add('how-traveler-hold');

  return { ruleRow, toRow, ring };
}

function buildPaths(track: HTMLElement): { svg: SVGSVGElement; paths: Journey['paths'] } {
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.classList.add('how-track-svg');
  svg.setAttribute('aria-hidden', 'true');
  const path = (className: string) => {
    const node = svg.appendChild(document.createElementNS(SVG_NS, 'path'));

    node.setAttribute('class', className);
    node.setAttribute('pathLength', '1');
    node.style.strokeDasharray = '0 2';

    return node;
  };

  const paths = {
    entry: path(PATH_CLASS),
    journey: path(PATH_CLASS),
    evidence: path(`${PATH_CLASS} how-path--evidence`),
    greenJourney: path(GREEN_CLASS),
    greenEntry: path(GREEN_CLASS),
    exit: path(GREEN_CLASS),
  };

  paths.evidence.setAttribute('transform', `translate(0 ${EVIDENCE.offset})`);
  track.prepend(svg);

  return { svg, paths };
}

export function buildJourney(root: HTMLElement, shared: Shared): Journey {
  const track = one(root, '.how-track');
  const built = buildTraveller(root, track);
  const rows = addRows(built.label, one(root, '.how-hold'));
  const order = createCarried().el;

  order.classList.add('how-order');
  order.dataset.handoffObject = '';
  track.append(order);
  const { svg, paths } = buildPaths(track);

  return {
    root,
    shared,
    phone: shared.conditions.phone,
    stage: one(root, '.how-stage'),
    track,
    message: built.message,
    label: built.label,
    labelFields: all<HTMLElement>(built.label, ':scope > div:not(.how-label-extra) dd'),
    ruleRow: rows.ruleRow,
    toRow: rows.toRow,
    ring: rows.ring,
    traveller: built.traveller,
    halo: built.halo,
    order,
    svg,
    paths,
    clock: { t: 0, entry: 0 },
    geo: null,
    received: null,
    inOut: shared.gsap.parseEase('power2.inOut'),
    clamp: shared.gsap.utils.clamp(0, 1),
  };
}

function boxIn(node: Element, origin: DOMRect): Box {
  const rect = node.getBoundingClientRect();
  const left = rect.left - origin.left;
  const top = rect.top - origin.top;

  return {
    x: left,
    y: top,
    w: rect.width,
    h: rect.height,
    cx: left + rect.width / 2,
    cy: top + rect.height / 2,
  };
}

function startOf(root: HTMLElement): { x: number; y: number; angle: number } {
  const anchor = one(root, '[data-thread-in]').getBoundingClientRect();
  const box = root.getBoundingClientRect();

  return { x: anchor.left - box.left, y: anchor.top - box.top, angle: 0 };
}

function entryPathOf(start: { x: number; y: number }, trip: Journey, message: Point): string {
  const stage = trip.stage.getBoundingClientRect();
  const root = trip.root.getBoundingClientRect();
  const fromX = start.x - (stage.left - root.left);
  const fromY = start.y - (stage.top - root.top);
  const bendY = fromY + (message[1] - fromY) * ENTRY.bend;

  return `M${fromX},${fromY} C${fromX},${bendY} ${message[0] - ENTRY.reach},${message[1]} ${message[0]},${message[1]}`;
}

function viewOf(trip: Journey, trackBox: DOMRect, stageWidth: number): Record<Dock, number> {
  const maxX = Math.max(0, trip.track.scrollWidth - stageWidth);
  const view = {} as Record<Dock, number>;

  for (const dock of Object.keys(STATION) as Dock[]) {
    const panel = one(trip.root, `[data-panel="${STATION[dock]}"]`);

    view[dock] = Math.min(Math.max(0, boxIn(panel, trackBox).x), maxX);
  }

  return view;
}

function legsOf(docks: Record<Dock, Point>): { legs: Leg[]; pathOf: Record<number, string> } {
  const pathOf: Record<number, string> = {};
  const built = LEGS.map((leg, index) => {
    const [fromX, fromY] = docks[leg.from];
    const [toX, toY] = docks[leg.to];
    const bend = (toX - fromX) * HALF;
    const pathData =
      leg.from === 'role'
        ? `M${fromX},${fromY} C${fromX + Math.max(ROUTE.minReach, (toX - fromX) * ROUTE.bend)},${fromY} ${toX},${fromY + (toY - fromY) * ROUTE.lift} ${toX},${toY}`
        : `M${fromX},${fromY} C${fromX + bend},${fromY} ${toX - bend},${toY} ${toX},${toY}`;

    pathOf[index] = pathData;
    const raw = MotionPathPlugin.getRawPath(pathData);

    MotionPathPlugin.cacheRawPathMeasurements(raw);

    return {
      from: leg.from,
      to: leg.to,
      start: leg.t0,
      end: leg.t1,
      raw,
      length: (raw as unknown as { totalLength: number }).totalLength,
      share0: 0,
      share1: 0,
    };
  });
  const total = built.reduce((sum, leg) => sum + leg.length, 0);
  let run = 0;

  for (const leg of built) {
    leg.share0 = run / total;
    run += leg.length;
    leg.share1 = run / total;
  }

  return { legs: built, pathOf };
}

function drawPaths(
  trip: Journey,
  paths: {
    entryD: string;
    journeyD: string;
    phone: Box;
    width: number;
    height: number;
    view: Record<Dock, number>;
    stageLeft: number;
  },
): void {
  const out = one(trip.root, '[data-thread-out]').getBoundingClientRect();
  const outY = out.top - trip.stage.getBoundingClientRect().top;
  const phoneX = paths.phone.cx;
  const exitD = `M${phoneX},${paths.phone.y + paths.phone.h} L${phoneX},${outY}`;

  Object.assign(trip.order.dataset, {
    exitX: phoneX - paths.view.phone + paths.stageLeft - trip.root.getBoundingClientRect().left,
    exitY: trip.root.offsetHeight,
    exitAngle: 0,
  });

  trip.svg.setAttribute('width', String(paths.width));
  trip.svg.setAttribute('viewBox', `0 0 ${paths.width} ${paths.height}`);
  trip.paths.entry.setAttribute('d', paths.entryD);
  trip.paths.greenEntry.setAttribute('d', paths.entryD);

  for (const node of [trip.paths.journey, trip.paths.evidence, trip.paths.greenJourney]) {
    node.setAttribute('d', paths.journeyD);
  }

  trip.paths.exit.setAttribute('d', exitD);
}

function dockPlaces(
  trip: Journey,
  match: Element,
  notice: Element,
  trackBox: DOMRect,
): { docks: Record<Dock, Point>; msg: Box } {
  const boxAt = (node: Element) => boxIn(node, trackBox);
  const msg = boxAt(one(trip.root, '.how-msg'));
  const half = msg.w / 2;
  const arrive = boxAt(one(trip.root, '[data-panel="arrive"]'));
  const label = boxAt(one(trip.root, '.how-panel .how-label'));
  const matchBox = boxAt(match);
  const role = boxAt(one(trip.root, '.how-role'));
  const backup = boxAt(one(trip.root, '.how-backup'));
  const noticeBox = boxAt(notice);
  const docks: Record<Dock, Point> = {
    message: [msg.cx, msg.cy],
    understand: [label.cx, label.cy],
    decide: [matchBox.x - DOCK.gap - half, matchBox.cy],
    role: [role.x - DOCK.gap - half, role.cy],
    backup: [backup.x - DOCK.gap - half, backup.cy],
    hold: [arrive.x + arrive.w * DOCK.handX, arrive.y + arrive.h * DOCK.handY],
    phone: [noticeBox.cx, noticeBox.cy],
  };

  return { docks, msg };
}

function fitPhone(trip: Journey, stage: DOMRect): void {
  const fit = Math.min(
    FIT.max,
    (stage.height * FIT.heightShare) / FIT.height,
    (stage.width * FIT.widthShare) / FIT.width,
  );

  trip.root.style.setProperty('--fit', fit.toFixed(FIT_DIGITS));
}

export function measureJourney(trip: Journey, match: Element, notice: Element): void {
  const stage = trip.stage.getBoundingClientRect();

  fitPhone(trip, stage);
  const trackBox = trip.track.getBoundingClientRect();
  const { docks, msg } = dockPlaces(trip, match, notice, trackBox);

  trip.traveller.style.width = `${msg.w}px`;
  const view = viewOf(trip, trackBox, stage.width);
  const start = trip.shared.handoff.incoming(trip.root) ?? startOf(trip.root);
  const { legs, pathOf } = legsOf(docks);
  const journeyD =
    `M${msg.cx},${msg.cy}` +
    legs.map((leg, index) => pathOf[index].replace(/^M[^A-Z]+/i, '')).join('');
  const entryD = entryPathOf(start, trip, docks.message);
  const entryRaw = MotionPathPlugin.getRawPath(entryD);

  MotionPathPlugin.cacheRawPathMeasurements(entryRaw);
  const phone = boxIn(one(trip.root, '.how-phone'), trackBox);

  drawPaths(trip, {
    entryD,
    journeyD,
    phone,
    width: trackBox.width,
    height: trackBox.height,
    view,
    stageLeft: stage.left,
  });
  trip.geo = { docks, view, legs, entryRaw, start, understandAt: legs[0].share1 };
}

function travel(trip: Journey, time: number): { x: number; y: number; p: number; cam: number } {
  const geo = trip.geo;

  if (!geo) {
    return { x: 0, y: 0, p: 0, cam: 0 };
  }

  let [posX, posY] = geo.docks.message;
  let share = 0;
  let cam = geo.view.message;

  for (const leg of geo.legs) {
    if (time < leg.start) {
      break;
    }

    const eased = trip.inOut(trip.clamp((time - leg.start) / (leg.end - leg.start)));

    ({ x: posX, y: posY } = MotionPathPlugin.getPositionOnPath(leg.raw, eased));
    share = leg.share0 + (leg.share1 - leg.share0) * eased;
    cam = geo.view[leg.from] + (geo.view[leg.to] - geo.view[leg.from]) * eased;
  }

  return { x: posX, y: posY, p: share, cam };
}

function span(node: SVGPathElement, from: number, to: number): void {
  node.style.strokeDasharray = `${Math.max(0, to - from)} 2`;
  node.style.strokeDashoffset = `${-from}`;
}

function drawTrail(trip: Journey, time: number, share: number): void {
  const geo = trip.geo;

  span(trip.paths.journey, 0, share);
  const tie = trip.clamp((time - EVIDENCE.tieAt) / EVIDENCE.tieSpan);
  const understandAt = geo?.understandAt ?? 0;
  const evidenceFrom = time < EVIDENCE.leaves ? understandAt * (1 - trip.inOut(tie)) : 0;
  const evidenceTo = tie > 0 ? Math.max(share, understandAt) : 0;

  span(trip.paths.evidence, evidenceFrom, evidenceTo);
}

function drawGreen(trip: Journey, time: number): void {
  const green = trip.inOut(trip.clamp((time - GREEN) / CLOCK.green));

  span(trip.paths.greenJourney, 1 - green, 1);
  span(trip.paths.greenEntry, 1 - trip.clamp((time - GREEN - CLOCK.green) / CLOCK.greenStop), 1);
  span(trip.paths.exit, 0, trip.inOut(trip.clamp((time - GREEN) / CLOCK.greenRun)));
}

function renderEntry(trip: Journey, entry: number, time: number): void {
  const { gsap } = trip.shared;
  const eased = trip.inOut(entry);

  span(trip.paths.entry, 0, eased);

  if (!trip.geo) {
    return;
  }

  const pos = MotionPathPlugin.getPositionOnPath(trip.geo.entryRaw, eased);

  gsap.set(trip.order, {
    x: pos.x,
    y: pos.y,
    xPercent: -50,
    yPercent: -50,
    rotation: trip.geo.start.angle * (1 - eased),
  });
  const arrived = entry >= ARRIVED || time > 0;

  trip.order.style.visibility = entry > 0 && !arrived ? 'visible' : 'hidden';
  trip.traveller.style.visibility = arrived && time < HIDE_AT ? 'visible' : 'hidden';
}

export function renderJourney(
  trip: Journey,
  setGreen: (lit: boolean) => void,
  takeOrder: (taken: boolean) => void,
): void {
  const { gsap } = trip.shared;
  const { t: time, entry } = trip.clock;
  const pose = travel(trip, time);

  gsap.set(trip.traveller, { x: pose.x, y: pose.y, xPercent: -50, yPercent: -50 });
  gsap.set(trip.track, { x: -pose.cam });
  drawTrail(trip, time, pose.p);
  drawGreen(trip, time);
  setGreen(time >= GREEN);
  renderEntry(trip, entry, time);
  takeOrder(entry > 0 || time > 0);
}
