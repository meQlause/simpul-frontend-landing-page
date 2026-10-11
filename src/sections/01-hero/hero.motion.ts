import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { SplitText } from 'gsap/SplitText';
import type { gsap } from '../../motion/gsap';
import { all, one, SVG_NS } from '../../motion/dom';
import { mark } from '../../motion/mark';
import type { SectionMotion, Shared } from '../../motion/types';
import { type LineNodes, placeLines, placeRelease } from './hero.lines';
import { runLights } from './hero.lights';
import {
  ARRIVE,
  ASLEEP_AFTER,
  CHAT,
  FLOW,
  HALF,
  LEAN,
  OPENING,
  SKIP_AFTER,
  THREADS,
  TILT,
  WANDER,
} from './hero.tuning';

interface Clock {
  travel: gsap.core.Timeline | null;
  restless: gsap.core.Tween | null;
  asleep: boolean;
  opened: boolean;
  skip: boolean;
}

interface Scene extends LineNodes {
  root: HTMLElement;
  shared: Shared;
  clock: Clock;
  arriving: SVGCircleElement[];
  leaving: SVGCircleElement[];
  links: SVGPathElement[];
  backdrop: SVGCircleElement;
  releaseLinks: SVGGElement[];
  releaseBackdrop: SVGGElement;
  release: SVGSVGElement;
  releasePath: SVGPathElement;
  lockup: HTMLElement;
  wordmarkExit: HTMLElement;
  breathe: HTMLElement;
  tilt: HTMLElement;
  opening: HTMLElement;
  footer: HTMLElement;
  chats: HTMLElement[];
}

interface Headings {
  scatter: SplitText;
  split: SplitText;
}

interface Lean {
  y: number;
  rotation: number;
  scale: number;
}

function lean(index: number): Lean {
  return {
    y: ((index * LEAN.y.step) % LEAN.y.modulo) - LEAN.y.offset,
    rotation: ((index * LEAN.rotation.step) % LEAN.rotation.modulo) - LEAN.rotation.offset,
    scale: LEAN.scale.base + ((index * LEAN.scale.step) % LEAN.scale.modulo) / LEAN.scale.divisor,
  };
}

function revealPage(): void {
  document.documentElement.classList.remove('hero-boot');
}

function addPath(lines: SVGSVGElement, className?: string): SVGPathElement {
  const path = lines.appendChild(document.createElementNS(SVG_NS, 'path'));

  if (className) {
    path.setAttribute('class', className);
  }

  return path;
}

function addDot(lines: SVGSVGElement): SVGCircleElement {
  const dot = lines.appendChild(document.createElementNS(SVG_NS, 'circle'));

  dot.setAttribute('r', '3.5');

  return dot;
}

function wrapSVG(node: SVGElement): SVGGElement {
  const wrapper = document.createElementNS(SVG_NS, 'g');

  node.before(wrapper);
  wrapper.append(node);

  return wrapper;
}

function buildScene(root: HTMLElement, shared: Shared): Scene {
  const lines = one<SVGSVGElement>(root, '.hero-lines');
  const tangled = Array.from(
    { length: shared.conditions.phone ? THREADS.phoneIn : THREADS.deskIn },
    () => addPath(lines),
  );
  const straight = Array.from({ length: THREADS.out }, () => addPath(lines, 'out'));
  const links = all<SVGPathElement>(root, '[data-mark-link]');
  const backdrop = one<SVGCircleElement>(root, '[data-mark-backdrop]');

  links.forEach((link) => link.setAttribute('vector-effect', 'non-scaling-stroke'));

  return {
    root,
    shared,
    clock: {
      travel: null,
      restless: null,
      asleep: false,
      opened: false,
      skip: root.dataset.entered === 'true' || window.scrollY > root.offsetHeight * HALF,
    },
    lines,
    tangled,
    straight,
    arriving: tangled.map(() => addDot(lines)),
    leaving: straight.map(() => addDot(lines)),
    links,
    backdrop,
    releaseLinks: links.map(wrapSVG),
    releaseBackdrop: wrapSVG(backdrop),
    symbol: one(root, '.hero-symbol'),
    kicker: one(root, '.hero-kicker'),
    busy: one(root, '.hero-busy'),
    clear: one(root, '.hero-clear'),
    below: one(root, '.hero-bottom'),
    wordmark: one(root, '.hero-wordmark'),
    wordmarkExit: one(root, '.hero-wordmark-exit'),
    lockup: one(root, '.hero-lockup'),
    breathe: one(root, '.hero-mark-breathe'),
    tilt: one(root, '.hero-mark-tilt'),
    opening: one(root, '.hero-handoff'),
    release: one<SVGSVGElement>(root, '.hero-release'),
    releasePath: one<SVGPathElement>(root, '.hero-release path'),
    footer: one(root, '.hero-footer'),
    chats: all(root, '.hero-chat'),
  };
}

