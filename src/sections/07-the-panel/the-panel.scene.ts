import { all, segment, SVG_NS } from '../../motion/dom';
import type { Shared } from '../../motion/types';
import { type Box, type Point, CARD_HTML } from './the-panel.data';
import { DASH_GAP, DRAW_VISIBLE, type Span } from './the-panel.tuning';

export const VISIBLE = 'visible';
export const HIDDEN = 'hidden';

// What the section made on the page: the card and the thread it draws, and the three captions.
export interface Panel {
  root: HTMLElement;
  shared: Shared;
  card: HTMLElement;
  svg: SVGSVGElement;
  shots: HTMLElement[];
}

// Where section 6 left the card, in this section's coordinates (its own in-anchor when run alone).
export interface Arrival extends Point {
  angle: number;
}

// How far a value has got through a span of the clock, clamped to 0..1.
export const share = (time: number, span: Span): number => segment(time, span.from, span.to);

// Adds a node to the parent, as the vanilla `el` did: a class, the inner HTML, appended last.
export function addNode(parent: Element, tag: string, className: string, html = ''): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  node.innerHTML = html;
  return parent.appendChild(node);
}

// Where a node sits inside the section, from its offset chain (the section's own box is the origin).
export function boxIn(root: HTMLElement, node: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let inner: HTMLElement | null = node;
  while (inner && inner !== root) {
    left += inner.offsetLeft;
    top += inner.offsetTop;
    inner = inner.offsetParent instanceof HTMLElement ? inner.offsetParent : null;
  }
  return { x: left, y: top, w: node.offsetWidth, h: node.offsetHeight };
}

export function sizeSvg(svg: SVGSVGElement, width: number, height: number): void {
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
}

export function addStrand(svg: SVGSVGElement): SVGPathElement {
  return svg.appendChild(document.createElementNS(SVG_NS, 'path'));
}

// A strand whose drawn part is a share of its length, so it can be drawn with dashes.
export function dashedStrand(svg: SVGSVGElement): SVGPathElement {
  const path = addStrand(svg);
  path.setAttribute('pathLength', '1');
  return path;
}

// Draws a strand to this share of its length: the dash is the drawn part, then a gap.
export function draw(path: SVGPathElement, drawn: number): void {
  path.style.strokeDasharray = `${Math.max(0, drawn)} ${DASH_GAP}`;
  path.style.visibility = drawn > DRAW_VISIBLE ? VISIBLE : HIDDEN;
}

export function fade(node: HTMLElement, opacity: number): void {
  node.style.opacity = String(opacity);
}

// Where section 6's card arrives: the page's hand-off, or the centre top of this section when run alone.
export function arrivalOf(panel: Panel): Arrival {
  return (
    panel.shared.handoff.incoming(panel.root) ?? { x: panel.root.offsetWidth / 2, y: 0, angle: 0 }
  );
}

// The card, and this section's own thread, made the vanilla way and kept for the cleanup.
export function mountPanel(root: HTMLElement, shared: Shared): Panel {
  const card = addNode(root, 'div', 'panel-card', CARD_HTML);
  card.setAttribute('aria-hidden', 'true');
  const svg = root.insertBefore(document.createElementNS(SVG_NS, 'svg'), root.firstChild);
  svg.setAttribute('class', 'panel-thread');
  svg.setAttribute('aria-hidden', 'true');
  return { root, shared, card, svg, shots: all(root, '.panel-shot') };
}
