// Boundary ownership belongs to the page. A section only moves its own copy of the carried object;
// the page tells it where the previous section left that object, and hides the previous copy once
// this section has taken it.
interface Arrival {
  x: number;
  y: number;
  angle: number;
}

export interface Handoff {
  incoming: (root: HTMLElement) => Arrival | null;
  receive: (root: HTMLElement, received: boolean) => void;
}

export function createHandoff(roots: readonly HTMLElement[]): Handoff {
  const previous = (root: HTMLElement): HTMLElement | undefined => roots[roots.indexOf(root) - 1];
  return {
    incoming(root) {
      const before = previous(root);
      const object = before?.querySelector<HTMLElement>('[data-handoff-object]');
      if (!before || !object?.hasAttribute('data-exit-x')) {
        return null;
      }
      return {
        x:
          before.getBoundingClientRect().left -
          root.getBoundingClientRect().left +
          Number(object.dataset.exitX),
        y: Number(object.dataset.exitY) - before.offsetHeight,
        angle: Number(object.dataset.exitAngle),
      };
    },
    receive(root, received) {
      previous(root)?.toggleAttribute('data-handed-off', received);
    },
  };
}
