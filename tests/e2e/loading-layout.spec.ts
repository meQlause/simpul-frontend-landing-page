import { expect, test, type Page } from '@playwright/test';

// Headless Chromium normally hides the scrollbar that changes the pinned scene's width.
test.use({
  launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] },
  viewport: { width: 1440, height: 900 },
  isMobile: false,
  hasTouch: false,
});

const seamDistance = (page: Page) =>
  page.evaluate(() => {
    const reach = document.querySelector<SVGPathElement>('.turn-thread-reach')!;
    const endpoint = reach
      .getPointAtLength(reach.getTotalLength())
      .matrixTransform(reach.getScreenCTM()!);
    const order = document.querySelector<HTMLElement>('.problem-order')!.getBoundingClientRect();

    return Math.hypot(
      endpoint.x - order.left - order.width / 2,
      endpoint.y - order.top - order.height / 2,
    );
  });

test('loader release preserves scene widths and the Problem to Turn handoff', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'true');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: 15_000 });
  const widths = await page.evaluate(() => ({
    viewport: innerWidth,
    content: document.documentElement.clientWidth,
    problem: document.querySelector('.problem')!.getBoundingClientRect().width,
    turn: document.querySelector('.turn')!.getBoundingClientRect().width,
  }));

  expect(widths.viewport - widths.content).toBeGreaterThan(0);
  expect(widths.problem).toBeCloseTo(widths.content, 0);
  expect(widths.turn).toBeCloseTo(widths.content, 0);
  await page.evaluate(() => {
    const turn = document.querySelector('.turn')!.getBoundingClientRect();

    scrollTo(0, scrollY + turn.top - innerHeight * 0.7);
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(document.querySelector('#smooth-content')!.getBoundingClientRect().top + scrollY),
      ),
    )
    .toBeLessThanOrEqual(1);
  await expect
    .poll(() =>
      page
        .locator('.chain-face')
        .evaluateAll((faces) =>
          faces.every((face) => getComputedStyle(face).visibility === 'visible'),
        ),
    )
    .toBe(true);
  await expect.poll(() => seamDistance(page)).toBeLessThanOrEqual(1);
});
