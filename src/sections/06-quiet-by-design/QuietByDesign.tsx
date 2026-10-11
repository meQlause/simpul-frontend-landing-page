import './quiet-by-design.css';
import { QuietHead, QuietRules, QuietStage } from './QuietByDesign.parts';

export function QuietByDesign() {
  return (
    <section
      className="section quiet"
      data-section="06-quiet-by-design"
      aria-labelledby="quiet-title"
    >
      <span data-thread-in="" />
      <div className="quiet-body">
        <QuietHead />
        {/* The stage. Still, one clean card on the thread. With motion it stays in view while the
            commitments scroll past: a storm of notifications falls here and each commitment takes some away. */}
        <QuietStage />
        <QuietRules />
      </div>
      <span data-thread-out="" />
    </section>
  );
}
