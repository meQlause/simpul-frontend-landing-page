import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { sectionOf, textOf } from './html';

// The port of ../landing/scripts/check-hero.mjs: what the hero says and links to, with no motion.
const html = render();
const hero = sectionOf(html, '01-hero');

describe('section 1, the hero', () => {
  it('says everything with no motion', () => {
    const text = textOf(hero);
    for (const copy of [
      'Your information flow',
      'Busy conversations.',
      'Clear next steps',
      'Watch the video',
      'Join the pilot',
      'See how it works',
      'AI understands. You decide. Simpul routes.',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('is full screen, with no header bar', () => {
    expect(hero).not.toMatch(/hero-nav/);
  });

  it('offers the video one press away, as a button', () => {
    expect(hero).toMatch(/<button\b[^>]*data-film/);
  });

  it('has its accessible main heading', () => {
    expect(hero).toMatch(/<h1\b[^>]*id="hero-title"/);
  });

  it('shows a finished logo without JavaScript', () => {
    expect(hero).toMatch(/class="hero-symbol"[^>]*>\s*<(?:img|svg)\b/);
  });

  it('has exactly one thread entrance and one exit', () => {
    expect(hero.match(/data-thread-in\b/g)).toHaveLength(1);
    expect(hero.match(/data-thread-out\b/g)).toHaveLength(1);
  });

  it('links to destinations that exist on the page', () => {
    for (const target of ['join', 'how-it-works']) {
      expect(hero, target).toContain(`href="#${target}"`);
      expect(html, target).toContain(`id="${target}"`);
    }
  });

  it('has the logo file it shows, in public/', () => {
    expect(existsSync(new URL('../../public/simpul-mark.png', import.meta.url))).toBe(true);
  });
});
