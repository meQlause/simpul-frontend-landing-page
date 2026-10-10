import { gsap, ScrollTrigger } from './gsap';

const SVG_NS = 'http://www.w3.org/2000/svg';
const POINTS = '[data-thread-in], [data-thread-via], [data-thread-out]';

export type ThreadColor = 'sage' | 'green';

export interface Thread {
  el: SVGSVGElement;
  path: SVGPathElement;
  measure: () => void;
  // Draws the thread as the page scrolls. Called inside gsap.matchMedia, so it is rebuilt with the page.
  draw: (reduce: boolean) => gsap.core.Tween;
  // The one shared state. Section 4 turns it green; nothing else changes it.
  setColor: (color: ThreadColor) => void;
  color: () => ThreadColor;
  destroy: () => void;
}

type Point = readonly [number, number];

function centreOf(element: Element, origin: DOMRect): Point {
  const box = element.getBoundingClientRect();
  return [box.left + box.width / 2 - origin.left, box.top + box.height / 2 - origin.top];
}

// One path through the points, each leg leaving and arriving vertically.
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

// One path through every thread point on the page, in document order. A section routes its own
// stretch by placing its in and out anchors and any number of via points between them.
export function createThread(page: HTMLElement): Thread {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const path = document.createElementNS(SVG_NS, 'path');
  svg.classList.add('thread-layer');
  svg.setAttribute('aria-hidden', 'true');
  svg.dataset.color = 'sage';
  path.classList.add('thread');
  path.setAttribute('pathLength', '1'); // lets the draw run from 1 to 0 whatever the real length
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
