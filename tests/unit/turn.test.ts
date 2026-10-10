import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { initTurn } from '../../src/sections/03-turn/turn.motion';
import { sectionOf, textOf } from './html';

// The port of ../landing/scripts/check-turn.mjs: what the still turn says, and that it never pins.
const html = render();
const turn = sectionOf(html, '03-turn');

describe('section 3, the turn', () => {
  it('says everything with no motion, and no leftover copy from earlier drafts', () => {
    const text = textOf(turn).toLowerCase();
    for (const copy of [
      'the idea',
      'not another tool.',
      'a layer on the ones you already use.',
      'fill in a form',
      'open another app',
      'change how you write',
    ]) {
      expect(text, copy).toContain(copy);
    }
    expect(text).not.toMatch(/whatsapp next|uninterrupted|keeps chatting where they chat/);
  });

  it('has its accessible heading and exactly one thread entrance and exit', () => {
    expect(turn).toMatch(/<h2\b[^>]*id="turn-title"/);
    expect(turn.match(/data-thread-in\b/g)).toHaveLength(1);
    expect(turn.match(/data-thread-out\b/g)).toHaveLength(1);
  });

  it('identifies exactly two meaningful messages among the ordinary ones', () => {
    const tags = turn.split('<');
    const messages = tags.filter((tag) => tag.includes('data-turn-message'));
    const signals = messages.filter((tag) => tag.includes('data-turn-signal'));
    expect(messages.length).toBeGreaterThanOrEqual(6);
    expect(signals).toHaveLength(2);
    expect(signals.length).toBeLessThan(messages.length / 2);
  });

  it('has a native pause control, hidden until the motion runs', () => {
    expect(turn).toMatch(
      /<button\b[^>]*type="button"[^>]*aria-pressed="false"[^>]*hidden[^>]*>Pause chat motion<\/button>/,
    );
  });

  it('never pins: it is a free-scrolling break between pinned sections', () => {
    const source = readFileSync(
      new URL('../../src/sections/03-turn/turn.motion.ts', import.meta.url),
      'utf8',
    );
    expect(source).not.toMatch(/\bpin\s*:/);
  });

  it('does nothing at all with reduced motion, and never touches the DOM', () => {
    const untouched = new Proxy(
      {},
      { get: () => expect.fail('reduced motion must leave the still chat unchanged') },
    );
    const shared = { conditions: { reduce: true } };
    expect(initTurn(untouched as unknown as HTMLElement, shared as never)).toBeUndefined();
  });
});
