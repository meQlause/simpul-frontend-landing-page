import { expect, test } from '@playwright/test';

// Section 8's own browser checks: the page loads with no errors, and the section gets its motion as the visitor
// scrolls through it. The section has no button or form, so there is nothing else to click.
const LOAD_MS = 15_000;
const SECTION = '[data-section="08-your-data"]';

test('section 8 loads with no page errors, and gets its motion once the visitor scrolls through it', async ({
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
  await page.locator(SECTION).scrollIntoViewIfNeeded();
  await expect(page.locator(SECTION)).toHaveAttribute('data-motion', '');
  await expect(page.locator(`${SECTION} .data-threads`)).toHaveCount(1);
  expect(errors).toEqual([]);
});
