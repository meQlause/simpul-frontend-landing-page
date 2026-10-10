import { seeded } from '../../motion/random';
import {
  BAND,
  CARD,
  CENTRED,
  FPS,
  GRAVITY,
  HEADING,
  MS_PER_SECOND,
  POSE_SIZE,
  SEED,
  SIDES,
  SPEED,
  SPIN,
  START,
  STORM,
  SURVIVOR_CHAMFER,
  WALL,
} from './quiet-by-design.tuning';
import { born, pose, stepAt, total, type Geo, type Plan } from './heap';

// The storm, recorded once with real collisions and played back by scroll. Matter.js arrives as a
// parameter, typed here by the part of it this file uses, so the module never imports the library: the
// library loads only where the section needs it (the same rule as problem.physics.ts).
interface Vector {
  x: number;
  y: number;
}

interface Body {
  position: Vector;
  angle: number;
  restitution: number;
  friction: number;
  frictionStatic: number;
  frictionAir: number;
}

interface Engine {
  gravity: { y: number };
  world: object;
}

export interface Matter {
  Engine: {
    create(options: { enableSleeping: boolean }): Engine;
    update(engine: Engine, delta: number): void;
  };
  Bodies: {
    rectangle(x: number, y: number, width: number, height: number, options?: object): Body;
  };
  Composite: {
    add(world: object, bodies: unknown): unknown; // the library takes more than bodies; this file adds bodies
    remove(world: object, body: unknown): unknown;
  };
  Body: {
    setVelocity(body: Body, velocity: Vector): void;
    setAngularVelocity(body: Body, velocity: number): void;
  };
  Sleeping: { set(body: Body, asleep: boolean): void };
}

// One card: its body, how it is thrown, and the frame it goes on the stage.
interface Throw {
  body: Body;
  velocity: Vector;
  spin: number;
  born: number;
}

// One storm, in progress: the engine, the cards, the frames recorded so far, and what is taken so far.
interface Run {
  Matter: Matter;
  engine: Engine;
  throws: Throw[];
  frames: Float32Array[];
  alive: number[];
  chosen: number[][];
  take: readonly number[];
}

// The four walls and the survivor's floor-piece: they hold the heap on the stage and nothing else.
function walls(Matter: Matter, geo: Geo): Body[] {
  const { Wp, Hp, floor, cx, sw, sh } = geo;
  const wall = { isStatic: true, restitution: 0.6, friction: 0.4 };
  const { Bodies } = Matter;
  return [
    Bodies.rectangle(Wp / 2, floor + WALL.depth, Wp * WALL.span, WALL.thick, wall),
    Bodies.rectangle(Wp / 2, -WALL.depth, Wp * WALL.span, WALL.thick, wall),
    Bodies.rectangle(-WALL.depth, Hp / 2, WALL.thick, Hp * WALL.tall, wall),
    Bodies.rectangle(Wp + WALL.depth, Hp / 2, WALL.thick, Hp * WALL.tall, wall),
    Bodies.rectangle(cx, floor - sh / 2, sw, sh, {
      ...wall,
      chamfer: { radius: SURVIVOR_CHAMFER },
    }),
  ];
}

// A card comes from one of four sides, with a heading that points into the stage.
const SIDE_HEADING = [0, Math.PI, Math.PI / 2, -Math.PI / 2];

function throwOf(
  Matter: Matter,
  index: number,
  geo: Geo,
  random: () => number,
): Omit<Throw, 'born'> {
  const { Wp, Hp, ch, cw } = geo;
  const side = index % SIDES;
  const share = BAND.from + random() * BAND.span;
  const starts: [number, number][] = [
    [cw * START.edge, Hp * share * START.drop],
    [Wp - cw * START.edge, Hp * share * START.drop],
    [Wp * share, ch * START.low],
    [Wp * share, Hp * START.mid],
  ];
  const [left, top] = starts[side];
  const heading = SIDE_HEADING[side] + (random() - CENTRED) * HEADING;
  const speed = SPEED.base + random() * SPEED.span;
  return {
    body: Matter.Bodies.rectangle(left, top, cw, ch, {
      chamfer: { radius: CARD.chamfer },
      restitution: CARD.restitution,
      friction: CARD.friction,
      frictionAir: CARD.air,
    }),
    velocity: { x: Math.cos(heading) * speed, y: Math.sin(heading) * speed },
    spin: (random() - CENTRED) * SPIN,
  };
}

