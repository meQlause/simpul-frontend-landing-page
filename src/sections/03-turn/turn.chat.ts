import { one } from '../../motion/dom';
import type { ChatGeo, Item, Scene } from './turn.scene';
import { BLIP, CHAT, DOT, HALF, LAYER, LOCK, PHASE } from './turn.tuning';

export function restingLayer(root: HTMLElement): { x: number; y: number; w: number; winY: number } {
  const box = root.getBoundingClientRect();
  const win = one(root, '.turn-window').getBoundingClientRect();
  const inset = parseFloat(getComputedStyle(root).getPropertyValue('--inset'));

  return {
    x: win.left - box.left - inset,
    y: win.top - box.top - inset,
    w: win.width + inset * 2,
    winY: win.top - box.top,
  };
}

function measureItems(items: Item[], feedX: number, lineX: number): void {
  for (const item of items) {
    const bubble = item.el.lastElementChild as HTMLElement;

    item.top = item.el.offsetTop;
    item.h = item.el.offsetHeight;
    item.dotX = feedX + bubble.offsetLeft + DOT.inset - lineX;
  }
}

function phaseOf(scene: Scene, payment: Item, lineY: number, cycle: number): number {
  const lockAt =
    (innerHeight * (scene.phone ? LOCK.phone : LOCK.desk) + restingLayer(scene.root).winY) /
    (scene.root.getBoundingClientRect().height + innerHeight);

  return (
    payment.top + payment.h / 2 - lineY + PHASE.lead - lockAt * cycle * CHAT.scrollRate - PHASE.pad
  );
}

export function measureChat(scene: Scene): void {
  const { root, feed, reading, items, originals, clones } = scene;
  const layer = restingLayer(root);
  const feedBox = feed.getBoundingClientRect();
  const rootBox = root.getBoundingClientRect();
  const line = reading.getBoundingClientRect();
  const feedX = feedBox.left - rootBox.left;
  const feedY = feedBox.top - rootBox.top;
  const lineX = layer.x + LAYER.edge + reading.offsetLeft;
  const cycle = clones[0].offsetTop - originals[0].offsetTop;
  const lineY = line.top - rootBox.top + line.height / 2 - feedY;

  measureItems(items, feedX, lineX);
  const payment = items.find((item) => item.signal) ?? items[0];

  scene.chatGeo = { cycle, lineY, phase: phaseOf(scene, payment, lineY, cycle) };
}

function blip(scene: Scene, item: Item): void {
  const { gsap } = scene.shared;
  const style = item.signal ? BLIP.signal : BLIP.other;

  gsap.fromTo(
    scene.dot,
    {
      x: item.dotX,
      autoAlpha: BLIP.start.alpha,
      scale: BLIP.start.scale,
      backgroundColor: style.colour,
    },
    {
      autoAlpha: 0,
      scale: style.scale,
      duration: style.duration,
      ease: 'power2.out',
      overwrite: true,
    },
  );
}

function loopOffset(scene: Scene, geo: ChatGeo): { offset: number; wrapped: boolean } {
  const { gsap } = scene.shared;
  const raw =
    scene.chat.time * CHAT.speed + scene.chat.scroll * geo.cycle * CHAT.scrollRate + geo.phase;
  const offset = gsap.utils.wrap(0, geo.cycle, raw);
  const wrapped = Math.abs(offset - scene.lastOffset) > geo.cycle * HALF;

  scene.lastOffset = offset;

  return { offset, wrapped };
}

function moveList(scene: Scene, offset: number, wrapped: boolean): void {
  scene.list.style.transform = `translate3d(0, ${-offset}px, 0)`;

  if (wrapped) {
    scene.list.classList.add('is-wrapping');
    requestAnimationFrame(() => scene.list.classList.remove('is-wrapping'));
  }
}

function readItem(scene: Scene, item: Item, read: boolean, wrapped: boolean): void {
  const { gsap } = scene.shared;

  if (read === item.read) {
    return;
  }

  item.read = read;
  item.el.classList.toggle('is-read', read);

  if (!item.meaning) {
    return;
  }

  gsap.killTweensOf(item.meaning);
  item.meaning.textContent = item.text;

  if (read && !wrapped) {
    gsap.fromTo(
      item.meaning,
      { scrambleText: '' },
      {
        duration: CHAT.scramble.duration,
        scrambleText: { text: item.text, chars: 'lowerCase', speed: CHAT.scramble.speed },
      },
    );
  }
}

const readable = (item: Item, centre: number, lineY: number): boolean =>
  item.signal && centre < lineY && centre > -item.h;

function placeMessages(scene: Scene, lineY: number, offset: number, wrapped: boolean): void {
  const locked = scene.layerP > CHAT.locked;

  for (const item of scene.items) {
    const centre = item.top + item.h / 2 - offset;

    if (locked && !wrapped && item.centre >= lineY && centre < lineY) {
      blip(scene, item);
    }

    item.centre = centre;
    readItem(scene, item, locked && readable(item, centre, lineY), wrapped);
  }
}

export function paint(scene: Scene): void {
  const geo = scene.chatGeo;

  if (!geo) {
    return;
  }

  const { offset, wrapped } = loopOffset(scene, geo);

  moveList(scene, offset, wrapped);
  placeMessages(scene, geo.lineY, offset, wrapped);
}
