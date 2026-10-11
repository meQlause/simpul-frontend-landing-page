import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { segment } from '../../motion/dom';
import { along, type Pose } from './heap';
import type { Curves, Layout, Role, Scene } from './quiet-by-design.scene';
import {
  ASK,
  DARK,
  FEEL,
  FPS,
  LAYER,
  LIMIT,
  LIMIT_MOVE,
  MORNING,
  READS,
  RULE,
  SLEEP,
  SPOTS,
  START,
  SURVIVOR,
  SURVIVOR_FADE,
  SURVIVOR_LAYER,
  type Span,
  VISIBLE,
  WAITS,
} from './quiet-by-design.tuning';

interface Tick {
  y: number;
  s: number;
  e: number[];
  dim: number;
  dark: number;
}

interface Part {
  x: number;
  y: number;
  r: number;
  alpha: number;
  scale: number;
  z: number;
  summed: number;
  ticked: number;
  lead: boolean;
}

interface Ctx {
  layout: Layout;
  curves: Curves;
  share: number;
  role: Role;
  start: Pose;
  dim: number;
}

type Place = { x: number; y: number; r?: number; scale?: number };

const clampTo = (min: number, max: number, value: number): number =>
  Math.min(max, Math.max(min, value));
const ramp = (value: number, span: Span, shift: number): number =>
  segment(value, span.from + shift, span.to + shift);

function tickOf(scene: Scene): Tick {
  const { layout, clock } = scene;
  const position = clock.p * layout.H;
  const shares = layout.windows.map((window) => segment(position, window.a, window.b));
  const dark =
    segment(shares[RULE.sleeps], DARK.in.from, DARK.in.to) -
    segment(shares[RULE.sleeps], DARK.out.from, DARK.out.to);

  return {
    y: position,
    s: along(layout.knots, position),
    e: shares,
    dim: 1 - DARK.dim * dark,
    dark,
  };
}

function restingPart(posX: number, posY: number, angle: number, dim: number): Part {
  return {
    x: posX,
    y: posY,
    r: angle,
    alpha: dim,
    scale: 1,
    z: LAYER.note,
    summed: 0,
    ticked: 0,
    lead: false,
  };
}

function waitsPart({ layout, share, role, start, curves }: Ctx): Partial<Part> {
  const [startX, startY, startR] = start;
  const lift = curves.inOut(ramp(share, WAITS.lift, role.slot * WAITS.liftStep));
  const back = curves.inOut(segment(share, WAITS.back.from, WAITS.back.to));
  const [anchorX, anchorY] =
    role.slot === 0
      ? [
          clampTo(layout.cw * START.edge, layout.Wp - layout.cw * START.edge - WAITS.inset, startX),
          layout.lift,
        ]
      : [startX, startY - WAITS.beside];
  const travel = lift * (1 - WAITS.pullBack * back);

  return {
    x: startX + (anchorX - startX) * travel,
    y: startY + (anchorY - startY) * travel,
    r: startR * (1 - lift * (1 - back)),
    scale: 1 + WAITS.grow * lift - WAITS.shrink * back,
    alpha: 1 - segment(share, WAITS.fade.from, WAITS.fade.to),
    z: LAYER.lifted,
    lead: role.slot === 0,
  };
}

function limitPart({ layout, share, role, start, curves }: Ctx): Partial<Part> {
  const [startX, startY, startR] = start;

  if (role.slot < LIMIT) {
    const exit = ramp(share, LIMIT_MOVE.go, role.slot * LIMIT_MOVE.step);

    return {
      x: startX + (layout.cx - startX) * LIMIT_MOVE.drift * exit,
      y: startY + (-layout.ch - startY) * curves.takeoff(exit),
      r: startR * (1 - exit),
      alpha: 1 - segment(exit, LIMIT_MOVE.fade.from, LIMIT_MOVE.fade.to),
      ticked: curves.pop(ramp(share, LIMIT_MOVE.tick, role.slot * LIMIT_MOVE.step)),
      z: LAYER.lifted,
    };
  }

  const extra = role.slot - LIMIT;
  const gather = curves.inOut(
    segment(share, LIMIT_MOVE.gather.from + extra * LIMIT_MOVE.gatherStep, LIMIT_MOVE.gather.to),
  );

  return {
    x: startX + (layout.fold[0] + extra * LIMIT_MOVE.fold - startX) * gather,
    y: startY + (layout.fold[1] + extra * LIMIT_MOVE.fold - startY) * gather,
    r: startR * (1 - gather),
    scale: 1 - LIMIT_MOVE.foldShrink * gather,
    alpha: 1 - segment(share, LIMIT_MOVE.foldFade.from, LIMIT_MOVE.foldFade.to),
    z: LAYER.lifted + extra,
  };
}

