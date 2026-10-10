import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registered once, here. A section's motion file registers any other plugin it needs (SplitText,
// DrawSVGPlugin, MotionPathPlugin, …) at the top of its own init.
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// The three conditions every section's init receives. GSAP reverts and rebuilds everything when
// one changes.
export const conditions = {
  desktop: '(min-width: 761px)',
  phone: '(max-width: 760px)',
  reduce: '(prefers-reduced-motion: reduce)',
};

// The page's motion voice: calm and exact. Physics (sections 2 and 6) is the only exception.
export const ease = { out: 'power3.out', long: 'expo.out', inOut: 'power2.inOut', linear: 'none' };
export const duration = { quick: 0.4, base: 0.8, slow: 1.4 };

// The one scroll: seconds the content takes to catch up with the scrollbar (pointer, touch).
export const scroll = { smooth: 1, touch: 0.1 };

gsap.defaults({ ease: ease.out, duration: duration.base });

export { gsap, ScrollSmoother, ScrollTrigger };
