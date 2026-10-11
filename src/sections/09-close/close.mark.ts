import { SVG_NS, all, one } from '../../motion/dom';
import { mark } from '../../motion/mark';
import type { Shared } from '../../motion/types';
import { type Press } from './close.form';
import { CENTRE, PULL } from './close.tuning';

export interface Mark {
  holder: HTMLElement;
  still: string;
  backdrop: SVGElement;
  links: SVGPathElement[];
  arms: SVGGElement[];
}

// The real mark, the same tracing the hero uses, with its two links free to move; the knot is tightened on press.
export function buildMark(root: HTMLElement, gsap: Shared['gsap'], press: Press): Mark {
  const holder = one<HTMLElement>(root, '.close-mark');
  const still = holder.innerHTML;
  holder.innerHTML = mark
    .replaceAll('simpul-colour', 'close-colour')
    .replaceAll('simpul-glow', 'close-glow');
  const backdrop = one<SVGElement>(holder, '[data-mark-backdrop]');
  const links = all<SVGPathElement>(holder, '[data-mark-link]');
  const pull = document.createElementNS(SVG_NS, 'g') as SVGGElement;
  links[0].before(pull);
  const arms = links.map((link) => {
    const arm = pull.appendChild(document.createElementNS(SVG_NS, 'g')) as SVGGElement;
    arm.append(link);
    link.setAttribute('pathLength', '1');
    Object.assign(link.style, {
      stroke: 'var(--green)',
      strokeWidth: '7px',
      strokeLinejoin: 'round',
    });
    return arm;
  });
  press.tighten = () => {
    gsap
      .timeline()
      .to(pull, {
        scale: PULL.press,
        svgOrigin: CENTRE,
        duration: PULL.pressFor,
        ease: 'power2.in',
      })
      .to(pull, {
        scale: PULL.rest,
        svgOrigin: CENTRE,
        duration: PULL.restFor,
        ease: 'elastic.out(1.2, 0.32)',
      }); // and it stays tight
  };
  return { holder, still, backdrop, links, arms };
}
