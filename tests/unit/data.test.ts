import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { sectionOf, textOf } from './html';

// The port of ../landing/scripts/check-data.mjs: section 8 reads with no motion, sits between the panel and the close,
// and claims no more than the product specification does. Page order is page.test.ts's job, so it is not repeated here.
const data = sectionOf(render(), '08-your-data');
const text = textOf(data);

const count = (block: string | undefined) => (block?.match(/<li\b/g) ?? []).length;
const listOf = (name: string) =>
  data.match(new RegExp(`<ol class="${name}">([\\s\\S]*?)</ol>`))?.[1];

describe('section 8, your data', () => {
  it('says everything with no motion', () => {
    for (const copy of [
      'Your data',
      'Your data stays yours.',
      'Keep it in your own database.',
      'Simpul can run on a PostgreSQL database you provide.',
      'Simpul keeps three things',
      'Your sign-in',
      'Your workspace name',
      'An encrypted link to your database',
      'What stays in your database',
      'Messages',
      'Work items',
      'People and rules',
      'Notifications',
      'History',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('keeps the note out, lists three things and five layers, our side first', () => {
    expect(text, 'the note is gone: the headline and the two sides say it').not.toMatch(
      /Optional\./,
    );
    expect(count(listOf('data-kept')), 'three things on our side').toBe(3);
    expect(count(listOf('data-layers')), 'five named layers on theirs').toBe(5);
    expect(data.indexOf('data-kept'), 'our side is listed first, in full').toBeLessThan(
      data.indexOf('data-layers'),
    );
  });

  it('draws all five layers with motion off: a full six by six of cells each, 180 in all', () => {
    expect(data.match(/data-layer=""/g), 'with motion off, all five layers are drawn').toHaveLength(
      5,
    );
    expect(data.match(/class="cell /g), 'each layer is a full six by six of cells').toHaveLength(
      180,
    );
  });

  it('has four decorative drawings and three drawn things, one per thing kept', () => {
    expect(data.match(/<svg aria-hidden="true"/g), 'the four drawings are decoration').toHaveLength(
      4,
    );
    expect(
      data.match(/<g class="thing" data-thing="">/g),
      'each thing kept has its own drawing',
    ).toHaveLength(3);
  });

  it('has no call to action, and no overclaim', () => {
    expect(
      data.match(/<button\b|<a\b/g),
      'no second call to action: the close has the one',
    ).toBeNull();
    expect(text, 'messages do pass through Simpul').not.toMatch(
      /never (see|touch|read)|zero[- ]knowledge|end-to-end/i,
    );
  });

  it('has exactly one thread anchor in and one out', () => {
    for (const anchor of ['in', 'out']) {
      expect(
        data.match(new RegExp(`data-thread-${anchor}\\b`, 'g')),
        `${anchor} anchor`,
      ).toHaveLength(1);
    }
  });
});
