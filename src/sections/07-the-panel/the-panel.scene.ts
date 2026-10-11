import { all, segment, SVG_NS } from '../../motion/dom';
import type { Shared } from '../../motion/types';
import { type Box, type Point, CARD_HTML } from './the-panel.data';
import { DASH_GAP, DRAW_VISIBLE, type Span } from './the-panel.tuning';

export const VISIBLE = 'visible';

export const HIDDEN = 'hidden';

export interface Panel {
  root: HTMLElement;
  shared: Shared;
  card: HTMLElement;
  svg: SVGSVGElement;
  shots: HTMLElement[];
}

export interface Arrival extends Point {
  angle: number;
}

export const share = (time: number, span: Span): number => segment(time, span.from, span.to);

export function addNode(parent: Element, tag: string, className: string, html = ''): HTMLElement {
  const node = document.createElement(tag);

  node.className = className;
  node.innerHTML = html;

  return parent.appendChild(node);
}

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

export function dashedStrand(svg: SVGSVGElement): SVGPathElement {
  const path = addStrand(svg);

  path.setAttribute('pathLength', '1');

  return path;
}

export function draw(path: SVGPathElement, drawn: number): void {
  path.style.strokeDasharray = `${Math.max(0, drawn)} ${DASH_GAP}`;
  path.style.visibility = drawn > DRAW_VISIBLE ? VISIBLE : HIDDEN;
}

export function fade(node: HTMLElement, opacity: number): void {
  node.style.opacity = String(opacity);
}

export function arrivalOf(panel: Panel): Arrival {
  return (
    panel.shared.handoff.incoming(panel.root) ?? { x: panel.root.offsetWidth / 2, y: 0, angle: 0 }
  );
}

export function mountPanel(root: HTMLElement, shared: Shared): Panel {
  const card = addNode(root, 'div', 'panel-card', CARD_HTML);

  card.setAttribute('aria-hidden', 'true');
  const svg = root.insertBefore(document.createElementNS(SVG_NS, 'svg'), root.firstChild);

  svg.setAttribute('class', 'panel-thread');
  svg.setAttribute('aria-hidden', 'true');

  return { root, shared, card, svg, shots: all(root, '.panel-shot') };
}
