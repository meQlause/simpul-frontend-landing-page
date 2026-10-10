import { renderToString } from 'react-dom/server';
import { App } from './app/App';

// The whole page as HTML, so every word is there before any script runs. Used by
// scripts/prerender.ts at build time and by the unit tests.
export function render(): string {
  return renderToString(<App />);
}
