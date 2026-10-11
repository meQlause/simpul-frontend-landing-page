import type { gsap } from '../../motion/gsap';
import { HALF, FLOW, THREADS } from './hero.tuning';

export interface Lights {
  tangled: SVGPathElement[];
  straight: SVGPathElement[];
  arriving: SVGCircleElement[];
  leaving: SVGCircleElement[];
}

const along = (line: SVGPathElement, end: number) => ({
  motionPath: { path: line, align: line, alignOrigin: [HALF, HALF], start: 0, end },
});

function arrive(
  travel: gsap.core.Timeline,
  light: SVGCircleElement,
  line: SVGPathElement,
  when: number,
): void {
  travel
    .fromTo(light, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, when)
    .fromTo(light, along(line, 0), { ...along(line, 1), duration: 1.5, ease: 'power1.in' }, when)
    .to(light, { autoAlpha: 0, duration: 0.12 }, when + FLOW.reachedAt);
}

function depart(
  travel: gsap.core.Timeline,
  leaf: SVGCircleElement,
  line: SVGPathElement,
  when: number,
): void {
  travel
    .fromTo(
      leaf,
      { autoAlpha: 1, ...along(line, 0) },
      { ...along(line, 1), duration: 1, ease: 'power2.out' },
      when + FLOW.leaveAt,
    )
    .to(leaf, { autoAlpha: 0, duration: 0.15 }, when + FLOW.leaveFadeAt);
}

export function runLights(
  gsapInstance: typeof gsap,
  lights: Lights,
  period: number,
): gsap.core.Timeline {
  const travel = gsapInstance.timeline({ repeat: -1 });

  lights.arriving.forEach((light, index) => {
    const when = (index * period) / lights.tangled.length;

    arrive(travel, light, lights.tangled[index], when);

    if (index % 2 === 0) {
      const share = (index / 2) % THREADS.out;

      depart(travel, lights.leaving[share], lights.straight[share], when);
    }
  });
  travel.to({}, { duration: 0.1 }, period + FLOW.leaveFadeAt);

  return travel;
}
