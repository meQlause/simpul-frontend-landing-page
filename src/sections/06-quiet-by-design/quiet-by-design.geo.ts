import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { poseAt, stepAt, type Plan, type Pose } from './heap';
import type { Board, Layout, Role, Window } from './quiet-by-design.scene';
import {
  FLOOR_INSET,
  HOLD,
  INTO,
  KNOT,
  PHONE,
  RIDE,
  SETTLED,
  SPOTS,
  STORM,
  WINDOW,
} from './quiet-by-design.tuning';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Sizes {
  W: number;
  H: number;
  Wp: number;
  Hp: number;
  cw: number;
  ch: number;
  sw: number;
  sh: number;
}

interface Thread {
  phone: boolean;
  W: number;
  H: number;
  Hp: number;
  mid: number;
  tx: number;
  top: number;
  final: { x: number; y: number };
}

const HOLDS = Object.values(HOLD);

function place(element: HTMLElement, root: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = element;

  while (node && node !== root) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }

  return { x: left, y: top, w: element.offsetWidth, h: element.offsetHeight };
}

function rideOf(thread: Thread): string {
  const { phone, H, Hp, mid, tx, final } = thread;
  const top = final.y + Hp / 2;

  if (phone) {
    return `M${tx},${top} L${mid},${H}`;
  }

  const low = final.y + Hp;
  const span = H - low;

  return `M${tx},${top} L${tx},${low + RIDE.lift} C${tx},${low + span * RIDE.bendFirst} ${mid},${low + span * RIDE.bendSecond} ${mid},${H}`;
}

function intoOf(thread: Thread): string {
  const { phone, W, mid, tx, top } = thread;

  if (phone) {
    const rail = W - PHONE.inset;

    return `M${mid},0 C${mid},${PHONE.bend} ${rail},${PHONE.top} ${rail},${PHONE.rail} L${rail},${top - PHONE.hop} C${rail},${top - PHONE.handle} ${tx},${top - PHONE.reach} ${tx},${top}`;
  }

  return `M${mid},0 C${mid},${top * INTO.bend} ${tx},${top * INTO.handle} ${tx},${top}`;
}

function drawThread(board: Board, thread: Thread): string {
  const ride = rideOf(thread);
  const { W, H, Hp, tx, final } = thread;

  board.thread.setAttribute(
    'd',
    `${intoOf(thread)} L${tx},${final.y + Hp / 2} ${ride.replace(/^M[^LC]+/, '')}`,
  );
  board.svg.setAttribute('width', String(W));
  board.svg.setAttribute('height', String(H));
  board.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  return ride;
}

function windowsOf(
  centres: number[],
  viewHeight: number,
  span: { from: number; to: number },
): Window[] {
  return centres.map((centre, step) => {
    const startY = centre + (1 - span.from) * viewHeight;
    const endY = centre + (1 - span.to) * viewHeight;

    return { a: startY, b: endY, m: startY + (endY - startY) * HOLDS[step] };
  });
}

function knotsOf(stage: Box, viewHeight: number, windows: Window[]): [number, number][] {
  const stick = stage.y + viewHeight;
  const knots: [number, number][] = [
    [stage.y, 0],
    [stick - KNOT.storm * viewHeight, STORM],
    [stick + KNOT.settled * viewHeight, SETTLED],
  ];

  windows.forEach((window, step) => {
    knots.push([window.m, stepAt(step)], [windows[step + 1]?.a ?? window.b, stepAt(step + 1)]);
  });

  return knots;
}

function sizesOf(board: Board): Sizes {
  const { root, panel, notes, survivor } = board;

  return {
    W: root.offsetWidth,
    H: root.offsetHeight,
    Wp: panel.clientWidth,
    Hp: panel.clientHeight,
    cw: notes[0].el.offsetWidth,
    ch: notes[0].el.offsetHeight,
    sw: survivor.offsetWidth,
    sh: survivor.offsetHeight,
  };
}

function spotsOf(sizes: Sizes) {
  const { Wp: width, Hp: height, cw, sh } = sizes;
  const floor = height - FLOOR_INSET;
  const centreX = width / 2;

  return {
    floor,
    cx: centreX,
    rest: floor - sh / 2,
    fold: [width * SPOTS.fold.x, height * SPOTS.fold.y] as [number, number],
    count: [width * SPOTS.count.x, height * SPOTS.count.y] as [number, number],
    ask: [centreX, height * SPOTS.ask.y] as [number, number],
    chips: [
      [width * SPOTS.chips.left + SPOTS.chips.inset, height * SPOTS.chips.y],
      [width * SPOTS.chips.right - SPOTS.chips.inset, height * SPOTS.chips.y],
    ] as [number, number][],
    reach: Math.max(
      SPOTS.reach.min,
      width * SPOTS.reach.right - SPOTS.reach.inset - (centreX + cw / 2),
    ),
    cell: cw * SPOTS.slot.width + SPOTS.slot.gap,
  };
}

function riseOf(windows: Window[], viewHeight: number, release: number): [number, number] {
  const last = windows[windows.length - 1].b;

  return [last, Math.min(last + SPOTS.rise * viewHeight, release)];
}

export function measureLayout(board: Board, phone: boolean): Layout {
  const { root, stage, panel, body, rules, survivor } = board;
  const sizes = sizesOf(board);
  const stageBox = place(stage, root);
  const panelBox = place(panel, root);
  const bodyBox = place(body, root);
  const centres = rules.map((rule) => {
    const box = place(rule, root);

    return box.y + box.h / 2;
  });
  const viewHeight = innerHeight;
  const final = {
    x: panelBox.x,
    y: bodyBox.y + bodyBox.h - stageBox.h + (panelBox.y - stageBox.y),
  };
  const release = bodyBox.y + bodyBox.h + viewHeight - stageBox.h;
  const spots = spotsOf(sizes);
  const thread: Thread = {
    phone,
    W: sizes.W,
    H: sizes.H,
    Hp: sizes.Hp,
    mid: sizes.W / 2,
    tx: panelBox.x + spots.cx,
    top: panelBox.y,
    final,
  };
  const ride = drawThread(board, thread);

  Object.assign(survivor.dataset, { exitX: thread.mid, exitY: sizes.H, exitAngle: 0 });
  const windows = windowsOf(centres, viewHeight, phone ? WINDOW.phone : WINDOW.desktop);

  return {
    ...sizes,
    ...spots,
    lift: 0,
    final,
    windows,
    knots: knotsOf(stageBox, viewHeight, windows),
    release,
    rideRaw: MotionPathPlugin.getRawPath(ride),
    rise: riseOf(windows, viewHeight, release),
  };
}

export function liftOf(layout: Layout, plan: Plan, count: number): number {
  const tops = Array.from({ length: count }, (_unused, index) => poseAt(plan, index, SETTLED)[1]);
  const heapTop = Math.min(...tops) - layout.ch / 2;

  return Math.max(layout.ch, Math.min(layout.Hp * SPOTS.lift.share, heapTop - SPOTS.lift.room));
}

export function rolesOf(plan: Plan, count: number): Role[] {
  const roles = new Array<Role>(count);

  plan.chosen.forEach((list, step) =>
    list.forEach((index, slot) => {
      roles[index] = { step, slot, size: list.length };
    }),
  );

  return roles;
}

export function startsOf(plan: Plan, roles: Role[]): Pose[] {
  return roles.map((role, index) => poseAt(plan, index, stepAt(role.step)));
}
