import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { all, one } from '../../motion/dom';
import type { SectionMotion, Shared } from '../../motion/types';
import { measureChat, paint } from './turn.chat';
import { buildTurn, type Scene } from './turn.scene';
import { measureRoute, renderThread } from './turn.thread';
import {
  ASKS,
  CHAT,
  CHAT_RUN,
  EXIT_RUN,
  LAYER,
  LAYER_RUN,
  MS_PER_SECOND,
  PICK,
  REVEAL,
  SHEEN,
} from './turn.tuning';

// The turn. Not pinned: the visitor feels free again after section 2. Three scroll ranges, each a pure
// function of the scroll so every step reverses: the thread picks the fallen order up, the layer slides
// over the chat and takes it, then the order is handed on. The chat runs on its own pausable clock.

// Where the page is measured: the route for the thread, and the loop for the chat.
function measureAll(scene: Scene): void {
  measureRoute(scene);
  measureChat(scene);
}

// The chat's clock, and the motion that runs by itself: it stops off screen, with the tab hidden, or on
// request. The sheen crosses the layer in its own loop.
function runChat(scene: Scene): () => void {
  const { gsap } = scene.shared;
  const controller = new AbortController();
  const { signal } = controller;
  const sheen = gsap
    .timeline({ repeat: -1, repeatDelay: SHEEN.repeatDelay, paused: true })
    .fromTo(
      scene.layer,
      { '--sheen': '-100%' },
      { '--sheen': '900%', duration: SHEEN.duration, ease: scene.shared.ease.inOut },
    );
  const running = () => !scene.paused && scene.onScreen && !document.hidden;
  const sync = () => (running() ? sheen.resume() : sheen.pause());
  const tick = (_time: number, delta: number) => {
    if (!running()) {
      return;
    }
    scene.chat.time += Math.min(delta, CHAT.maxFrame) / MS_PER_SECOND;
    paint(scene);
  };
  gsap.ticker.add(tick);
  scene.button.hidden = false;
  scene.button.addEventListener(
    'click',
    () => {
      scene.paused = !scene.paused;
      scene.button.setAttribute('aria-pressed', String(scene.paused));
      scene.button.textContent = scene.paused ? 'Resume chat motion' : 'Pause chat motion';
      sync();
    },
    { signal },
  );
  document.addEventListener('visibilitychange', sync, { signal });
  const observer = new IntersectionObserver(([entry]) => {
    scene.onScreen = entry.isIntersecting;
    sync();
  });
  observer.observe(scene.stage);
  return () => {
    controller.abort();
    observer.disconnect();
    gsap.ticker.remove(tick);
  };
}

// Words arrive as they come into view, and leave again as the page scrolls back above them.
function when(trigger: Element, start = REVEAL.headline) {
  return { trigger, start, toggleActions: 'play none none reverse' };
}

// The eyebrow, the chapter, the headline and each row's words: split once and revealed as they arrive.
function reveal(scene: Scene, splits: SplitText[]): void {
  const { gsap, ease } = scene.shared;
  const { root } = scene;
  const split = (target: Element, vars: Parameters<typeof SplitText.create>[1]) => {
    const result = SplitText.create(target, vars);
    splits.push(result);
    return result;
  };
  const chapter = one(root, '.turn-chapter');
  const chapterText = chapter.textContent;
  const headline = one(root, '.turn .headline');
  gsap.from(split(one(root, '.turn .eyebrow'), { type: 'chars' }).chars, {
    autoAlpha: 0,
    y: 6,
    stagger: 0.03,
    duration: 0.4,
    scrollTrigger: when(root, REVEAL.copy),
  });
  gsap.fromTo(
    chapter,
    { scrambleText: '' },
    {
      scrambleText: { text: chapterText, chars: 'upperCase', speed: 0.5 },
      duration: 1.4,
      scrollTrigger: when(root, REVEAL.copy),
    },
  );
  gsap.from(split(headline, { type: 'words', mask: 'words' }).words, {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.06,
    duration: 0.95,
    ease: 'power4.out',
    scrollTrigger: when(headline),
  });
  for (const row of all(root, '.turn-asks li')) {
    gsap
      .timeline({ defaults: { ease: ease.out }, scrollTrigger: when(row, REVEAL.row) })
      .fromTo(row, { '--rule': 0 }, { '--rule': 1, duration: 0.9, ease: ease.inOut }, 0)
      .from(
        one(row, 'svg'),
        {
          autoAlpha: 0,
          scale: 0.4,
          rotation: -18,
          transformOrigin: '50% 50%',
          duration: 0.7,
          ease: 'back.out(2.2)',
        },
        REVEAL.icon,
      )
      .from(
        split(one(row, 'p'), { type: 'words', mask: 'words' }).words,
        { yPercent: 110, stagger: 0.035, duration: 0.6 },
        REVEAL.words,
      );
  }
}

// The text reveals, with the splits kept so the cleanup can put the words back.
function revealAll(scene: Scene): SplitText[] {
  const splits: SplitText[] = [];
  reveal(scene, splits);
  return splits;
}

