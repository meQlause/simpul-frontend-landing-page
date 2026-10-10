import type { Carried, CarriedForm } from './carried';
import type { duration, ease, gsap, ScrollSmoother, ScrollTrigger } from './gsap';
import type { Handoff } from './handoff';
import type { Thread, ThreadColor } from './thread';

type Cleanup = () => void;

export interface Conditions {
  desktop: boolean;
  phone: boolean;
  reduce: boolean;
}

// Everything a section's init receives. A section animates nothing outside its own root.
export interface Shared {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  // The page's one scroll. null with reduced motion: then the page scrolls natively.
  smoother: ScrollSmoother | null;
  thread: Thread;
  carried: Carried;
  handoff: Handoff;
  ease: typeof ease;
  duration: typeof duration;
  conditions: Conditions;
}

export interface SectionMotion {
  id: string;
  // What the solo stub puts at the in-anchor when this section runs alone (?solo=04). null: nothing.
  receives: { form: CarriedForm; thread: ThreadColor } | null;
  // Builds the section's motion on its root and returns how to take it all down again.
  init: (root: HTMLElement, shared: Shared) => Cleanup | undefined;
}
