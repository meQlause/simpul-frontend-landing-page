import { one } from '../../motion/dom';
import { stitch } from '../../motion/thread';
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

function placeRail(rail: SVGPathElement, width: number, height: number): void {
  const edge = width - RAIL.inset;
  const mid = width / 2;

  rail.setAttribute('d', `M${mid},0 ${stitch([mid, 0], [edge, RAIL.reach])} L${edge},${height}`);
  Object.assign(rail.dataset, { handoffObject: '', exitX: edge, exitY: height, exitAngle: 0 });
}

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
    placeRail(rail, width, height);
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
