import { expect, test, type Page } from '@playwright/test';

const SECTION = '[data-section="04-how-it-works"]';
const LOAD_MS = 15_000;

const colour = (page: Page) =>
  page.evaluate(() => document.querySelector<HTMLElement>('.thread-layer')?.dataset.color);

const journeyEnd = (page: Page) =>
  page.evaluate((selector) => {
    const section = document.querySelector<HTMLElement>(selector);
    const spacer = section?.parentElement?.classList.contains('pin-spacer')
      ? section.parentElement
      : section;

    return (spacer?.getBoundingClientRect().bottom ?? 0) + scrollY;
  }, SECTION);

const sectionTop = (page: Page) =>
  page.evaluate(
    (selector) => (document.querySelector(selector)?.getBoundingClientRect().top ?? 0) + scrollY,
    SECTION,
  );

test('the thread turns green through the journey, and back to sage above it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/hero-boot/, { timeout: LOAD_MS });
  const viewport = page.viewportSize();
  const above = (await sectionTop(page)) - (viewport?.height ?? 0);
  const end = await journeyEnd(page);

  await page.evaluate((target) => scrollTo(0, target), end);
  await expect.poll(() => colour(page), { timeout: 10_000 }).toBe('green');
  await page.evaluate((target) => scrollTo(0, target), above);
  await expect.poll(() => colour(page), { timeout: 10_000 }).toBe('sage');
});
