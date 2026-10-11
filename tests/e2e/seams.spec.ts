import { expect, test, type Page } from '@playwright/test';

const THREADS = [
  '.hero-release',
  '.problem-thread',
  '.turn-thread',
  '.how-track-svg',
  '.how-rail',
  '.people-threads',
  '.quiet-thread',
  '.panel-thread',
  '.data-threads',
  '.close-strands',
]
  .map((svg) => `${svg} path`)
  .join(', ');

const SAMPLE_PX = 2;
const NEAR_PX = 2.5;
const MEET_PX = 3;
const UPRIGHT = 0.2;
const SETTLED_PX = 2;
const WALK = 0.3;
const STOPS = [0.75, 0.5, 0.3];
const SEAM_TIMEOUT_MS = 240_000;
const LOAD_MS = 15_000;

interface Crossing {
  x: number;
  slope: number | null;
}

interface Seam {
  above: string;
  below: string;
  top: number;
}

const seamsOf = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-section]')].slice(1).map((section) => {
      const outer = section.parentElement?.classList.contains('pin-spacer')
        ? section.parentElement
        : section;
      const above = outer.previousElementSibling?.querySelector<HTMLElement>('[data-section]');

      return {
        above:
          above?.dataset.section ??
          (outer.previousElementSibling as HTMLElement).dataset.section ??
          '',
        below: section.dataset.section ?? '',
        top: outer.getBoundingClientRect().top + scrollY,
      };
    }),
  );

const settle = async (page: Page, top: number) => {
  await page.evaluate((target) => scrollTo(0, target), Math.max(0, Math.round(top)));
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(
          (document.querySelector('#smooth-content')?.getBoundingClientRect().top ?? 0) + scrollY,
        ),
      ),
    )
    .toBeLessThanOrEqual(SETTLED_PX);
};

const crossings = (page: Page, id: string, seamY: number) =>
  page.evaluate(
    ({ id, seamY, selector, step, near }) => {
      const section = document.querySelector(`[data-section="${id}"]`);
      const paths = [...(section?.querySelectorAll<SVGPathElement>(selector) ?? [])].filter(
        (path) => path.getAttribute('d'),
      );

      return paths.flatMap((path) => {
        const matrix = path.getScreenCTM() ?? undefined;
        const length = path.getTotalLength();
        const pointAt = (run: number) =>
          path.getPointAtLength(Math.min(length, Math.max(0, run))).matrixTransform(matrix);
        const runs = Array.from(
          { length: Math.floor(length / step) + 1 },
          (_unused, index) => index * step,
        ).concat(length);

        return runs
          .filter((run) => Math.abs(pointAt(run).y - seamY) <= near)
          .map((run) => {
            const ahead = pointAt(run + step);
            const behind = pointAt(run - step);
            const rise = ahead.y - behind.y;

            return { x: pointAt(run).x, slope: rise === 0 ? null : (ahead.x - behind.x) / rise };
          });
      });
    },
    { id, seamY, selector: THREADS, step: SAMPLE_PX, near: NEAR_PX },
  );

const upright = (crossing: Crossing) =>
  crossing.slope === null || Math.abs(crossing.slope) < UPRIGHT;

const coveredObjects = (page: Page) =>
  page.evaluate(() => {
    const layers = [...document.querySelectorAll<HTMLElement>('[data-section]')].map(
      (section, order) => {
        const outer = section.parentElement?.classList.contains('pin-spacer')
          ? section.parentElement
          : section;

        return { section, order, top: section.getBoundingClientRect().top, outer };
      },
    );
    const paintRank = (layer: (typeof layers)[number]) =>
      Number(getComputedStyle(layer.outer).zIndex) * layers.length + layer.order;
    const objects = [...document.querySelectorAll<HTMLElement>('.carried, .panel-card')];

    return objects.flatMap((object) => {
      const box = object.getBoundingClientRect();
      const own = layers.find((layer) => layer.section.contains(object));
      const shown = getComputedStyle(object).visibility === 'visible' && box.height > 0;
      const under = layers.filter(
        (layer) =>
          layer !== own &&
          box.top < layer.top + layer.section.offsetHeight &&
          layer.top < box.bottom &&
          own &&
          paintRank(layer) > paintRank(own),
      );

      return shown && own && under.length > 0 ? [object.className] : [];
    });
  });

async function walkTo(page: Page, from: number, to: number): Promise<void> {
  const viewport = page.viewportSize()?.height ?? 0;

  for (let top = from; top < to; top += viewport * WALK) {
    await settle(page, top);
  }

  await settle(page, to);
}

async function checkSeam(page: Page, seam: Seam): Promise<void> {
  const viewport = page.viewportSize()?.height ?? 0;
  const seamY = viewport / 2;
  const above = await crossings(page, seam.above, seamY);
  const below = await crossings(page, seam.below, seamY);
  const label = `${seam.above} → ${seam.below}`;
  const stitched = above.some(
    (top) =>
      upright(top) &&
      below.some((bottom) => upright(bottom) && Math.abs(top.x - bottom.x) <= MEET_PX),
  );

  expect(
    stitched,
    `${label}: threads meet upright at the seam ${JSON.stringify({ above, below })}`,
  ).toBe(true);
}

test('every seam is stitched, and nothing carried across a seam is painted over', async ({
  page,
}) => {
  test.setTimeout(SEAM_TIMEOUT_MS);
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  const seams = await seamsOf(page);
  const viewport = page.viewportSize()?.height ?? 0;
  let reached = 0;

  for (const seam of seams) {
    for (const stop of STOPS) {
      const top = seam.top - viewport * stop;

      await walkTo(page, reached, top);
      reached = top;
      expect(await coveredObjects(page), `cropped near ${seam.below}`).toEqual([]);
    }

    await settle(page, seam.top - viewport / 2);
    await checkSeam(page, seam);
  }
});
