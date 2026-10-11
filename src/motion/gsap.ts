import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export const conditions = {
  desktop: '(min-width: 761px)',
  phone: '(max-width: 760px)',
  reduce: '(prefers-reduced-motion: reduce)',
};

export const ease = { out: 'power3.out', long: 'expo.out', inOut: 'power2.inOut', linear: 'none' };

export const duration = { quick: 0.4, base: 0.8, slow: 1.4 };

export const scroll = { smooth: 1.2, touch: 0.1 };

gsap.defaults({ ease: ease.out, duration: duration.base });

export { gsap, ScrollSmoother, ScrollTrigger };