function restlessLetters(scene: Scene, chars: Element[]): void {
  const { gsap } = scene.shared;

  scene.clock.restless?.kill();
  const restless = gsap.to(chars, {
    x: () => gsap.utils.random(-WANDER.x, WANDER.x),
    y: () => gsap.utils.random(-WANDER.y, WANDER.y),
    rotation: () => gsap.utils.random(-WANDER.rotation, WANDER.rotation),
    scale: () => gsap.utils.random(WANDER.scale.low, WANDER.scale.high),
    duration: 0.7,
    ease: 'sine.inOut',
    repeat: -1,
    repeatRefresh: true,
    stagger: { each: 0.03, from: 'random' },
    paused: true,
  });

  scene.clock.restless = restless;

  if (!scene.clock.opened) {
    return;
  }

  chars.forEach((char, index) => gsap.set(char, lean(index)));

  if (!scene.clock.asleep) {
    restless.play();
  }
}

function splitHeadings(scene: Scene): Headings {
  const scatter = SplitText.create(scene.busy, {
    type: 'words,chars',
    autoSplit: true,
    onSplit: (self) => restlessLetters(scene, self.chars),
  });
  const split = SplitText.create(scene.clear, { type: 'lines', mask: 'lines', autoSplit: true });

  return { scatter, split };
}

const xToKnot = (node: Element, symbol: HTMLElement): number => {
  const card = node.getBoundingClientRect();
  const target = symbol.getBoundingClientRect();

  return target.left + target.width / 2 - card.left - card.width / 2;
};

const yToKnot = (node: Element, symbol: HTMLElement): number => {
  const card = node.getBoundingClientRect();
  const target = symbol.getBoundingClientRect();

  return target.top + target.height / 2 - card.top - card.height / 2;
};

function buildOpening(scene: Scene, headings: Headings, intro: gsap.core.Timeline): void {
  const { gsap, conditions } = scene.shared;
  const chars = headings.scatter.chars;
  const threads = [...scene.tangled, ...scene.straight];

  intro
    .from(
      scene.chats,
      {
        x: conditions.phone ? CHAT.phoneX : CHAT.deskX,
        y: -10,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.12,
      },
      0,
    )
    .to(
      scene.chats,
      {
        x: (_index: number, node: Element) => xToKnot(node, scene.symbol),
        y: (_index: number, node: Element) => yToKnot(node, scene.symbol),
        scale: 0.06,
        rotation: 0,
        autoAlpha: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: 'power2.in',
      },
      OPENING.fly,
    )
    .to(
      scene.links,
      {
        drawSVG: '100%',
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.8,
        stagger: 0.2,
        ease: 'power2.inOut',
      },
      OPENING.links,
    )
    .to(scene.backdrop, { autoAlpha: 1, duration: 0.6 }, OPENING.lock)
    .to(scene.links, { fillOpacity: 1, strokeOpacity: 0, duration: 0.6 }, OPENING.lock)
    .fromTo(scene.breathe, { scale: 1.06 }, { scale: 1, duration: 0.7 }, OPENING.breathe)
    .to(scene.wordmark, { autoAlpha: 1, y: 0, duration: 0.7 }, OPENING.wordmark)
    .to(
      threads,
      { drawSVG: '0% 100%', duration: 1.6, stagger: 0.04, ease: 'power2.out' },
      OPENING.threads,
    )
    .set(scene.busy, { autoAlpha: 1 }, OPENING.busy)
    .fromTo(
      chars,
      {
        x: () => gsap.utils.random(-ARRIVE.x, ARRIVE.x),
        y: () => gsap.utils.random(-ARRIVE.y, ARRIVE.y),
        rotation: () => gsap.utils.random(-ARRIVE.rotation, ARRIVE.rotation),
        scale: 1,
        autoAlpha: 0,
      },
      {
        x: 0,
        y: (index: number) => lean(index).y,
        rotation: (index: number) => lean(index).rotation,
        scale: (index: number) => lean(index).scale,
        autoAlpha: 1,
        duration: 1.3,
        stagger: { each: 0.025, from: 'random' },
        ease: 'power3.out',
      },
      OPENING.busy,
    )
    .set(scene.clear, { autoAlpha: 1 }, OPENING.clear)
    .fromTo(
      headings.split.lines,
      { yPercent: 110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.16, ease: 'power4.out' },
      OPENING.clear,
    )
    .fromTo(
      scene.kicker,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.8 },
      OPENING.kicker,
    )
    .set(scene.below, { autoAlpha: 1 }, OPENING.actions)
    .fromTo(
      [...scene.below.children],
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
      OPENING.actions,
    )
    .fromTo(scene.footer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, OPENING.foot);
}

