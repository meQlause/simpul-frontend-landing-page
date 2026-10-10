import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { one } from '../../motion/dom';
import type { Shared } from '../../motion/types';
import { FIGURES, GLANCE, main, type Point, REVIEW, spots, view } from './the-panel.data';
import { placeOn, buildScreen, type Screen } from './the-panel.screen';
import { pointerAt, routeOf, tapAt, type Stop } from './the-panel.pointer';
import {
  arrivalOf,
  boxIn,
  dashedStrand,
  draw,
  fade,
  HIDDEN,
  type Panel,
  share,
  sizeSvg,
  VISIBLE,
} from './the-panel.scene';
import {
  CARD,
  CARD_FADE,
  CHIP_BEND,
  CURSOR,
  END,
  ENTRY,
  FLY,
  FOCUS,
  FOCUS_FADE,
  FOCUS_PAD,
  LABEL,
  LEAN,
  PIN_SCREENS,
  RESOLVE,
  RISE_OPACITY,
  RISE_PX,
  RULE_FRAMES,
  SHOT_LIGHT,
  SPAN,
  STAGE_FROM,
  STRIP_GLOW,
  TILT_X,
  WINDOW_EDGE,
  WINDOW_FRAME,
} from './the-panel.tuning';

type RawPath = ReturnType<typeof MotionPathPlugin.getRawPath>;
interface Geo {
  raw: RawPath;
  land: number; // the card's scale when it lands on the order's chip
}

// The window's parts: the screen inside it, and the two strands of thread that run into and out of it.
interface WindowParts extends Screen {
  panel: Panel;
  win: HTMLElement;
  tilt: HTMLElement;
  stage: HTMLElement;
  inPath: SVGPathElement;
  outPath: SVGPathElement;
}

// Everything a frame needs: the parts, the clock, the route and the frame's own state.
interface Scene extends WindowParts {
  clock: { time: number; entry: number };
  route: Stop[];
  geo: Geo;
  received: boolean | null; // whether this section has taken the card from the one above
  stageNow: number; // which caption is lit
  inOut: (share: number) => number;
  out: (share: number) => number;
}

function buildParts(panel: Panel): WindowParts {
  const { root, svg } = panel;
  const win = one(root, '.panel-window');
  const screen: Screen = buildScreen(win);
  return {
    ...screen,
    panel,
    win,
    tilt: one(root, '.panel-tilt'),
    stage: one(root, '.panel-stage'),
    inPath: dashedStrand(svg),
    outPath: dashedStrand(svg),
  };
}

// The card's path from where it arrives into the order's chip on the window.
const arrivalPath = (start: Point, chip: Point): string => {
  const drop = (bend: number) => start.y + (chip.y - start.y) * bend;
  return `M${start.x},${start.y} C${start.x},${drop(CHIP_BEND.near)} ${chip.x},${drop(CHIP_BEND.far)} ${chip.x},${chip.y}`;
};

// The screen is scaled to fit the stage, and the window is sized around it with its frame.
function scaleWindow(parts: WindowParts): number {
  const { win, stage, screen } = parts;
  const scale = Math.min(
    (stage.clientWidth - WINDOW_FRAME) / view.width,
    (stage.clientHeight - WINDOW_FRAME) / view.height,
  );
  Object.assign(win.style, {
    width: `${view.width * scale + WINDOW_FRAME}px`,
    height: `${view.height * scale + WINDOW_FRAME}px`,
  });
  screen.style.transform = `scale(${scale})`;
  return scale;
}

// The window is sized to fit the stage, and the threads and the card's path are measured to the window.
function fitWindow(parts: WindowParts): Geo {
  const { panel, win, inPath, outPath } = parts;
  const { root, svg, card } = panel;
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  const scale = scaleWindow(parts);
  const box = boxIn(root, win);
  const chip = {
    x: box.x + WINDOW_EDGE + (main.x + spots.order.x + spots.order.w / 2) * scale,
    y: box.y + WINDOW_EDGE + (main.y + spots.order.y + spots.order.h / 2) * scale,
  };
  const start = arrivalOf(panel);
  sizeSvg(svg, width, height);
  inPath.setAttribute('d', `M${width / 2},0 L${width / 2},${box.y}`);
  outPath.setAttribute('d', `M${width / 2},${box.y + box.h} L${width / 2},${height}`);
  const raw = MotionPathPlugin.getRawPath(arrivalPath(start, chip));
  MotionPathPlugin.cacheRawPathMeasurements(raw);
  return { raw, land: (spots.order.w * scale) / card.offsetWidth };
}

