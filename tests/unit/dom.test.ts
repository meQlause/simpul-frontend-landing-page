import { describe, expect, it } from 'vitest';
import { all, one, segment } from '../../src/motion/dom';
import { mark } from '../../src/motion/mark';

const HIT = '.hit';
const hit = { id: 'hit' };
const root = {
  querySelector: (selector: string) => (selector === HIT ? hit : null),
  querySelectorAll: (selector: string) => (selector === HIT ? [hit] : []),
} as unknown as ParentNode;

describe('segment', () => {
  it('is 0 before the start, 1 after the end, and linear between', () => {
    expect(segment(1, 2, 4)).toBe(0);
    expect(segment(5, 2, 4)).toBe(1);
    expect(segment(3, 2, 4)).toBe(0.5);
  });
});

describe('one and all', () => {
  it('one returns the element, or throws when the markup has no match', () => {
    expect(one(root, HIT)).toBe(hit);
    expect(() => one(root, '.missing')).toThrow('Missing .missing');
  });

  it('all returns every match as an array', () => {
    expect(all(root, HIT)).toEqual([hit]);
    expect(all(root, '.missing')).toEqual([]);
  });
});

describe('mark', () => {
  it('is the logo as SVG markup', () => {
    expect(mark.trimStart().startsWith('<svg')).toBe(true);
  });
});
