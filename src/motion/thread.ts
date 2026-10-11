import { SVG_NS } from './dom';
import { gsap, ScrollTrigger } from './gsap';

const POINTS = '[data-thread-in], [data-thread-via], [data-thread-out]';

export type ThreadColor = 'sage' | 'green';

export interface Thread {
  el: SVGSVGElement;
  path: SVGPathElement;
  measure: () => void;
  draw: (reduce: boolean) => gsap.core.Tween;
  setColor: (color: ThreadColor) => void;
  color: () => ThreadColor;
  destroy: () => void;
}

type Point = readonly [number, number];

function centreOf(element: Element, origin: DOMRect): Point {
  const box = element.getBoundingClientRect();

  return [box.left + box.width / 2 - origin.left, box.top + box.height / 2 - origin.top];
}

function route(points: readonly Point[]): string {
  return points
    .map(([left, top], index) => {
      if (index === 0) {
        return `M${left},${top}`;
      }

      const [fromLeft, fromTop] = points[index - 1];
      const middle = (fromTop + top) / 2;

      return `C${fromLeft},${middle} ${left},${middle} ${left},${top}`;
    })
    .join('');
}

export function createThread(page: HTMLElement): Thread {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const path = document.createElementNS(SVG_NS, 'path');

  svg.classList.add('thread-layer');
  svg.setAttribute('aria-hidden', 'true');
  svg.dataset.color = 'sage';
  path.classList.add('thread');
  path.setAttribute('pathLength', '1');
  svg.append(path);
  page.prepend(svg);

  const measure = () => {
    const origin = page.getBoundingClientRect();
    const anchors = [...page.querySelectorAll(POINTS)].filter(
      (anchor) => !anchor.closest('[hidden]'),
    );

    svg.setAttribute('viewBox', `0 0 ${page.clientWidth} ${page.scrollHeight}`);
    svg.style.height = `${page.scrollHeight}px`;
    path.setAttribute('d', route(anchors.map((anchor) => centreOf(anchor, origin))));
  };

  const draw = (reduce: boolean) => {
    measure();

    if (reduce) {
      return gsap.set(path, { strokeDashoffset: 0 });
    }

    const scrollTrigger = { start: 0, end: 'max', scrub: 0.6 };

    return gsap.fromTo(
      path,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, ease: 'none', scrollTrigger },
    );
  };

  ScrollTrigger.addEventListener('refresh', measure);

  return {
    el: svg,
    path,
    measure,
    draw,
    setColor: (color) => {
      svg.dataset.color = color;
    },
    color: () => (svg.dataset.color === 'green' ? 'green' : 'sage'),
    destroy: () => {
      ScrollTrigger.removeEventListener('refresh', measure);
      svg.remove();
    },
  };
}
