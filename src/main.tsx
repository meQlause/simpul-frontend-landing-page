import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import './styles/tokens.css';
import './styles/base.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { createLoading, readyFonts, readyImage } from './loading/loading';

const page = document.getElementById('page');
const sections = document.getElementById('sections');

if (!page || !sections) {
  throw new Error('Missing #page or #sections in index.html');
}

const screenshots = import.meta.glob<string>('./sections/07-the-panel/screens/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const SHARED_ASSET_TASKS = 4;

const startMotion = () => {
  const sources = [
    ...new Set([
      ...Object.values(screenshots),
      '/simpul-mark.png',
      ...Array.from(page.querySelectorAll('img'), (image) => image.src),
    ]),
  ];
  const loading = createLoading(sources.length + SHARED_ASSET_TASKS);
  let stop: (() => void) | undefined;
  let cancelled = false;

  const start = async () => {
    try {
      const [motion, sectionMotions, { gsap, ScrollTrigger }] = await Promise.all([
        loading.track(import('./motion/page')),
        loading.track(import('./sections/motions')),
        loading.track(import('./motion/gsap')),
        loading.track(readyFonts()),
        ...sources.map((source) => loading.track(readyImage(source))),
      ]);

      if (!cancelled) {
        loading.show(gsap, () => {
          stop = motion.startPage(page, sectionMotions.MOTIONS);
          ScrollTrigger.refresh();
        });
      }
    } catch {
      if (!cancelled) {
        loading.fail();
      }
    }
  };

  void start();

  return () => {
    cancelled = true;
    loading.cancel();
    stop?.();
  };
};

const app = <App onMount={startMotion} />;

if (sections.firstElementChild) {
  hydrateRoot(sections, app);
} else {
  createRoot(sections).render(app);
}
