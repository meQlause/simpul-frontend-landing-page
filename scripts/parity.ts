import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from '@playwright/test';

// Screenshots one section of the vanilla page and of this one at the same scroll points, side by
// side in parity/, so a port can be compared by eye. Both dev servers must be running:
//   ../landing: npm run dev   (http://localhost:5173)      here: npm run dev   (http://localhost:5174)
// Usage: npm run parity -- 08            (desktop)
//        npm run parity -- 08 phone
const [solo, device = 'desktop'] = process.argv.slice(2);
if (!solo) {
  throw new Error('Usage: npm run parity -- <section number, e.g. 08, or page> [desktop|phone]');
}
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 375, height: 812 } };
const viewport = device === 'phone' ? VIEWPORTS.phone : VIEWPORTS.desktop;
const SITES = { vanilla: 'http://localhost:5173', react: 'http://localhost:5174' };
const STOP_COUNT = 5; // six screenshots, from the section arriving to it leaving
const STOPS = [...Array(STOP_COUNT + 1).keys()].map((index) => index / STOP_COUNT);
const WHOLE_PAGE = solo === 'page';
const PAGE_STOPS = 24; // the whole page, from its top to its foot, in even steps
// Let directional snapping and the smoother finish before comparing their final frames.
const PAUSE = { step: 40, settle: 5000, load: 1500 };
const STEP = 100; // a jump of 300 px across a pin's start can leave the smoother behind until the next scroll

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
  await page.goto(WHOLE_PAGE ? `${SITES[site]}/` : `${SITES[site]}/?solo=${solo}`);
  await page.waitForTimeout(PAUSE.load);
  if (WHOLE_PAGE) {
    // Measured after a settle at the foot: the page grows once its last section's text fills in, and the stops
    // have to be the same absolute positions on both sites, so both sites are measured at their final height.
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
    // Not isMobile: a mobile emulation zooms out a page that overflows sideways (the vanilla one does), and the
    // zoom changes innerHeight, so every pin would be measured at a different height. The width is the same.
    isMobile: false,
    hasTouch: device === 'phone',
  });
  await capture(page, site);
  await page.close();
}
await browser.close();
console.log(`parity/${solo}-${device}-*-{vanilla,react}.png written`);
