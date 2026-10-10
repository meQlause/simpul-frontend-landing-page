import { one } from '../../motion/dom';
import {
  addStrand,
  arrivalOf,
  boxIn,
  HIDDEN,
  type Panel,
  share,
  sizeSvg,
  VISIBLE,
} from './the-panel.scene';
import { CARD, PHONE_FADE, RAIL } from './the-panel.tuning';
import type { Point } from './the-panel.data';

// The thread down the phone's right edge: it bows out at the top, turns in under the heading, and comes back
// to the middle at the bottom.
function railPath(width: number, height: number): string {
  const edge = width - RAIL.inset;
  return `M${width / 2},0 C${width / 2},${RAIL.bow} ${edge},${RAIL.turn} ${edge},${RAIL.drop} L${edge},${height - RAIL.foot} C${edge},${height - RAIL.pull} ${width / 2},${height - RAIL.base} ${width / 2},${height}`;
}

// Phones: the card rides down to the first capture and becomes part of it; the thread keeps to a rail.
// Returns how to stop it.
export function stacked(panel: Panel): () => void {
  const { root, shared, card, svg, shots } = panel;
  const { gsap, ScrollTrigger, handoff, ease } = shared;
  const rail = addStrand(svg);
  const first = one<HTMLImageElement>(shots[0], 'img');
  const state = { p: 0 };
  const ends: { from: Point; to: Point } = { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
  const inOut = gsap.parseEase(ease.inOut);

  const measure = () => {
    const width = root.offsetWidth;
    const height = root.offsetHeight;
    const box = boxIn(root, first);
    ends.from = arrivalOf(panel);
    ends.to = { x: box.x + box.w / 2, y: box.y + box.h * CARD.share };
    sizeSvg(svg, width, height);
    rail.setAttribute('d', railPath(width, height));
  };
  const render = () => {
    const progress = inOut(state.p);
    const { from, to } = ends;
    gsap.set(card, {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      xPercent: -50,
      yPercent: -50,
      scale: CARD.start - CARD.shrink * progress,
      opacity: 1 - share(state.p, PHONE_FADE),
    });
    card.style.visibility = state.p > 0 && state.p < 1 ? VISIBLE : HIDDEN;
    handoff.receive(root, state.p > 0);
  };

  measure();
  gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: { trigger: root, start: 'top 96%', end: 'top 30%', scrub: 0.6 },
  });
  const onRefresh = () => {
    measure();
    render();
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);
  render();
  return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
}
