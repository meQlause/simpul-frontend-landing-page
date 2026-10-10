import { expect, test, type Locator, type Page } from '@playwright/test';

// The problem's own browser checks: the pinned walk down and back, and the order's place after it.
const SECTION = '[data-section="02-problem"]';
const PIN_VIEWPORTS = 4; // the pin's length, in viewport heights (problem.tuning.ts PIN.desk)
const PAGE_MS = 120_000;

const visibleBubbles = (page: Page) =>
  page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>('.problem-bubble')].filter(
        (bubble) => getComputedStyle(bubble).visibility === 'visible',
      ).length,
  );

const orderPlace = (order: Locator) => order.evaluate((node) => node.style.transform);

test('the problem un-drops when scrolled back up, and the pile clears', async ({ page }) => {
  test.setTimeout(PAGE_MS);
  await page.goto('/');
  const section = page.locator(SECTION);
  const order = page.locator('.problem-order');

  await section.evaluate((node) => node.scrollIntoView({ block: 'start' }));
  await expect.poll(() => orderPlace(order)).not.toBe('');
  const start = await orderPlace(order);
  const startY = await page.evaluate(() => scrollY);
  expect(await visibleBubbles(page)).toBe(0);

  await page.evaluate((viewports) => scrollBy(0, innerHeight * (viewports + 2)), PIN_VIEWPORTS);
  await expect.poll(() => visibleBubbles(page)).toBeGreaterThan(0);
  expect(await orderPlace(order)).not.toBe(start);

  await page.evaluate((top) => scrollTo(0, top), startY);
  await expect.poll(() => visibleBubbles(page)).toBe(0);
  await expect.poll(() => orderPlace(order)).toBe(start);
});
