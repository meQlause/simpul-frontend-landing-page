import { all, one, SVG_NS } from '../../motion/dom';
import type { Board, Feel, Note } from './quiet-by-design.scene';
import { FEEL, HUE, LIMIT, RULE } from './quiet-by-design.tuning';

const NOISE = [
  ['GG', 'Grup Gudang', 'udah dikirim belum?', '3'],
  ['ST', 'Sales Team', '@all tolong dicek ya', '12'],
  ['FN', 'Finance', 'PENTING!! cek transfer', '!'],
  ['RM', 'Reminder', 'follow up Bu Sri', '2'],
  ['GK', 'Grup Kantor', 'pagi semua 🙏', '27'],
  ['AD', 'Admin', 'yg kemarin gimana?', '5'],
  ['BU', 'Budi', 'udah aku bilang kemarin', '1'],
  ['PH', 'Pak Hendra', 'kok baru tau sekarang?', '1'],
  ['SK', 'Stok', 'menipis: Aqua 600 ml', '9'],
  ['RI', 'Rina', 'udah??', '4'],
  ['OP', 'Ops', 'status ORD-0088?', '3'],
  ['GG', 'Grup Gudang', 'foto barangnya dong', '6'],
];

const CHIPS = [
  ['RA', 'Rina'],
  ['BU', 'Budi'],
];

const SKY =
  '<svg viewBox="0 0 24 24"><path class="moon" d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z"/><g class="sun"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g></svg><b>21:00</b>';

function addTo(
  panel: HTMLElement,
  className: string,
  html: string,
  tag: 'div' | 'p' = 'div',
): HTMLElement {
  const node = document.createElement(tag);

  node.className = className;
  node.innerHTML = html;

  return panel.appendChild(node);
}

function buildNotes(panel: HTMLElement, count: number): Note[] {
  return Array.from({ length: count }, (_unused, index) => {
    const [initials, from, text, badge] = NOISE[index % NOISE.length];
    const node = addTo(
      panel,
      'quiet-note',
      `<i>${initials}</i><b>${from}</b><span>${text}</span><em>${badge}</em><span class="quiet-note-sum"></span><span class="quiet-note-tick">✓</span>`,
    );

    node.style.setProperty('--hue', String((index * HUE.step) % HUE.turn));

    return {
      el: node,
      words: [...node.querySelectorAll<HTMLElement>('b, span:not([class])')],
      sum: one(node, '.quiet-note-sum'),
      tick: one(node, '.quiet-note-tick'),
    };
  });
}

function buildExtras(panel: HTMLElement, take: number[]) {
  const hold = addTo(
    panel,
    'quiet-hold',
    '<svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="23"/><circle class="quiet-hold-ring" cx="28" cy="28" r="23" pathLength="1"/></svg><span><b>0</b>s</span>',
  );
  const fix = addTo(panel, 'quiet-fix', 'eh salah, belum siap', 'p');
  const counter = addTo(panel, 'quiet-count', '<b>0</b><small>per hour</small>');
  const summary = addTo(
    panel,
    'quiet-summary',
    `<b>1 summary</b><small>${take[RULE.limit] - LIMIT} updates</small>`,
  );
  const night = addTo(panel, 'quiet-sky', SKY);
  const queue = addTo(panel, 'quiet-queue', 'MORNING, 07:00', 'p');
  const chips = CHIPS.map(([initials, name]) =>
    addTo(panel, 'quiet-chip', `<i>${initials}</i><small>${name}</small>`),
  );
  const ask = addTo(panel, 'quiet-ask', '?', 'p');
  const tally = addTo(panel, 'quiet-tally', '<b></b><small></small>', 'p');

  return { hold, fix, counter, summary, night, queue, chips, ask, tally };
}

export function buildBoard(root: HTMLElement, take: number[]): Board {
  const body = one(root, '.quiet-body');
  const stage = one(root, '.quiet-stage');
  const panel = one(root, '.quiet-panel');
  const survivor = one(root, '.quiet-card');
  const notes = buildNotes(
    panel,
    take.reduce((sum, size) => sum + size, 0),
  );
  const extras = buildExtras(panel, take);
  const svg = root.insertBefore(document.createElementNS(SVG_NS, 'svg'), root.firstChild);

  svg.setAttribute('class', 'quiet-thread');
  svg.setAttribute('aria-hidden', 'true');
  const thread = svg.appendChild(document.createElementNS(SVG_NS, 'path'));

  survivor.dataset.handoffObject = '';

  return {
    root,
    body,
    stage,
    panel,
    survivor,
    rules: all(root, '.quiet-rule'),
    notes,
    hold: extras.hold,
    ring: one<SVGCircleElement>(extras.hold, '.quiet-hold-ring'),
    held: one(extras.hold, 'b'),
    fix: extras.fix,
    counter: extras.counter,
    counted: one(extras.counter, 'b'),
    summary: extras.summary,
    night: extras.night,
    hour: one(extras.night, 'b'),
    queue: extras.queue,
    chips: extras.chips,
    ask: extras.ask,
    tallied: one(extras.tally, 'b'),
    tallyLabel: one(extras.tally, 'small'),
    extras: [
      extras.hold,
      extras.fix,
      extras.counter,
      extras.summary,
      extras.night,
      extras.queue,
      ...extras.chips,
      extras.ask,
      extras.tally,
    ],
    svg,
    thread,
  };
}

export function shake(panel: HTMLElement, feel: Feel, time: number): void {
  feel.felt += (feel.noise - feel.felt) * FEEL.ease;
  panel.style.setProperty('--noise', feel.felt.toFixed(FEEL.digits));
  panel.style.setProperty(
    '--jx',
    `${(feel.felt * FEEL.shake * Math.sin(time * FEEL.freqX)).toFixed(2)}px`,
  );
  panel.style.setProperty(
    '--jy',
    `${(feel.felt * FEEL.shake * Math.cos(time * FEEL.freqY)).toFixed(2)}px`,
  );
}
