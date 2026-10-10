import { one } from '../../motion/dom';
import type { gsap } from '../../motion/gsap';
import type { Shared } from '../../motion/types';
import type { Carousel, Slide } from './quiet-by-design.scene';
import { READS_MOVE, SLIDE } from './quiet-by-design.tuning';

// The desktop index: one commitment at a time holds the column beside the stage. Built from the real list,
// hidden from screen readers, which read the real one. Each commitment has its own drawing and its own loop.

type Part = (name: string) => Element[];
type Move = (part: Part, timeline: gsap.core.Timeline) => gsap.core.Timeline;

// Each drawing again, in parts, so it can move the way its commitment does.
const DRAWING: Record<string, string> = {
  waits:
    '<circle cx="12" cy="13.5" r="7.5"/><path d="M9.5 3h5M12 3v3"/><path data-part="hand" d="M12 13.5V8.6"/>',
  limit:
    '<path d="M3.5 20h17M3.5 7h17"/><path data-part="bar" d="M6.5 20v-5"/><path data-part="bar" d="M10 20v-8"/><path data-part="bar" d="M13.5 20v-6"/><path data-part="bar" d="M17 20V9.5"/>',
  sleeps:
    '<path data-part="moon" d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z"/><path data-part="star" d="M16.5 4.5v3M15 6h3"/>',
  asks: '<path d="M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5v-3.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><path data-part="mark" d="M10.2 9a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.8-.9 1.4M12 14.4v.1"/>',
  reads:
    '<path data-part="lid" d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle data-part="pupil" cx="12" cy="12" r="2.6"/><path d="M4 20 20 4"/>',
};

// What each does while it is the one being shown. Slow and small: the page does not shout.
const ORIGIN_CENTRE = '12 12';
const SINE_IN_OUT = 'sine.inOut';
const MOVES: Record<string, Move> = {
  waits: (part, timeline) =>
    timeline.to(part('hand'), {
      rotation: 360,
      svgOrigin: '12 13.5',
      duration: 6,
      ease: 'none',
      repeat: -1,
    }),
  limit: (part, timeline) =>
    timeline.fromTo(
      part('bar'),
      { scaleY: 0.25 },
      {
        scaleY: 1,
        svgOrigin: '0 20',
        duration: 0.7,
        stagger: 0.14,
        ease: 'power3.out',
        repeat: -1,
        repeatDelay: 1.6,
        yoyo: true,
      },
    ),
  sleeps: (part, timeline) =>
    timeline
      .fromTo(
        part('moon'),
        { rotation: -7 },
        {
          rotation: 7,
          svgOrigin: ORIGIN_CENTRE,
          duration: 3.2,
          ease: SINE_IN_OUT,
          repeat: -1,
          yoyo: true,
        },
        0,
      )
      .fromTo(
        part('star'),
        { scale: 0.5, opacity: 0.35 },
        {
          scale: 1.15,
          opacity: 1,
          svgOrigin: '16.5 6',
          duration: 1.3,
          ease: SINE_IN_OUT,
          repeat: -1,
          yoyo: true,
        },
        0,
      ),
  asks: (part, timeline) =>
    timeline.to(part('mark'), {
      keyframes: [
        { rotation: -14, duration: 0.25 },
        { rotation: 12, duration: 0.3 },
        { rotation: 0, duration: 0.35 },
      ],
      svgOrigin: '12 14.5',
      ease: SINE_IN_OUT,
      repeat: -1,
      repeatDelay: 1.8,
    }),
  reads: (part, timeline) =>
    timeline
      .to(
        part('pupil'),
        {
          keyframes: [
            { x: -2.4, duration: 0.7 },
            { x: 2.4, duration: 1 },
            { x: 0, duration: 0.6 },
          ],
          ease: SINE_IN_OUT,
          repeat: -1,
          repeatDelay: 1.2,
        },
        0,
      )
      .to(
        [...part('lid'), ...part('pupil')],
        {
          keyframes: [
            { scaleY: 0.12, duration: 0.11 },
            { scaleY: 1, duration: 0.16 },
          ],
          svgOrigin: ORIGIN_CENTRE,
          repeat: -1,
          repeatDelay: 3.3,
        },
        READS_MOVE.lidAt,
      ),
};

// The figure in each sentence, which the index marks.
const FIGURE: Record<string, string> = {
  waits: '60 seconds',
  limit: '6 per person per hour',
  sleeps: '21:00 to 07:00',
  asks: 'one short question',
  reads: 'Summaries only',
};

// One commitment's list item as the index draws it: the heading's first word in the page's soft tone,
// and the sentence's figure marked.
function itemHtml(rule: HTMLElement): string {
  const name = rule.dataset.rule ?? '';
  const title = (one(rule, 'h3').textContent ?? '').replace(
    /^It /,
    '<span class="soft">It</span> ',
  );
  const figure = FIGURE[name];
  const text = (one(rule, 'p').textContent ?? '').replace(figure, `<mark>${figure}</mark>`);
  return `<li data-rule="${name}"><span class="quiet-icon"><svg viewBox="0 0 24 24">${DRAWING[name]}</svg></span><h3>${title}</h3><p>${text}</p></li>`;
}

