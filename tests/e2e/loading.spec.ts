import { expect, test, type Page } from '@playwright/test';

async function holdRequests(page: Page, url: string | RegExp): Promise<() => void> {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(url, async (route) => {
    await pending;
    await route.continue();
  });

  return release;
}

async function expectReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'true');
  await expect(page.locator('#page-loader')).not.toBeVisible();
  await expect(page.locator('#smooth-wrapper')).not.toHaveAttribute('inert');
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
}

test('the loader paints before JavaScript and styles arrive', async ({ page }) => {
  const release = await holdRequests(page, /\.(?:js|css)(?:\?|$)/);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('#page-loader')).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/page-loading/);
    await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'false');
    await expect(page.locator('#smooth-wrapper')).toHaveAttribute('inert', '');
    const background = await page.locator('#page-loader').evaluate((node) => {
      const style = getComputedStyle(node);

      return { position: style.position, background: style.backgroundColor };
    });

    expect(background.position).toBe('fixed');
    expect(background.background).not.toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).not.toBeFocused();
  } finally {
    release();
  }

  await expectReady(page);
});

test('screenshots hold the loader until the complete page is ready', async ({ page }) => {
  const release = await holdRequests(page, '**/*.webp');

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-loader')).toBeVisible();
    const progress = page.locator('#page-loader [role="progressbar"]');

    await expect
      .poll(async () => Number(await progress.getAttribute('aria-valuenow')))
      .toBeGreaterThan(0);
    expect(Number(await progress.getAttribute('aria-valuenow'))).toBeLessThan(
      Number(await progress.getAttribute('aria-valuemax')),
    );
    await page.mouse.wheel(0, 700);
    await page.keyboard.press('PageDown');
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'false');
  } finally {
    release();
  }

  await expectReady(page);
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('a failed screenshot offers a working retry without claiming readiness', async ({ page }) => {
  await page.route('**/*.webp', (route) => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#loader-retry')).toBeVisible();
  await expect(page.locator('#loader-status')).not.toBeEmpty();
  await expect(page.locator('html')).toHaveAttribute('data-page-ready', 'false');
  await expect(page.locator('#smooth-wrapper')).toHaveAttribute('inert', '');
  await page.unroute('**/*.webp');
  await page.locator('#loader-retry').click();
  await expectReady(page);
});

test('reduced motion keeps the loading screen still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const release = await holdRequests(page, '**/*.webp');

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loader = page.locator('#page-loader');

    await expect(loader).toBeVisible();
    expect(
      await loader.evaluate(
        (node) =>
          node
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === 'running').length,
      ),
    ).toBe(0);
  } finally {
    release();
  }

  await expectReady(page);
  await expect(page.locator('[data-motion]')).toHaveCount(0);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the complete prerendered page is readable without a loader', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#page-loader')).not.toBeVisible();
    await expect(page.locator('[data-section]')).toHaveCount(9);
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('form[data-join]')).toBeVisible();
    await expect(page.locator('#smooth-wrapper')).not.toHaveAttribute('inert');
    expect(await page.locator('body').evaluate((node) => getComputedStyle(node).margin)).toBe(
      '0px',
    );
  });
});
