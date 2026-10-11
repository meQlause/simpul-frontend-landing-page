import { expect, test, type Page } from '@playwright/test';

// Phase 12: the built page holds with no JavaScript, with reduced motion, on a phone, and under the hover rules.
const LOAD_MS = 15_000;
const PHONE_STOPS = 10;

// One line of each section's main copy, as its unit test holds it.
const MAIN_COPY: [string, string][] = [
  ['01-hero', 'Busy conversations.'],
  ['02-problem', 'Everyone is working.'],
  ['03-turn', 'A layer on the ones you already use.'],
  ['04-how-it-works', 'You decide.'],
  ['05-for-each-person', 'Four people.'],
  ['06-quiet-by-design', 'Fewer notifications.'],
  ['07-the-panel', 'Fifteen minutes a week.'],
  ['08-your-data', 'Your data stays yours.'],
  ['09-close', 'Stay informed.'],
];

test.describe('with no JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every section shows its main copy, and the form is there', async ({ page }) => {
    await page.goto('/');
    for (const [id, copy] of MAIN_COPY) {
      const section = page.locator(`[data-section="${id}"]`);
      await expect(section, id).toBeVisible();
      await expect(section, id).toContainText(copy);
    }
    await expect(page.locator('form[data-join]')).toBeVisible();
    await expect(page.locator('label[for="join-email"]')).toHaveText('Work email');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('there is no motion layer, no pin, and no smoother, and the page is as tall as with no JavaScript', async ({
    page,
    browser,
  }) => {
    await page.goto('/');
    await expect(page.locator('[data-section="09-close"]')).toBeVisible({ timeout: LOAD_MS });
    await expect(page.locator('[data-motion]')).toHaveCount(0);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    const smoother = await page.evaluate(
      () => getComputedStyle(document.querySelector('#smooth-wrapper') ?? document.body).position,
    );
    expect(smoother).not.toBe('fixed');
    const height = await page.evaluate(() => document.documentElement.scrollHeight);

    const bare = await browser.newContext({ javaScriptEnabled: false });
    const barePage = await bare.newPage();
    await barePage.goto('/');
    const bareHeight = await barePage.evaluate(() => document.documentElement.scrollHeight);
    await bare.close();
    expect(Math.abs(height - bareHeight) / bareHeight).toBeLessThanOrEqual(0.1);
  });
});

// The page never scrolls sideways on a phone: checked at ten stops down its length.
test('on a phone, the page does not scroll sideways at any of ten stops', async ({
  page,
}, testInfo) => {
  testInfo.skip(testInfo.project.name !== 'phone', 'the phone layout');
  await page.goto('/');
  await expect(page.locator('[data-section="09-close"]')).toBeVisible({ timeout: LOAD_MS });
  const bottom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let index = 0; index <= PHONE_STOPS; index++) {
    await page.evaluate((top) => scrollTo(0, top), (bottom * index) / PHONE_STOPS);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), {
        message: `stop ${index}`,
      })
      .toBe(true);
  }
});

// The hover rules: a headline line lifts, and a turn ask's label moves, on a fine pointer.
test('the hover rules answer on desktop', async ({ page }, testInfo) => {
  testInfo.skip(testInfo.project.name !== 'desktop', 'hover is a desktop rule');
  await page.goto('/');
  await expect(page.locator('[data-section="09-close"]')).toBeVisible({ timeout: LOAD_MS });
  const translateOf = (locator: ReturnType<Page['locator']>) =>
    locator.evaluate((node) => getComputedStyle(node).translate);

  const line = page.locator('.close-title > span').first();
  await line.scrollIntoViewIfNeeded();
  const lineBefore = await translateOf(line);
  await line.hover();
  await expect.poll(() => translateOf(line)).not.toBe(lineBefore);

  const ask = page.locator('.turn-asks li strong').first();
  await ask.scrollIntoViewIfNeeded();
  const askBefore = await translateOf(ask);
  await ask.hover();
  await expect.poll(() => translateOf(ask)).not.toBe(askBefore);
});