function openHero(scene: Scene, headings: Headings): void {
  const { clock } = scene;

  if (clock.opened) {
    return;
  }

  clock.opened = true;
  scene.root.dataset.entered = 'true';
  settleFinal(scene, headings);
  revealPage();
  flow(scene);
  clock.restless?.play();

  if (clock.asleep) {
    clock.travel?.pause(0);
    clock.restless?.pause();
  }
}

function settleFinal(scene: Scene, headings: Headings): void {
  const { gsap } = scene.shared;

  gsap.set(
    [scene.kicker, scene.busy, scene.clear, scene.below, scene.footer, ...scene.below.children],
    { autoAlpha: 1, y: 0 },
  );
  headings.scatter.chars.forEach((char, index) =>
    gsap.set(char, { x: 0, autoAlpha: 1, ...lean(index) }),
  );
  gsap.set(headings.split.lines, { yPercent: 0, autoAlpha: 1 });
  gsap.set([...scene.tangled, ...scene.straight], {
    clearProps: 'strokeDasharray,strokeDashoffset',
  });
}

function flow(scene: Scene): void {
  const { gsap, conditions } = scene.shared;

  scene.clock.travel?.kill();
  const period = conditions.phone ? FLOW.phonePeriod : FLOW.desktopPeriod;

  scene.clock.travel = runLights(gsap, scene, period);
}

function sleep(scene: Scene, asleep: boolean): void {
  const { clock } = scene;

  if (asleep === clock.asleep) {
    return;
  }

  clock.asleep = asleep;

  if (asleep) {
    clock.travel?.pause(0);
    clock.restless?.pause();

    return;
  }

  if (clock.opened) {
    clock.travel?.restart();
    clock.restless?.resume();
  }
}

function remeasure(scene: Scene): void {
  placeLines(scene, scene.shared.conditions.phone);
  placeRelease(scene.root, scene.lockup, scene.release, scene.releasePath);

  if (scene.clock.travel) {
    flow(scene);
  }

  if (scene.clock.asleep) {
    scene.clock.travel?.pause(0);
  }
}

function setStart(scene: Scene): void {
  const { gsap, carried } = scene.shared;

  carried.setForm('order');
  scene.opening.append(carried.el);
  carried.el.dataset.handoffObject = '';
  gsap.set([scene.releasePath, carried.el], { autoAlpha: 0 });
  gsap.set(scene.lockup, { visibility: 'visible' });
  gsap.set(scene.links, {
    fillOpacity: 0,
    stroke: getComputedStyle(scene.root).getPropertyValue('--green').trim(),
    strokeWidth: 2,
    strokeOpacity: 1,
    drawSVG: 0,
    transformOrigin: '50% 50%',
  });
  gsap.set(scene.links[0], { x: -24, y: -16, rotation: -12 });
  gsap.set(scene.links[1], { x: 24, y: 16, rotation: 12 });
  gsap.set(scene.backdrop, { autoAlpha: 0 });
  gsap.set(scene.wordmark, { autoAlpha: 0, y: 8 });
  gsap.set(scene.tangled, { drawSVG: '100% 100%' });
  gsap.set(scene.straight, { drawSVG: '0% 0%' });
  gsap.set([...scene.arriving, ...scene.leaving], { autoAlpha: 0 });
}

function prepareOpening(scene: Scene, headings: Headings): gsap.core.Timeline {
  setStart(scene);

  return scene.shared.gsap.timeline({
    paused: true,
    defaults: { ease: scene.shared.ease.out },
    onComplete: () => openHero(scene, headings),
  });
}

