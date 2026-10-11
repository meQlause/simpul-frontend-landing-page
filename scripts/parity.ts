import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from '@playwright/test';

const [solo, device = 'desktop'] = process.argv.slice(2);

if (!solo) {
  throw new Error('Usage: npm run parity -- <section number, e.g. 08, or page> [desktop|phone]');
}

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 375, height: 812 } };
const viewport = device === 'phone' ? VIEWPORTS.phone : VIEWPORTS.desktop;
const SITES = { vanilla: 'http://localhost:5173', react: 'http://localhost:5174' };
const STOP_COUNT = 5;
const STOPS = [...Array(STOP_COUNT + 1).keys()].map((index) => index / STOP_COUNT);
const WHOLE_PAGE = solo === 'page';
const PAGE_STOPS = 24;
const PAUSE = { step: 40, settle: 5000, load: 1500 };
const STEP = 100;

async function span(page: Page): Promise<{ top: number; length: number }> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-section]:not([hidden])');
    const box = root?.parentElement?.classList.contains('pin-spacer') ? root.parentElement : root;
    const rect = box?.getBoundingClientRect() ?? { top: 0, height: 0 };

    return { top: rect.top + scrollY, length: rect.height };
  });
}

async function walk(page: Page, target: number): Promise<void> {
  let position = await page.evaluate(() => scrollY);

  while (Math.abs(position - target) > 2) {
    position += Math.sign(target - position) * Math.min(STEP, Math.abs(target - position));
    await page.evaluate((top) => scrollTo(0, top), position);
    await page.waitForTimeout(PAUSE.step);
  }

  await page.waitForTimeout(PAUSE.settle);
}

async function capture(page: Page, site: keyof typeof SITES): Promise<void> {
  await page.goto(WHOLE_PAGE ? `${SITES[site]}/` : `${SITES[site]}/?solo=${solo}`);
  await page.waitForTimeout(PAUSE.load);

  if (WHOLE_PAGE) {
    await page.evaluate(() => scrollTo(0, Number.MAX_SAFE_INTEGER));
    await page.waitForTimeout(PAUSE.settle);
    const bottom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

    for (let index = 0; index < PAGE_STOPS; index++) {
      await walk(page, (bottom * index) / (PAGE_STOPS - 1));
      await page.screenshot({ path: `parity/page-${device}-${index}-${site}.png` });
    }

    return;
  }

  const { top, length } = await span(page);

  for (const stop of STOPS) {
    await walk(page, Math.max(0, top - viewport.height + stop * (length + viewport.height)));
    await page.screenshot({ path: `parity/${solo}-${device}-${stop}-${site}.png` });
  }
}

await mkdir('parity', { recursive: true });
const browser = await chromium.launch();

for (const site of ['vanilla', 'react'] as const) {
  const page = await browser.newPage({
    viewport,
    isMobile: false,
    hasTouch: device === 'phone',
  });

  await capture(page, site);
  await page.close();
}

await browser.close();
console.log(`parity/${solo}-${device}-*-{vanilla,react}.png written`);
