import { all, SVG_NS } from '../../motion/dom';
import { LOST_TILES } from './problem.tuning';

interface RedLine {
  tile: number;
  line: SVGPathElement;
  link: HTMLElement;
}

export interface RedLines {
  svg: SVGSVGElement;
  lines: RedLine[];
}

function lineOf(link: HTMLElement, root: HTMLElement): string {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = link;

  while (node && node !== root) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }

  const level = top + link.offsetHeight / 2;

  return `M${left},${level} L${left + link.offsetWidth},${level}`;
}

export function buildRedLines(root: HTMLElement): RedLines {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const links = all<HTMLElement>(root, '.chain-link');
  const lines = LOST_TILES.flatMap(({ tile }) => {
    const link = links.at(tile);

    if (!link) {
      return [];
    }

    const line = svg.appendChild(document.createElementNS(SVG_NS, 'path'));

    line.setAttribute('pathLength', '1');
    line.style.strokeDasharray = '1';
    line.style.strokeDashoffset = '1';

    return [{ tile, line, link }];
  });

  svg.classList.add('problem-lost');
  svg.setAttribute('aria-hidden', 'true');
  root.append(svg);

  return { svg, lines };
}

export function measureRedLines(redLines: RedLines, root: HTMLElement): void {
  redLines.svg.setAttribute('viewBox', `0 0 ${root.offsetWidth} ${root.offsetHeight}`);
  redLines.lines.forEach(({ line, link }) => line.setAttribute('d', lineOf(link, root)));
}
