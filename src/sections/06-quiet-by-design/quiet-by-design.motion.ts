import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { one } from '../../motion/dom';
import type { SectionMotion, Shared } from '../../motion/types';
import { settle, type Plan } from './heap';
import { simulate, type Matter } from './heap.physics';
import { buildBoard, shake } from './quiet-by-design.board';
import { liftOf, measureLayout, rolesOf, startsOf } from './quiet-by-design.geo';
import { buildIndex, disposeIndex, openFirst, openSlide } from './quiet-by-design.index';
import { renderFrame } from './quiet-by-design.render';
import type { Carousel, Curves, Scene } from './quiet-by-design.scene';
import { NEAR_MARGIN, PERCENT, RULE_REVEAL, SCRUB, TAKE, WINDOW } from './quiet-by-design.tuning';

// Quiet by design. Not pinned as a section (section 7 is): the commitments scroll past while the stage
// beside them stays in view. Where the vanilla page used sticky, the stage is a ScrollTrigger pin here.
// The storm and the heap are physics, recorded ahead of time and played back by one scroll clock.

const END_AT_BOTTOM = 'bottom bottom';

// Matter.js, once it has arrived. Kept for later rebuilds, so a resize never loads it twice.
let matter: Matter | null = null;

type Split = (target: Element, vars: Parameters<typeof SplitText.create>[1]) => SplitText;
type Measured = Pick<Scene, 'layout' | 'plan' | 'roles' | 'starts'>;
type Base = Omit<Scene, keyof Measured>;

// The text arrives as it comes into view; scrolling back takes it away again.
const when = (trigger: Element, start: string) => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

// Every split the section makes is kept, so the cleanup can put the words back.
function splitterOf(splits: SplitText[]): Split {
  return (target, vars) => {
    const result = SplitText.create(target, vars);
    splits.push(result);
    return result;
  };
}

const wordsOf =
  (split: Split) =>
  (target: Element): Element[] =>
    split(target, { type: 'words', mask: 'words' }).words;

function curvesOf(gsap: Shared['gsap']): Curves {
  return {
    inOut: gsap.parseEase('power2.inOut'),
    out: gsap.parseEase('power2.out'),
    takeoff: gsap.parseEase('power2.in'),
    pop: gsap.parseEase('back.out(2.4)'),
    sky: gsap.utils.interpolate('#edf4e7', '#163f32'),
    glow: gsap.utils.interpolate('#176448', '#71a977'),
  };
}

// The eyebrow, the chapter, the title and the lead: each arrives as its section comes into view.
function revealText(root: HTMLElement, shared: Shared, split: Split): void {
  const { gsap } = shared;
  const words = wordsOf(split);
  const chapter = one(root, '.quiet-chapter');
  const chapterText = chapter.textContent ?? '';
  gsap.from(split(one(root, '.quiet .eyebrow'), { type: 'chars' }).chars, {
    autoAlpha: 0,
    y: 6,
    stagger: 0.03,
    duration: 0.4,
    scrollTrigger: when(root, 'top 80%'),
  });
  gsap.fromTo(
    chapter,
    { scrambleText: '' },
    {
      scrambleText: { text: chapterText, chars: 'upperCase', speed: 0.5 },
      duration: 1.4,
      scrollTrigger: when(root, 'top 80%'),
    },
  );
  gsap.from(words(one(root, '.quiet-title')), {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.07,
    duration: 0.95,
    ease: 'power4.out',
    scrollTrigger: when(root, 'top 70%'),
  });
  gsap.from(words(one(root, '.quiet-lead')), {
    yPercent: 100,
    stagger: 0.02,
    duration: 0.7,
    ease: shared.ease.out,
    scrollTrigger: when(root, 'top 55%'),
  });
}

// The layout, the physics and the roles, measured now: the same again on every refresh.
function measured(board: Scene['board'], phone: boolean, take: number[]): Measured {
  const base = measureLayout(board, phone);
  const plan: Plan = !phone && matter ? simulate(matter, base, take) : settle(base, take);
  const count = board.notes.length;
  const roles = rolesOf(plan, count);
  return {
    layout: { ...base, lift: liftOf(base, plan, count) },
    plan,
    roles,
    starts: startsOf(plan, roles),
  };
}

