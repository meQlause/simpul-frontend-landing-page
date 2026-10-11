import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { all, one, SVG_NS, segment } from '../../motion/dom';
import { type Press, wireForm } from './close.form';
import { buildMark, type Mark } from './close.mark';
import type { SectionMotion, Shared } from '../../motion/types';
import {
  BEND,
  CENTRE,
  CURVE,
  FOOT,
  HEAD,
  HIDE,
  LINKS,
  NOT,
  PIECES,
  SCRIBBLE,
  SHOW,
  SHRINK,
  STARTS,
  SWEEP,
  TAIL,
  VISIBLE,
  WAVE,
} from './close.tuning';

const POWER4_OUT = 'power4.out';
const POWER2_IN_OUT = 'power2.inOut';

interface Strand {
  line: SVGPathElement;
  piece: HTMLElement;
  raw: number[][];
}

function buildStrands(root: HTMLElement): { svg: SVGSVGElement; strands: Strand[] } {
  const svg = root.insertBefore(
    document.createElementNS(SVG_NS, 'svg'),
    root.firstChild,
  ) as SVGSVGElement;

  svg.setAttribute('class', 'close-strands');
  svg.setAttribute('aria-hidden', 'true');
  const strands = PIECES.map((html) => {
    const line = svg.appendChild(document.createElementNS(SVG_NS, 'path')) as SVGPathElement;

    line.setAttribute('pathLength', '1');
    const piece = root.appendChild(document.createElement('span'));

    piece.className = 'close-piece';
    piece.setAttribute('aria-hidden', 'true');
    piece.innerHTML = html;

    return { line, piece, raw: [] as number[][] };
  });

  return { svg, strands };
}

function spanLine(node: SVGPathElement, from: number, to: number) {
  node.style.strokeDasharray = `${Math.max(0, to - from)} 2`;
  node.style.strokeDashoffset = `${-from}`;
  node.style.visibility = to - from > VISIBLE.line ? 'visible' : 'hidden';
}

interface Scene {
  root: HTMLElement;
  phone: boolean;
  gsap: Shared['gsap'];
  ScrollTrigger: Shared['ScrollTrigger'];
  handoff: Shared['handoff'];
  ease: Shared['ease'];
  inOut: (share: number) => number;
  press: Press;
  mark: Mark;
  svg: SVGSVGElement;
  strands: Strand[];
  splits: SplitText[];
  chapter: HTMLElement;
  chapterText: string;
  foot: HTMLElement;
  clock: { p: number };
}

function wordsOf(scene: Scene, target: Element): Element[] {
  const result = SplitText.create(target, { type: 'words', mask: 'words' });

  scene.splits.push(result);

  return result.words;
}

function when(scene: Scene, start: string) {
  return { trigger: scene.root, start, toggleActions: 'play none none reverse' };
}

function revealHeading(scene: Scene) {
  const { gsap, root, chapter, chapterText } = scene;

  gsap.fromTo(
    chapter,
    { scrambleText: '​' },
    {
      scrambleText: { text: chapterText, chars: 'upperCase', speed: 0.5 },
      duration: 1.4,
      scrollTrigger: when(scene, 'top 80%'),
    },
  );
  gsap.from(wordsOf(scene, one(root, '.close-title')), {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0 100%',
    stagger: 0.06,
    duration: 0.95,
    ease: POWER4_OUT,
    scrollTrigger: when(scene, 'top 70%'),
  });
}

function revealNots(scene: Scene) {
  const nots = scene.gsap.timeline({
    defaults: { ease: scene.ease.out },
    scrollTrigger: when(scene, 'top 50%'),
  });

  all<HTMLLIElement>(scene.root, '.is-not li').forEach((item, index) => {
    const said = wordsOf(scene, item);

    item.insertAdjacentHTML(
      'beforeend',
      '<svg class="is-not-scribble" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1"/></svg>',
    );
    const start = index * NOT.every;

    nots
      .from(said, { yPercent: 110, stagger: NOT.rise, duration: 0.55 }, start)
      .fromTo(
        one<SVGPathElement>(item, '.is-not-scribble path'),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' },
        start + NOT.scribbleAt,
      )
      .to(said, { opacity: NOT.fade, duration: 0.5 }, start + NOT.stepBackAt);
  });
}

