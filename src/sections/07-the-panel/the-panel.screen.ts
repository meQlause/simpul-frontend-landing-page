import { all, one } from '../../motion/dom';
import { type Box, type Spot, main, RULE_URLS, shot, spots, view } from './the-panel.data';
import { addNode } from './the-panel.scene';
import { NUMBER_BOX, RING_PAD } from './the-panel.tuning';

export interface Screen {
  screen: HTMLElement;
  content: HTMLElement;
  figures: HTMLElement[];
  count: HTMLElement;
  rings: { order: HTMLElement; strip: HTMLElement; item: HTMLElement; focus: HTMLElement };
  frames: HTMLElement[];
  cursor: SVGElement;
}

const HOME_HTML = `<img src="${shot('home')}" alt=""><div class="panel-scroll"><div class="panel-content"><img src="${shot('home-content')}" alt=""></div></div>`;
const ruleHtml = (url: string) => `<img class="panel-rule" src="${url}" alt="">`;
const CURSOR_HTML =
  '<svg class="panel-cursor" viewBox="0 0 24 24"><path d="M4 2.5 19.5 12l-6.6 1.6 3.9 7-2.9 1.6-3.9-7L5 20z"/></svg>';

export function placeOn(node: HTMLElement, box: Box, pad: number): void {
  Object.assign(node.style, {
    left: `${box.x - pad}px`,
    top: `${box.y - pad}px`,
    width: `${box.w + pad * 2}px`,
    height: `${box.h + pad * 2}px`,
  });
}

function numberOn(content: HTMLElement, spot: Spot): HTMLElement {
  const node = addNode(content, 'span', 'panel-num', spot.text);

  Object.assign(node.style, {
    left: `${spot.x - NUMBER_BOX.x}px`,
    top: `${spot.y - NUMBER_BOX.y}px`,
    minWidth: `${spot.w + NUMBER_BOX.width}px`,
    height: `${spot.h + NUMBER_BOX.height}px`,
    padding: '2px 3px',
    font: spot.font,
    letterSpacing: spot.spacing,
    color: spot.color,
    background: spot.bg,
  });

  return node;
}

function ringOn(parent: HTMLElement, spot?: Box, pad = 0): HTMLElement {
  const node = addNode(parent, 'span', 'panel-ring', '');

  if (spot) {
    placeOn(node, spot, pad);
  }

  return node;
}

export function buildScreen(win: HTMLElement): Screen {
  const screen = addNode(win, 'div', 'panel-screen', HOME_HTML + RULE_URLS.map(ruleHtml).join(''));
  const scroller = one(screen, '.panel-scroll');
  const content = one(screen, '.panel-content');

  Object.assign(screen.style, { width: `${view.width}px`, height: `${view.height}px` });
  Object.assign(scroller.style, {
    left: `${main.x}px`,
    top: `${main.y}px`,
    width: `${view.width - main.x}px`,
    height: `${view.height - main.y}px`,
  });
  const figures = spots.stats.map((stat) => numberOn(content, stat));
  const count = numberOn(content, spots.count);
  const rings = {
    order: ringOn(content, spots.order, RING_PAD.order),
    strip: ringOn(content, spots.strip, RING_PAD.strip),
    item: ringOn(content, spots.item, RING_PAD.item),
    focus: ringOn(screen),
  };

  screen.insertAdjacentHTML('beforeend', CURSOR_HTML);

  return {
    screen,
    content,
    figures,
    count,
    rings,
    frames: all(screen, '.panel-rule'),
    cursor: one<SVGElement>(screen, '.panel-cursor'),
  };
}