function playOpening(scene: Scene, headings: Headings, intro: gsap.core.Timeline): void {
  if (scene.clock.opened) {
    return;
  }

  buildOpening(scene, headings, intro);

  if (scene.clock.skip) {
    intro.progress(1);
  } else {
    intro.play();
  }
}

function stillHero(root: HTMLElement): void {
  root.dataset.entered = 'true';
  revealPage();
}

function listenForRefresh(scene: Scene): () => void {
  const refresh = () => remeasure(scene);

  scene.shared.ScrollTrigger.addEventListener('refreshInit', refresh);

  return () => scene.shared.ScrollTrigger.removeEventListener('refreshInit', refresh);
}

function scrollOut(scene: Scene, intro: gsap.core.Timeline): void {
  const { gsap, carried } = scene.shared;
  const { links, releaseLinks, releaseBackdrop, wordmarkExit, releasePath } = scene;

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene.root,
        start: 'top top',
        end: 'bottom 35%',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > SKIP_AFTER && !scene.clock.opened) {
            scene.clock.skip = true;

            if (intro.duration()) {
              intro.progress(1);
            }
          }

          sleep(scene, self.progress > ASLEEP_AFTER);
        },
      },
    })
    .fromTo(
      links,
      { fillOpacity: 1, strokeOpacity: 0 },
      { fillOpacity: 0, strokeOpacity: 1, duration: 0.45, immediateRender: false },
      0,
    )
    .to(releaseLinks[0], { x: -9, y: -12, rotation: -9, duration: 0.7 }, 0)
    .to(releaseLinks[1], { x: 9, y: 12, rotation: 9, duration: 0.7 }, 0)
    .to(releaseBackdrop, { autoAlpha: 0, duration: 0.5 }, 0)
    .to(wordmarkExit, { autoAlpha: 0, y: -8, duration: 0.4 }, 0)
    .fromTo(releasePath, { drawSVG: 0 }, { autoAlpha: 1, drawSVG: '100%', duration: 1 }, 0)
    .to(
      carried.el,
      {
        autoAlpha: 1,
        motionPath: { path: releasePath, align: releasePath, alignOrigin: [HALF, HALF] },
        duration: 1,
      },
      0,
    )
    .to(scene.lines, { autoAlpha: 0, duration: 0.5 }, 0);
}

function followPointer(scene: Scene): AbortController {
  const controller = new AbortController();
  const { conditions } = scene.shared;

  if (!conditions.phone && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    attachTilt(scene, controller.signal);
  }

  return controller;
}

function attachTilt(scene: Scene, signal: AbortSignal): void {
  const { gsap, ease } = scene.shared;
  const rotateX = gsap.quickTo(scene.tilt, 'rotationX', { duration: 0.7, ease: ease.out });
  const rotateY = gsap.quickTo(scene.tilt, 'rotationY', { duration: 0.7, ease: ease.out });

  scene.root.addEventListener(
    'pointermove',
    (event) => {
      const rect = scene.root.getBoundingClientRect();

      rotateX((HALF - (event.clientY - rect.top) / rect.height) * TILT.degrees);
      rotateY(((event.clientX - rect.left) / rect.width - HALF) * TILT.degrees);
    },
    { signal },
  );
  scene.root.addEventListener(
    'pointerleave',
    () => {
      rotateX(0);
      rotateY(0);
    },
    { signal },
  );
}

export const initHero: SectionMotion['init'] = (root, shared) => {
  shared.gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, SplitText);
  one(root, '.hero-symbol').innerHTML = mark;

  if (shared.conditions.reduce) {
    stillHero(root);

    return undefined;
  }

  root.dataset.motion = '';
  const scene = buildScene(root, shared);
  const headings = splitHeadings(scene);
  const intro = prepareOpening(scene, headings);

  remeasure(scene);
  const unlisten = listenForRefresh(scene);

  void document.fonts.ready.then(() => playOpening(scene, headings, intro));
  scrollOut(scene, intro);
  const controller = followPointer(scene);

  return () => {
    controller.abort();
    unlisten();
    headings.split.revert();
    scene.clock.restless?.kill();
    headings.scatter.revert();
    scene.clock.travel?.kill();
    scene.lines.replaceChildren();
    shared.carried.el.remove();
    delete root.dataset.motion;
  };
};