// Records every card's pose for this frame, as x, y and angle in one flat array per card.
function recordFrame(frames: Float32Array[], throws: Throw[], frame: number): void {
  throws.forEach((item, index) => {
    const { position, angle } = item.body;
    frames[index].set([position.x, position.y, angle], frame * POSE_SIZE);
  });
}

// Puts on the stage the cards whose frame has come, and throws each one.
function launchDue(run: Run, frame: number): void {
  run.throws.forEach((item, index) => {
    if (frame !== item.born) {
      return;
    }
    run.Matter.Composite.add(run.engine.world, item.body);
    run.Matter.Body.setVelocity(item.body, item.velocity);
    run.Matter.Body.setAngularVelocity(item.body, item.spin);
    run.alive.push(index);
  });
}

// The storm is over: gravity switches on, and the cards grip each other and the floor.
function gripStorm(run: Run): void {
  run.engine.gravity.y = GRAVITY;
  for (const item of run.throws) {
    Object.assign(item.body, {
      restitution: 0.1,
      friction: 0.7,
      frictionStatic: 1,
      frictionAir: 0.03,
    });
  }
}

// A commitment takes its cards off the top of the heap, and the rest are woken to fall.
function releaseStep(run: Run, step: number): void {
  const { Matter, throws, alive } = run;
  alive.sort((first, second) => throws[first].body.position.y - throws[second].body.position.y);
  const top = alive.splice(0, run.take[step]);
  run.chosen.push(top);
  for (const index of top) {
    Matter.Composite.remove(run.engine.world, throws[index].body);
  }
  for (const index of alive) {
    Matter.Sleeping.set(throws[index].body, false); // what rested on them has to fall
  }
}

// One physics frame, in the vanilla order: launch, grip, release, step the world, record.
function runFrame(run: Run, frame: number, removals: number[]): void {
  launchDue(run, frame);
  if (frame === Math.round(STORM * FPS)) {
    gripStorm(run);
  }
  const step = removals.indexOf(frame);
  if (step >= 0) {
    releaseStep(run, step);
  }
  run.Matter.Engine.update(run.engine, MS_PER_SECOND / FPS);
  recordFrame(run.frames, run.throws, frame);
}

// Plays the recorded frames back: linear between two frames, and nothing before a card is born.
function trackOf(frames: Float32Array[], throws: Throw[], steps: number): Plan['track'] {
  return (index, seconds) => {
    const moment = seconds * FPS;
    if (moment < throws[index].born) {
      return null;
    }
    const low = Math.min(Math.floor(moment), steps - 1);
    const high = Math.min(low + 1, steps - 1);
    const share = Math.min(moment - low, 1);
    const frame = frames[index];
    const mix = (offset: number) =>
      frame[low * POSE_SIZE + offset] +
      (frame[high * POSE_SIZE + offset] - frame[low * POSE_SIZE + offset]) * share;
    return pose(mix(0), mix(1), mix(2));
  };
}

// Plays the storm frame by frame and records it. The cards are thrown in one after another; gravity
// switches on when the storm is over; each commitment takes its cards off the top of the heap.
export function simulate(Matter: Matter, geo: Geo, take: readonly number[]): Plan {
  const count = total(take);
  const random = seeded(SEED);
  const engine = Matter.Engine.create({ enableSleeping: true }); // a resting heap really rests, instead of creeping
  engine.gravity.y = 0; // the storm: no gravity yet
  Matter.Composite.add(engine.world, walls(Matter, geo));
  const throws: Throw[] = Array.from({ length: count }, (_unused, index) => ({
    ...throwOf(Matter, index, geo, random),
    born: Math.round(born(index, count) * FPS),
  }));
  const steps = Math.ceil(stepAt(take.length) * FPS);
  const run: Run = {
    Matter,
    engine,
    throws,
    frames: throws.map(() => new Float32Array(steps * POSE_SIZE)),
    alive: [],
    chosen: [],
    take,
  };
  const removals = take.map((_unused, step) => Math.round(stepAt(step) * FPS));
  for (let frame = 0; frame < steps; frame++) {
    runFrame(run, frame, removals);
  }
  return { track: trackOf(run.frames, throws, steps), chosen: run.chosen };
}
