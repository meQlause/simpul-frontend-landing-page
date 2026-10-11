import { expect, test } from '@playwright/test';

const OPENING_MS = 15_000;

test('the hero is hidden until its opening reveals it, on every load', async ({ page }) => {
  test.setTimeout(OPENING_MS * 5);

  for (let load = 0; load < 5; load++) {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/hero-boot/);
    await expect(page.locator('.hero-heading-line').first()).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: OPENING_MS });
  }
});

test('Watch the video opens the film, and Escape closes it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: OPENING_MS });
  const film = page.locator('dialog.film');

  await page.locator('[data-film]').click();
  await expect(film).toHaveJSProperty('open', true);
  await page.keyboard.press('Escape');
  await expect(film).toHaveJSProperty('open', false);
});

test('See how it works moves the page down', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: OPENING_MS });
  const before = await page.evaluate(() => scrollY);

  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
});
