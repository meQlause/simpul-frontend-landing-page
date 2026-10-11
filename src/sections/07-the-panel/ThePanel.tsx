import './the-panel.css';
import attention from './screens/attention.webp';
import home from './screens/home.webp';
import rule from './screens/rule-2.webp';

export function ThePanel() {
  return (
    <section className="section panel" data-section="07-the-panel" aria-labelledby="panel-title">
      <span data-thread-in="" />
      <header className="panel-head">
        <div className="panel-kicker">
          <p className="eyebrow">The panel</p>
          <span className="panel-chapter" aria-hidden="true">
            07 — THE REAL THING
          </span>
        </div>
        <h2 className="headline headline--section panel-title" id="panel-title">
          <span>Fifteen minutes a week.</span>
          <span className="soft">It tells you what to fix.</span>
        </h2>
        <div className="panel-aside">
          <p className="lead panel-lead">
            You do not have to predict what to configure. The panel shows you what is missing.
          </p>
          <p className="footline panel-foot">Our target: up and running in under twenty minutes.</p>
        </div>
      </header>
      {/* One window, pinned on desktop and scrubbed through the three screens. the-panel.window.ts builds it
          from the same captures of the real panel that the list below shows still (scripts/capture-panel.mjs). */}
      <div className="panel-stage" aria-hidden="true">
        <div className="panel-tilt">
          <div className="panel-window" data-window="" />
        </div>
      </div>
      <ol className="panel-screens" data-screens="">
        <li className="panel-shot" data-screen="home">
          <img
            src={home}
            width="1200"
            height="660"
            loading="lazy"
            alt="The panel’s home screen. It greets Siti and shows the team’s information flow, with Mrs. Sri’s order ORD-0091 ready to ship."
          />
          <h3>
            <b>1</b>Home
          </h3>
          <p>Good morning, Siti. Today at a glance.</p>
        </li>
        <li className="panel-shot" data-screen="attention">
          <img
            src={attention}
            width="1200"
            height="660"
            loading="lazy"
            alt="The same screen further down: 1,284 messages understood, 48 active work items, 156 updates delivered, 7 needing attention, and three areas to review numbered 04, 02 and 01."
          />
          <h3>
            <b>2</b>Needs attention
          </h3>
          <p>A little attention. A smoother flow. Three areas to review.</p>
        </li>
        <li className="panel-shot" data-screen="rule">
          <img
            src={rule}
            width="1200"
            height="660"
            loading="lazy"
            alt="A notification rule being created: the recipient is Rina Anggraini in Sales, and the preview shows 4 matching updates from the last 30 days."
          />
          <h3>
            <b>3</b>A notification rule
          </h3>
          <p>You define the flow. See the impact before you save.</p>
        </li>
      </ol>
      <span data-thread-out="" />
    </section>
  );
}
