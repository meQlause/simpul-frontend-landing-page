import spotData from './screens/spots.json';
import { GLANCE_GAP, REVIEW_LIFT, RULE_FRAMES } from './the-panel.tuning';

export interface Point {
  x: number;
  y: number;
}

export interface Box extends Point {
  w: number;
  h: number;
}

export interface Spot extends Box {
  text: string;
  font: string;
  spacing: string;
  color: string;
  bg: string;
}

export const spots = spotData;

export const { view, main } = spots;

const SHOTS = import.meta.glob<string>('./screens/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const shot = (name: string): string => SHOTS[`./screens/${name}.webp`];

export const RULE_URLS = RULE_FRAMES.map((_unused, index) => shot(`rule-${index}`));

export const FIGURES = spots.stats.map((stat) => Number(stat.text.replace(/\D/g, '')));

export const GLANCE = Math.round(
  spots.statsRow.y + spots.statsRow.h + GLANCE_GAP - (view.height - main.y),
);

export const REVIEW = Math.round(spots.statsRow.y - REVIEW_LIFT);

export const CARD_HTML =
  '<p><b>simpul.</b><small>now</small></p><p>For Siti Aminah · Backup for Rina</p><h4>ORD-0091 · Mrs. Sri</h4><p>Aqua 600 ml · 3 cases ready since yesterday 16:02. Shipping is awaiting confirmation.</p>';