function revealLead(scene: Scene) {
  scene.gsap
    .timeline({ scrollTrigger: when(scene, 'top 40%') })
    .from(wordsOf(scene, one(scene.root, '.close-lead')), {
      yPercent: 100,
      stagger: 0.012,
      duration: 0.7,
      ease: scene.ease.out,
    })
    .fromTo(
      all(scene.root, '.close-lead mark'),
      { '--sweep': '0%' },
      { '--sweep': '100%', duration: 0.5, stagger: SWEEP.every, ease: POWER2_IN_OUT },
      SWEEP.at,
    );
}

interface Footer {
  sign: SplitText;
  line: SplitText;
}

function splitFooter(scene: Scene): Footer {
  const sign = SplitText.create(one(scene.root, '.page-foot-mark'), {
    type: 'chars',
    mask: 'chars',
  });
  const line = SplitText.create(one(scene.root, '.page-foot-line'), {
    type: 'words,chars',
    charsClass: 'char',
  });

  scene.splits.push(sign, line);

  return { sign, line };
}

function waveFlow(scene: Scene): {
  stream: SVGSVGElement;
  loops: { play: () => unknown; pause: () => unknown }[];
} {
  const flow = one<HTMLElement>(scene.root, '.page-foot-flow');

  flow.insertAdjacentHTML(
    'beforeend',
    '<svg class="page-foot-stream" viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true"><path d="M0,7 q7.5,-6 15,0 t15,0 t15,0 t15,0 t15,0 t15,0 t15,0 t15,0 t15,0 t15,0"/></svg>',
  );
  const stream = one<SVGSVGElement>(flow, '.page-foot-stream');
  const loops = [
    scene.gsap.fromTo(
      all(flow, '.char'),
      { y: WAVE.lift },
      {
        y: WAVE.drop,
        duration: 0.7,
        ease: 'sine.inOut',
        stagger: { each: WAVE.each, repeat: -1, yoyo: true },
        paused: true,
      },
    ),
    scene.gsap.to(stream.firstChild, {
      x: -WAVE.stream,
      duration: 1.4,
      ease: 'none',
      repeat: -1,
      paused: true,
    }),
  ];

  return { stream, loops };
}

function signOff(scene: Scene, footer: Footer, wave: ReturnType<typeof waveFlow>) {
  const { gsap, ScrollTrigger, ease, foot } = scene;

  ScrollTrigger.create({
    trigger: foot,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => wave.loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause())),
  });
  gsap
    .timeline({
      defaults: { ease: ease.out },
      scrollTrigger: { trigger: foot, start: 'top 96%', toggleActions: 'play none none reverse' },
    })
    .from(foot, { borderTopColor: 'transparent', duration: 0.8 }, 0)
    .from(
      footer.sign.chars,
      { yPercent: 110, stagger: 0.04, duration: 0.8, ease: POWER4_OUT },
      FOOT.signAt,
    )
    .from(
      footer.line.words,
      {
        yPercent: 120,
        autoAlpha: 0,
        rotation: 6,
        transformOrigin: '0 100%',
        stagger: 0.08,
        duration: 0.8,
        ease: POWER4_OUT,
      },
      FOOT.lineAt,
    )
    .fromTo(
      wave.stream,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: POWER2_IN_OUT },
      FOOT.streamAt,
    )
    .from(
      one(scene.root, '.page-foot-nav').children,
      { autoAlpha: 0, x: 18, stagger: 0.1, duration: 0.6 },
      FOOT.navAt,
    );
}

