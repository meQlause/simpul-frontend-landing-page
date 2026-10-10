import { all, one } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import type { Journey } from './how.journey';
import { headingOf, head, off, decodeFields, type Page } from './how.page';
import {
  BEAT,
  BUZZ,
  COLOUR,
  END,
  FIELD_STEP,
  GREEN,
  HOLD_SECONDS,
  PALE,
  RULE_STEP,
  TAP,
  WORD_JITTER,
  WORD_TILT,
} from './how.tuning';

// The five stations of the desktop journey, each a block of the one master timeline. Each beat says what
// kind of thing it is: "Understand" is soft, "Decide" is human, "Route" is mechanical, "Hold" counts,
// "Arrive" buzzes.

// The match: the rule that fits the message lights, and only then.
export const MATCH_STYLE = {
  backgroundColor: COLOUR.matchFill,
  color: COLOUR.ink,
  fontWeight: 600,
  borderColor: COLOUR.green,
  duration: 0.2,
};

// The words of the message scatter, each on its own jitter, and settle back.
function wordScatter() {
  const jitter = (index: number) => WORD_JITTER[index % WORD_JITTER.length];
  return {
    x: (index: number) => jitter(index).x,
    y: (index: number) => jitter(index).y,
    rotation: (index: number) => (index % 2 ? WORD_TILT.odd : WORD_TILT.even),
    opacity: 0.45,
    stagger: 0.03,
    duration: 0.45,
  };
}

// 1. Understand: soft and probabilistic. Words drift apart, then re-form, field by field.
export function understandBeat(
  trip: Journey,
  page: Page,
  timeline: gsap.core.Timeline,
  words: Element[],
): void {
  const glow = one(page.root, '.how-field-glow');
  timeline
    .addLabel('message', 0)
    .to([page.steps.decide, page.steps.route], { color: PALE, duration: 0.3 }, BEAT.understandOn);
  head(
    timeline.to(
      page.steps.understand,
      { color: COLOUR.ink, '--on': 1, duration: 0.3 },
      BEAT.understandOn,
    ),
    headingOf(page, 'understand'),
    BEAT.understandHead,
  )
    .fromTo(
      glow,
      { autoAlpha: 0, scale: 0.8 },
      { autoAlpha: 1, scale: 1, duration: 0.7 },
      BEAT.glow,
    )
    .to(trip.traveller, { scale: 1.04, duration: 0.3 }, BEAT.traveller)
    .to(trip.halo, { opacity: 1, duration: 0.5 }, BEAT.halo)
    .to(words, wordScatter(), BEAT.words)
    .to(trip.message, { autoAlpha: 0, scale: 0.9, duration: 0.3 }, BEAT.messageOut)
    .to(trip.label, { autoAlpha: 1, scale: 1, duration: 0.3 }, BEAT.labelIn)
    .to(trip.traveller, { scale: 1, duration: 0.3 }, BEAT.labelIn);
  decodeFields(timeline, page, trip.labelFields, (index) => BEAT.fields + index * FIELD_STEP);
  timeline.addLabel('understand', BEAT.understandLabel);
}

// Each rule is checked in turn: it lights, then the ones that did not match settle back to grey.
function checkRules(page: Page, timeline: gsap.core.Timeline): void {
  all<HTMLElement>(page.root, '.how-rules li').forEach((rule, index) => {
    timeline.to(
      rule,
      { borderColor: COLOUR.ruleLit, duration: 0.1 },
      BEAT.rules + index * RULE_STEP,
    );
    if (rule !== page.match) {
      timeline.to(
        rule,
        { borderColor: COLOUR.ruleIdle, duration: 0.12 },
        BEAT.rulesDim + index * RULE_STEP,
      );
    }
  });
}

