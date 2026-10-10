import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from '@playwright/test';

// Screenshots one section of the vanilla page and of this one at the same scroll points, side by
// side in parity/, so a port can be compared by eye. Both dev servers must be running:
//   ../landing: npm run dev   (http://localhost:5173)      here: npm run dev   (http://localhost:5174)
// Usage: npm run parity -- 08            (desktop)
//        npm run parity -- 08 phone
const [solo, device = 'desktop'] = process.argv.slice(2);
if (!solo) {
  throw new Error('Usage: npm run parity -- <section number, e.g. 08> [desktop|phone]');
}
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 375, height: 812 } };
const viewport = device === 'phone' ? VIEWPORTS.phone : VIEWPORTS.desktop;
const SITES = { vanilla: 'http://localhost:5173', react: 'http://localhost:5174' };
const STOP_COUNT = 5; // six screenshots, from the section arriving to it leaving
const STOPS = [...Array(STOP_COUNT + 1).keys()].map((index) => index / STOP_COUNT);
// Let directional snapping and the smoother finish before comparing their final frames.
const PAUSE = { step: 40, settle: 5000, load: 1500 };
const STEP = 300;

// The scroll length of the section: its own height, or its pin spacer's when it is pinned.
async function span(page: Page): Promise<{ top: number; length: number }> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-section]:not([hidden])');
    const box = root?.parentElement?.classList.contains('pin-spacer') ? root.parentElement : root;
    const rect = box?.getBoundingClientRect() ?? { top: 0, height: 0 };
    return { top: rect.top + scrollY, length: rect.height };
  });
}

// Walks to the target in small steps, so every scrubbed timeline sees the scroll go past.
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
  await page.goto(`${SITES[site]}/?solo=${solo}`);
  await page.waitForTimeout(PAUSE.load);
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
    isMobile: device === 'phone',
    hasTouch: device === 'phone',
  });
  await capture(page, site);
  await page.close();
}
await browser.close();
console.log(`parity/${solo}-${device}-*-{vanilla,react}.png written`);
