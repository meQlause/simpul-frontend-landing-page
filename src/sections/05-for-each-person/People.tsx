import './people.css';
import { PeopleCards } from './People.parts';

export function People() {
  return (
    <section
      className="section people"
      data-section="05-for-each-person"
      aria-labelledby="people-title"
    >
      <span data-thread-in="" />
      <header className="people-head">
        <div className="people-kicker">
          <p className="eyebrow">Who it is for</p>
          <span className="people-chapter" aria-hidden="true">
            05 — FOUR KNOTS
          </span>
        </div>
        <h2 className="headline headline--section people-title" id="people-title">
          <span>Four people.</span>
          <span className="soft">Four knots untied.</span>
        </h2>
        <p className="people-hint" aria-hidden="true">
          Pull a knot to untie it.
        </p>
      </header>
      {/* Each card hangs on its own strand of the thread. Its knot unties by itself in the middle of the
          screen, and also on hover, on focus, or when it is pulled. Still, each holds a straight line. */}
      <PeopleCards />
      <span data-thread-out="" />
    </section>
  );
}
