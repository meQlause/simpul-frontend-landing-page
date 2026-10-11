import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import type MatterModule from 'matter-js';
import { createCarried } from '../../motion/carried';
import { all, one, SVG_NS } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import { seeded } from '../../motion/random';
import type { SectionMotion, Shared } from '../../motion/types';
import {
  carry,
  settle,
  type Eases,
  type Geo,
  type Point,
  type Pose,
  type Track,
} from './problem.path';
import { simulate } from './problem.physics';
import {
  HALF,
  HANDOFF_AT,
  HAND,
  HOPS,
  INTRO,
  INTRO_AT,
  LABEL_TYPE_DELAY,
  LABELS,
  LAYOUT,
  LOST_TILES,
  PIN,
  QUESTIONS,
  SIM,
  TIME,
  WAREHOUSE,
} from './problem.tuning';

const FACES = import.meta.glob<string>('./people/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const DEGREES = 180;
const NEAR = '0px 0px 100% 0px';
const RESTING = { y: 0, borderColor: '#dae5d4', backgroundColor: '#ffffff', duration: 0.25 };
const LOST = {
  borderColor: '#ad3b2c',
  backgroundColor: '#fbecea',
  color: '#ad3b2c',
  duration: HAND.lostFade,
};

type Matter = typeof MatterModule;

let matter: Matter | null = null;

interface Live {
  geo: Geo;
  track: Track;
}

interface Scene {
  root: HTMLElement;
  shared: Shared;
  phone: boolean;
  alive: boolean;
  eases: Eases;
  clock: { t: number };
  faces: HTMLElement[];
  people: HTMLElement[];
  strongs: HTMLElement[];
  halves: HTMLElement[][];
  labels: HTMLElement[];
  close: HTMLElement;
  order: HTMLElement;
  svg: SVGSVGElement;
  thread: SVGPathElement;
  slackEnd: SVGPathElement;
  pile: HTMLElement;
  bubbles: HTMLElement[];
  tilts: number[];
  live: Live | null;
}

interface Splits {
  eyebrow: SplitText;
  headline: SplitText;
  names: SplitText;
  closing: SplitText;
  typed: SplitText[];
}

const put = (node: HTMLElement, left: number, top: number, angle: number) => {
  node.style.transform = `translate(${left}px, ${top}px) rotate(${angle}rad)`;
};

function orderOn(live: Live, seconds: number): Pose {
  return live.track(0, seconds) ?? [live.geo.gap[0], live.geo.gap[1], 0];
}

function orderAt(live: Live, eases: Eases, time: number): Pose {
  return time < TIME.fall
    ? carry(live.geo, eases, time)
    : orderOn(live, (time - TIME.fall) * SIM.rate);
}

const wobbleOf = (random: () => number, size: number): number => (random() - HALF) * size;

function bubbleCount(phone: boolean): number {
  if (phone) {
    return LAYOUT.bubbles.phone;
  }

  return window.innerWidth < LAYOUT.tabletBreak ? LAYOUT.bubbles.tablet : LAYOUT.bubbles.desk;
}

function buildPile(phone: boolean): { pile: HTMLElement; bubbles: HTMLElement[] } {
  const pile = document.createElement('div');

  pile.className = 'problem-pile';
  pile.setAttribute('aria-hidden', 'true');
  const bubbles = Array.from({ length: bubbleCount(phone) }, (_unused, index) => {
    const bubble = document.createElement('div');

    bubble.className = 'problem-bubble';
    bubble.textContent = QUESTIONS[index % QUESTIONS.length];

    return pile.appendChild(bubble);
  });

  return { pile, bubbles };
}

function buildThread(): { svg: SVGSVGElement; thread: SVGPathElement; slackEnd: SVGPathElement } {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const thread = document.createElementNS(SVG_NS, 'path');
  const slackEnd = document.createElementNS(SVG_NS, 'path');

  slackEnd.setAttribute('pathLength', '1');
  slackEnd.style.strokeDasharray = '1';
  svg.classList.add('problem-thread');
  svg.setAttribute('aria-hidden', 'true');
  svg.append(thread, slackEnd);

  return { svg, thread, slackEnd };
}

function buildOrder(): HTMLElement {
  const order = createCarried().el;

  order.classList.add('problem-order');
  order.dataset.handoffObject = '';

  return order;
}

function easesOf(gsapInstance: Shared['gsap']): Eases {
  return {
    inOut: gsapInstance.parseEase('power2.inOut'),
    bounce: gsapInstance.parseEase('bounce.out'),
    out: gsapInstance.parseEase('power2.out'),
  };
}

function buildScene(root: HTMLElement, shared: Shared, faces: HTMLElement[]): Scene {
  const order = buildOrder();
  const { svg, thread, slackEnd } = buildThread();
  const { pile, bubbles } = buildPile(shared.conditions.phone);
  const random = seeded(LAYOUT.tiltSeed);

  root.prepend(svg);
  root.append(pile, order);
  const people = all(root, '.chain-person');

  return {
    root,
    shared,
    phone: shared.conditions.phone,
    alive: true,
    eases: easesOf(shared.gsap),
    clock: { t: 0 },
    faces,
    people,
    strongs: people.map((person) => one(person, 'strong')),
    halves: all(root, '.chain-link').map((link) => all(link, 's')),
    labels: all(root, '.failures .card'),
    close: one(root, '.problem-close'),
    order,
    svg,
    thread,
    slackEnd,
    pile,
    bubbles,
    tilts: bubbles.map(() => wobbleOf(random, LAYOUT.tilt)),
    live: null,
  };
}

function measure(scene: Scene): void {
  const { root, faces, order, phone, eases } = scene;
  const box = root.getBoundingClientRect();
  const centre = (node: HTMLElement): Point => {
    const rect = node.getBoundingClientRect();

    return [rect.left - box.left + rect.width / 2, rect.top - box.top + rect.height / 2];
  };

  const tiles = faces.map(centre);
  const lift = faces[0].offsetHeight / 2 + order.offsetHeight / 2 + LAYOUT.dock;
  const stops = tiles.map(([left, top]): Point => [left, top - lift]);
  const geo: Geo = {
    width: box.width,
    height: box.height,
    entry: centre(one(root, '[data-thread-in]')),
    exit: centre(one(root, '[data-thread-out]')),
    stops,
    gap: [(tiles[WAREHOUSE - 1][0] + tiles[WAREHOUSE][0]) / 2, stops[WAREHOUSE - 1][1]],
    floor: box.height - (phone ? SIM.floorGap.phone : SIM.floorGap.desk),
    spawn: tiles[tiles.length - 1],
    order: [order.offsetWidth, order.offsetHeight],
    sizes: scene.bubbles.map((bubble): [number, number] => [
      bubble.offsetWidth,
      bubble.offsetHeight,
    ]),
  };
  const track = matter && !phone ? simulate(matter, geo, phone) : settle(geo, eases, phone);

  scene.live = { geo, track };
  const [exitX, exitY, exitAngle] = orderOn(scene.live, SIM.seconds);

  Object.assign(order.dataset, { exitX, exitY, exitAngle: (exitAngle * DEGREES) / Math.PI });
}

function drawBubbles(scene: Scene, live: Live, seconds: number): void {
  scene.bubbles.forEach((bubble, index) => {
    const pose = scene.clock.t < TIME.fall ? null : live.track(index + 1, seconds);

    bubble.style.visibility = pose ? 'visible' : 'hidden';

    if (pose) {
      put(bubble, pose[0], pose[1], pose[2] + scene.tilts[index]);
    }
  });
}

function drawTail(scene: Scene, live: Live): void {
  const tail = Array.from({ length: LAYOUT.tail }, (_unused, step) =>
    orderAt(live, scene.eases, Math.max(scene.clock.t - step * LAYOUT.tailStep, 0))
      .slice(0, 2)
      .join(','),
  );

  scene.thread.setAttribute('d', `M${tail.join(' L')}`);
}

function drawSlack(scene: Scene, live: Live, seconds: number, pose: Pose): void {
  const [exitLeft, exitTop] = live.geo.exit;
  const [orderLeft, orderTop] = pose;
  const edge = orderLeft + live.geo.order[0] / 2 - LAYOUT.edge;
  const curve = LAYOUT.slackCurve;

  scene.slackEnd.setAttribute(
    'd',
    `M${edge},${orderTop} C${edge + curve.reach},${orderTop + curve.sag} ${exitLeft + curve.pull},${exitTop} ${exitLeft},${exitTop}`,
  );
  const drawn = Math.min(Math.max((seconds - LAYOUT.slackDelay) / LAYOUT.slackLength, 0), 1);

  scene.slackEnd.style.strokeDashoffset = String(1 - drawn);
}

function render(scene: Scene): void {
  const { live } = scene;

  if (!live) {
    return;
  }

  const seconds = (scene.clock.t - TIME.fall) * SIM.rate;
  const pose = orderAt(live, scene.eases, scene.clock.t);

  put(scene.order, pose[0], pose[1], pose[2]);
  drawBubbles(scene, live, seconds);
  drawTail(scene, live);
  drawSlack(scene, live, seconds, pose);
  const redness = Math.min(Math.max((scene.clock.t - TIME.snap) / HAND.lostOver, 0), 1);

  scene.svg.style.setProperty('--lost', String(redness));
}

function refresh(scene: Scene): void {
  measure(scene);
  render(scene);
}

function splitText(scene: Scene): Splits {
  const { root, people, labels } = scene;

  return {
    eyebrow: SplitText.create(one(root, '.problem-head .eyebrow'), { type: 'chars' }),
    headline: SplitText.create(one(root, '.problem-head .headline'), {
      type: 'words',
      mask: 'words',
    }),
    names: SplitText.create(
      people.flatMap((person) => all(person, 'strong, strong + span')),
      {
        type: 'words',
        mask: 'words',
      },
    ),
    closing: SplitText.create(scene.close, { type: 'words', mask: 'words' }),
    typed: labels.map((label) => SplitText.create(label, { type: 'chars' })),
  };
}

function arriving(scene: Scene, splits: Splits): void {
  const { gsap, ease } = scene.shared;
  const { root, faces } = scene;

  gsap
    .timeline({ defaults: { ease: ease.out }, scrollTrigger: { trigger: root, ...INTRO } })
    .from(splits.eyebrow.chars, { autoAlpha: 0, y: 6, stagger: 0.02, duration: 0.25 }, 0)
    .from(
      splits.headline.words,
      { yPercent: 115, rotation: 5, transformOrigin: '0 100%', stagger: 0.04, duration: 0.45 },
      INTRO_AT.headline,
    )
    .from(
      faces,
      { autoAlpha: 0, scale: 0.6, stagger: 0.05, duration: 0.35, ease: 'back.out(1.7)' },
      INTRO_AT.faces,
    )
    .from(
      faces.flatMap((face) => all<SVGElement>(face, 'svg > *')),
      { drawSVG: 0, fillOpacity: 0, stagger: 0.008, duration: 0.4 },
      INTRO_AT.drawn,
    )
    .from(all(root, '.chain-link'), { scaleX: 0, stagger: 0.05, duration: 0.3 }, INTRO_AT.links)
    .from(splits.names.words, { yPercent: 110, stagger: 0.01, duration: 0.35 }, INTRO_AT.names);
}

function handOff(scene: Scene): void {
  const { order, root, shared } = scene;

  shared.ScrollTrigger.create({
    trigger: root,
    start: HANDOFF_AT,
    onToggle: (self) => {
      const taken = self.progress > 0 || self.isActive;

      order.style.visibility = taken ? 'visible' : 'hidden';
      shared.handoff.receive(root, taken);
    },
    onRefresh: (self) => {
      order.style.visibility = self.progress > 0 ? 'visible' : 'hidden';
      shared.handoff.receive(root, self.progress > 0);
    },
  });
}

function holdOf(phone: boolean) {
  return {
    y: phone ? HAND.rise.phone : HAND.rise.desk,
    borderColor: '#176448',
    backgroundColor: '#edf4e7',
    duration: HAND.tickFade,
  };
}

function hops(scene: Scene, timeline: gsap.core.Timeline): void {
  const { phone, faces, strongs, people, halves } = scene;
  const arrive = [1, HOPS[0].to, HOPS[1].to, HOPS[2].to];

  HOPS.forEach((hop, index) => {
    const span = (hop.to - hop.from) / 2;

    timeline
      .to(faces[index], holdOf(phone), arrive[index] - HAND.leadIn)
      .to(
        strongs[index],
        { color: '#176448', duration: HAND.tickFade },
        arrive[index] - HAND.leadIn,
      )
      .to(faces[index], RESTING, hop.from + HAND.settle)
      .to(strongs[index], { color: '#263c33', duration: HAND.tickFade }, hop.from + HAND.settle)
      .to(people[index], { '--done': 1 }, hop.from + HAND.settle)
      .to(halves[index][0], { '--fill': 1, duration: span, ease: 'none' }, hop.from);

    if (index < HOPS.length - 1) {
      timeline.to(
        halves[index][1],
        { '--fill': 1, duration: span, ease: 'none' },
        (hop.from + hop.to) / 2,
      );
    }
  });
}

function snap(scene: Scene, timeline: gsap.core.Timeline): void {
  const { faces, halves, phone } = scene;
  const warehouse = faces[WAREHOUSE];
  const broken = halves[HOPS.length - 1];
  const last = HOPS[HOPS.length - 1];

  timeline
    .to(warehouse, { ...holdOf(phone), borderColor: '#dae5d4' }, last.to - HAND.wardOff)
    .to(
      broken[0],
      { rotation: 38, autoAlpha: 0.45, duration: HAND.breakLink, ease: 'power2.in' },
      TIME.snap,
    )
    .to(
      broken[1],
      { rotation: -38, autoAlpha: 0.45, duration: HAND.breakLink, ease: 'power2.in' },
      TIME.snap + HAND.breakHalf,
    )
    .to(broken, { '--lost': 1, '--fill': 0, duration: 0.4 }, TIME.snap + HAND.breakRed)
    .to(warehouse, RESTING, TIME.snap + HAND.reset);
}

function lost(scene: Scene, timeline: gsap.core.Timeline): void {
  const { faces, strongs, people, halves } = scene;

  LOST_TILES.forEach(({ tile }, step) => {
    const when = TIME.snap + HAND.lostStart + step * HAND.lostStep;

    timeline
      .to(faces[tile], LOST, when)
      .to(strongs[tile], { color: '#ad3b2c', duration: 0.3 }, when)
      .to(
        people[tile],
        { '--lost': 1, duration: HAND.lostFade, ease: 'back.out(2.5)' },
        when + HAND.lostDelay,
      );

    if (halves[tile]) {
      timeline.to(halves[tile], { '--lost': 1, duration: 0.3 }, when + HAND.lostDelay);
    }
  });
}

function failures(scene: Scene, splits: Splits, timeline: gsap.core.Timeline): void {
  const { labels } = scene;

  LABELS.forEach((label, index) => {
    timeline
      .to(labels[index], { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, label.at)
      .from(
        splits.typed[index].chars,
        { autoAlpha: 0, stagger: 0.018, duration: 0.01, ease: 'none' },
        label.at + LABEL_TYPE_DELAY,
      );
  });
  timeline.from(splits.closing.words, { yPercent: 115, stagger: 0.06, duration: 0.5 }, TIME.close);
}

function pinned(scene: Scene, splits: Splits): void {
  const { gsap, ease } = scene.shared;
  const timeline = gsap.timeline({
    defaults: { ease: ease.out, duration: 0.3 },
    scrollTrigger: {
      trigger: scene.root,
      start: 'top top',
      end: () => `+=${innerHeight * (scene.phone ? PIN.phone : PIN.desk)}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  timeline.to(
    scene.clock,
    { t: TIME.end, duration: TIME.end, ease: 'none', onUpdate: () => render(scene) },
    0,
  );
  hops(scene, timeline);
  snap(scene, timeline);
  lost(scene, timeline);
  failures(scene, splits, timeline);
}

function arriveNear(scene: Scene): IntersectionObserver {
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        return;
      }

      near.disconnect();
      void import('matter-js').then((module) => {
        matter = module.default;

        if (scene.alive) {
          refresh(scene);
        }
      });
    },
    { rootMargin: NEAR },
  );

  return near;
}

function listen(scene: Scene): () => void {
  const onRefresh = () => refresh(scene);

  scene.shared.ScrollTrigger.addEventListener('refresh', onRefresh);
  const near = arriveNear(scene);

  if (!scene.phone && !matter) {
    near.observe(scene.root);
  } else if (!scene.phone) {
    refresh(scene);
  }

  return () => {
    scene.alive = false;
    near.disconnect();
    scene.shared.ScrollTrigger.removeEventListener('refresh', onRefresh);
  };
}

function drawFaces(faces: HTMLElement[]): void {
  faces.forEach((face) => {
    face.innerHTML = FACES[`./people/${face.dataset.face}.svg`];
  });
}

function scrollSetup(scene: Scene, splits: Splits): void {
  arriving(scene, splits);
  handOff(scene);
  scene.shared.gsap.set(scene.labels, {
    autoAlpha: 0,
    y: 24,
    xPercent: -50,
    rotation: (index: number) => LABELS[index].tilt,
  });
  pinned(scene, splits);
}

export const initProblem: SectionMotion['init'] = (root, shared) => {
  shared.gsap.registerPlugin(DrawSVGPlugin, SplitText);
  const faces = all(root, '.chain-face');

  drawFaces(faces);

  if (shared.conditions.reduce) {
    return undefined;
  }

  root.dataset.motion = '';

  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }

  const scene = buildScene(root, shared, faces);

  refresh(scene);
  const splits = splitText(scene);

  scrollSetup(scene, splits);
  render(scene);
  const stop = listen(scene);

  return () => {
    stop();
    scene.svg.remove();
    scene.pile.remove();
    scene.order.remove();
    [splits.eyebrow, splits.headline, splits.names, splits.closing, ...splits.typed].forEach(
      (split) => split.revert(),
    );
    delete root.dataset.motion;
  };
};