function slideOf(shared: Shared, item: HTMLElement, words: (target: Element) => Element[]): Slide {
  const strokes = [...item.querySelectorAll<SVGElement>('.quiet-icon svg *')];
  strokes.forEach((node) => node.setAttribute('pathLength', '1'));
  const part: Part = (name) => [...item.querySelectorAll(`[data-part="${name}"]`)];
  const loop = MOVES[item.dataset.rule ?? ''](part, shared.gsap.timeline({ paused: true }));
  return {
    li: item,
    tile: one(item, '.quiet-icon'),
    strokes,
    loop,
    title: words(one(item, 'h3')),
    text: words(one(item, 'p')),
    mark: one(item, 'mark'),
    tl: null,
  };
}

// Builds the index under the body and returns the carousel. On phones there is no index: an empty one.
export function buildIndex(
  shared: Shared,
  body: HTMLElement,
  rules: HTMLElement[],
  words: (target: Element) => Element[],
): Carousel {
  const index = body.appendChild(document.createElement('div'));
  index.className = 'quiet-index';
  index.setAttribute('aria-hidden', 'true');
  index.innerHTML = `<div class="quiet-index-view"><ol>${rules.map(itemHtml).join('')}</ol><div class="quiet-index-bars">${rules.map(() => '<i></i>').join('')}</div></div>`;
  const bars = [...index.querySelectorAll<HTMLElement>('.quiet-index-bars i')];
  const slides = [...index.querySelectorAll<HTMLElement>('li')].map((item) =>
    slideOf(shared, item, words),
  );
  return { index, slides, bars, opened: -1 };
}

// Out of the way: the outgoing one turns out, and the words rise away, the way the page is moving.
function outgoing(shared: Shared, last: Slide, way: number): void {
  last.tl?.kill();
  last.loop.pause();
  last.tl = shared.gsap
    .timeline({ defaults: { ease: 'power2.in', overwrite: true } })
    .to(
      [...last.title, ...last.text],
      { yPercent: -SLIDE.out * way, duration: 0.32, stagger: 0.006 },
      0,
    )
    .to(last.tile, { scale: 0.6, autoAlpha: 0, duration: 0.3 }, 0)
    .set(last.li, { visibility: 'hidden' });
}

// In: the tile turns in and its drawing is drawn, the heading rises word by word, the sentence follows,
// the figure is marked, and then it starts to move.
function incoming(shared: Shared, next: Slide, way: number, delay: number): void {
  const { gsap, ease } = shared;
  next.tl?.kill();
  next.tl = gsap
    .timeline({ delay, defaults: { overwrite: true } })
    .set(next.li, { visibility: 'visible' }, 0)
    .fromTo(
      next.tile,
      { scale: SLIDE.tileScale, rotation: -SLIDE.tilt * way, autoAlpha: 0 },
      { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.8)' },
      0,
    )
    .fromTo(
      next.strokes,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.8, stagger: 0.1, ease: 'power2.inOut' },
      SLIDE.strokeIn,
    )
    .fromTo(
      next.title,
      { yPercent: SLIDE.titleRise * way, rotation: SLIDE.tiltTitle * way },
      {
        yPercent: 0,
        rotation: 0,
        transformOrigin: '0 100%',
        duration: 0.9,
        stagger: 0.07,
        ease: 'power4.out',
      },
      SLIDE.titleIn,
    )
    .fromTo(
      next.text,
      { yPercent: SLIDE.textRise * way },
      { yPercent: 0, duration: 0.6, stagger: 0.014, ease: ease.out },
      SLIDE.textIn,
    )
    .fromTo(
      next.mark,
      { '--sweep': '0%' },
      { '--sweep': '100%', duration: 0.7, ease: 'power2.inOut' },
      SLIDE.markIn,
    )
    .call(() => next.loop.restart(), [], SLIDE.loopIn);
}

// Shows commitment `now`, and takes the one before it out, unless it is already the one shown.
export function openSlide(shared: Shared, carousel: Carousel, now: number): void {
  if (!carousel.slides.length || now === carousel.opened) {
    return;
  }
  const way = now > carousel.opened ? 1 : -1;
  const last = carousel.slides[carousel.opened];
  const next = carousel.slides[now];
  carousel.bars.forEach((bar, index) => {
    bar.classList.toggle('is-active', index === now);
    bar.classList.toggle('is-done', index < now);
  });
  carousel.opened = now;
  if (last) {
    outgoing(shared, last, way);
  }
  incoming(shared, next, way, last ? SLIDE.after : 0);
}

// The first commitment is there before its turn: never an empty index.
export function openFirst(shared: Shared, carousel: Carousel): void {
  openSlide(shared, carousel, 0);
  carousel.slides[0]?.tl?.progress(1);
}

// Takes the index back out of the page, and stops its loops.
export function disposeIndex(carousel: Carousel): void {
  carousel.slides.forEach((slide) => {
    slide.tl?.kill();
    slide.loop.kill();
  });
  carousel.index?.remove();
}
