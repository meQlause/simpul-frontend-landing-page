import './your-data.css';
import { DataOurs, DataYours } from './YourData.parts';

// Your data. Brief: ../../../sections/08-your-data.md. Not pinned. With motion, the thread comes down between
// the headline and the lead and forks; the left line strings Simpul's three layers and the right one fills the
// customer's five (your-data.motion.ts). Without motion the same words and the same drawings stand still.
export function YourData() {
  return (
    <section
      className="section data"
      id="your-data"
      data-section="08-your-data"
      aria-labelledby="data-title"
    >
      <span data-thread-in="" />
      <div className="data-kicker">
        <p className="eyebrow">Your data</p>
        <span className="data-chapter" aria-hidden="true">
          08 — THREE AND FIVE
        </span>
      </div>
      {/* The thread comes down between the headline and the lead, then forks: one line to each side. */}
      <div className="data-top" data-top="">
        <h2 className="headline headline--section data-title" id="data-title">
          <span>Your data stays yours.</span>
          <span className="soft">Keep it in your own database.</span>
        </h2>
        <p className="lead data-lead">
          Simpul can run on a PostgreSQL database you provide. What your team’s conversations become
          is stored there, not with us.
        </p>
      </div>
      <div className="data-body">
        {/* Simpul's side: three layers on its line of the thread, each empty but for the one thing it holds. */}
        <DataOurs />
        {/* The customer's side: their database as five layers of data. The other line of the thread
            comes in at the back of the top layer and leaves under the bottom one. index.js fills the
            cells from where the thread comes in, layer by layer. Still, every layer is full. */}
        <DataYours />
      </div>
      <span data-thread-out="" />
    </section>
  );
}
