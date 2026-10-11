import { describe, expect, it } from 'vitest';
import { createHandoff } from '../../src/motion/handoff';
import { seeded } from '../../src/motion/random';

describe('seeded', () => {
  it('repeats the same sequence for the same seed, inside [0, 1)', () => {
    const [first, second] = [seeded(7), seeded(7)];
    const values = Array.from({ length: 50 }, () => first());

    expect(Array.from({ length: 50 }, () => second())).toEqual(values);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(seeded(8)()).not.toBe(values[0]);
  });
});

describe('handoff', () => {
  const fake = (left: number, extra: object = {}) =>
    ({ getBoundingClientRect: () => ({ left }), ...extra }) as unknown as HTMLElement;

  it('starts the catch at the previous section exit, tilt included, and toggles its copy', () => {
    const attributes = new Set<string>();
    const object = {
      hasAttribute: () => true,
      dataset: { exitX: '450', exitY: '854', exitAngle: '-2.8' },
    };
    const previous = fake(20, {
      offsetHeight: 900,
      querySelector: () => object,
      toggleAttribute: (name: string, present: boolean) =>
        present ? attributes.add(name) : attributes.delete(name),
    });
    const current = fake(5);
    const handoff = createHandoff([previous, current]);

    expect(handoff.incoming(current)).toEqual({ x: 465, y: -46, angle: -2.8 });
    handoff.receive(current, true);
    expect(attributes.has('data-handed-off')).toBe(true);
    handoff.receive(current, false);
    expect(attributes.has('data-handed-off')).toBe(false);
  });

  it('has nothing incoming for the first section', () => {
    const only = fake(0);

    expect(createHandoff([only]).incoming(only)).toBeNull();
  });
});
