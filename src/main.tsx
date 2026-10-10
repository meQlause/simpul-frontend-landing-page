import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import './styles/tokens.css';
import './styles/base.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { startPage } from './motion/page';
import { MOTIONS } from './sections/motions';

const page = document.getElementById('page');
const sections = document.getElementById('sections');
if (!page || !sections) {
  throw new Error('Missing #page or #sections in index.html');
}

// No <StrictMode>: the sections are static markup driven by imperative GSAP, and a development
// double mount would build every scroll scene twice.
const app = <App onMount={() => startPage(page, MOTIONS)} />;
if (sections.firstElementChild) {
  hydrateRoot(sections, app); // the production build: prerendered by scripts/prerender.ts
} else {
  createRoot(sections).render(app); // `vite` in development: nothing prerendered
}
