import { expect, test } from '@playwright/test';

const LOAD_MS = 15_000;
const CARDS = ['rina', 'budi', 'siti', 'hendra'];

test('Tab focuses each of the four cards in order', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  await page.locator(`[data-person="${CARDS[0]}"]`).focus();
  const focused: (string | null | undefined)[] = [];

  for (let step = 0; step < CARDS.length; step++) {
    focused.push(await page.evaluate(() => document.activeElement?.getAttribute('data-person')));
    await page.keyboard.press('Tab');
  }

  expect(focused).toEqual(CARDS);
});
