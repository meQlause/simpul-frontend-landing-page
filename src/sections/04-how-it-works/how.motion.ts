import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { all, one } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import type { SectionMotion, Shared } from '../../motion/types';
import { arriveBeat, decideBeat, holdBeat, routeBeat, understandBeat } from './how.beats';
import { buildJourney, measureJourney, renderJourney, type Journey } from './how.journey';
import { revealText, type Page } from './how.page';
import { stacked } from './how.stacked';
import { END, ENTRY_RUN, PIN, SNAP } from './how.tuning';

function setStart(trip: Journey, page: Page, labelFields: HTMLElement[]): void {
  const { gsap } = page.shared;

  gsap.set(labelFields, { textContent: '' });
  gsap.set(trip.label, { autoAlpha: 0, scale: 0.94, yPercent: -50 });
  gsap.set([trip.ruleRow, trip.toRow], {
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 0,
    opacity: 0,
  });
  gsap.set(page.notice, { autoAlpha: 0, y: -14 });
  gsap.set(trip.ring, { autoAlpha: 0, scale: 0.6 });
  gsap.set(one(trip.ring, '.how-hold-ring'), {
    attr: { pathLength: 1 },
    strokeDasharray: 1,
    strokeDashoffset: 1,
  });
  one(trip.ring, '.how-hold-count').textContent = '0';
}

function beats(trip: Journey, page: Page, timeline: gsap.core.Timeline, words: Element[]): void {
  understandBeat(trip, page, timeline, words);
  decideBeat(trip, page, timeline);
  routeBeat(trip, page, timeline);
  holdBeat(trip, page, timeline);
  arriveBeat(trip, page, timeline);
}

function journey(page: Page): () => void {
  const { shared, root, match, notice } = page;
  const { ScrollTrigger } = shared;
  const trip = buildJourney(root, shared);
  const labelFields = trip.labelFields;
  const words = page.split(one(trip.message, 'p'), { type: 'words' }).words;

  measureJourney(trip, match, notice);
  setStart(trip, page, labelFields);
  const frame = () => renderJourney(trip, page.setGreen, page.takeOrder);

  scrollJourney(trip, page, frame, words);
  const onRefresh = () => {
    measureJourney(trip, match, notice);
    frame();
  };

  ScrollTrigger.addEventListener('refresh', onRefresh);
  frame();

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    page.takeOrder(false);
    trip.traveller.remove();
    trip.order.remove();
    trip.svg.remove();
  };
}

function scrollJourney(trip: Journey, page: Page, frame: () => void, words: Element[]): void {
  const { gsap, ease } = page.shared;
  const { root } = page;

  gsap.to(trip.clock, {
    entry: 1,
    ease: 'none',
    onUpdate: frame,
    scrollTrigger: { trigger: root, ...ENTRY_RUN, invalidateOnRefresh: true },
  });
  const timeline = gsap.timeline({
    defaults: { ease: ease.out, duration: 0.4 },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => `+=${innerHeight * PIN}`,
      pin: true,
      scrub: 0.7,
      invalidateOnRefresh: true,
      snap: SNAP,
    },
  });

  timeline.to(trip.clock, { t: END, duration: END, ease: 'none', onUpdate: frame }, 0);
  beats(trip, page, timeline, words);
}

function makeSplit(splits: SplitText[]): Page['split'] {
  return (target, vars) => {
    const result = SplitText.create(target, vars);

    splits.push(result);

    return result;
  };
}

function makePage(root: HTMLElement, shared: Shared, setGreen: (on: boolean) => void): Page {
  const splits: SplitText[] = [];
  const fields = all<HTMLElement>(root, '.how-panel .how-label dd');
  const chapter = one(root, '.how-chapter');
  const primary = one(root, '.how-btn--primary');
  const tap = primary.appendChild(document.createElement('span'));

  tap.className = 'how-tap';
  const page: Page = {
    root,
    shared,
    steps: Object.fromEntries(
      all(root, '.how-title > span').map((node) => [node.dataset.step ?? '', node]),
    ),
    match: one(root, '.how-rules .is-match'),
    notice: one(root, '.how-notice'),
    primary,
    tap,
    fields,
    fieldText: fields.map((field) => field.textContent ?? ''),
    chapter,
    chapterText: chapter.textContent ?? '',
    splits,
    split: makeSplit(splits),
    setGreen,
    received: null,
    takeOrder: (taken) => {
      if (taken !== page.received) {
        page.received = taken;
        shared.handoff.receive(root, taken);
      }
    },
  };

  return page;
}

export const initHow: SectionMotion['init'] = (root, shared) => {
  const { ScrollTrigger, thread } = shared;
  let isGreen: boolean | null = null;
  const setGreen = (lit: boolean) => {
    if (lit === isGreen) {
      return;
    }

    isGreen = lit;
    thread.setColor(lit ? 'green' : 'sage');
  };

  if (shared.conditions.reduce) {
    ScrollTrigger.create({
      trigger: root,
      start: 'bottom 60%',
      onEnter: () => setGreen(true),
      onLeaveBack: () => setGreen(false),
    });

    return undefined;
  }

  shared.gsap.registerPlugin(MotionPathPlugin, SplitText, ScrambleTextPlugin);
  root.dataset.motion = '';

  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }

  const page = makePage(root, shared, setGreen);

  page.match.classList.remove('is-match');
  revealText(page);
  const cleanup = shared.conditions.phone ? stacked(page) : journey(page);

  return () => {
    cleanup();
    page.splits.forEach((result) => result.revert());
    page.chapter.textContent = page.chapterText;
    page.fields.forEach((field, index) => {
      field.textContent = page.fieldText[index];
    });
    page.match.classList.add('is-match');
    page.tap.remove();
    root.style.removeProperty('--fit');
    delete root.dataset.motion;
  };
};
