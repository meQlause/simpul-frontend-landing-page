export const SVG_NS = 'http://www.w3.org/2000/svg';

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

export function segment(value: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}
