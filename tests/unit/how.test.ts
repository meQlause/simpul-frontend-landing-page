import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { sectionOf, textOf } from './html';

const html = render();
const how = sectionOf(html, '04-how-it-works');

describe('section 4, how it works', () => {
  it('says everything in the brief, with no motion', () => {
    const text = textOf(how);

    for (const copy of [
      'AI understands.',
      'You decide.',
      'Simpul routes.',
      'Three cases for Mrs. Sri are ready to ship.',
      'Understand',
      'Decide',
      'Route',
      'Ready to ship, notify sales',
      'Rina Anggraini',
      'Siti Aminah',
      'Backup for Rina',
      'ORD-0091 · Mrs. Sri',
      'Already shipped',
      'In progress',
      'There is a blocker',
      'Not this work',
      'The AI only describes what was said. It cannot send anything, and it does not choose who is told.',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('has its accessible heading, three numbered steps in order, and one matching rule', () => {
    expect(how).toMatch(/<h2\b[^>]*id="how-title"/);
    expect([...how.matchAll(/<h3><b>(\d)<\/b>/g)].map((match) => match[1])).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(how.match(/class="is-match"/g)).toHaveLength(1);
  });

  it('keeps the arrival an illustration: nothing in it looks clickable to assistive tech', () => {
    const notice = how.match(/<article class="how-notice"[\s\S]*?<\/article>/)?.[0] ?? '';

    expect(notice).not.toMatch(/<button\b/);
  });

  it('has exactly one thread entrance and one exit', () => {
    expect(how.match(/data-thread-in\b/g)).toHaveLength(1);
    expect(how.match(/data-thread-out\b/g)).toHaveLength(1);
  });
});