function sleepsPart({ layout, share, role, start, curves, dim }: Ctx): Partial<Part> {
  const [startX, startY, startR] = start;
  const line = curves.inOut(ramp(share, SLEEP.line, role.slot * SLEEP.lineStep));
  const away = segment(share, SLEEP.away.from + role.slot * SLEEP.awayStep, SLEEP.away.to);
  const seat = layout.cx + (role.slot - (role.size - 1) / 2) * layout.cell;

  return {
    x: startX + (seat - startX) * line + SLEEP.drift * curves.takeoff(away),
    y: startY + (layout.Hp * SLEEP.height - startY) * line,
    r: startR * (1 - line),
    scale: 1 - SLEEP.shrink * line,
    alpha: dim * (1 - away),
    z: LAYER.lifted,
  };
}

function lobe(curves: Curves, value: number): number {
  const near =
    curves.out(segment(value, ASK.near.from, ASK.near.to)) *
    (1 - curves.inOut(segment(value, ASK.nearOut.from, ASK.nearOut.to)));

  return near * (1 + ASK.wobble * Math.sin(value * ASK.wobbleFreq));
}

function hesitate(curves: Curves, share: number): number {
  return lobe(curves, segment(share, ASK.split, 1)) - lobe(curves, segment(share, 0, ASK.split));
}

function asksPart({ layout, share, start, curves }: Ctx): Partial<Part> {
  const [startX, startY, startR] = start;
  const rise = curves.inOut(segment(share, ASK.rise.from, ASK.rise.to));
  const between = hesitate(curves, segment(share, ASK.hesitate.from, ASK.hesitate.to));

  return {
    x: startX + (layout.ask[0] - startX) * rise + between * layout.reach,
    y: startY + (layout.ask[1] - startY) * rise,
    r: startR * (1 - rise),
    scale: 1 - ASK.shrinkBy * curves.inOut(segment(share, ASK.shrink.from, ASK.shrink.to)),
    alpha: 1 - segment(share, ASK.fade.from, ASK.fade.to),
    z: LAYER.lifted,
  };
}

function readsPart({ share, role, start }: Ctx): Partial<Part> {
  const [startX, startY, startR] = start;
  const summed = segment(
    share,
    READS.summed.from + role.slot * READS.summedStep,
    READS.summed.to + role.slot * READS.summedStep,
  );
  const gone = segment(
    share,
    READS.gone.from + role.slot * READS.goneStep,
    READS.gone.to + role.slot * READS.goneStep,
  );

  return { x: startX, y: startY + READS.drop * gone, r: startR, alpha: 1 - gone, summed };
}

const PARTS = [waitsPart, limitPart, sleepsPart, asksPart, readsPart];

function notePart(scene: Scene, tick: Tick, index: number): Part | null {
  const role = scene.roles[index];
  const { layout, curves } = scene;

  if (tick.y < layout.windows[role.step].a) {
    const found = scene.plan.track(index, tick.s);

    return found ? restingPart(found[0], found[1], found[2], tick.dim) : null;
  }

  const start = scene.starts[index];
  const ctx: Ctx = { layout, curves, share: tick.e[role.step], role, start, dim: tick.dim };

  return { ...restingPart(start[0], start[1], start[2], tick.dim), ...PARTS[role.step](ctx) };
}

