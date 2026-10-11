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

export interface Shared {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
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
  receives: { form: CarriedForm; thread: ThreadColor } | null;
  init: (root: HTMLElement, shared: Shared) => Cleanup | undefined;
}
