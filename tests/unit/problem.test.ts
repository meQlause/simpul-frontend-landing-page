import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import { sectionOf, textOf } from './html';

const html = render();
const problem = sectionOf(html, '02-problem');
const source = (file: string) =>
  readFileSync(new URL(`../../src/sections/02-problem/${file}`, import.meta.url), 'utf8');

describe('section 2, the problem', () => {
  it('says everything in the brief, with no motion', () => {
    const text = textOf(problem);

    for (const copy of [
      'The problem',
      'Everyone is working.',
      'Information still moves by hand.',
      'Customer orders by chat',
      'Sales forwards it by hand',
      'Admin notes it, then asks',
      'Warehouse confirms stock',
      'Finance confirms payment',
      'Sales updates the customer',
      'Every arrow is something a person has to remember.',
      'A hand-off is missed',
      'Nobody knows the status',
      'The context is gone',
      'A decision is not written down',
      'The boss finds out too late',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('draws the chain as six people, five links, and five failures', () => {
    expect(problem.match(/class="chain-person"/g)).toHaveLength(6);
    expect(problem.match(/class="chain-link"/g)).toHaveLength(5);
    expect(problem.match(/class="card"/g)).toHaveLength(5);
  });

  it('keeps every person icon as a file the motion can inline', () => {
    for (const role of ['customer', 'sales', 'admin', 'warehouse', 'finance']) {
      expect(problem, role).toMatch(new RegExp(`data-face="${role}"`));
      expect(source(`people/${role}.svg`), role).toContain('<svg');
    }
  });

  it('loads Matter.js only as the section approaches, never with the page', () => {
    const motion = source('problem.motion.ts');
    const physics = source('problem.physics.ts');

    expect(motion).toMatch(/import\('matter-js'\)/);
    expect(motion).not.toMatch(/^import (?!type )[^;]*matter-js/m);
    expect(physics).not.toMatch(/^import (?!type )[^;]*matter-js/m);
  });
});
