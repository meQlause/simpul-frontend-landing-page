import { expect, test, type Page } from '@playwright/test';

const LOAD_MS = 15_000;
const SECTION = '[data-section="07-the-panel"]';
const PINNED = `.pin-spacer > ${SECTION}`;
const SETTLED_PX = 2;

const lag = (page: Page) =>
  page.evaluate(() => {
    const content = document.querySelector('#smooth-content');

    return Math.abs((content?.getBoundingClientRect().top ?? NaN) + scrollY);
  });

const sectionTop = (page: Page) =>
  page.locator(SECTION).evaluate((node) => node.getBoundingClientRect().top + scrollY);

test('section 7 loads with no page errors, and gets its motion once the visitor scrolls through it', async ({
  page,
}) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  const top = await sectionTop(page);

  for (const share of [0, 0.5, 1]) {
    await page.evaluate((position) => scrollTo(0, position), top + share * 600);
    await expect.poll(() => lag(page)).toBeLessThanOrEqual(SETTLED_PX);
  }

  await expect(page.locator(SECTION)).toHaveAttribute('data-motion', '');
  expect(errors).toEqual([]);
});

test('at desktop width the window is pinned in a pin spacer', async ({ page }, testInfo) => {
  testInfo.skip(testInfo.project.name !== 'desktop', 'the pinned window is a desktop layout');
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  await expect(page.locator(PINNED)).toHaveCount(1);
  await expect(page.locator('.panel-window')).toHaveAttribute('data-window', '');
  const pin = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('.pin-spacer > [data-section="07-the-panel"]');

    return {
      length: (root?.parentElement?.offsetHeight ?? 0) - (root?.offsetHeight ?? 0),
      screen: innerHeight,
    };
  });

  expect(pin.length / pin.screen).toBeCloseTo(2.9, 2);
});
