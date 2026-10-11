import { describe, expect, it } from 'vitest';
import { knots, untie, type Knot } from '../../src/sections/05-for-each-person/knots';
import { HEIGHT, POINTS } from '../../src/sections/05-for-each-person/people.tuning';
import { render } from '../../src/entry-server';
import { sectionOf, textOf } from './html';

const html = render();
const people = sectionOf(html, '05-for-each-person');
const PULL = { x: 40, y: -25, at: 0.4 };
const TIED_WIDTH = 20;
const APART = 15;

describe('section 5, for each person', () => {
  it('says everything in the brief, with no motion', () => {
    const text = textOf(people);

    for (const copy of [
      'Who it is for',
      'Four people.',
      'Four knots untied.',
      'Rina',
      'sales admin',
      '“Tired of asking over and over. Sometimes I forget which are done.”',
      'She never has to remember who to tell.',
      'Budi',
      'warehouse lead',
      '“They keep asking, and I already said it yesterday.”',
      'He reports once. One tap stops the reminders.',
      'Siti',
      'operations manager',
      '“I only find out after the customer complains.”',
      'She sees what is stuck before it becomes a problem.',
      'Mr. Hendra',
      'director',
      '“I am told when it is already late.”',
      'One digest. Never a flood of operational pings.',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it("has four focusable cards, in the knots' order, each holding a straight still line", () => {
    const cards = [...people.matchAll(/<li class="person" ([^>]*)>([\s\S]*?)<\/li>/g)];

    expect(cards.map(([, attrs]) => attrs.match(/data-person="(\w+)"/)?.[1])).toEqual(
      Object.keys(knots),
    );

    for (const [, attrs, body] of cards) {
      expect(attrs).toMatch(/tabindex="0"/);
      expect(body).toMatch(/<path d="M100 0V120"/);
      expect(body.indexOf('<blockquote')).toBeLessThan(body.indexOf('<p>'));
    }
  });

  it('has exactly one thread entrance and one exit', () => {
    expect(people.match(/data-thread-in\b/g)).toHaveLength(1);
    expect(people.match(/data-thread-out\b/g)).toHaveLength(1);
  });
});

const near = (actual: number, expected: number, label: string) => {
  expect(Math.abs(actual - expected), label).toBeLessThan(1e-6);
};

describe('the knots', () => {
  it.each(Object.entries(knots))(
    '%s: POINTS points, tied at both ends whatever the progress',
    (name, knot: Knot) => {
      expect(knot.main).toHaveLength(POINTS);

      for (const progress of [0, 0.3, 0.7, 1]) {
        const { line } = untie(knot, progress, PULL);

        near(line[0][0], 0, `${name} top x at ${progress}`);
        near(line[0][1], 0, `${name} top y at ${progress}`);
        near(line[line.length - 1][0], 0, `${name} bottom x at ${progress}`);
        near(line[line.length - 1][1], HEIGHT, `${name} bottom y at ${progress}`);
      }
    },
  );

  it.each(Object.entries(knots))(
    '%s: untied, it is a straight line and its extra threads are gone',
    (name, knot: Knot) => {
      const straight = untie(knot, 1);

      straight.line.forEach(([left, top], index) => {
        near(left, 0, `${name} untied x`);
        near(top, (HEIGHT * index) / (POINTS - 1), `${name} untied y`);
      });
      expect(straight.fade).toBe(0);
    },
  );

  it.each(Object.entries(knots))('%s: tied, it is actually tangled', (name, knot: Knot) => {
    const tied = untie(knot, 0).line;

    expect(Math.max(...tied.map(([left]) => Math.abs(left)))).toBeGreaterThan(TIED_WIDTH);
  });

  it('gives four knots that look different from one another', () => {
    const shapes = Object.fromEntries(
      Object.entries(knots).map(([name, knot]) => [name, untie(knot, 0).line]),
    );
    const names = Object.keys(shapes);

    for (const [index, first] of names.entries()) {
      for (const second of names.slice(index + 1)) {
        const apart =
          shapes[first].reduce(
            (sum, [left, top], point) =>
              sum + Math.hypot(left - shapes[second][point][0], top - shapes[second][point][1]),
            0,
          ) / POINTS;

        expect(apart, `${first} and ${second}`).toBeGreaterThan(APART);
      }
    }
  });
});
