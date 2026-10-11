import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { sectionOf, textOf } from './html';

// The port of ../landing/scripts/check-close.mjs: section 9 works with no motion. The logo, the headline, one real
// button, the four lines, and a form that asks for one thing.
const close = sectionOf(render(), '09-close');
const text = textOf(close);

describe('section 9, the close', () => {
  it('says everything with no motion', () => {
    for (const copy of [
      'Stay informed.',
      'Important updates are accounted for.',
      'Work email',
      'Join the pilot',
      'We will only use it to contact you about the pilot.',
      'Not a new chat app.',
      'Not an ERP.',
      'Not a dashboard.',
      'Not surveillance.',
      'Made first for distributors, trading companies, B2B services and small manufacturers whose day runs in group chats.',
      'simpul',
      'Made for work that flows.',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('has one call to action, a real button with its label from the first paint', () => {
    expect(
      close.match(/<button\b/g),
      'one call to action: a second button halves the first',
    ).toHaveLength(1);
    expect(close).toMatch(/<button\b[^>]*type="submit"[^>]*>Join the pilot<\/button>/);
  });

  it('asks for one thing: the email field, and a second field only a bot fills', () => {
    const fields = [...close.matchAll(/<input\b[^>]*name="(\w+)"[^>]*>/g)];
    expect(fields.map((match) => match[1])).toEqual(['email', 'company']);
    expect(fields[1][0], 'the trap is out of reach of people and screen readers').toMatch(
      /tabindex="-1"[^>]*aria-hidden="true"/,
    );
  });

  it('labels the field, announces the status, and shows the logo with motion off', () => {
    expect(close).toMatch(/<label for="join-email">Work email<\/label>/);
    expect(close).toMatch(/data-status="" role="status" aria-live="polite"/);
    expect(close).toMatch(/<div class="close-mark"[^>]*><img\b[^>]*simpul-mark/);
  });

  it('has no invented proof', () => {
    expect(text).not.toMatch(/testimonial|trusted by|customers love/i);
  });

  it('has exactly one thread anchor in and one out', () => {
    for (const anchor of ['in', 'out']) {
      expect(
        close.match(new RegExp(`data-thread-${anchor}(?![\\w-])`, 'g')),
        `${anchor} anchor`,
      ).toHaveLength(1);
    }
  });
});