function placeIn(root: HTMLElement, node: HTMLElement) {
  let posX = 0;
  let posY = 0;
  let current: HTMLElement | null = node;

  while (current && current !== root) {
    posX += current.offsetLeft;
    posY += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return { x: posX, y: posY, w: node.offsetWidth, h: node.offsetHeight };
}

function measureScribbles(root: HTMLElement) {
  all<SVGSVGElement>(root, '.is-not-scribble').forEach((scribble) => {
    const reach = (share: number) =>
      (share * ((scribble.parentElement?.offsetWidth ?? 0) + SCRIBBLE.inset)).toFixed(1);

    scribble.setAttribute('viewBox', `0 0 ${reach(1)} ${SCRIBBLE.height}`);
    const trace = SCRIBBLE.trace.map((point) => {
      const command = 'cmd' in point ? point.cmd + ' ' : '';

      return command + reach(point.share) + ',' + point.y;
    });

    (scribble.firstChild as SVGPathElement).setAttribute('d', trace.join(' '));
  });
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Frame {
  phone: boolean;
  width: number;
  height: number;
  box: Box;
  seam: number;
}

const fromSeam = (frame: Frame, index: number): boolean =>
  frame.phone ? index === 0 : index < STARTS.topRow;

function startOf(frame: Frame, index: number): [number, number] {
  const { phone, width, height, box } = frame;

  if (phone) {
    return [
      index % 2 ? width + STARTS.margin : -STARTS.margin,
      box.y + box.h * (STARTS.phoneFrom + (STARTS.phoneSpan * index) / (PIECES.length - 1)),
    ];
  }

  if (index < STARTS.topRow) {
    const centreX = box.x + box.w / 2;

    return [
      centreX +
        box.w * (STARTS.topFrom + STARTS.topStep * index) +
        (index > 1 ? STARTS.topShift : -STARTS.topShift),
      -STARTS.margin,
    ];
  }

  return [
    width + STARTS.margin,
    height * (STARTS.rightFrom + STARTS.rightStep * (index - STARTS.topRow)),
  ];
}

function strandShape(frame: Frame, index: number): string {
  const centreX = frame.box.x + frame.box.w / 2;
  const centreY = frame.box.y + frame.box.h / 2;
  const [startX, startY] = startOf(frame, index);
  const bend = (index % 2 ? 1 : -1) * BEND;
  const pull = `${centreX + (startX - centreX) * CURVE.pullX},${centreY + (startY - centreY) * CURVE.pullY - bend}`;

  if (fromSeam(frame, index)) {
    return `M${frame.seam},0 C${frame.seam},${centreY * CURVE.seamDrop} ${pull} ${centreX},${centreY}`;
  }

  return `M${startX},${startY} C${startX + (centreX - startX) * CURVE.reachX},${startY + (centreY - startY) * CURVE.reachY + bend} ${pull} ${centreX},${centreY}`;
}

function measure(scene: Scene) {
  const { root, svg, strands } = scene;
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  const box = placeIn(root, scene.mark.holder);

  measureScribbles(root);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const seam = scene.handoff.incoming(root)?.x ?? width / 2;
  const frame: Frame = { phone: scene.phone, width, height, box, seam };

  strands.forEach((strand, index) => {
    const shape = strandShape(frame, index);

    strand.line.setAttribute('d', shape);
    strand.raw = MotionPathPlugin.getRawPath(shape) as number[][];
    MotionPathPlugin.cacheRawPathMeasurements(strand.raw);
  });
}

function renderPieces(scene: Scene, progress: number) {
  scene.strands.forEach(({ line, piece, raw }, index) => {
    const head = scene.inOut(
      segment(progress, HEAD.from + HEAD.step * index, HEAD.to + HEAD.step * index),
    );
    const tail = scene.inOut(
      segment(progress, TAIL.from + TAIL.step * index, TAIL.to + TAIL.step * index),
    );

    spanLine(line, tail, head);
    const spot = MotionPathPlugin.getPositionOnPath(raw, head);
    const alpha = segment(head, SHOW.from, SHOW.to) * (1 - segment(head, HIDE.from, HIDE.to));
    const shown = alpha > VISIBLE.piece;

    piece.style.display = shown ? 'flex' : 'none';
    piece.style.visibility = shown ? 'visible' : 'hidden';
    piece.style.opacity = String(alpha);
    piece.style.transform = `translate(${spot.x}px, ${spot.y}px) translate(-50%, -50%) scale(${1 - SHRINK.by * segment(head, SHRINK.from, 1)})`;
  });
}

function renderLinks(scene: Scene, progress: number) {
  const drawn = scene.inOut(segment(progress, LINKS.drawFrom, LINKS.drawTo));
  const apart = 1 - scene.inOut(segment(progress, LINKS.apartFrom, LINKS.apartTo));
  const filled = segment(progress, LINKS.filledFrom, 1);

  scene.mark.links.forEach((link, index) => {
    const side = index ? 1 : -1;

    scene.mark.arms[index].setAttribute(
      'transform',
      `translate(${side * LINKS.shift.x * apart} ${side * LINKS.shift.y * apart}) rotate(${side * LINKS.shift.turn * apart} ${CENTRE})`,
    );
    link.style.strokeDasharray = `${drawn} 2`;
    link.style.strokeOpacity = String(drawn > VISIBLE.line ? 1 - filled : 0);
    link.style.fillOpacity = String(filled);
  });
  scene.mark.backdrop.style.opacity = String(filled);
}

function render(scene: Scene) {
  renderPieces(scene, scene.clock.p);
  renderLinks(scene, scene.clock.p);
}

function buildScene(root: HTMLElement, shared: Shared, press: Press): Scene {
  const chapter = one<HTMLElement>(root, '.close-chapter');
  const { svg, strands } = buildStrands(root);

  return {
    root,
    phone: shared.conditions.phone,
    gsap: shared.gsap,
    ScrollTrigger: shared.ScrollTrigger,
    handoff: shared.handoff,
    ease: shared.ease,
    inOut: shared.gsap.parseEase(POWER2_IN_OUT),
    press,
    mark: buildMark(root, shared.gsap, press),
    svg,
    strands,
    splits: [],
    chapter,
    chapterText: chapter.textContent ?? '',
    foot: one<HTMLElement>(root, '.page-foot'),
    clock: { p: 0 },
  };
}

function followScroll(scene: Scene): () => void {
  const { gsap, ScrollTrigger, root } = scene;

  gsap.to(scene.clock, {
    p: 1,
    ease: 'none',
    onUpdate: () => render(scene),
    scrollTrigger: { trigger: root, start: 'top 82%', end: 'top 6%', scrub: 0.6 },
  });
  const onRefresh = () => {
    measure(scene);
    render(scene);
  };

  ScrollTrigger.addEventListener('refresh', onRefresh);

  return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
}

function playClose(root: HTMLElement, shared: Shared, press: Press): () => void {
  const { gsap, carried } = shared;

  gsap.registerPlugin(MotionPathPlugin, SplitText, ScrambleTextPlugin);
  root.dataset.motion = '';

  if (root.contains(carried.el)) {
    gsap.set(carried.el, { autoAlpha: 0 });
  }

  const scene = buildScene(root, shared, press);

  revealHeading(scene);
  revealNots(scene);
  revealLead(scene);
  const footer = splitFooter(scene);

  signOff(scene, footer, waveFlow(scene));
  measure(scene);
  const stopScroll = followScroll(scene);

  render(scene);

  return () => {
    stopScroll();
    scene.splits.forEach((result) => result.revert());
    scene.strands.forEach(({ piece }) => piece.remove());
    scene.svg.remove();
    scene.mark.holder.innerHTML = scene.mark.still;
    scene.chapter.textContent = scene.chapterText;
    delete root.dataset.motion;
  };
}

export const initClose: SectionMotion['init'] = (root, shared) => {
  const press: Press = { tighten: () => undefined };
  const stopForm = wireForm(root, press);

  if (shared.conditions.reduce) {
    return stopForm;
  }

  const stopMotion = playClose(root, shared, press);

  return () => {
    stopMotion();
    stopForm();
  };
};