// 1. The thread reaches down from the stage, hooks the fallen order and carries it to the layer.
// 2. The layer slides across the chat. The chat underneath keeps going exactly as before.
// 3. The order, outlined now, goes on down the corridor on a taut thread to the next section.
function scrollRanges(scene: Scene): void {
  const { gsap, ScrollTrigger } = scene.shared;
  const { root, stage, clock, phone } = scene;
  const run = phone ? PICK.phone : PICK.desk;
  const layerRun = phone ? LAYER_RUN.phone : LAYER_RUN.desk;
  const render = () => renderThread(scene);
  gsap.to(clock, {
    t: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: {
      trigger: root,
      start: run.start,
      endTrigger: stage,
      end: run.end,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  gsap.fromTo(
    scene.layer,
    { xPercent: LAYER.slide },
    {
      xPercent: 0,
      ease: 'power2.out',
      onUpdate() {
        scene.layerP = this.progress();
        render();
        paint(scene);
      },
      scrollTrigger: {
        trigger: one(root, '.turn-window'),
        start: layerRun.start,
        end: layerRun.end,
        scrub: 0.6,
      },
    },
  );
  gsap.to(clock, {
    exit: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: {
      trigger: stage,
      start: EXIT_RUN.start,
      endTrigger: root,
      end: EXIT_RUN.end,
      scrub: 0.6,
    },
  });
  ScrollTrigger.create({
    trigger: root,
    start: CHAT_RUN.start,
    end: CHAT_RUN.end,
    onUpdate: (self) => {
      scene.chat.scroll = self.progress;
      paint(scene);
    },
  });
}

// The three things it never asks: a form that closes, an app that never opens, a keyboard that stays.
function gestures(scene: Scene): void {
  const { gsap, ease } = scene.shared;
  const { root } = scene;
  const ask = (name: string, selector: string) =>
    one<SVGElement>(root, `[data-ask="${name}"] ${selector}`);
  const ring = ask('app', '.turn-app-ring');
  const app = ask('app', '.turn-app');
  gsap
    .timeline({
      defaults: { ease: ease.inOut },
      scrollTrigger: { trigger: one(root, '.turn-asks'), ...REVEAL.asks, scrub: 0.6 },
    })
    .to(ask('form', '.turn-form-fields'), { drawSVG: 0, duration: 0.2 }, ASKS.formFields)
    .to(
      ask('form', '.turn-form'),
      { scale: 0.8, opacity: 0.45, transformOrigin: '50% 50%', duration: 0.25 },
      ASKS.formShrink,
    )
    .from(ask('form', '.turn-strike'), { drawSVG: 0, duration: 0.2 }, ASKS.formStrike)
    .to(
      app,
      { scale: 1.14, transformOrigin: '50% 50%', duration: 0.1, ease: 'power2.out' },
      ASKS.appGrow,
    )
    .to(app, { scale: 1, duration: 0.12 }, ASKS.appShrink)
    .fromTo(
      ring,
      { autoAlpha: 1, drawSVG: '0% 0%' },
      { drawSVG: '0% 60%', duration: 0.16 },
      ASKS.ringDraw,
    )
    .to(ring, { drawSVG: '60% 60%', duration: 0.12 }, ASKS.ringAway)
    .to(ring, { autoAlpha: 0, duration: 0.04 }, ASKS.ringGone)
    .to(app, { opacity: 0.5, duration: 0.1 }, ASKS.appDim)
    .from(ask('app', '.turn-strike'), { drawSVG: 0, duration: 0.18 }, ASKS.appStrike)
    .to(
      all<SVGElement>(root, '[data-ask="keys"] .turn-keys rect'),
      {
        fillOpacity: 1,
        duration: 0.025,
        stagger: { each: 0.022, from: 'random', yoyo: true, repeat: 1 },
      },
      ASKS.keys,
    )
    .from(
      ask('keys', '.turn-keys-ok'),
      { scale: 0, transformOrigin: '50% 50%', duration: 0.1, ease: 'back.out(2)' },
      ASKS.keysOk,
    );
}

export const initTurn: SectionMotion['init'] = (root, shared: Shared) => {
  if (shared.conditions.reduce) {
    return undefined; // the still chat: the layer lying on it, two messages outlined
  }
  shared.gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, SplitText, ScrambleTextPlugin);
  root.dataset.motion = '';
  hideStubCopy(root, shared);
  const scene = buildTurn(root, shared);
  const stopChat = runChat(scene);
  measureAll(scene);
  const splits = revealAll(scene);
  scrollRanges(scene);
  gestures(scene);
  const onRefresh = () => {
    measureAll(scene);
    draw(scene);
  };
  shared.ScrollTrigger.addEventListener('refresh', onRefresh);
  draw(scene);
  return () => {
    stopChat();
    shared.ScrollTrigger.removeEventListener('refresh', onRefresh);
    shared.handoff.receive(root, false);
    splits.forEach((result) => result.revert());
    restoreDom(scene, root);
  };
};

// The solo stub has no section above it: the copy the page carries is hidden here.
function hideStubCopy(root: HTMLElement, shared: Shared): void {
  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }
}

// One frame of everything the page draws here: the thread and the order, then the chat.
function draw(scene: Scene): void {
  renderThread(scene);
  paint(scene);
}

// Puts the page back the way the static markup left it: the chat, the pause control, the order.
function restoreDom(scene: Scene, root: HTMLElement): void {
  scene.clones.forEach((item) => item.remove());
  scene.items.forEach((item) => {
    if (item.meaning) {
      item.meaning.textContent = item.text;
    }
  });
  scene.originals.forEach((item) =>
    item.classList.toggle('is-read', item.hasAttribute('data-turn-signal')),
  );
  scene.list.style.transform = '';
  scene.order.remove();
  scene.button.hidden = true;
  scene.button.setAttribute('aria-pressed', 'false');
  scene.button.textContent = 'Pause chat motion';
  delete root.dataset.motion;
}
