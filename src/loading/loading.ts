import type { gsap } from 'gsap';

const COMPLETE_PERCENT = 100;
const REVEAL_SECONDS = 0.55;

function stylesheet(link: HTMLLinkElement): Promise<void> {
  if (link.dataset.failed) {
    return Promise.reject(new Error('Stylesheet did not load'));
  }

  if (link.sheet) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error('Stylesheet did not load')), {
      once: true,
    });
  });
}

export async function readyFonts(): Promise<void> {
  await Promise.all(
    Array.from(document.querySelectorAll<HTMLLinkElement>('[data-page-styles]'), stylesheet),
  );
  // Request both faces after the deferred stylesheet has applied, including in hidden sections.
  await Promise.all([
    document.fonts.load('500 16px "DM Sans Variable"'),
    document.fonts.load('650 54px "Manrope Variable"'),
  ]);
  await document.fonts.ready;
}

export async function readyImage(source: string): Promise<void> {
  const image = new Image();

  image.src = source;
  await image.decode();
}

export function createLoading(total: number) {
  const root = document.documentElement;
  const loader = document.querySelector<HTMLElement>('#page-loader')!;
  const wrapper = document.querySelector<HTMLElement>('#smooth-wrapper')!;
  const progress = loader.querySelector<HTMLElement>('[role="progressbar"]')!;
  const fill = loader.querySelector<HTMLElement>('.loader-progress-fill')!;
  const percent = loader.querySelector<HTMLElement>('#loader-percent')!;
  let done = 0;
  let reveal: gsap.core.Tween | undefined;

  const track = async <Value>(task: Promise<Value>): Promise<Value> => {
    const value = await task;
    const amount = Math.round((++done / total) * COMPLETE_PERCENT);

    progress.setAttribute('aria-valuenow', String(amount));
    fill.style.transform = 'scaleX(' + done / total + ')';
    percent.textContent = amount + '%';

    return value;
  };

  const finish = () => {
    root.classList.remove('page-loading', 'page-revealing');
    root.dataset.pageReady = 'true';
    wrapper.inert = false;
    document.dispatchEvent(new Event('page-load-ready'));
    loader.remove();
  };

  return {
    track,
    fail: () => document.dispatchEvent(new Event('page-load-error')),
    show: (animate: typeof gsap, start: () => void) => {
      // Measure the visible page at its final scrollbar width, behind the opaque overlay.
      root.classList.add('page-revealing');
      start();
      reveal = animate.to(loader, {
        opacity: 0,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : REVEAL_SECONDS,
        ease: 'power2.inOut',
        onComplete: finish,
      });
    },
    cancel: () => reveal?.kill(),
  };
}
