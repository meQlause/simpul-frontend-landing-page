import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { MOTIONS } from '../../src/sections/motions';
import { SECTIONS } from '../../src/sections';
import { sectionOf } from './html';

const ORDER = [
  '01-hero',
  '02-problem',
  '03-turn',
  '04-how-it-works',
  '05-for-each-person',
  '06-quiet-by-design',
  '07-the-panel',
  '08-your-data',
  '09-close',
];

describe('the page', () => {
  const html = render();

  it('renders the nine sections, in order, on the server', () => {
    const ids = [...html.matchAll(/data-section="([\w-]+)"/g)].map((match) => match[1]);
    expect(ids).toEqual(ORDER);
  });

  it('gives every section exactly one in-anchor and one out-anchor', () => {
    for (const id of ORDER) {
      const section = sectionOf(html, id);
      expect(section.match(/data-thread-in=/g), id).toHaveLength(1);
      expect(section.match(/data-thread-out=/g), id).toHaveLength(1);
    }
  });

  it('has no duplicate ids anywhere in the page', () => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('registers markup and motion for the same sections, in the same order', () => {
    expect(SECTIONS.map((section) => section.id)).toEqual(ORDER);
    expect(MOTIONS.map((motion) => motion.id)).toEqual(ORDER);
  });
});
