export function HowMessagePanel() {
  return (
    <li className="how-panel how-panel--message" data-panel="message">
      <div className="how-chat">
        <p className="how-chat-head">
          <svg className="how-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5h11a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H9l-3.5 3v-3H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z" />
            <path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5L16 18h-4" />
          </svg>
          <b>Warehouse &amp; Shipping</b>
          <small>Group</small>
        </p>
        <blockquote className="how-msg" data-message="">
          <small>
            Budi <time>16:02</time>
          </small>
          <p>Three cases for Mrs. Sri are ready to ship.</p>
        </blockquote>
      </div>
    </li>
  );
}

export function HowUnderstandPanel() {
  return (
    <li className="how-panel how-panel--understand" data-panel="understand">
      <div className="how-panel-head">
        <h3>
          <b>1</b>Understand
        </h3>
        <p>
          The message becomes a label: Order · ready to ship · ORD-0091. It stays tied to the
          message it came from.
        </p>
      </div>
      <div className="how-field-glow" aria-hidden="true" />
      <dl className="how-label" data-label="">
        <div>
          <dt>Type</dt>
          <dd>Order</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>ready to ship</dd>
        </div>
        <div>
          <dt>Ref</dt>
          <dd>ORD-0091</dd>
        </div>
        <div className="how-label-evidence">
          <dt>Evidence</dt>
          <dd>↩ this message</dd>
        </div>
      </dl>
      <div className="how-gate" aria-hidden="true">
        <span />
        <svg className="how-icon" viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="10" rx="2.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
    </li>
  );
}

export function HowDecidePanel() {
  return (
    <li className="how-panel how-panel--decide" data-panel="decide">
      <div className="how-panel-head">
        <h3>
          <b>2</b>Decide
        </h3>
        <p>
          A rule your manager wrote: “Ready to ship, notify sales.” The AI never sees the rules.
        </p>
      </div>
      <ul className="how-rules">
        <li>New orders reach the warehouse</li>
        <li>Payment updates reach finance</li>
        <li className="is-match">Ready to ship, notify sales</li>
        <li>Low stock, prepare the next step</li>
        <li>Order cancelled, notify sales</li>
      </ul>
      <svg className="how-hand" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M23 35V15.5a3 3 0 0 1 6 0V31M29 30V11.5a3 3 0 0 1 6 0V30M35 30V13.5a3 3 0 0 1 6 0V32M41 31.5V19.5a3 3 0 0 1 6 0V39c0 10-6.5 17-15 17h-2.2c-4.6 0-8.4-2.2-11-6L12.4 40.3a3 3 0 0 1 4.6-3.8L23 42" />
        <path className="accent" d="M22 6h22v5H22z" />
      </svg>
    </li>
  );
}

export function HowRoutePanel() {
  return (
    <li className="how-panel how-panel--route" data-panel="route">
      <div className="how-panel-head">
        <h3>
          <b>3</b>Route
        </h3>
        <p>To a role, not a person. Rina is away, so it goes to her backup.</p>
      </div>
      <div className="how-role">
        <div className="how-role-front">
          <span className="how-role-tag">Role</span>
          <b>Sales Admin</b>
          <small>Who holds it today?</small>
        </div>
        <div className="how-role-back">
          <i>RA</i>
          <b>Rina Anggraini</b>
          <small className="how-away">Away today</small>
        </div>
      </div>
      <div className="how-backup">
        <i>SA</i>
        <b>Siti Aminah</b>
        <small>Backup for Rina</small>
      </div>
    </li>
  );
}

export function HowArrivePanel() {
  return (
    <li className="how-panel how-panel--arrive" data-panel="arrive">
      <div className="how-hold" aria-hidden="true">
        <svg viewBox="0 0 88 88">
          <circle className="how-hold-track" cx="44" cy="44" r="38" />
          <circle className="how-hold-ring" cx="44" cy="44" r="38" />
        </svg>
        <span>
          <b className="how-hold-count">60</b>s
        </span>
      </div>
      <p className="how-hold-note">Held for 60 seconds, so a correction can cancel it.</p>
      <div className="how-phone">
        <div className="how-phone-screen">
          {/* A lock screen, as Siti's phone shows it: the bar, the time, and under it what arrived. */}
          <div className="how-phone-status" aria-hidden="true">
            <b>11:01</b>
            <svg viewBox="0 0 58 12">
              <path d="M1 11V8.500M5 11V6.500M9 11V4.500M13 11V2" />
              <path d="M21.500 4.800a7 7 0 0 1 9 0M23.400 7.100a4 4 0 0 1 5.200 0M26 9.600v.1" />
              <rect x="38" y="1.500" width="16" height="9" rx="2.600" />
              <rect className="fill" x="39.800" y="3.300" width="10" height="5.400" rx="1.200" />
              <path d="M56 4.500v3" />
            </svg>
          </div>
          <div className="how-phone-clock" aria-hidden="true">
            <small>Saturday, 10 October</small>
            <b>11:01</b>
          </div>
          <article className="how-notice" data-arrival="">
            <p className="how-notice-app">
              <img src="/simpul-mark.png" width="22" height="22" alt="" />
              <b>simpul.</b>
              <small>now</small>
            </p>
            <p className="how-notice-to">For Siti Aminah · Backup for Rina</p>
            <h4>ORD-0091 · Mrs. Sri</h4>
            <p>
              Aqua 600 ml · 3 cases ready since yesterday 16:02. Shipping is awaiting confirmation.
            </p>
            <div className="how-notice-actions">
              <span className="how-btn how-btn--primary">Already shipped</span>
              <span className="how-btn">In progress</span>
              <span className="how-btn">There is a blocker</span>
            </div>
            <span className="how-notice-skip">Not this work</span>
          </article>
        </div>
      </div>
    </li>
  );
}
