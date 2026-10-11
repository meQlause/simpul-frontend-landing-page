import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { one } from '../../motion/dom';
import type { SectionMotion, Shared } from '../../motion/types';
import { mountPanel, type Panel } from './the-panel.scene';
import { stacked } from './the-panel.stacked';
import { SHOT_STEP, SHOT_TEXT_AT, SHOT_TITLE_AT } from './the-panel.tuning';
import { windowed } from './the-panel.window';

type Split = (target: Element, vars: Parameters<typeof SplitText.create>[1]) => SplitText;

const when = (trigger: Element, start: string) => ({
  trigger,
  start,
  toggleActions: 'play none none reverse',
});

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

function hideStubCopy(root: HTMLElement, shared: Shared): void {
  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }
}

function revealText(panel: Panel, split: Split, chapter: HTMLElement, chapterText: string): void {
  const { root, shared } = panel;
  const { gsap, ease } = shared;
  const words = wordsOf(split);

  gsap.from(split(one(root, '.panel .eyebrow'), { type: 'chars' }).chars, {
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
  gsap.from(words(one(root, '.panel-title')), {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.07,
    duration: 0.95,
    ease: 'power4.out',
    scrollTrigger: when(root, 'top 70%'),
  });
  gsap.from(words(one(root, '.panel-lead')), {
    yPercent: 100,
    stagger: 0.015,
    duration: 0.7,
    ease: ease.out,
    scrollTrigger: when(root, 'top 55%'),
  });
  gsap.from(one(root, '.panel-foot'), {
    autoAlpha: 0,
    x: -14,
    duration: 0.7,
    ease: ease.out,
    scrollTrigger: when(root, 'top 45%'),
  });
}

function revealShots(panel: Panel, words: (target: Element) => Element[]): void {
  const { root, shared, shots } = panel;

  shots.forEach((item, index) => {
    const step = index * SHOT_STEP;

    shared.gsap
      .timeline({
        defaults: { ease: shared.ease.out },
        scrollTrigger: shared.conditions.phone ? when(item, 'top 86%') : when(root, 'top 40%'),
      })
      .from(one(item, 'img'), { autoAlpha: 0, y: 26, duration: 0.8 }, 0)
      .from(one(item, 'h3 b'), { scale: 0, duration: 0.4, ease: 'back.out(2)' }, step)
      .from(one(item, 'h3'), { autoAlpha: 0, x: -12, duration: 0.5 }, SHOT_TITLE_AT + step)
      .from(
        words(one(item, 'p')),
        { yPercent: 110, stagger: 0.015, duration: 0.5 },
        SHOT_TEXT_AT + step,
      );
  });
}

export const initPanel: SectionMotion['init'] = (root, shared) => {
  if (shared.conditions.reduce) {
    return undefined;
  }

  shared.gsap.registerPlugin(MotionPathPlugin, SplitText, ScrambleTextPlugin);
  root.dataset.motion = '';
  hideStubCopy(root, shared);
  const chapter = one(root, '.panel-chapter');
  const chapterText = chapter.textContent ?? '';
  const splits: SplitText[] = [];
  const panel = mountPanel(root, shared);
  const split = splitterOf(splits);

  revealText(panel, split, chapter, chapterText);
  revealShots(panel, wordsOf(split));
  const stop = shared.conditions.phone ? stacked(panel) : windowed(panel);

  return () => {
    stop();
    shared.handoff.receive(root, false);
    splits.forEach((result) => result.revert());
    panel.card.remove();
    panel.svg.remove();
    chapter.textContent = chapterText;
    delete root.dataset.motion;
  };
};
