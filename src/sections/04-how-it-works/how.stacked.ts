import { all, one } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import { MATCH_STYLE } from './how.beats';
import { head, headingOf, scrambleFor, type Page } from './how.page';
import {
  ARRIVE_RUN,
  COLOUR,
  HALF,
  HOLD_SECONDS,
  STACK_ARRIVE,
  STACK_ROUTE,
  STACK_RUN,
  STACKED,
} from './how.tuning';

// Phones: no pin and no camera. Each station plays as it scrolls through the screen, top to bottom.

// The phone's hold and arrival, played as the screen goes by.
function stackedArrive(page: Page, timeline: gsap.core.Timeline): void {
  const { gsap } = page.shared;
  const { root, primary, tap, notice } = page;
  const count = one(root, '.how-hold-count');
  const held = { s: 0 };
  const ring = one(root, '.how-hold-ring');
  const note = page.split(one(root, '.how-hold-note'), { type: 'words', mask: 'words' }).words;
  gsap.set(ring, { attr: { pathLength: 1 }, strokeDasharray: 1, strokeDashoffset: 1 });
  count.textContent = '0';
  timeline
    .to(ring, { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 0)
    .to(
      held,
      {
        s: HOLD_SECONDS,
        duration: 0.6,
        ease: 'none',
        onUpdate: () => {
          count.textContent = String(Math.round(held.s));
        },
      },
      0,
    )
    .from(note, { yPercent: 110, stagger: 0.03, duration: 0.3 }, STACK_ARRIVE.note)
    .from(notice, { autoAlpha: 0, y: -16 }, STACK_ARRIVE.notice)
    .fromTo(
      tap,
      { scale: 0, opacity: 0.6 },
      { scale: 3, opacity: 0, duration: 0.3, ease: 'power2.out' },
      STACK_ARRIVE.tap,
    )
    .to(
      primary,
      { backgroundColor: COLOUR.ink, borderColor: COLOUR.ink, duration: 0.15 },
      STACK_ARRIVE.primary,
    )
    .to(
      {},
      {
        duration: 0.1,
        onUpdate() {
          page.setGreen(this.progress() > HALF);
        },
        onReverseComplete: () => page.setGreen(false),
      },
      STACK_ARRIVE.green,
    );
}

// Each rule lights in turn, and the one that matches stays lit.
function stackedRules(page: Page, decide: gsap.core.Timeline): void {
  all<HTMLElement>(page.root, '.how-rules li').forEach((rule, index) => {
    decide.to(
      rule,
      { borderColor: COLOUR.ruleLit, duration: 0.1 },
      STACKED.rules + index * STACKED.rulesStep,
    );
    if (rule !== page.match) {
      decide.to(
        rule,
        { borderColor: COLOUR.ruleIdle, duration: 0.12 },
        STACKED.rulesDim + index * STACKED.rulesStep,
      );
    }
  });
  decide.to(page.match, MATCH_STYLE, STACKED.match);
}

// The label's fields decode one after another as the understand station plays.
function stackedFields(page: Page, understand: gsap.core.Timeline): void {
  page.fields.forEach((field, index) => {
    const chars = scrambleFor(index);
    understand.to(
      field,
      {
        scrambleText: { text: page.fieldText[index], chars, speed: 0.7 },
        duration: 0.4,
        ease: 'none',
      },
      STACKED.fields + index * STACKED.fieldStep,
    );
  });
}

// Phones: each station plays on its own scroll range.
export function stacked(page: Page): () => void {
  const { shared, root } = page;
  const { gsap, ScrollTrigger, ease } = shared;
  const play = (panel: string, run = STACK_RUN) =>
    gsap.timeline({
      defaults: { ease: ease.out, duration: 0.4 },
      scrollTrigger: { trigger: one(root, `[data-panel="${panel}"]`), ...run },
    });
  // Section 3's order is taken in here: this chat is where it becomes the message.
  ScrollTrigger.create({
    trigger: one(root, '[data-panel="message"]'),
    start: 'top 75%',
    onToggle: (self) => page.takeOrder(self.progress > 0 || self.isActive),
  });
  play('message').from(one(root, '.how-msg'), { autoAlpha: 0, x: -30, duration: 0.6 });
  page.fields.forEach((field) => {
    field.textContent = '';
  });
  const understand = head(play('understand'), headingOf(page, 'understand'), 0).from(
    one(root, '.how-panel .how-label'),
    { autoAlpha: 0, y: 20 },
    STACKED.label,
  );
  stackedFields(page, understand);
  stackedRules(page, head(play('decide'), headingOf(page, 'decide'), 0));
  head(play('route'), headingOf(page, 'route'), 0)
    .from(one(root, '.how-role-front'), { autoAlpha: 0, y: 16 }, STACK_ROUTE.front)
    .from(one(root, '.how-role-back'), { autoAlpha: 0, y: 16 }, STACK_ROUTE.back)
    .to(one(root, '.how-role-back'), { opacity: 0.55, duration: 0.25 }, STACK_ROUTE.dim)
    .from(one(root, '.how-backup'), { autoAlpha: 0, x: 24 }, STACK_ROUTE.backup);
  stackedArrive(page, play('arrive', ARRIVE_RUN));
  return () => page.takeOrder(false);
}
