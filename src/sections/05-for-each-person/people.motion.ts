import { Draggable } from 'gsap/Draggable';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { all, one } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import type { SectionMotion, Shared } from '../../motion/types';
import { buildCard, isStraight, renderCard, sizeCard, type Card } from './people.card';
import { SEAM } from '../../motion/thread';
import {
  buildThreads,
  drawStroke,
  measureCards,
  measureThreads,
  renderEntry,
  renderJoin,
  type Curves,
  type Threads,
} from './people.strands';
import { AUTO, CHAPTER, ENTRY, HOVER, JOIN, PULL, SCROLL, SPRING } from './people.tuning';

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

type Split = (target: Element, vars: Parameters<typeof SplitText.create>[1]) => SplitText;

interface Scene {
  root: HTMLElement;
  shared: Shared;
  phone: boolean;
  cards: Card[];
  threads: Threads;
  curves: Curves;
  entry: { progress: number };
  seam: { progress: number };
  together: { progress: number };
  join: gsap.core.Tween | null;
  joined: boolean;
}

function revealText(root: HTMLElement, shared: Shared, split: Split): void {
  const { gsap } = shared;
  const chapter = one(root, '.people-chapter');
  const chapterText = chapter.textContent ?? '';
  const when = (start: string) => ({
    trigger: root,
    start,
    toggleActions: 'play none none reverse',
  });

  gsap.from(split(one(root, '.people .eyebrow'), { type: 'chars' }).chars, {
    autoAlpha: 0,
    y: 6,
    stagger: 0.03,
    duration: 0.4,
    scrollTrigger: when(CHAPTER.copy),
  });
  gsap.fromTo(
    chapter,
    { scrambleText: '' },
    {
      scrambleText: { text: chapterText, chars: 'upperCase', speed: 0.5 },
      duration: 1.4,
      scrollTrigger: when(CHAPTER.copy),
    },
  );
  const title = split(one(root, '.people-title'), { type: 'words', mask: 'words' }).words;

  gsap.from(title, {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.07,
    duration: 0.95,
    ease: 'power4.out',
    scrollTrigger: when(CHAPTER.title),
  });
  const hint = split(one(root, '.people-hint'), { type: 'words', mask: 'words' }).words;

  gsap.from(hint, {
    yPercent: 110,
    stagger: 0.04,
    duration: 0.6,
    scrollTrigger: when(CHAPTER.hint),
  });
}

function renderOne(scene: Scene, card: Card): void {
  renderCard(card);
  syncJoin(scene);
}

function syncJoin(scene: Scene): void {
  const straight = scene.cards.every(isStraight);

  if (straight === scene.joined) {
    return;
  }

  scene.joined = straight;

  if (straight) {
    scene.join?.play();
  } else {
    scene.join?.reverse();
  }
}

function renderEntryFrame(scene: Scene, progress: number): void {
  renderEntry(scene.threads, progress, scene.curves);

  if (scene.phone) {
    return;
  }

  for (const card of scene.cards) {
    card.state.arrival = clamp(
      (progress - ENTRY.cardFrom - card.index * ENTRY.cardStep) / ENTRY.cardSpan,
    );
    renderOne(scene, card);
  }
}

function renderJoinFrame(scene: Scene): void {
  renderJoin(scene.threads, scene.together.progress, scene.curves);
}

function paint(scene: Scene): void {
  const entry = scene.shared.handoff.incoming(scene.root)?.x;

  scene.cards.forEach(sizeCard);
  measureCards(scene.root, scene.cards);
  measureThreads(scene.threads, scene.cards, { root: scene.root, phone: scene.phone, entry });
  renderEntryFrame(scene, scene.entry.progress);
  scene.cards.forEach((card) => renderCard(card));
  syncJoin(scene);
  renderJoinFrame(scene);
  drawStroke(scene.threads.trunk, scene.seam.progress);
}

