import { createCarried, type Carried } from './carried';
import { createFilm } from './film';
import { conditions, duration, ease, gsap, scroll, ScrollSmoother, ScrollTrigger } from './gsap';
import { createHandoff } from './handoff';
import { createThread, type Thread } from './thread';
import type { Conditions, SectionMotion, Shared } from './types';

type Active = readonly (readonly [SectionMotion, HTMLElement])[];

// ?solo=04 runs one section alone, against its stub: the others are hidden, not removed, because
// React owns them.
function activate(
  page: HTMLElement,
  motions: readonly SectionMotion[],
  solo: string | null,
): Active {
  return motions.flatMap((motion) => {
    const root = page.querySelector<HTMLElement>(`[data-section="${motion.id}"]`);
    if (!root) {
      throw new Error(`${motion.id}: no <section data-section="${motion.id}"> rendered`);
    }
    if (solo && !motion.id.startsWith(solo)) {
      root.hidden = true;
      return [];
    }
    return [[motion, root] as const];
  });
}

// The stub: put what the one section receives at its in-anchor, in the stated state.
function stub(active: Active, thread: Thread, carried: Carried): void {
  const [motion, root] = active[0] ?? [];
  if (active.length !== 1 || !motion?.receives || !root) {
    return;
  }
  thread.setColor(motion.receives.thread);
  carried.setForm(motion.receives.form);
  root.querySelector('[data-thread-in]')?.append(carried.el);
  document.body.insertAdjacentHTML('beforeend', `<div class="solo-note">solo · ${motion.id}</div>`);
}

function unhide(page: HTMLElement): void {
  page.querySelectorAll<HTMLElement>('[data-section][hidden]').forEach((root) => {
    root.hidden = false;
  });
  document.querySelector('.solo-note')?.remove();
}

// The one scroll. Created before any section's ScrollTrigger, so every pin and scrub in the page
// runs on the same smoothed clock. None with reduced motion: the page scrolls natively.
function smoothScroll(reduce: boolean): ScrollSmoother | null {
  if (reduce) {
    return null;
  }
  return ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: scroll.smooth,
    smoothTouch: scroll.touch,
    normalizeScroll: true,
    effects: false,
  });
}

// In-page links (#join, #how-it-works, the skip link) travel through the smoother, so they land
// where its transformed content really puts the target.
function routeAnchors(smoother: ScrollSmoother | null): () => void {
  const onClick = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    const target = link && document.querySelector(link.getAttribute('href') ?? '');
    if (!smoother || !target) {
      return;
    }
    event.preventDefault();
    smoother.scrollTo(target, true, 'top top');
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

// The page's motion, as one unit: the shared pieces, the one scroll, then every section's init in
// page order (ScrollTrigger needs them top to bottom), then the thread. Returns the cleanup.
export function startPage(page: HTMLElement, motions: readonly SectionMotion[]): () => void {
  const solo = new URLSearchParams(location.search).get('solo');
  const active = activate(page, motions, solo);
  const destroyFilm = createFilm();
  const thread = createThread(page);
  const carried = createCarried();
  const handoff = createHandoff(active.map(([, root]) => root));
  if (solo) {
    stub(active, thread, carried);
  }
  const media = gsap.matchMedia();
  media.add(conditions, (context) => {
    const met = context.conditions as unknown as Conditions;
    const smoother = smoothScroll(met.reduce);
    const unroute = routeAnchors(smoother);
    const shared: Shared = {
      gsap,
      ScrollTrigger,
      smoother,
      thread,
      carried,
      handoff,
      ease,
      duration,
      conditions: met,
    };
    const cleanups = active.map(([motion, root]) => motion.init(root, shared));
    thread.draw(met.reduce);
    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
      unroute();
      smoother?.kill();
    };
  });
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
  return () => {
    media.revert();
    thread.destroy();
    carried.el.remove();
    destroyFilm();
    unhide(page);
  };
}
