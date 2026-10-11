import type { SplitText } from 'gsap/SplitText';
import { one } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import type { Shared } from '../../motion/types';
import { PALE, REVEAL } from './how.tuning';

export interface Page {
  root: HTMLElement;
  shared: Shared;
  steps: Record<string, HTMLElement>;
  match: HTMLElement;
  notice: HTMLElement;
  primary: HTMLElement;
  tap: HTMLElement;
  fields: HTMLElement[];
  fieldText: string[];
  chapter: HTMLElement;
  chapterText: string;
  splits: SplitText[];
  split: (target: HTMLElement | HTMLElement[], vars: SplitVars) => SplitText;
  setGreen: (on: boolean) => void;
  received: boolean | null;
  takeOrder: (taken: boolean) => void;
}

type SplitVars = Parameters<typeof SplitText.create>[1];

const FIELD_SPEED = 0.7;
const HEAD_LAG = 0.05;
const REF_FIELD = 2;
const SCRAMBLE = { words: 'lowerCase', ref: '0123456789ORD-' } as const;

export const scrambleFor = (index: number): string =>
  index === REF_FIELD ? SCRAMBLE.ref : SCRAMBLE.words;

export function headingOf(page: Page, panel: string): { badge: HTMLElement; words: Element[] } {
  const node = one(page.root, `[data-panel="${panel}"]`);
  const nodes = [...node.querySelectorAll<HTMLElement>('.how-panel-head h3, .how-panel-head p')];

  return {
    badge: one(node, '.how-panel-head h3 b'),
    words: page.split(nodes, { type: 'words', mask: 'words' }).words,
  };
}

export function head(
  timeline: gsap.core.Timeline,
  heading: { badge: HTMLElement; words: Element[] },
  beat: number,
): gsap.core.Timeline {
  return timeline
    .from(heading.badge, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'back.out(2)' }, beat)
    .from(heading.words, { yPercent: 110, stagger: 0.012, duration: 0.4 }, beat + HEAD_LAG);
}

const when = (trigger: Element, start: string) => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

export function off(timeline: gsap.core.Timeline, station: HTMLElement, beat: number): void {
  timeline.to(station, { color: PALE, '--on': 0, duration: 0.3 }, beat);
}

export function decodeFields(
  timeline: gsap.core.Timeline,
  page: Page,
  fields: HTMLElement[],
  beatOf: (index: number) => number,
): void {
  fields.forEach((field, index) => {
    const chars = scrambleFor(index);

    timeline.to(
      field,
      {
        scrambleText: { text: page.fieldText[index], chars, speed: FIELD_SPEED },
        duration: 0.35,
        ease: 'none',
      },
      beatOf(index),
    );
  });
}

export function revealText(page: Page): void {
  const { gsap, ease } = page.shared;
  const { root, chapterText } = page;
  const eyebrow = page.split(one(root, '.how .eyebrow'), { type: 'chars' }).chars;

  gsap.from(eyebrow, {
    autoAlpha: 0,
    y: 6,
    stagger: 0.03,
    duration: 0.4,
    scrollTrigger: when(root, REVEAL.copy),
  });
  gsap.fromTo(
    page.chapter,
    { scrambleText: '' },
    {
      scrambleText: { text: chapterText, chars: 'upperCase', speed: 0.5 },
      duration: 1.4,
      scrollTrigger: when(root, REVEAL.copy),
    },
  );
  const title = page.split(one(root, '.how-title'), { type: 'words', mask: 'words' }).words;

  gsap.from(title, {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.07,
    duration: 0.95,
    ease: 'power4.out',
    scrollTrigger: when(root, REVEAL.title),
  });
  const principle = page.split(one(root, '.how-principle'), { type: 'words', mask: 'words' }).words;

  gsap.from(principle, {
    yPercent: 100,
    stagger: 0.015,
    duration: 0.7,
    ease: ease.out,
    scrollTrigger: when(root, REVEAL.principle),
  });
}