// The rules of the list: each reveals as it comes in, and on desktop the one in the middle is shown.
function watchRules(base: Base, words: (target: Element) => Element[]): void {
  const { shared, board, carousel, phone } = base;
  const { gsap, ScrollTrigger } = shared;
  const span = phone ? WINDOW.phone : WINDOW.desktop;
  board.rules.forEach((rule, index) => {
    gsap
      .timeline({ defaults: { ease: shared.ease.out }, scrollTrigger: when(rule, 'top 88%') })
      .from(
        one(rule, '.quiet-icon'),
        { scale: 0.4, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' },
        0,
      )
      .from(
        words(one(rule, 'h3')),
        { yPercent: 110, stagger: 0.05, duration: 0.6 },
        RULE_REVEAL.title,
      )
      .from(
        words(one(rule, 'p')),
        { yPercent: 105, stagger: 0.012, duration: 0.5 },
        RULE_REVEAL.text,
      );
    ScrollTrigger.create({
      trigger: rule,
      start: `center ${span.from * PERCENT}%`,
      end: `center ${span.to * PERCENT}%`,
      toggleClass: 'is-active',
      onToggle: (self) => {
        if (self.isActive) {
          openSlide(shared, carousel, index);
        }
      },
    });
  });
}

// The stage (and the desktop index) stays in view while the commitments scroll past. That is what the
// vanilla sticky rule did; inside the smoother it is a pin for the length of its column.
function pinInView(
  shared: Shared,
  trigger: HTMLElement,
  endTrigger: HTMLElement,
  pinSpacer?: HTMLElement,
): void {
  shared.ScrollTrigger.create({
    trigger,
    pin: true,
    pinSpacing: false,
    pinSpacer,
    start: 'top top',
    endTrigger,
    end: () =>
      `+=${endTrigger.getBoundingClientRect().bottom - trigger.getBoundingClientRect().top - trigger.offsetHeight}`,
  });
}

// ScrollTrigger makes its own spacer after it has measured the pin, so the pin is measured outside any box
// and loses the bleed margins the spacer takes over (phones). A spacer already in the page keeps them, so the
// stage is wrapped here, before the pin, and unwrapped by the cleanup.
function wrapStage(stage: HTMLElement): HTMLElement {
  const spacer = document.createElement('div');
  spacer.className = 'pin-spacer';
  // Keep the same grid rows while ScrollTrigger reverts the native spacer to measure the column.
  spacer.style.gridArea = getComputedStyle(stage).gridArea;
  stage.before(spacer);
  spacer.append(stage);
  stage.style.width = '100%'; // the bleed margins are the spacer's; the stage fills it
  return spacer;
}

// The board, its text, its index and its rules, in the vanilla order. Nothing here is measured yet.
function mountBase(root: HTMLElement, shared: Shared, split: Split): Base {
  const phone = shared.conditions.phone;
  const take = Object.values(phone ? TAKE.phone : TAKE.desktop);
  const board = buildBoard(root, take);
  const stageSpacer = wrapStage(board.stage);
  revealText(root, shared, split);
  const carousel: Carousel = phone
    ? { index: null, slides: [], bars: [], opened: -1 }
    : buildIndex(shared, board.body, board.rules, wordsOf(split));
  if (carousel.index) {
    root.dataset.index = '';
  }
  const base: Base = {
    board,
    shared,
    curves: curvesOf(shared.gsap),
    phone,
    take,
    clock: { p: 0 },
    feel: { noise: 0, felt: 0 },
    carousel,
  };
  openFirst(shared, carousel); // never empty: the first one is there before its turn
  watchRules(base, wordsOf(split));
  pinInView(shared, board.stage, board.body, stageSpacer);
  if (carousel.index) {
    pinInView(shared, one(carousel.index, '.quiet-index-view'), carousel.index);
  }
  return base;
}

// Matter.js only arrives as the section comes near, and only on desktop.
function arriveNear(root: HTMLElement, phone: boolean, onArrive: () => void): IntersectionObserver {
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        return;
      }
      near.disconnect();
      void import('matter-js').then((module) => {
        matter = module.default;
        onArrive();
      });
    },
    { rootMargin: NEAR_MARGIN },
  );
  if (!phone && !matter) {
    near.observe(root);
  }
  return near;
}

