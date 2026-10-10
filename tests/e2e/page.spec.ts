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
