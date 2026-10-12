import { expect, test } from '@playwright/test';

const SECTIONS = 9;

test('the built page loads with every section and no errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  await page.goto('/');
  await expect(page.locator('[data-section]')).toHaveCount(SECTIONS);
  await expect(page.locator('.thread-layer')).toHaveCount(1);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('every section is in the page before any script runs', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('[data-section]')).toHaveCount(SECTIONS);
  await context.close();
});

test('with reduced motion the page reads without the motion layer', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('[data-section]')).toHaveCount(SECTIONS);
  await expect(page.locator('[data-motion]')).toHaveCount(0);
  await context.close();
});

test('the whole page scrolls as one unit, through one smoother', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#smooth-wrapper > #smooth-content > #page')).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.querySelector('#smooth-wrapper')!).position),
    )
    .toBe('fixed');
});

test('scrolling waits for every screenshot to load and decode', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route('**/*.webp', async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'false');
  await page.mouse.wheel(0, 700);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  release();
  await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'true');
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.every(
          (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  expect(await page.evaluate(() => document.fonts.status)).toBe('loaded');
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});