// The solo stub has no section above it: the copy the page carries is hidden here.
function hideStubCopy(root: HTMLElement, shared: Shared): void {
  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }
}

// The survivor hands its card on: the handoff object and the exit it left are taken back off it.
function resetSurvivor(survivor: HTMLElement): void {
  survivor.removeAttribute('style');
  survivor.classList.remove('is-clean');
  for (const key of ['handoffObject', 'exitX', 'exitY', 'exitAngle']) {
    delete survivor.dataset[key];
  }
}

// The stage goes back to its own place in the section, out of the spacer made for its pin.
function unwrapStage(stage: HTMLElement): void {
  const spacer = stage.parentElement;
  if (spacer?.classList.contains('pin-spacer')) {
    spacer.replaceWith(stage);
  }
}

// Puts back what the section changed on the page: its nodes, its styles, its datasets, its index.
function cleanupOf(scene: Scene, dispose: () => void): () => void {
  const { board, carousel } = scene;
  return () => {
    dispose();
    for (const node of [...board.extras, ...board.notes.map((note) => note.el), board.svg]) {
      node.remove();
    }
    resetSurvivor(board.survivor);
    board.panel.removeAttribute('style');
    board.rules.forEach((rule) => rule.classList.remove('is-active'));
    disposeIndex(carousel);
    board.panel.classList.remove('is-calm');
    delete board.root.dataset.index;
    delete board.root.dataset.motion;
    unwrapStage(board.stage);
  };
}

// Plays the frames: the clock that scrubs them, the restless board, the refresh on every resize, and the
// arrival of Matter.js. Returns how to stop all of it.
function playScene(scene: Scene, root: HTMLElement): () => void {
  const { ScrollTrigger, gsap } = scene.shared;
  let alive = true;
  const onRefresh = () => {
    Object.assign(scene, measured(scene.board, scene.phone, scene.take));
    renderFrame(scene);
  };
  const restless = (time: number) => {
    if (ScrollTrigger.isInViewport(scene.board.panel)) {
      shake(scene.board.panel, scene.feel, time);
    }
  };
  gsap.ticker.add(restless);
  gsap.to(scene.clock, {
    p: 1,
    ease: 'none',
    onUpdate: () => renderFrame(scene),
    scrollTrigger: { trigger: root, start: 'top bottom', end: END_AT_BOTTOM, scrub: SCRUB },
  });
  ScrollTrigger.addEventListener('refresh', onRefresh);
  renderFrame(scene);
  const near = arriveNear(root, scene.phone, () => {
    if (alive) {
      onRefresh();
    }
  });
  return () => {
    alive = false;
    near.disconnect();
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    gsap.ticker.remove(restless);
  };
}

export const initQuiet: SectionMotion['init'] = (root, shared) => {
  if (shared.conditions.reduce) {
    return undefined; // still: the five commitments beside one clean card
  }
  shared.gsap.registerPlugin(SplitText, ScrambleTextPlugin, MotionPathPlugin);
  root.dataset.motion = '';
  hideStubCopy(root, shared);
  const chapter = one(root, '.quiet-chapter');
  const chapterText = chapter.textContent ?? '';
  const splits: SplitText[] = [];
  const base = mountBase(root, shared, splitterOf(splits));
  const scene: Scene = { ...base, ...measured(base.board, base.phone, base.take) };
  const stopPlaying = playScene(scene, root);
  return cleanupOf(scene, () => {
    stopPlaying();
    splits.forEach((result) => result.revert());
    chapter.textContent = chapterText;
  });
};