function reachSeam(scene: Scene): void {
  const { root, threads } = scene;

  scene.shared.gsap.to(scene.seam, {
    progress: 1,
    ease: 'none',
    onUpdate: () => drawStroke(threads.trunk, scene.seam.progress),
    scrollTrigger: {
      trigger: root,
      start: () => `top+=${threads.trunkTop} ${SEAM.line}`,
      end: `bottom ${SEAM.line}`,
      scrub: SEAM.scrub,
      invalidateOnRefresh: true,
    },
  });
}

function autoUntie(scene: Scene, card: Card, lit: boolean): void {
  scene.shared.gsap.to(card.state, {
    auto: lit ? 1 : 0,
    duration: lit ? AUTO.inDuration : AUTO.outDuration,
    ease: AUTO.ease,
    overwrite: 'auto',
    onUpdate: () => renderOne(scene, card),
  });
}

function wantUntied(scene: Scene, card: Card): void {
  const lit = Boolean(card.state.focused || card.state.pointing);

  if (lit === card.state.wanted) {
    return;
  }

  card.state.wanted = lit;
  scene.shared.gsap.to(card.state, {
    hover: lit ? 1 : 0,
    duration: lit ? HOVER.inDuration : HOVER.outDuration,
    ease: HOVER.ease,
    overwrite: 'auto',
    onUpdate: () => renderOne(scene, card),
  });
}

function watchScroll(scene: Scene): void {
  const { gsap, ScrollTrigger } = scene.shared;
  const { root, phone, cards } = scene;

  gsap.to(scene.entry, {
    progress: 1,
    ease: 'none',
    onUpdate: () => renderEntryFrame(scene, scene.entry.progress),
    scrollTrigger: {
      trigger: root,
      start: SCROLL.entryStart,
      end: phone ? SCROLL.entryEnd.phone : SCROLL.entryEnd.desk,
      scrub: SCROLL.scrub,
    },
  });

  if (phone) {
    for (const card of cards) {
      gsap.to(card.state, {
        arrival: 1,
        ease: 'none',
        onUpdate: () => renderOne(scene, card),
        scrollTrigger: {
          trigger: card.el,
          start: SCROLL.cardStart,
          end: SCROLL.cardEnd,
          scrub: SCROLL.cardScrub,
        },
      });
    }
  }

  const list = one(root, '.people-cards');

  for (const card of cards) {
    ScrollTrigger.create({
      trigger: phone ? card.el : list,
      start: phone ? AUTO.startPhone : `center ${AUTO.startDesk - card.index * AUTO.startStep}%`,
      onEnter: () => autoUntie(scene, card, true),
      onLeaveBack: () => autoUntie(scene, card, false),
    });
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    onLeaveBack: () =>
      cards.forEach((card) => {
        card.state.pulled = false;
        card.state.pull = 0;
        renderOne(scene, card);
      }),
  });
}

function watchPointer(scene: Scene, signal: AbortSignal): void {
  for (const card of scene.cards) {
    const { state } = card;

    card.el.addEventListener(
      'focus',
      () => {
        state.focused = card.el.matches(':focus-visible');
        wantUntied(scene, card);
      },
      { signal },
    );
    card.el.addEventListener(
      'blur',
      () => {
        state.focused = false;
        wantUntied(scene, card);
      },
      { signal },
    );
    card.el.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType !== 'mouse' || state.dragging) {
          return;
        }

        state.pointing = !card.box.contains(event.target as Node);
        wantUntied(scene, card);
      },
      { signal },
    );
    card.el.addEventListener(
      'pointerleave',
      () => {
        state.pointing = false;
        wantUntied(scene, card);
      },
      { signal },
    );
  }
}