function put(node: HTMLElement, place: Place): void {
  const { x, y, r: angle = 0, scale = 1 } = place;

  node.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad) scale(${scale})`;
}

function show(node: HTMLElement, alpha: number): void {
  node.style.opacity = String(alpha);
  node.style.visibility = alpha > VISIBLE ? 'visible' : 'hidden';
}

function write(node: HTMLElement, text: number | string): void {
  if (node.textContent !== String(text)) {
    node.textContent = String(text);
  }
}

function paintSky(scene: Scene, tick: Tick): void {
  const { panel } = scene.board;

  panel.style.backgroundColor = scene.curves.sky(tick.dark);
  panel.style.setProperty('--line-color', scene.curves.glow(tick.dark));
}

interface Notes {
  lead: { x: number; y: number } | null;
  seen: number;
}

function renderNotes(scene: Scene, tick: Tick): Notes {
  const notes: Notes = { lead: null, seen: 1 };

  scene.board.notes.forEach((note, index) => {
    const part = notePart(scene, tick, index);

    if (!part) {
      show(note.el, 0);

      return;
    }

    show(note.el, part.alpha);

    if (part.alpha > FEEL.seen) {
      notes.seen += 1;
    }

    note.el.style.zIndex = String(part.z);
    put(note.el, part);
    note.tick.style.transform = `scale(${part.ticked})`;

    if (part.lead) {
      notes.lead = { x: part.x, y: part.y };
    }

    if (scene.roles[index].step === RULE.reads) {
      note.sum.style.opacity = String(part.summed);
      note.words.forEach((word) => {
        word.style.opacity = String(1 - part.summed);
      });
    }
  });

  return notes;
}

function renderHold(scene: Scene, tick: Tick, lead: Notes['lead']): void {
  const { board, layout, curves } = scene;
  const waits = tick.e[RULE.waits];
  const holdAlpha =
    curves.pop(segment(waits, WAITS.show.from, WAITS.show.to)) *
    (1 - segment(waits, WAITS.hide.from, WAITS.hide.to));
  const fixAlpha =
    segment(waits, WAITS.fixShow.from, WAITS.fixShow.to) *
    (1 - segment(waits, WAITS.fixHide.from, WAITS.fixHide.to));

  show(board.hold, lead ? holdAlpha : 0);
  show(board.fix, lead ? fixAlpha : 0);

  if (!lead) {
    return;
  }

  const sweep = WAITS.full * segment(waits, WAITS.ring.from, WAITS.ring.to);

  put(board.hold, {
    x: lead.x + layout.cw / 2 - SPOTS.hold.x,
    y: lead.y - layout.ch / 2 + SPOTS.hold.y,
  });
  board.ring.style.strokeDashoffset = String(1 - sweep);
  write(board.held, Math.round(sweep * FPS));
  board.hold.classList.toggle('is-stopped', waits >= WAITS.stopped);
  put(board.fix, {
    x: lead.x,
    y: lead.y + layout.ch / 2 + SPOTS.fix,
    scale:
      WAITS.fixScale +
      WAITS.fixGrow * curves.pop(segment(waits, WAITS.fixPop.from, WAITS.fixPop.to)),
  });
}

function renderTally(scene: Scene, seen: number): void {
  const { board, feel, shared } = scene;

  if (board.tallied.textContent !== String(seen)) {
    board.tallied.textContent = String(seen);
    board.tallyLabel.textContent = seen === 1 ? 'that matters' : 'notifications';
    shared.gsap.fromTo(
      board.tallied,
      { scale: 1.16 },
      { scale: 1, duration: 0.4, ease: 'power3.out', overwrite: true },
    );
    board.panel.classList.toggle('is-calm', seen === 1);
  }

  feel.noise = clampTo(0, 1, (seen - 1) / FEEL.full);
}

function renderCounter(scene: Scene, tick: Tick): void {
  const { board, layout, curves } = scene;
  const limit = tick.e[RULE.limit];
  const sent = Array.from(
    { length: LIMIT },
    (_unused, slot) => limit >= LIMIT_MOVE.sent.from + LIMIT_MOVE.sent.step * slot,
  ).filter(Boolean).length;

  show(
    board.counter,
    segment(limit, LIMIT_MOVE.count.from, LIMIT_MOVE.count.to) *
      (1 - segment(limit, LIMIT_MOVE.countOut.from, LIMIT_MOVE.countOut.to)),
  );
  put(board.counter, {
    x: layout.count[0],
    y: layout.count[1],
    scale:
      1 +
      LIMIT_MOVE.pulseSize *
        Math.sin(Math.PI * segment(limit, LIMIT_MOVE.pulse.from, LIMIT_MOVE.pulse.to)),
  });
  write(board.counted, sent);
  board.counter.classList.toggle('is-full', sent === LIMIT);
  show(
    board.summary,
    segment(limit, LIMIT_MOVE.summary.from, LIMIT_MOVE.summary.to) *
      (1 - segment(limit, LIMIT_MOVE.summaryOut.from, LIMIT_MOVE.summaryOut.to)),
  );
  put(board.summary, {
    x: layout.fold[0],
    y: layout.fold[1],
    scale:
      LIMIT_MOVE.summaryBase +
      LIMIT_MOVE.summaryGrow *
        curves.pop(segment(limit, LIMIT_MOVE.summaryPop.from, LIMIT_MOVE.summaryPop.to)),
  });
}

function renderNight(scene: Scene, tick: Tick): void {
  const { board, layout } = scene;
  const sleeps = tick.e[RULE.sleeps];

  show(
    board.night,
    segment(sleeps, SLEEP.night.from, SLEEP.night.to) *
      (1 - segment(sleeps, SLEEP.nightOut.from, SLEEP.nightOut.to)),
  );
  put(board.night, { x: layout.Wp * SLEEP.nightX + SLEEP.nightInset, y: layout.Hp * SLEEP.nightY });
  write(board.hour, sleeps >= MORNING ? '07:00' : '21:00');
  board.night.classList.toggle('is-morning', sleeps >= MORNING);
  const queued = scene.take[RULE.sleeps];
  const row = ((queued - 1) / 2) * layout.cell + layout.cw * SLEEP.tiles;

  show(
    board.queue,
    segment(sleeps, SLEEP.queue.from, SLEEP.queue.to) *
      (1 - segment(sleeps, SLEEP.queueOut.from, SLEEP.queueOut.to)),
  );

  if (queued > 2) {
    put(board.queue, {
      x: layout.cx - row + SLEEP.queueLong.x,
      y: layout.Hp * SLEEP.height + layout.ch * SLEEP.queueLong.y + SLEEP.queueLong.gap,
    });
  } else {
    put(board.queue, { x: layout.cx - row - SLEEP.queueShort.x, y: layout.Hp * SLEEP.height });
  }
}

function renderQuestion(scene: Scene, tick: Tick): void {
  const { board, layout, curves } = scene;
  const asks = tick.e[RULE.asks];

  board.chips.forEach((chip, index) => {
    show(
      chip,
      segment(asks, ASK.chipIn.from, ASK.chipIn.to) *
        (1 - segment(asks, ASK.chipOut.from, ASK.chipOut.to)),
    );
    put(chip, { x: layout.chips[index][0], y: layout.chips[index][1] });
  });
  show(
    board.ask,
    segment(asks, ASK.mark.from, ASK.mark.to) *
      (1 - segment(asks, ASK.markOut.from, ASK.markOut.to)),
  );
  put(board.ask, {
    x: layout.ask[0],
    y: layout.ask[1] - ASK.lift * curves.out(segment(asks, ASK.liftAt.from, ASK.liftAt.to)),
    scale: curves.pop(segment(asks, ASK.pop.from, ASK.pop.to)),
  });
}

function ridingAt(
  layout: Layout,
  curves: Curves,
  away: number,
): { x: number; y: number; scale: number } {
  const point = MotionPathPlugin.getPositionOnPath(layout.rideRaw, curves.inOut(away));

  return {
    x: point.x - layout.final.x,
    y: point.y - layout.final.y,
    scale: 1 + SURVIVOR.grow - SURVIVOR.shrink * away,
  };
}

function renderSurvivor(scene: Scene, tick: Tick): void {
  const { board, layout, curves } = scene;
  const rise = curves.inOut(segment(tick.y, layout.rise[0], layout.rise[1]));
  const away = segment(tick.y, layout.release, layout.H);
  const sitting = {
    x: layout.cx,
    y: layout.rest + (layout.Hp / 2 - layout.rest) * rise,
    scale: 1 + SURVIVOR.grow * rise,
  };
  const spot = away > 0 ? ridingAt(layout, curves, away) : sitting;

  put(board.survivor, { x: spot.x, y: spot.y, scale: spot.scale });
  board.survivor.style.opacity = String(rise > 0 ? 1 : tick.dim);
  board.survivor.style.zIndex = String(rise > 0 ? SURVIVOR_LAYER.up : SURVIVOR_LAYER.rest);
  board.survivor.classList.toggle('is-clean', rise > SURVIVOR_FADE);
}

export function renderFrame(scene: Scene): void {
  const tick = tickOf(scene);

  paintSky(scene, tick);
  const notes = renderNotes(scene, tick);

  renderHold(scene, tick, notes.lead);
  renderTally(scene, notes.seen);
  renderCounter(scene, tick);
  renderNight(scene, tick);
  renderQuestion(scene, tick);
  renderSurvivor(scene, tick);
}
