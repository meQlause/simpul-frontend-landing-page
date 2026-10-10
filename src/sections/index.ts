import type { ComponentType } from 'react';
import { stubSection } from './stub';
import { Hero } from './01-hero/Hero';
import { Problem } from './02-problem/Problem';
import { Turn } from './03-turn/Turn';

export interface SectionView {
  id: string;
  Component: ComponentType;
}

// The page, in order: the markup only, safe to render on the server. Each section's motion is
// registered separately, in ./motions.ts, so no animation code is part of the prerender.
// A port phase swaps one stubSection(...) for the real component, e.g. { id: '08-your-data', Component: YourData }.
export const SECTIONS: readonly SectionView[] = [
  { id: '01-hero', Component: Hero },
  { id: '02-problem', Component: Problem },
  { id: '03-turn', Component: Turn },
  {
    id: '04-how-it-works',
    Component: stubSection({ id: '04-how-it-works', className: 'how', anchor: 'how-it-works' }),
  },
  {
    id: '05-for-each-person',
    Component: stubSection({ id: '05-for-each-person', className: 'people' }),
  },
  {
    id: '06-quiet-by-design',
    Component: stubSection({ id: '06-quiet-by-design', className: 'quiet' }),
  },
  { id: '07-the-panel', Component: stubSection({ id: '07-the-panel', className: 'panel' }) },
  {
    id: '08-your-data',
    Component: stubSection({ id: '08-your-data', className: 'data', anchor: 'your-data' }),
  },
  {
    id: '09-close',
    Component: stubSection({ id: '09-close', className: 'close', anchor: 'join' }),
  },
];