function dragCard(scene: Scene, card: Card): Draggable {
  const { gsap } = scene.shared;
  const { state } = card;

  return Draggable.create(document.createElement('div'), {
    trigger: card.box,
    type: scene.phone ? 'x' : 'x,y',
    onPress(event: Event) {
      gsap.killTweensOf(state, 'dx,dy,pull');
      gsap.set(this.target, { x: 0, y: 0 });
      this.update();
      const { clientY } = (event as TouchEvent).changedTouches?.[0] ?? (event as MouseEvent);

      state.at = clamp((clientY - card.box.getBoundingClientRect().top) / state.height);
      state.dragging = true;
      state.pointing = false;
      wantUntied(scene, card);
    },
    onDrag() {
      const far = Math.hypot(this.x, this.y);
      const give = 1 / (1 + far / PULL.far);

      state.dx = this.x * give;
      state.dy = this.y * give;
      state.pull = clamp((far - PULL.start) / PULL.span);
      renderOne(scene, card);
    },
    onRelease() {
      state.dragging = false;
      const straight = state.pull > PULL.straightAbove;

      gsap.to(state, {
        pull: straight ? 1 : 0,
        duration: straight ? PULL.straightDuration : PULL.slackDuration,
        ease: straight ? 'power2.out' : 'power3.inOut',
        onUpdate: () => renderOne(scene, card),
        onComplete: () => {
          state.pulled ||= straight;
        },
      });
      gsap.to(state, {
        dx: 0,
        dy: 0,
        duration: PULL.springDuration,
        ease: SPRING,
        onUpdate: () => renderOne(scene, card),
      });
    },
  })[0];
}

function buildScene(
  root: HTMLElement,
  shared: Shared,
  words: (target: Element) => Element[],
): Scene {
  const phone = shared.conditions.phone;
  const cards = all(root, '.person').map((element, index) =>
    buildCard(element, index, shared, words),
  );
  const scene: Scene = {
    root,
    shared,
    phone,
    cards,
    threads: buildThreads(root, phone),
    curves: {
      inOut: shared.gsap.parseEase('power2.inOut'),
      back: shared.gsap.parseEase('back.out(3)'),
    },
    entry: { progress: 0 },
    seam: { progress: 0 },
    together: { progress: 0 },
    join: null,
    joined: false,
  };

  scene.join = shared.gsap.to(scene.together, {
    progress: 1,
    duration: JOIN.duration,
    ease: 'none',
    paused: true,
    onUpdate: () => renderJoinFrame(scene),
  });
  shared.gsap.set(
    cards.map((card) => card.el),
    { transformOrigin: '50% 0' },
  );

  return scene;
}

function hideStubCopy(root: HTMLElement, shared: Shared): void {
  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }
}

function mountScene(root: HTMLElement, shared: Shared, splits: SplitText[]): Scene {
  const split: Split = (target, vars) => {
    const result = SplitText.create(target, vars);

    splits.push(result);

    return result;
  };

  revealText(root, shared, split);

  return buildScene(
    root,
    shared,
    (target) => split(target, { type: 'words', mask: 'words' }).words,
  );
}

function wire(scene: Scene, signal: AbortSignal): Draggable[] {
  watchScroll(scene);
  reachSeam(scene);
  watchPointer(scene, signal);

  return scene.cards.map((card) => dragCard(scene, card));
}

export const initPeople: SectionMotion['init'] = (root, shared) => {
  if (shared.conditions.reduce) {
    return undefined;
  }

  shared.gsap.registerPlugin(Draggable, SplitText, ScrambleTextPlugin);
  root.dataset.motion = '';
  hideStubCopy(root, shared);
  const splits: SplitText[] = [];
  const chapter = one(root, '.people-chapter');
  const chapterText = chapter.textContent ?? '';
  const scene = mountScene(root, shared, splits);
  const listen = new AbortController();
  const drags = wire(scene, listen.signal);
  const refresh = () => paint(scene);

  shared.ScrollTrigger.addEventListener('refresh', refresh);
  paint(scene);

  return () => {
    shared.ScrollTrigger.removeEventListener('refresh', refresh);
    listen.abort();
    drags.forEach((drag) => drag.kill());
    splits.forEach((result) => result.revert());
    scene.cards.forEach((card) => {
      card.tangle.remove();
      card.mouth.setAttribute('d', card.smile);
    });
    scene.threads.svg.remove();
    chapter.textContent = chapterText;
    delete root.dataset.motion;
  };
};
