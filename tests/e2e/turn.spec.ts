import { expect, test } from '@playwright/test';

// The turn's own browser check: the pause control toggles its state and its label.
const OPEN_MS = 15_000;

test('the pause control toggles its state and its label', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: OPEN_MS }); // the motion has started
  const button = page.locator('.turn-pause');
  await expect(button).toBeVisible({ timeout: OPEN_MS });
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveText('Resume chat motion');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveText('Pause chat motion');
});
