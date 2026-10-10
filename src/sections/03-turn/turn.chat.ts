import { one } from '../../motion/dom';
import type { ChatGeo, Item, Scene } from './turn.scene';
import { BLIP, CHAT, DOT, HALF, LAYER, LOCK, PHASE } from './turn.tuning';

// The chat: its own pace plus the scroll. The reading line marks every message it passes, and lifts
// only the messages that need someone to act. The layer decides what is read; it never changes the chat.

// The layer at rest, over the window, in the section's own coordinates.
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

// Each message's place in the loop, and where its dot sits on the reading line.
function measureItems(items: Item[], feedX: number, lineX: number): void {
  for (const item of items) {
    const bubble = item.el.lastElementChild as HTMLElement;
    item.top = item.el.offsetTop;
    item.h = item.el.offsetHeight;
    item.dotX = feedX + bubble.offsetLeft + DOT.inset - lineX;
  }
}

// The loop's starting place: the payment message lands on the reading line just after the layer settles.
function phaseOf(scene: Scene, payment: Item, lineY: number, cycle: number): number {
  const lockAt =
    (innerHeight * (scene.phone ? LOCK.phone : LOCK.desk) + restingLayer(scene.root).winY) /
    (scene.root.getBoundingClientRect().height + innerHeight);
  return (
    payment.top + payment.h / 2 - lineY + PHASE.lead - lockAt * cycle * CHAT.scrollRate - PHASE.pad
  );
}

// Where the loop sits: its length, the reading line, and the phase that lands the payment message on it.
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

// A pulse on the reading line as a message passes it: green and large for one that matters.
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

// Where the loop is now, and whether it just wrapped (a jump, which must not animate the messages).
function loopOffset(scene: Scene, geo: ChatGeo): { offset: number; wrapped: boolean } {
  const { gsap } = scene.shared;
  const raw =
    scene.chat.time * CHAT.speed + scene.chat.scroll * geo.cycle * CHAT.scrollRate + geo.phase;
  const offset = gsap.utils.wrap(0, geo.cycle, raw);
  const wrapped = Math.abs(offset - scene.lastOffset) > geo.cycle * HALF;
  scene.lastOffset = offset;
  return { offset, wrapped };
}

// The list moves; on a wrap it turns off its transitions for one frame.
function moveList(scene: Scene, offset: number, wrapped: boolean): void {
  scene.list.style.transform = `translate3d(0, ${-offset}px, 0)`;
  if (wrapped) {
    scene.list.classList.add('is-wrapping');
    requestAnimationFrame(() => scene.list.classList.remove('is-wrapping'));
  }
}

// A message is read when the layer has landed and it has passed the line: its meaning decodes itself.
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

// A message that needs someone to act has passed the reading line and is still in view of it.
const readable = (item: Item, centre: number, lineY: number): boolean =>
  item.signal && centre < lineY && centre > -item.h;

// Every message's place on the line, for the pulse and for the reading.
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

// One frame of the chat. Scrolling and the chat's own clock both move it; the layer's landing decides
// which messages can be read.
export function paint(scene: Scene): void {
  const geo = scene.chatGeo;
  if (!geo) {
    return;
  }
  const { offset, wrapped } = loopOffset(scene, geo);
  moveList(scene, offset, wrapped);
  placeMessages(scene, geo.lineY, offset, wrapped);
}