// 2. Decide: human and deliberate. The AI's light stays behind the gate; the rules are checked.
export function decideBeat(trip: Journey, page: Page, timeline: gsap.core.Timeline): void {
  const gate = one(page.root, '.how-gate svg');
  const hand = one(page.root, '.how-hand');
  off(timeline, page.steps.understand, BEAT.decideOn);
  head(
    timeline.to(page.steps.decide, { color: COLOUR.ink, '--on': 1, duration: 0.3 }, BEAT.decideOn),
    headingOf(page, 'decide'),
    BEAT.decideHead,
  )
    .to(trip.halo, { opacity: 0, scale: 0.6, duration: 0.2 }, BEAT.decideHalo)
    .fromTo(
      gate,
      { scale: 1 },
      { scale: 1.25, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' },
      BEAT.gate,
    );
  checkRules(page, timeline);
  timeline
    .to(page.match, MATCH_STYLE, BEAT.match)
    .fromTo(
      hand,
      { y: 0 },
      { y: 6, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' },
      BEAT.hand,
    )
    .to(
      trip.ruleRow,
      {
        height: 'auto',
        paddingTop: 5,
        paddingBottom: 5,
        borderTopWidth: 1,
        opacity: 1,
        duration: 0.35,
      },
      BEAT.ruleRow,
    )
    .addLabel('decide', BEAT.decideLabel);
}

// 3. Route: mechanical and exact. A role, who holds it today, then the backup.
export function routeBeat(trip: Journey, page: Page, timeline: gsap.core.Timeline): void {
  const back = one(page.root, '.how-role-back');
  const backup = one(page.root, '.how-backup');
  off(timeline, page.steps.decide, BEAT.routeOn);
  head(
    timeline.to(page.steps.route, { color: COLOUR.green, '--on': 1, duration: 0.3 }, BEAT.routeOn),
    headingOf(page, 'route'),
    BEAT.routeHead,
  )
    .to(
      one(page.root, '.how-role-front'),
      { rotationY: -180, duration: 0.45, ease: 'power2.inOut' },
      BEAT.flipFront,
    )
    .fromTo(
      back,
      { rotationY: 180 },
      { rotationY: 0, duration: 0.45, ease: 'power2.inOut' },
      BEAT.flipBack,
    )
    .to(back, { opacity: 0.55, duration: 0.25 }, BEAT.roleFade)
    .to(
      backup,
      {
        backgroundColor: COLOUR.backupFill,
        boxShadow: '0 16px 30px -22px #176448',
        duration: 0.25,
      },
      BEAT.backupLit,
    )
    .to(
      trip.toRow,
      {
        height: 'auto',
        paddingTop: 5,
        paddingBottom: 5,
        borderTopWidth: 1,
        opacity: 1,
        duration: 0.35,
      },
      BEAT.toRow,
    )
    .addLabel('route', BEAT.routeLabel);
}

// 4. Hold: sixty seconds, in case someone corrects it.
export function holdBeat(trip: Journey, page: Page, timeline: gsap.core.Timeline): void {
  const note = page.split(one(page.root, '.how-hold-note'), { type: 'words', mask: 'words' }).words;
  const count = one(trip.traveller, '.how-hold-count');
  const held = { s: 0 };
  timeline
    .from(note, { yPercent: 110, stagger: 0.03, duration: 0.3 }, BEAT.holdNote)
    .to(trip.ring, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, BEAT.ringIn)
    .to(
      one(trip.ring, '.how-hold-ring'),
      { strokeDashoffset: 0, duration: 0.8, ease: 'none' },
      BEAT.ringSweep,
    )
    .to(
      held,
      {
        s: HOLD_SECONDS,
        duration: 0.8,
        ease: 'none',
        onUpdate: () => {
          count.textContent = String(Math.round(held.s));
        },
      },
      BEAT.ringSweep,
    )
    .addLabel('hold', BEAT.holdLabel);
}

// 5. Arrive: the label becomes the notification; one tap and the whole thread turns green.
export function arriveBeat(trip: Journey, page: Page, timeline: gsap.core.Timeline): void {
  const { primary, tap, notice, steps } = page;
  timeline
    .to(trip.ring, { autoAlpha: 0, scale: 0.6, duration: 0.2 }, BEAT.arrivedOut)
    .to(trip.traveller, { scale: 0.86, duration: 0.5 }, BEAT.shrink)
    .to(trip.traveller, { opacity: 0, duration: 0.15 }, BEAT.fade)
    .to(notice, { autoAlpha: 1, y: 0, duration: 0.3 }, BEAT.notice)
    .to(one(page.root, '.how-phone'), { keyframes: BUZZ, duration: 0.32, ease: 'none' }, BEAT.buzz)
    .fromTo(
      tap,
      { scale: 0, opacity: 0.6 },
      { scale: 3, opacity: 0, duration: 0.35, ease: 'power2.out' },
      TAP,
    )
    .to(primary, { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1 }, TAP)
    .to(
      primary,
      { backgroundColor: COLOUR.ink, borderColor: COLOUR.ink, duration: 0.15 },
      TAP + BEAT.tapFill,
    )
    .to(notice, { borderColor: COLOUR.green, duration: 0.2 }, GREEN)
    .to([steps.understand, steps.decide], { color: COLOUR.ink, duration: 0.3 }, BEAT.primaryDim)
    .to(steps.route, { '--on': 0, duration: 0.3 }, BEAT.primaryDim)
    .addLabel('arrive', END);
}
