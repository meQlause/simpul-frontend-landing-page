import './how.css';
import {
  HowArrivePanel,
  HowDecidePanel,
  HowMessagePanel,
  HowRoutePanel,
  HowUnderstandPanel,
} from './How.parts';

export function How() {
  return (
    <section
      className="section how"
      id="how-it-works"
      data-section="04-how-it-works"
      aria-labelledby="how-title"
    >
      <span data-thread-in="" />
      <div className="how-frame">
        {/* The sidebar stays put. Each phrase of the headline lights while its station works. */}
        <header className="how-side">
          <div className="how-kicker">
            <p className="eyebrow">How it works</p>
            <span className="how-chapter" aria-hidden="true">
              04 — THE JOURNEY
            </span>
          </div>
          <h2 className="headline how-title" id="how-title">
            <span data-step="understand">AI understands.</span>
            <span data-step="decide">You decide.</span>
            <span data-step="route" className="soft">
              Simpul routes.
            </span>
          </h2>
          <p className="lead how-principle">
            The AI only describes what was said. It cannot send anything, and it does not choose who
            is told.
          </p>
        </header>
        {/* The camera window. On desktop the track travels sideways; elsewhere it is a numbered diagram. */}
        <div className="how-stage">
          <ol className="how-track">
            <HowMessagePanel />
            <HowUnderstandPanel />
            <HowDecidePanel />
            <HowRoutePanel />
            <HowArrivePanel />
          </ol>
        </div>
      </div>
      <span data-thread-out="" />
    </section>
  );
}
