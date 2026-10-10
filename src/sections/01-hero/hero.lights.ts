import type { gsap } from '../../motion/gsap';
import { HALF, FLOW, THREADS } from './hero.tuning';

// The lights of the hero, on a loop: one light in along each tangled thread, and every second one
// sends a dot out along a straight thread. The loop is built once per layout.
export interface Lights {
  tangled: SVGPathElement[];
  straight: SVGPathElement[];
  arriving: SVGCircleElement[];
  leaving: SVGCircleElement[];
}

// A tween that rides a path from `end` 0 to 1, and the motion path's origin is the path's middle.
const along = (line: SVGPathElement, end: number) => ({
  motionPath: { path: line, align: line, alignOrigin: [HALF, HALF], start: 0, end },
});

// One light: in along its tangled thread, then gone as it reaches the knot.
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

// One strand: a dot leaves the knot along its straight thread.
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

// Builds the loop. `period` is the length of one full loop, which the caller picks by breakpoint.
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
  travel.to({}, { duration: 0.1 }, period + FLOW.leaveFadeAt); // the loop is long enough for the last one out
  return travel;
}
