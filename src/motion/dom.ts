export const SVG_NS = 'http://www.w3.org/2000/svg';

// Typed lookups inside a section root. `one` throws when the markup and the motion disagree:
// that is a bug to fix in the markup, not a case to handle.
export function one<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) {
    throw new Error(`Missing ${selector}`);
  }
  return found;
}

export function all<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
  return [...root.querySelectorAll<T>(selector)];
}

// How far a value has got from start to end, clamped to 0..1. The vanilla `seg(v, a, b)`.
export function segment(value: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}
