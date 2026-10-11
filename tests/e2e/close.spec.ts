import { expect, test } from '@playwright/test';

// Section 9's own browser checks: the form works from the keyboard alone, with every outcome shown in place; it is
// present with JavaScript off; the hero's "Join the pilot" lands on it; and the page loads with no errors.
const LOAD_MS = 15_000;
const SECTION = '[data-section="09-close"]';
const STATUS = `${SECTION} [data-status]`;
const FIELD = `${SECTION} #join-email`;

async function submit(page: import('@playwright/test').Page, email: string) {
  await page.locator(FIELD).fill(email);
  await page.locator(FIELD).press('Enter');
}

test('section 9 loads with no page errors, and gets its motion once the visitor scrolls through it', async ({
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
  expect(errors).toEqual([]);
});

test('a work email is accepted, and the thank-you replaces the field in place', async ({
  page,
}) => {
  await page.goto('/#join');
  await submit(page, 'someone@company.com');
  await expect(page.locator(STATUS)).toHaveText('Thank you. You are on the pilot list.');
  await expect(page.locator(`${SECTION} .join-row`)).toBeHidden();
});

test('an address the send refuses keeps what was typed and says so', async ({ page }) => {
  await page.goto('/#join');
  await submit(page, 'fail@company.com');
  await expect(page.locator(STATUS)).toHaveText('That did not go through. Try again.');
  await expect(page.locator(FIELD)).toHaveValue('fail@company.com');
});

test('something that is not an address is refused before anything is sent', async ({ page }) => {
  await page.goto('/#join');
  await submit(page, 'nope');
  await expect(page.locator(STATUS)).toHaveText('Enter a work email address.');
});

test('with JavaScript off, the form, its label and the button are all there', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/#join');
  await expect(page.locator(`${SECTION} form.join`)).toBeVisible();
  await expect(page.locator(`${SECTION} label[for="join-email"]`)).toHaveText('Work email');
  await expect(page.locator(`${SECTION} button[type="submit"]`)).toHaveText('Join the pilot');
  await context.close();
});

test('the hero\'s "Join the pilot" link lands on the form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  await page.locator('.hero-join').click();
  await expect(page.locator(FIELD)).toBeInViewport();
});
