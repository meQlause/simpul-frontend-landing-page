import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import './styles/tokens.css';
import './styles/base.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';

const page = document.getElementById('page');
const sections = document.getElementById('sections');
if (!page || !sections) {
  throw new Error('Missing #page or #sections in index.html');
}

// No <StrictMode>: the sections are static markup driven by imperative GSAP, and a development
// double mount would build every scroll scene twice.
// The motion is loaded after the page is in place: the static markup is already readable, and the first
// script stays small. The chunk holds GSAP and every section's motion.
const startMotion = () => {
  let stop: (() => void) | undefined;
  let cancelled = false;
  void Promise.all([import('./motion/page'), import('./sections/motions')]).then(
    ([motion, sectionMotions]) => {
      if (!cancelled) {
        stop = motion.startPage(page, sectionMotions.MOTIONS);
      }
    },
  );
  return () => {
    cancelled = true;
    stop?.();
  };
};
const app = <App onMount={startMotion} />;
if (sections.firstElementChild) {
  hydrateRoot(sections, app); // the production build: prerendered by scripts/prerender.ts
} else {
  createRoot(sections).render(app); // `vite` in development: nothing prerendered
}
