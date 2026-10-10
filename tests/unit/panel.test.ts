import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import spots from '../../src/sections/07-the-panel/screens/spots.json';
import { sectionOf, textOf } from './html';

// The port of ../landing/scripts/check-panel.mjs: the still section's words, its three described captures, its
// anchors, the screens as files, and the panel's own figures from spots.json.
const html = render();
const panel = sectionOf(html, '07-the-panel');
const text = textOf(panel);
const SCREENS = new URL('../../src/sections/07-the-panel/screens/', import.meta.url);

describe('section 7, the panel', () => {
  it('says everything in the brief, with no motion', () => {
    for (const copy of [
      'The panel',
      'Fifteen minutes a week.',
      'It tells you what to fix.',
      'You do not have to predict what to configure. The panel shows you what is missing.',
      'Home',
      'Good morning, Siti. Today at a glance.',
      'Needs attention',
      'A little attention. A smoother flow. Three areas to review.',
      'A notification rule',
      'You define the flow. See the impact before you save.',
      'Our target: up and running in under twenty minutes.', // a target, and called one
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('has three still screenshots, each described, and exactly one thread entrance and exit', () => {
    const images = [...panel.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/g)];
    expect(images, 'three still screenshots, each described').toHaveLength(3);
    for (const [, src, alt] of images) {
      expect(src).toMatch(/\.webp$/);
      expect(alt.length, src).toBeGreaterThan(0);
    }
    for (const anchor of ['in', 'out']) {
      expect(
        panel.match(new RegExp(`data-thread-${anchor}\\b`, 'g')),
        `${anchor} anchor`,
      ).toHaveLength(1);
    }
  });

  it('copies the seven screens as files, next to the section', () => {
    const files = readdirSync(SCREENS);
    for (const name of [
      'home',
      'home-content',
      'attention',
      'rule-0',
      'rule-1',
      'rule-2',
      'rule-3',
    ]) {
      expect(files, name).toContain(`${name}.webp`);
      expect(existsSync(new URL(`${name}.webp`, SCREENS)), name).toBe(true);
    }
    expect(files).toContain('spots.json');
  });

  it("holds the panel's own figures, the count, the record and the saved rule", () => {
    expect(spots.stats.map((stat) => stat.text)).toEqual(['1,284', '48', '156', '7']);
    expect(spots.count.text).toBe('04');
    expect(spots.order.text).toMatch(/ORD-0091/);
    expect(spots.savedActive && spots.toggle).toBeTruthy();
  });
});
