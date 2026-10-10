import type { SectionMotion } from '../motion/types';
import { initHero } from './01-hero/hero.motion';

// Not ported yet: the section has no motion. A port phase replaces it with the section's own,
// e.g. { id: '08-your-data', receives: { form: 'card', thread: 'green' }, init: initYourData }.
const still = (): undefined => undefined;

// Every section's motion, in page order. The ids and `receives` are the hand-off contract from
// ../landing/README.md and must not change.
export const MOTIONS: readonly SectionMotion[] = [
  { id: '01-hero', receives: null, init: initHero },
  { id: '02-problem', receives: { form: 'order', thread: 'sage' }, init: still },
  { id: '03-turn', receives: { form: 'order', thread: 'sage' }, init: still },
  { id: '04-how-it-works', receives: { form: 'order', thread: 'sage' }, init: still },
  { id: '05-for-each-person', receives: { form: 'notification', thread: 'green' }, init: still },
  { id: '06-quiet-by-design', receives: { form: 'notification', thread: 'green' }, init: still },
  { id: '07-the-panel', receives: { form: 'card', thread: 'green' }, init: still },
  { id: '08-your-data', receives: { form: 'card', thread: 'green' }, init: still },
  { id: '09-close', receives: { form: 'card', thread: 'green' }, init: still },
];
