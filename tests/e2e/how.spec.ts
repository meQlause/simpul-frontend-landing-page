import { expect, test, type Page } from '@playwright/test';

// The journey's thread colour: sage until the tap, green from there to the end of the page, and sage
// again when the visitor scrolls back above the section.
const SECTION = '[data-section="04-how-it-works"]';
const LOAD_MS = 15_000;

const colour = (page: Page) =>
  page.evaluate(() => document.querySelector<HTMLElement>('.thread-layer')?.dataset.color);

// Where the section's pinned journey ends, as a page offset. Measured at the top of the page, so the
// pin's own spacing is part of it. A phone has no pin: the section's own bottom is the end.
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
