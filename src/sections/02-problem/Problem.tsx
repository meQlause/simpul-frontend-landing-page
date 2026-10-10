import './problem.css';
import { ProblemChain, ProblemFloor } from './Problem.parts';

export function Problem() {
  return (
    <section className="section problem" data-section="02-problem" aria-labelledby="problem-title">
      <span data-thread-in="" />
      <div className="wrap problem-scene">
        <header className="problem-head">
          <p className="eyebrow">The problem</p>
          <h2 className="headline headline--section" id="problem-title">
            <span>Everyone is working.</span>
            <span className="soft">Information still moves by hand.</span>
          </h2>
        </header>
        {/* The chain: one order, passed person to person. Pinned; the link snaps at the third hand-over. */}
        <ProblemChain />
        {/* The floor: where the order falls and the questions pile up. */}
        <ProblemFloor />
      </div>
      <span data-thread-out="" />
    </section>
  );
}
