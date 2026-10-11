import { all, one, SVG_NS } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import { SEAM, stitch } from '../../motion/thread';
import { MATCH_STYLE } from './how.beats';
import { head, headingOf, scrambleFor, type Page } from './how.page';
import {
  ARRIVE_RUN,
  COLOUR,
  HALF,
  HOLD_SECONDS,
  STACK_ARRIVE,
  STACK_RAIL,
  STACK_ROUTE,
  STACK_RUN,
  STACKED,
} from './how.tuning';

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

function railOf(page: Page): { svg: SVGSVGElement; sage: SVGPathElement; green: SVGPathElement } {
  const svg = page.root.insertBefore(document.createElementNS(SVG_NS, 'svg'), page.root.firstChild);
  const line = (className: string) => {
    const node = svg.appendChild(document.createElementNS(SVG_NS, 'path'));

    node.setAttribute('class', className);
    node.setAttribute('pathLength', '1');
    node.style.strokeDasharray = '0 2';

    return node;
  };

  svg.setAttribute('class', 'how-rail');
  svg.setAttribute('aria-hidden', 'true');

  return { svg, sage: line(''), green: line('how-rail-green') };
}

function railThread(page: Page): () => void {
  const { root, shared } = page;
  const { gsap, ScrollTrigger } = shared;
  const { svg, sage, green } = railOf(page);
  const turn = { at: 0 };
  const measure = () => {
    const width = root.offsetWidth;
    const height = root.offsetHeight;
    const edge = width - STACK_RAIL.inset;
    const arrive = one(root, '[data-panel="arrive"]').getBoundingClientRect();

    turn.at = arrive.top - root.getBoundingClientRect().top;
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    sage.setAttribute(
      'd',
      `M${width / 2},0 ${stitch([width / 2, 0], [edge, STACK_RAIL.reach])} L${edge},${height}`,
    );
    green.setAttribute('d', `M${edge},${turn.at} L${edge},${height}`);
    Object.assign(svg.dataset, { handoffObject: '', exitX: edge, exitY: height, exitAngle: 0 });
  };

  const grow = (line: SVGPathElement, from: () => string) =>
    gsap.fromTo(
      line,
      { strokeDasharray: '0 2' },
      {
        strokeDasharray: '1 2',
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: from,
          end: 'bottom bottom',
          scrub: SEAM.scrub,
        },
      },
    );

  measure();
  grow(sage, () => `top ${SEAM.line}`);
  grow(green, () => `top+=${turn.at} ${SEAM.line}`);
  ScrollTrigger.addEventListener('refresh', measure);

  return () => {
    ScrollTrigger.removeEventListener('refresh', measure);
    svg.remove();
  };
}

export function stacked(page: Page): () => void {
  const { shared, root } = page;
  const { gsap, ScrollTrigger, ease } = shared;
  const play = (panel: string, run = STACK_RUN) =>
    gsap.timeline({
      defaults: { ease: ease.out, duration: 0.4 },
      scrollTrigger: { trigger: one(root, `[data-panel="${panel}"]`), ...run },
    });

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
  const stopRail = railThread(page);

  return () => {
    stopRail();
    page.takeOrder(false);
  };
}
