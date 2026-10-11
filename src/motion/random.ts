const STEP = 0x6d2b79f5;
const SHIFT = { first: 15, second: 7, last: 14 };
const ODD = 61;
const RANGE = 4294967296;

export function seeded(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + STEP) | 0;
    let mixed = Math.imul(state ^ (state >>> SHIFT.first), 1 | state);

    mixed = (mixed + Math.imul(mixed ^ (mixed >>> SHIFT.second), ODD | mixed)) ^ mixed;

    return ((mixed ^ (mixed >>> SHIFT.last)) >>> 0) / RANGE;
  };
}