// Before the pin: the thread reaches the window, the window rises, the card flies into it.
function renderEntry(scene: Scene): void {
  const { time, entry } = scene.clock;
  const { card, root, shared } = scene.panel;
  const fly = scene.inOut(share(entry, FLY));
  const spot = MotionPathPlugin.getPositionOnPath(scene.geo.raw, fly);
  shared.gsap.set(card, {
    x: spot.x,
    y: spot.y,
    xPercent: -50,
    yPercent: -50,
    scale: CARD.start + (scene.geo.land - CARD.start) * fly,
    opacity: 1 - share(entry, CARD_FADE),
  });
  card.style.visibility = entry > 0 && entry < CARD_FADE.to && time === 0 ? VISIBLE : HIDDEN;
  draw(scene.inPath, share(entry, ENTRY.thread));
  const rise = scene.out(share(entry, ENTRY.rise));
  shared.gsap.set(scene.win, {
    y: RISE_PX * (1 - rise),
    opacity: Math.min(1, rise * RISE_OPACITY),
    rotationX: TILT_X * (1 - scene.inOut(share(time, SPAN.release))),
  });
  scene.win.classList.toggle('is-lit', entry > ENTRY.lit);
  const taken = entry > 0 || time > 0;
  if (taken !== scene.received) {
    scene.received = taken;
    shared.handoff.receive(root, taken);
  }
  fade(scene.rings.order, share(entry, ENTRY.ring) * (1 - share(time, ENTRY.ringOut)));
}

// Home: the page scrolls inside the window and today's figures count up.
function renderHome(scene: Scene): void {
  const { time } = scene.clock;
  const scroll =
    GLANCE * scene.inOut(share(time, SPAN.glance)) +
    (REVIEW - GLANCE) * scene.inOut(share(time, SPAN.review));
  scene.content.style.transform = `translateY(${-scroll}px)`;
  const counted = scene.out(share(time, SPAN.counted));
  scene.figures.forEach((node, index) => {
    const text = Math.round(FIGURES[index] * counted).toLocaleString('en-US');
    if (node.textContent !== text) {
      node.textContent = text;
    }
  });
}

// Needs attention: three areas to review arrive; the pointer resolves one and its count drops.
function renderAttention(scene: Scene): void {
  const { time } = scene.clock;
  fade(scene.rings.strip, Math.sin(Math.PI * share(time, SPAN.strip)) * STRIP_GLOW);
  fade(scene.rings.item, share(time, SPAN.itemIn) * (1 - share(time, SPAN.itemOut)));
  const left = time >= RESOLVE ? '03' : spots.count.text;
  if (scene.count.textContent !== left) {
    scene.count.textContent = left;
  }
}

// The focus ring fades in and out on the field the rule form is on.
const rampOf = (time: number, field: (typeof FOCUS)[number]): number =>
  Math.min(
    share(time, { from: field.from, to: field.from + FOCUS_FADE }),
    1 - share(time, { from: field.to - FOCUS_FADE, to: field.to }),
  );

// A rule: the form opens, a category, who needs to know, the estimate, saved, and it is on.
function renderRule(scene: Scene): void {
  const { time } = scene.clock;
  scene.frames.forEach((frame, index) => fade(frame, share(time, RULE_FRAMES[index])));
  const field = FOCUS.find((span) => time >= span.from && time < span.to);
  fade(scene.rings.focus, field ? rampOf(time, field) : 0);
  if (field) {
    placeOn(scene.rings.focus, spots[field.spot], FOCUS_PAD);
  }
}

