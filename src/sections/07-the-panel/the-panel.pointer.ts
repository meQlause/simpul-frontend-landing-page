import { segment } from '../../motion/dom';
import { type Box, type Point, main, REVIEW, spots } from './the-panel.data';
import { REACH, TAP_TIMES, TAP_WIDTH, TOGGLE_NUDGE } from './the-panel.tuning';

// The pointer of an unseen hand: where it is at each time of the clock, in the capture's own pixels.
export interface Stop extends Point {
  time: number;
}

// The middle of a spot, moved by the shift in the capture's pixels.
const centreOf = (spot: Box, shiftX = 0, shiftY = 0): Point => ({
  x: spot.x + spot.w / 2 + shiftX,
  y: spot.y + spot.h / 2 + shiftY,
});

// The route the hand takes: it rests on the review item, then the rule's fields, then Save, then the toggle.
export function routeOf(): Stop[] {
  const item = centreOf(spots.item, main.x, main.y - REVIEW);
  return [
    { time: 2.5, x: 930, y: 610 },
    { time: 2.95, ...item },
    { time: 3.6, ...item },
    { time: 4.3, ...centreOf(spots.category, REACH) },
    { time: 4.75, ...centreOf(spots.category, REACH) },
    { time: 5, ...centreOf(spots.recipient, REACH) },
    { time: 5.2, ...centreOf(spots.recipient, REACH) },
    { time: 5.5, ...centreOf(spots.save) },
    { time: 5.75, ...centreOf(spots.save) },
    { time: 6, ...centreOf(spots.toggle, TOGGLE_NUDGE.dx, TOGGLE_NUDGE.dy) },
  ];
}

// The two stops the hand is moving between at this time. Before the first and after the last it rests.
function segmentAt(route: readonly Stop[], time: number): [Stop, Stop] {
  const next = Math.max(
    1,
    route.findIndex((stop) => stop.time > time),
  );
  if (route[next].time > time) {
    return [route[next - 1], route[next]];
  }
  const last = route[route.length - 1];
  return [last, last];
}

// Where the hand is at this time, moving between its stops on the eased share of their time.
export function pointerAt(
  route: readonly Stop[],
  time: number,
  eased: (share: number) => number,
): Point {
  const [from, to] = segmentAt(route, time);
  const share = eased(segment(time, from.time, to.time === from.time ? from.time + 1 : to.time));
  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
  };
}

// How hard a tap squeezes the cursor now: 0 between taps, 1 at a tap's peak.
export function tapAt(time: number): number {
  return Math.max(
    ...Object.values(TAP_TIMES).map((tap) =>
      Math.sin(Math.PI * segment(time, tap - TAP_WIDTH, tap + TAP_WIDTH)),
    ),
  );
}
