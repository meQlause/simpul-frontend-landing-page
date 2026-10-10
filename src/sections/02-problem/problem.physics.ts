import type MatterModule from 'matter-js';
import { seeded } from '../../motion/random';
import { spawnAt, type Geo, type Pose, type Track } from './problem.path';
import { SIM } from './problem.tuning';

// The physics, recorded once ahead of time and played back by scroll. Matter.js arrives as a parameter,
// so this module never imports it: the library loads only where the section needs it.
type Matter = typeof MatterModule;
type Body = MatterModule.Body;
type World = MatterModule.World;

const MS_PER_SECOND = 1000;

// Walls: a floor under the section, a wall on each side, all out of sight.
function addWalls(Matter: Matter, geo: Geo, world: World): void {
  const { Bodies, Composite } = Matter;
  const { wall } = SIM;
  const options = { isStatic: true, collisionFilter: { category: wall.category } };
  Composite.add(world, [
    Bodies.rectangle(
      geo.width / 2,
      geo.floor + wall.depth,
      geo.width * wall.span,
      wall.thick,
      options,
    ),
    Bodies.rectangle(-wall.depth, geo.height / 2, wall.thick, geo.height * wall.tall, options),
    Bodies.rectangle(
      geo.width + wall.depth,
      geo.height / 2,
      wall.thick,
      geo.height * wall.tall,
      options,
    ),
  ]);
}

// The order only meets the floor, so it lies untouched in front of the pile.
function orderBody(Matter: Matter, geo: Geo): Body {
  const [width, height] = geo.order;
  const { order } = SIM;
  const body = Matter.Bodies.rectangle(geo.gap[0], geo.gap[1], width, height, {
    chamfer: { radius: height / 2 },
    restitution: order.restitution,
    friction: order.friction,
    collisionFilter: { category: order.category, mask: SIM.wall.category },
  });
  Matter.Body.setInertia(body, Infinity); // lands flat and stays put, exactly above the out-anchor
  return body;
}

// One body per question, all of them stacked like bricks so every one stays readable.
function questionBodies(Matter: Matter, geo: Geo, random: () => number): Body[] {
  const { question } = SIM;
  return geo.sizes.map(([width, height]) => {
    const left = geo.spawn[0] - random() * SIM.spawnRange;
    const body = Matter.Bodies.rectangle(left, geo.spawn[1], width, height, {
      chamfer: { radius: Math.min(SIM.chamfer, height / 2) },
      restitution: question.restitution,
      friction: question.friction,
      frictionStatic: 1,
      frictionAir: question.air,
      collisionFilter: { category: question.category, mask: 1 | question.category },
    });
    Matter.Body.setInertia(body, Infinity);
    return body;
  });
}

// A question is thrown across the floor when it is added.
function throwAcross(Matter: Matter, body: Body, geo: Geo, random: () => number): void {
  const { speed } = SIM;
  Matter.Body.setVelocity(body, {
    x: -(speed.base + random() * speed.across) * Math.min(1, geo.width / SIM.designWidth),
    y: -(speed.base + random() * speed.up),
  });
}

// The recorded run: each frame's pose for each body (index 0 is the order), then a player for it.
function recordRun(Matter: Matter, geo: Geo, phone: boolean): Track {
  const { Engine, Composite } = Matter;
  const random = seeded(SIM.seed);
  const engine = Engine.create();
  engine.gravity.y = SIM.gravity;
  addWalls(Matter, geo, engine.world);
  const bodies = [orderBody(Matter, geo), ...questionBodies(Matter, geo, random)];
  Composite.add(engine.world, bodies[0]);
  const born = bodies.map((_unused, index) =>
    index ? Math.round(spawnAt(index - 1, phone) * SIM.fps) : 0,
  );
  const steps = Math.ceil(SIM.seconds * SIM.fps);
  const frames = bodies.map(() => new Float32Array(steps * SIM.pose));
  for (let step = 0; step < steps; step++) {
    bodies.forEach((body, index) => {
      if (index && step === born[index]) {
        Composite.add(engine.world, body);
        throwAcross(Matter, body, geo, random);
      }
    });
    Matter.Engine.update(engine, MS_PER_SECOND / SIM.fps);
    bodies.forEach((body, index) =>
      frames[index].set([body.position.x, body.position.y, body.angle], step * SIM.pose),
    );
  }
  return playback(frames, born, steps);
}

// The pose of a body at a given time, interpolated between the two recorded frames either side of it.
function playback(frames: Float32Array[], born: number[], steps: number): Track {
  return (index, seconds) => {
    const frame = seconds * SIM.fps;
    if (frame < born[index]) {
      return null;
    }
    const low = Math.min(Math.floor(frame), steps - 1);
    const high = Math.min(low + 1, steps - 1);
    const share = Math.min(frame - low, 1);
    const data = frames[index];
    const lane = (offset: number) =>
      data[low * SIM.pose + offset] +
      (data[high * SIM.pose + offset] - data[low * SIM.pose + offset]) * share;
    const pose: Pose = [lane(0), lane(1), lane(2)];
    return pose;
  };
}

export function simulate(Matter: Matter, geo: Geo, phone: boolean): Track {
  return recordRun(Matter, geo, phone);
}
