import { expect, test, type Page } from '@playwright/test';
import { PORTED } from '../unit/ported';

const STEPS = 30;
const SETTLED_PX = 2;
const VISIBLE_OPACITY = 0.05;
const MAX_VISIBLE_CARRIED = 1;
const WALK_TIMEOUT_MS = 240_000;

const VANILLA_PIN_SCREENS: Record<'desktop' | 'phone', Record<string, number>> = {
  desktop: { '02-problem': 4, '04-how-it-works': 4.2, '07-the-panel': 2.9 },
  phone: { '02-problem': 3.4 },
};

const colourAtBottom = PORTED.includes('04-how-it-works') ? 'green' : 'sage';

const lag = (page: Page) =>
  page.evaluate(() => {
    const content = document.querySelector('#smooth-content');

    return Math.abs((content?.getBoundingClientRect().top ?? NaN) + scrollY);
  });

const visibleCarried = (page: Page) =>
  page.evaluate((minOpacity) => {
    const visible = [...document.querySelectorAll<HTMLElement>('.carried')].filter((node) => {
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();

      return (
        style.visibility === 'visible' &&
        Number(style.opacity) > minOpacity &&
        box.top >= 0 &&
        box.left >= 0 &&
        box.bottom <= innerHeight &&
        box.right <= innerWidth
      );
    });

    return visible.length;
  }, VISIBLE_OPACITY);

const threadColour = (page: Page) =>
  page.evaluate(() => document.querySelector<HTMLElement>('.thread-layer')?.dataset.color);

function collectErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  return errors;
}

const pinOffenders = (page: Page, pins: Record<string, number>) =>
  page.evaluate(
    (allowed) =>
      [...document.querySelectorAll<HTMLElement>('.pin-spacer')].flatMap((spacer) => {
        const child = spacer.firstElementChild as HTMLElement | null;
        const id = child?.closest<HTMLElement>('[data-section]')?.dataset.section ?? '';
        const added = spacer.offsetHeight - (child?.offsetHeight ?? 0);
        const limit = (allowed[id] ?? 0) * innerHeight;

        return added > limit + 1
          ? [`${id} adds ${Math.round(added)}px, vanilla ${Math.round(limit)}px`]
          : [];
      }),
    pins,
  );

async function atStep(
  page: Page,
  top: number,
  errors: readonly string[],
  pins: Record<string, number>,
): Promise<void> {
  await page.evaluate((target) => scrollTo(0, target), top);
  await expect.poll(() => lag(page)).toBeLessThanOrEqual(SETTLED_PX);
  await expect.poll(() => visibleCarried(page)).toBeLessThanOrEqual(MAX_VISIBLE_CARRIED);
  await expect(page.locator('.thread-layer')).toHaveCount(1);
  expect(errors, `errors at scroll ${top}`).toEqual([]);
  expect(await pinOffenders(page, pins), `pins longer than vanilla at scroll ${top}`).toEqual([]);
}

test('the whole page is one unit, top to bottom and back', async ({ page }, testInfo) => {
  test.setTimeout(WALK_TIMEOUT_MS);
  const pins = VANILLA_PIN_SCREENS[testInfo.project.name as keyof typeof VANILLA_PIN_SCREENS];
  const errors = collectErrors(page);

  await page.goto('/');
  await expect(page.locator('.thread-layer')).toHaveCount(1);

  const bottom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const down = [...Array(STEPS + 1).keys()].map((index) => Math.round((bottom * index) / STEPS));
  const up = down.slice(0, -1).reverse();

  for (const top of down) {
    await atStep(page, top, errors, pins);
  }

  expect(await threadColour(page)).toBe(colourAtBottom);

  for (const top of up) {
    await atStep(page, top, errors, pins);
  }

  expect(await threadColour(page)).toBe('sage');
});
