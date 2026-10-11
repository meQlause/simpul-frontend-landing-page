import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { one } from '../../motion/dom';
import { stitch } from '../../motion/thread';
import type { Route, Scene } from './turn.scene';
import { restingLayer } from './turn.chat';
import { DOCK, HALF, LEAN, LEVEL, OUTLINE, ROUTE, UPRIGHT } from './turn.tuning';

export function measureRoute(scene: Scene): void {
  const { root } = scene;
  const { handoff } = scene.shared;
  const box = root.getBoundingClientRect();
  const layer = restingLayer(root);
  const copy = one(root, '.turn-copy').getBoundingClientRect();
  const anchor = one(root, '[data-thread-out]').getBoundingClientRect();
  const inPoint = one(root, '[data-thread-in]').getBoundingClientRect();
  const start = handoff.incoming(root);
  const { order } = scene;
  const out = {
    x: anchor.left - box.left + anchor.width / 2,
    y: anchor.top - box.top + anchor.height / 2,
  };
  const dockX = scene.phone
    ? layer.x + layer.w - DOCK.edge - order.offsetWidth / 2
    : layer.x + DOCK.edge + order.offsetWidth / 2;

  scene.route = {
    width: box.width,
    height: box.height,
    solo: !start,
    start: start ?? { x: inPoint.left - box.left, y: inPoint.top - box.top, angle: 0 },
    out,
    seam: inPoint.left - box.left + inPoint.width / 2,
    lane: scene.phone
      ? (layer.x + layer.w + box.width) / 2
      : (copy.left - box.left + copy.width + layer.x) / 2,
    dock: { x: dockX, y: layer.y - order.offsetHeight / 2 - DOCK.drop },
  };
  buildPaths(scene);
  Object.assign(order.dataset, { exitX: out.x, exitY: out.y, exitAngle: 0 });
}

function reachOf(route: Route, orderHeight: number): string {
  const { start, dock, seam } = route;

  return `M${dock.x},${dock.y} ${stitch([dock.x, dock.y], [seam, 0])} ${stitch([seam, 0], [start.x, start.y + orderHeight / 2])} L${start.x},${start.y}`;
}

function buildPaths(scene: Scene): void {
  const route: Route | null = scene.route;

  if (!route) {
    return;
  }

  const { width, height, dock, lane, out } = route;

  scene.reach.setAttribute('d', reachOf(route, scene.order.offsetHeight));
  scene.onward.setAttribute(
    'd',
    `M${dock.x},${dock.y} C${lane},${dock.y} ${lane},${dock.y + ROUTE.onBend} ${lane},${dock.y + ROUTE.onLift} L${lane},${height - ROUTE.onFoot} C${lane},${height - ROUTE.onFootBend} ${out.x},${height - ROUTE.onFootIn} ${out.x},${out.y}`,
  );
  scene.reach.setAttribute('pathLength', '1');
  scene.onward.setAttribute('pathLength', '1');
  scene.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const raw = {
    reach: MotionPathPlugin.getRawPath(scene.reach),
    out: MotionPathPlugin.getRawPath(scene.onward),
  };

  MotionPathPlugin.cacheRawPathMeasurements(raw.reach);
  MotionPathPlugin.cacheRawPathMeasurements(raw.out);
  scene.raw = raw;
}

function poseOn(
  scene: Scene,
  path: NonNullable<Scene['raw']>['reach'],
  share: number,
): [number, number, number] {
  const point = MotionPathPlugin.getPositionOnPath(path, share, true) as {
    x: number;
    y: number;
    angle: number;
  };
  const period = UPRIGHT.period;
  const upright = ((((point.angle + UPRIGHT.turn) % period) + period) % period) - UPRIGHT.turn;
  const level = Math.min(1, Math.min(share, 1 - share) / LEVEL.ends);

  return [point.x, point.y, upright * level * (scene.phone ? 1 : LEVEL.desk)];
}

function followStart(scene: Scene): void {
  const route = scene.route;

  if (scene.clock.t >= HALF || !route || route.solo) {
    return;
  }

  const start = scene.shared.handoff.incoming(scene.root);

  if (start && (start.x !== route.start.x || start.y !== route.start.y)) {
    route.start = start;
    buildPaths(scene);
  }
}

function orderPose(scene: Scene): [number, number, number] {
  const { clock, route, raw } = scene;

  if (!route || !raw) {
    return [0, 0, 0];
  }

  if (clock.exit > 0) {
    return poseOn(scene, raw.out, scene.inOut(clock.exit));
  }

  if (clock.t > HALF) {
    const lifted = 1 - scene.inOut((clock.t - HALF) / HALF);
    const pose = poseOn(scene, raw.reach, lifted);

    pose[2] += route.start.angle * scene.clamp((lifted - LEAN.from) / LEAN.span);

    return pose;
  }

  return [route.start.x, route.start.y, route.start.angle];
}

function drawnShare(scene: Scene): number {
  const { clock, inOut } = scene;

  if (clock.t <= HALF) {
    return inOut(clock.t / HALF);
  }

  return clock.exit > 0 ? 0 : 1 - inOut((clock.t - HALF) / HALF);
}

function drawThread(scene: Scene): void {
  const { clock, reach, onward, outline, layerP } = scene;
  const { inOut, clamp } = scene;
  const drawn = drawnShare(scene);

  reach.style.strokeDasharray = `${drawn} 2`;
  onward.style.strokeDasharray = `${inOut(clock.exit)} 2`;
  outline.style.opacity = String(
    clock.exit > 0
      ? 1
      : Math.min(
          clamp((clock.t - LEAN.from) / LEAN.span),
          clamp((layerP - OUTLINE.after) / OUTLINE.span),
        ),
  );
}

function takeOrder(scene: Scene): void {
  const { clock, order, root, route, shared } = scene;
  const taken = clock.t > HALF || clock.exit > 0;

  if (taken !== scene.receiving) {
    scene.receiving = taken;
    shared.handoff.receive(root, taken);
  }

  order.style.visibility = taken || route?.solo ? 'visible' : 'hidden';
}

export function renderThread(scene: Scene): void {
  followStart(scene);
  const pose = orderPose(scene);

  scene.shared.gsap.set(scene.order, {
    x: pose[0],
    y: pose[1],
    xPercent: -50,
    yPercent: -50,
    rotation: pose[2],
  });
  drawThread(scene);
  takeOrder(scene);
}
