import { SVG_NS, one } from '../../motion/dom';
import type { Card } from './people.card';
import { DRAW, ENTRY, HALF, JOIN, LINKS, RAIL, STRAND, STRANDS, TRUNK } from './people.tuning';

// The section's own thread, behind the cards: the stem, the four strands, the tails that gather them, and
// the trunk that runs on down the page. On a phone, one rail with a link through each card instead.

export interface Threads {
  svg: SVGSVGElement;
  stem: SVGPathElement;
  strands: SVGPathElement[];
  tails: SVGPathElement[];
  links: SVGPathElement[];
  trunk: SVGPathElement;
  bead: SVGCircleElement | null;
}

// The easings the threads are drawn with: the in-out of the strands, and the overshoot of the bead.
export interface Curves {
  inOut: (share: number) => number;
  back: (share: number) => number;
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

// Draws a stroke from its start to `to` (0 to 1). Hidden at 0, so the round cap leaves no dot.
export function drawStroke(node: SVGPathElement | SVGCircleElement, to: number): void {
  node.style.strokeDasharray = `${Math.max(0, to)} 2`;
  node.style.visibility = to > DRAW.hidden ? 'visible' : 'hidden';
}

function strandIn(svg: SVGSVGElement, className = ''): SVGPathElement {
  const node = svg.appendChild(document.createElementNS(SVG_NS, 'path'));
  if (className) {
    node.setAttribute('class', className);
  }
  node.setAttribute('pathLength', '1');
  return node;
}

// Desktop has four strands and four tails; a phone has three links and no bead.
export function buildThreads(root: HTMLElement, phone: boolean): Threads {
  const svg = root.insertBefore(document.createElementNS(SVG_NS, 'svg'), root.firstChild);
  svg.setAttribute('class', 'people-threads');
  svg.setAttribute('aria-hidden', 'true');
  const strands = phone ? [] : Array.from({ length: STRANDS }, () => strandIn(svg));
  const tails = phone ? [] : Array.from({ length: STRANDS }, () => strandIn(svg));
  const links = phone ? Array.from({ length: LINKS }, () => strandIn(svg)) : [];
  const bead = phone ? null : svg.appendChild(document.createElementNS(SVG_NS, 'circle'));
  return {
    svg,
    stem: strandIn(svg),
    strands,
    tails,
    links,
    trunk: strandIn(svg, 'people-trunk'),
    bead,
  };
}

// The stem and the four strands draw as the section comes up. The cards are hung on them.
export function renderEntry(threads: Threads, progress: number, curves: Curves): void {
  drawStroke(threads.stem, clamp(progress / ENTRY.stem));
  threads.strands.forEach((node) =>
    drawStroke(node, curves.inOut(clamp((progress - ENTRY.strandFrom) / ENTRY.strandSpan))),
  );
}

// Once all four are straight they meet below the cards and run on as one thread.
export function renderJoin(
  threads: Threads,
  phone: boolean,
  progress: number,
  curves: Curves,
): void {
  threads.tails.forEach((node, index) =>
    drawStroke(node, curves.inOut(clamp((progress - index * JOIN.stagger) / JOIN.span))),
  );
  const trunkFrom = phone ? TRUNK.phoneFrom : TRUNK.deskFrom;
  const trunkSpan = phone ? TRUNK.phoneSpan : TRUNK.deskSpan;
  drawStroke(threads.trunk, curves.inOut(clamp((progress - trunkFrom) / trunkSpan)));
  const radius = JOIN.beadRadius * curves.back(clamp((progress - JOIN.beadAt) / JOIN.beadSpan));
  threads.bead?.setAttribute('r', String(radius));
}

// Where an element sits in the section: its offsets, summed up through its offset parents.
function placeOf(
  node: HTMLElement,
  root: HTMLElement,
): { left: number; top: number; width: number; height: number } {
  let left = 0;
  let top = 0;
  let parent: HTMLElement | null = node;
  while (parent && parent !== root) {
    left += parent.offsetLeft;
    top += parent.offsetTop;
    parent = parent.offsetParent as HTMLElement | null;
  }
  return { left, top, width: node.offsetWidth, height: node.offsetHeight };
}

// Every card's top and bottom centre, in the section's own coordinates. The cards' swing is ignored.
export function measureCards(root: HTMLElement, cards: Card[]): void {
  for (const card of cards) {
    const box = placeOf(card.el, root);
    card.state.top = [box.left + box.width / 2, box.top];
    card.state.bottom = [box.left + box.width / 2, box.top + box.height];
  }
}

// The section's size, and the thread's paths for it: the stem and strands for a desktop, a rail for a phone.
export function measureThreads(
  threads: Threads,
  root: HTMLElement,
  cards: Card[],
  phone: boolean,
): void {
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  threads.svg.setAttribute('width', String(width));
  threads.svg.setAttribute('height', String(height));
  threads.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const geometry = { middle: width * HALF, height, cards, root };
  if (phone) {
    placeRail(threads, geometry, width);
    return;
  }
  placeStrands(threads, geometry);
}

interface Geometry {
  middle: number;
  height: number;
  cards: Card[];
  root: HTMLElement;
}

// The rail: down the right edge, past the heading, then through each card in turn.
function placeRail(threads: Threads, geometry: Geometry, width: number): void {
  const { middle, height, cards } = geometry;
  const rail = width - RAIL.inset;
  const [cardLeft, cardTop] = cards[0].state.top;
  threads.stem.setAttribute(
    'd',
    `M${middle},0 C${middle},${RAIL.dropA} ${rail},${RAIL.dropB} ${rail},${RAIL.dropC} L${rail},${cardTop - RAIL.lift} C${rail},${cardTop - RAIL.lowerA} ${cardLeft},${cardTop - RAIL.lowerB} ${cardLeft},${cardTop}`,
  );
  threads.links.forEach((node, index) =>
    node.setAttribute(
      'd',
      `M${cards[index].state.bottom.join(',')} L${cards[index + 1].state.top.join(',')}`,
    ),
  );
  threads.trunk.setAttribute(
    'd',
    `M${cards[STRANDS - 1].state.bottom.join(',')} L${middle},${height}`,
  );
}

// The desktop: the stem from the heading to the cards, a strand to each card, and the tails back down to
// one join, from which the trunk runs on.
function placeStrands(threads: Threads, geometry: Geometry): void {
  const { middle, height, cards, root } = geometry;
  const cardTop = cards[0].state.top[1];
  const head = placeOf(one(root, '.people-head'), root);
  const stemY = cardTop - (cardTop - head.top - head.height) * STRAND.stemShare;
  threads.stem.setAttribute('d', `M${middle},0 L${middle},${stemY}`);
  threads.strands.forEach((node, index) => {
    const [cardLeft, cardY] = cards[index].state.top;
    const pull = (cardY - stemY) * STRAND.pull;
    node.setAttribute(
      'd',
      `M${middle},${stemY} C${middle},${stemY + pull} ${cardLeft},${cardY - pull} ${cardLeft},${cardY}`,
    );
  });
  const bottom = cards[0].state.bottom[1];
  const joinY = bottom + (height - bottom) * JOIN.at;
  threads.tails.forEach((node, index) => {
    const [cardLeft] = cards[index].state.bottom;
    const pull = (joinY - bottom) * JOIN.tailPull;
    node.setAttribute(
      'd',
      `M${cardLeft},${bottom} C${cardLeft},${bottom + pull} ${middle + (middle - cardLeft) * JOIN.tailSway},${joinY - pull} ${middle},${joinY}`,
    );
  });
  threads.trunk.setAttribute('d', `M${middle},${joinY} L${middle},${height}`);
  threads.bead?.setAttribute('cx', String(middle));
  threads.bead?.setAttribute('cy', String(joinY));
}
