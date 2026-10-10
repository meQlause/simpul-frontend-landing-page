import { readFileSync } from 'node:fs';
import Matter from 'matter-js';
import { describe, expect, it } from 'vitest';
import { render } from '../../src/entry-server';
import {
  along,
  settle,
  stepAt,
  type Geo,
  type Plan,
} from '../../src/sections/06-quiet-by-design/heap';
import { simulate } from '../../src/sections/06-quiet-by-design/heap.physics';
import {
  LIMIT,
  SETTLED,
  STORM,
  TAKE,
} from '../../src/sections/06-quiet-by-design/quiet-by-design.tuning';
import { sectionOf, textOf } from './html';

// The port of ../landing/scripts/check-quiet.mjs: the still section's words, its one card and its anchors,
// and the heap's promises. The heap is checked on the desktop stage (with Matter.js) and the phone stage.
const html = render();
const quiet = sectionOf(html, '06-quiet-by-design');
const text = textOf(quiet);

const DESKTOP: Geo = { Wp: 700, Hp: 840, floor: 826, cx: 350, cw: 168, ch: 46, sw: 270, sh: 118 };
const PHONE: Geo = { Wp: 351, Hp: 435, floor: 421, cx: 175.5, cw: 124, ch: 38, sw: 196, sh: 74 };
const sizeOf = (take: readonly number[]) => take.reduce((sum, size) => sum + size, 0);

// Every card's place at one physics second, as [x, y]; a card not yet thrown has no place.
function placesAt(plan: Plan, count: number, seconds: number): ([number, number] | null)[] {
  return Array.from({ length: count }, (_unused, index) => {
    const found = plan.track(index, seconds);
    return found ? [found[0], found[1]] : null;
  });
}

// Every card lands on the stage before the storm ends, and the storm is thrown in, not already there.
function expectOnStage(plan: Plan, geo: Geo, count: number, label: string): void {
  placesAt(plan, count, SETTLED - 0.01).forEach((place, index) => {
    const [posX, posY] = place ?? [NaN, NaN];
    const onStage = posX > -1 && posX < geo.Wp + 1 && posY > 0 && posY < geo.floor;
    expect(onStage, `${label}: card ${index} at ${posX},${posY}`).toBe(true);
  });
  expect(plan.track(0, 0), `${label}: the storm is thrown in`).toBeNull();
  expect(
    plan.track(count - 1, STORM),
    `${label}: every card is in the air before gravity`,
  ).not.toBeNull();
}

// The heap is still moving before the first commitment touches it: no card has settled far.
function expectStillHeap(plan: Plan, count: number, label: string): void {
  const now = placesAt(plan, count, SETTLED - 0.01);
  const before = placesAt(plan, count, stepAt(0) - 0.3);
  now.forEach((place, index) => {
    const [posX, posY] = place ?? [NaN, NaN];
    const [laterX, laterY] = before[index] ?? [NaN, NaN];
    expect(
      Math.hypot(posX - laterX, posY - laterY),
      `${label}: card ${index} is still`,
    ).toBeLessThan(2);
  });
}

describe('section 6, quiet by design', () => {
  it('says everything in the brief, with no motion', () => {
    for (const copy of [
      'By design',
      'Fewer notifications.',
      'More clarity.',
      'Most messages should go nowhere. That is the product working.',
      'It waits',
      'Every notification is held for 60 seconds, so a correction can cancel it.',
      'It has a limit',
      'No more than 6 per person per hour. The rest become one summary.',
      'It sleeps',
      'Quiet from 21:00 to 07:00. What can wait arrives in the morning.',
      'It asks instead of guessing',
      'When unsure, one short question in the chat. If nobody answers, it stays silent.',
      'It reads, it does not watch',
      'It is not a tool for monitoring staff.',
      'ORD-0091 · Mrs. Sri',
    ]) {
      expect(text, copy).toContain(copy);
    }
  });

  it('has one clean card beside the list, and exactly one thread entrance and exit', () => {
    expect(quiet.match(/<article class="quiet-card">/g)).toHaveLength(1);
    for (const anchor of ['in', 'out']) {
      expect(
        quiet.match(new RegExp(`data-thread-${anchor}\\b`, 'g')),
        `${anchor} anchor`,
      ).toHaveLength(1);
    }
  });
});

describe('the heap', () => {
  it('lets the limit take more than six, so the cards past it have something to fold', () => {
    expect(TAKE.desktop.limit > LIMIT && TAKE.phone.limit > LIMIT).toBe(true);
  });

  const desktopTake = Object.values(TAKE.desktop);
  const phoneTake = Object.values(TAKE.phone);

  it('desktop: the commitments take their shares, every card once, and every card lands on the stage', () => {
    const plan = simulate(Matter, DESKTOP, desktopTake);
    expect(plan.chosen.map((list) => list.length)).toEqual(desktopTake);
    expect(plan.chosen.flat().sort((first, second) => first - second)).toEqual([
      ...Array(sizeOf(desktopTake)).keys(),
    ]);
    expectOnStage(plan, DESKTOP, sizeOf(desktopTake), 'desktop simulate');
    expectStillHeap(plan, sizeOf(desktopTake), 'desktop simulate');
  });

  it('phone: the commitments take their shares, every card once, and every card lands on the stage', () => {
    const plan = settle(PHONE, phoneTake);
    expect(plan.chosen.map((list) => list.length)).toEqual(phoneTake);
    expect(plan.chosen.flat().sort((first, second) => first - second)).toEqual([
      ...Array(sizeOf(phoneTake)).keys(),
    ]);
    expectOnStage(plan, PHONE, sizeOf(phoneTake), 'phone settle');
  });

  it('desktop fallback: the same story with hand-placed landings, on every stage', () => {
    const plan = settle(DESKTOP, desktopTake);
    expect(plan.chosen.map((list) => list.length)).toEqual(desktopTake);
    expectOnStage(plan, DESKTOP, sizeOf(desktopTake), 'desktop settle');
  });

  it('is the same storm on every visit, on both paths', () => {
    const phoneCount = sizeOf(phoneTake);
    expect(simulate(Matter, DESKTOP, desktopTake).chosen).toEqual(
      simulate(Matter, DESKTOP, desktopTake).chosen,
    );
    expect(settle(PHONE, phoneTake).track(phoneCount - 1, STORM)).toEqual(
      settle(PHONE, phoneTake).track(phoneCount - 1, STORM),
    );
  });

  it('maps the scroll clock onto physics seconds linearly, and holds before the first knot', () => {
    expect(
      along(
        [
          [0, 0],
          [100, 2],
          [100, 2],
          [300, 6],
        ],
        200,
      ),
    ).toBe(4);
    expect(
      along(
        [
          [50, 1],
          [60, 3],
        ],
        10,
      ),
    ).toBe(1);
  });
});

describe('the motion', () => {
  it('loads Matter.js only as the section approaches, never with the page', () => {
    const base = new URL('../../src/sections/06-quiet-by-design/', import.meta.url);
    for (const file of ['quiet-by-design.motion.ts', 'heap.ts', 'heap.physics.ts']) {
      const source = readFileSync(new URL(file, base), 'utf8');
      expect(source, file).not.toMatch(/^import (?!type )[^;]*matter-js/m);
    }
    expect(readFileSync(new URL('quiet-by-design.motion.ts', base), 'utf8')).toMatch(
      /import\('matter-js'\)/,
    );
  });
});
