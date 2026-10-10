import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { one } from '../../motion/dom';
import type { SectionMotion, Shared } from '../../motion/types';
import { mountPanel, type Panel } from './the-panel.scene';
import { stacked } from './the-panel.stacked';
import { SHOT_STEP, SHOT_TEXT_AT, SHOT_TITLE_AT } from './the-panel.tuning';
import { windowed } from './the-panel.window';

// The panel. Desktop: pinned, one window of the real panel scrubbed through the three screens. Phones: the
// three still captures, stacked with their captions, unpinned. With reduced motion: the still page.
// Everything is a function of the scroll clock, so it replays backwards.

type Split = (target: Element, vars: Parameters<typeof SplitText.create>[1]) => SplitText;

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

// The solo stub has no section above it: the copy the page carries is hidden here.
function hideStubCopy(root: HTMLElement, shared: Shared): void {
  if (root.contains(shared.carried.el)) {
    shared.gsap.set(shared.carried.el, { autoAlpha: 0 });
  }
}

// The eyebrow, the chapter, the title, the lead and the foot each arrive as the section comes into view.
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

// Each screen's caption: its icon, its heading and its sentence arrive one after the other.
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
    return undefined; // three still screenshots with captions
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