// The pointer of an unseen hand, and the taps it makes.
function renderPointer(scene: Scene): void {
  const { time } = scene.clock;
  const hand = pointerAt(scene.route, time, scene.inOut);
  scene.cursor.style.opacity = String(
    share(time, SPAN.cursorIn) * (1 - share(time, SPAN.cursorOut)),
  );
  scene.cursor.style.transform = `translate(${hand.x}px, ${hand.y}px) scale(${CURSOR.scale - CURSOR.squeeze * tapAt(time)})`;
}

// Which caption is lit, by the clock: the first screen, then the second, then the third.
function stageOf(time: number): number {
  if (time < STAGE_FROM.second) {
    return 0;
  }
  return time < STAGE_FROM.third ? 1 : 2;
}

// On release the thread leaves the window, carrying nothing, and the captions show their progress.
function renderExit(scene: Scene): void {
  const { time } = scene.clock;
  const { shots } = scene.panel;
  draw(scene.outPath, scene.inOut(share(time, SPAN.release)));
  SHOT_LIGHT.forEach((span, index) => {
    shots[index].style.setProperty('--p', String(share(time, span)));
  });
  const now = stageOf(time);
  if (now !== scene.stageNow) {
    scene.stageNow = now;
    shots.forEach((item, index) => item.classList.toggle('is-active', index === now));
  }
}

function render(scene: Scene): void {
  renderEntry(scene);
  renderHome(scene);
  renderAttention(scene);
  renderRule(scene);
  renderPointer(scene);
  renderExit(scene);
}

// The window leans a few degrees towards the pointer. Returns how to stop listening.
function leanOn(root: HTMLElement, tilt: HTMLElement, shared: Shared): () => void {
  const { gsap } = shared;
  const lean = {
    x: gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3.out' }),
    y: gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3.out' }),
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    lean.x((event.clientX / innerWidth - LEAN.centre) * LEAN.x);
    lean.y((LEAN.centre - event.clientY / innerHeight) * LEAN.y);
  };
  root.addEventListener('pointermove', onMove);
  return () => root.removeEventListener('pointermove', onMove);
}

// The pinned timeline: the clock runs from 0 to END while the section is pinned, and snaps to the screens.
function pinWindow(scene: Scene): void {
  const { root, shared } = scene.panel;
  shared.gsap
    .timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${innerHeight * PIN_SCREENS}`,
        pin: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
        // No inertia: a flick of the wheel moves one screen, never past one.
        snap: {
          snapTo: 'labelsDirectional',
          inertia: false,
          duration: { min: 0.25, max: 0.8 },
          delay: 0.1,
          ease: 'power1.inOut',
        },
      },
    })
    .to(scene.clock, { time: END, duration: END, ease: 'none', onUpdate: () => render(scene) }, 0)
    .addLabel('start', 0)
    .addLabel('home', LABEL.home)
    .addLabel('attention', LABEL.attention)
    .addLabel('rule', LABEL.rule)
    .addLabel('end', END);
}

// The desktop window: pinned, scrubbed through the three screens, and the hand-off of the card.
export function windowed(panel: Panel): () => void {
  const { root, shared } = panel;
  const { gsap, ScrollTrigger } = shared;
  const parts = buildParts(panel);
  const scene: Scene = {
    ...parts,
    clock: { time: 0, entry: 0 },
    route: routeOf(),
    geo: fitWindow(parts),
    received: null,
    stageNow: -1,
    inOut: gsap.parseEase(shared.ease.inOut),
    out: gsap.parseEase(shared.ease.out),
  };
  gsap.to(scene.clock, {
    entry: 1,
    ease: 'none',
    onUpdate: () => render(scene),
    scrollTrigger: {
      trigger: root,
      start: 'top 90%',
      end: 'top top',
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  pinWindow(scene);
  const stopLean = leanOn(root, parts.tilt, shared);
  const onRefresh = () => {
    scene.geo = fitWindow(scene);
    render(scene);
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);
  render(scene);
  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    stopLean();
    parts.screen.remove();
    parts.win.removeAttribute('style');
    parts.win.classList.remove('is-lit');
    panel.shots.forEach((item) => {
      item.classList.remove('is-active');
      item.style.removeProperty('--p');
    });
  };
}
