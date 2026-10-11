import type { ComponentType } from 'react';
import { Hero } from './01-hero/Hero';
import { Problem } from './02-problem/Problem';
import { Turn } from './03-turn/Turn';
import { How } from './04-how-it-works/How';
import { People } from './05-for-each-person/People';
import { QuietByDesign } from './06-quiet-by-design/QuietByDesign';
import { ThePanel } from './07-the-panel/ThePanel';
import { YourData } from './08-your-data/YourData';
import { Close } from './09-close/Close';

export interface SectionView {
  id: string;
  Component: ComponentType;
}

// The page, in order: the markup only, safe to render on the server. Each section's motion is
// registered separately, in ./motions.ts, so no animation code is part of the prerender.
export const SECTIONS: readonly SectionView[] = [
  { id: '01-hero', Component: Hero },
  { id: '02-problem', Component: Problem },
  { id: '03-turn', Component: Turn },
  { id: '04-how-it-works', Component: How },
  { id: '05-for-each-person', Component: People },
  { id: '06-quiet-by-design', Component: QuietByDesign },
  { id: '07-the-panel', Component: ThePanel },
  { id: '08-your-data', Component: YourData },
  { id: '09-close', Component: Close },
];
