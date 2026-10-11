import { expect, test, type Page } from '@playwright/test';

const LOAD_MS = 15_000;
const SECTION = '[data-section="06-quiet-by-design"]';
const SETTLED_PX = 2;
const PINNED_PX = 2;
const STEPS = [0.3, 0.6];

const lag = (page: Page) =>
  page.evaluate(() => {
    const content = document.querySelector('#smooth-content');

    return Math.abs((content?.getBoundingClientRect().top ?? NaN) + scrollY);
  });

const stageTop = (page: Page) =>
  page
    .locator('.quiet-stage')
    .evaluate((node) => Math.abs(Math.round(node.getBoundingClientRect().top)));

const columnOf = (page: Page) =>
  page.locator('.quiet-body').evaluate((node) => {
    const box = node.getBoundingClientRect();

    return { top: box.top + scrollY, height: box.height, screen: innerHeight };
  });

test('section 6 loads with no page errors, and gets its motion once the visitor scrolls through it', async ({
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
  const quiet = page.locator(SECTION);
  const column = await columnOf(page);

  for (const share of [0, 0.5, 1]) {
    await page.evaluate((position) => scrollTo(0, position), column.top + column.height * share);
    await expect.poll(() => lag(page)).toBeLessThanOrEqual(SETTLED_PX);
  }

  await expect(quiet).toHaveAttribute('data-motion', '');
  expect(errors).toEqual([]);
});

test('at desktop width the stage is pinned while the commitments scroll past', async ({
  page,
}, testInfo) => {
  testInfo.skip(
    testInfo.project.name !== 'desktop',
    'the pinned stage and index are desktop layouts',
  );
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  await expect(page.locator('.pin-spacer > .quiet-stage')).toHaveCount(1);
  const column = await columnOf(page);

  for (const share of STEPS) {
    const target = column.top + (column.height - column.screen) * share;

    await page.evaluate((position) => scrollTo(0, position), target);
    await expect.poll(() => lag(page)).toBeLessThanOrEqual(SETTLED_PX);
    await expect.poll(() => stageTop(page)).toBeLessThanOrEqual(PINNED_PX);
  }
});

test('the stage stops at the bottom of its column, matching the vanilla sticky rule', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  const column = await columnOf(page);

  await page.evaluate(
    (position) => scrollTo(0, position),
    column.top + column.height - column.screen / 4,
  );
  await expect.poll(() => lag(page)).toBeLessThanOrEqual(SETTLED_PX);
  await expect
    .poll(() =>
      page.locator('.quiet-stage').evaluate((node) => {
        const body = document.querySelector('.quiet-body');

        return Math.abs(
          node.getBoundingClientRect().bottom - (body?.getBoundingClientRect().bottom ?? NaN),
        );
      }),
    )
    .toBeLessThanOrEqual(PINNED_PX);
});
