import './turn.css';
import { TurnAsks, TurnStage } from './Turn.parts';

export function Turn() {
  return (
    <section className="section turn" data-section="03-turn" aria-labelledby="turn-title">
      <span data-thread-in="" />
      <div className="turn-heading">
        <p className="eyebrow">The idea</p>
        <span className="turn-chapter" aria-hidden="true">
          03 — THE QUIET LAYER
        </span>
      </div>
      <div className="turn-layout">
        <div className="turn-copy">
          <h2 className="headline" id="turn-title">
            <span>Not another tool.</span>
            <span className="soft">
              A layer on the ones you already use<span className="dot">.</span>
            </span>
          </h2>
          {/* Three things it never asks. Each icon makes its own small gesture: closes, never opens, stays the same. */}
          <TurnAsks />
        </div>
        <TurnStage />
      </div>
      <svg className="turn-thread" aria-hidden="true">
        <path className="turn-thread-reach" />
        <path className="turn-thread-out" />
      </svg>
      <span data-thread-out="" />
    </section>
  );
}
