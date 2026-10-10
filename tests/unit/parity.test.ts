import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { classesOf, hooksOf, sectionOf, textOf } from './html';
import { PORTED } from './ported';

// Every ported section must say the same words, use the same classes and carry the same data-*
// hooks as the vanilla page, so its CSS and its motion find what they expect.
// Build the vanilla page first: `cd ../landing && npm run build`. LANDING_DIST overrides the path.
const VANILLA =
  process.env.LANDING_DIST ??
  fileURLToPath(new URL('../../../landing/dist/index.html', import.meta.url));

describe.skipIf(!existsSync(VANILLA))('parity with the vanilla page', () => {
  const vanilla = existsSync(VANILLA) ? readFileSync(VANILLA, 'utf8') : '';
  const react = render();

  it.each(PORTED.length ? PORTED : ['(none ported yet)'])('%s matches', (id) => {
    if (!PORTED.length) {
      return;
    }
    const [before, after] = [sectionOf(vanilla, id), sectionOf(react, id)];
    expect(before, `${id} is missing from ${VANILLA}`).not.toBe('');
    expect(textOf(after)).toBe(textOf(before));
    expect(classesOf(after)).toEqual(classesOf(before));
    expect(hooksOf(after)).toEqual(hooksOf(before));
  });
});
