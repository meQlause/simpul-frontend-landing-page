import { expect, test, type Page } from '@playwright/test';
import { PORTED } from '../unit/ported';

// The whole built page, top to bottom and back, in even steps. It holds the page together as it
// grows: every seam, every phase, one unit.
const STEPS = 30;
const SETTLED_PX = 2; // how close the smoothed content must be to the scrollbar
const VISIBLE_OPACITY = 0.05;
const MAX_VISIBLE_CARRIED = 1;
const WALK_TIMEOUT_MS = 240_000;

// The thread is sage until section 4 turns it green, and stays green below it.
const colourAtBottom = PORTED.includes('04-how-it-works') ? 'green' : 'sage';

// How far the smoothed content still is from the scrollbar. ScrollSmoother moves #smooth-content
// with a transform, so its rect top is -scrollY once it has caught up.
const lag = (page: Page) =>
  page.evaluate(() => {
    const content = document.querySelector('#smooth-content');
    return Math.abs((content?.getBoundingClientRect().top ?? NaN) + scrollY);
  });

// Carried objects a reader can see right now: visible, opaque enough, and inside the viewport.
const visibleCarried = (page: Page) =>
  page.evaluate((minOpacity) => {
    const visible = [...document.querySelectorAll<HTMLElement>('.carried')].filter((node) => {
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return (
        style.visibility === 'visible' &&
        Number(style.opacity) > minOpacity &&
        box.top >= 0 &&
        box.left >= 0 &&
        box.bottom <= innerHeight &&
        box.right <= innerWidth
      );
    });
    return visible.length;
  }, VISIBLE_OPACITY);

const threadColour = (page: Page) =>
  page.evaluate(() => document.querySelector<HTMLElement>('.thread-layer')?.dataset.color);

// One step of the walk: scroll there, wait for the smoother, then hold the page to its rules.
async function atStep(page: Page, top: number, errors: readonly string[]): Promise<void> {
  await page.evaluate((target) => scrollTo(0, target), top);
  await expect.poll(() => lag(page)).toBeLessThanOrEqual(SETTLED_PX);
  await expect.poll(() => visibleCarried(page)).toBeLessThanOrEqual(MAX_VISIBLE_CARRIED);
  await expect(page.locator('.thread-layer')).toHaveCount(1);
  expect(errors, `errors at scroll ${top}`).toEqual([]);
}

test('the whole page is one unit, top to bottom and back', async ({ page }) => {
  test.setTimeout(WALK_TIMEOUT_MS); // 61 smoothed stops; each waits for the smoother to settle
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  await page.goto('/');
  await expect(page.locator('.thread-layer')).toHaveCount(1);

  const bottom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const down = [...Array(STEPS + 1).keys()].map((index) => Math.round((bottom * index) / STEPS));
  const up = down.slice(0, -1).reverse();
  for (const top of down) {
    await atStep(page, top, errors);
  }
  expect(await threadColour(page)).toBe(colourAtBottom);
  for (const top of up) {
    await atStep(page, top, errors);
  }
  expect(await threadColour(page)).toBe('sage');
});
