export function TurnAsks() {
  return (
    <ul className="turn-asks" data-asks="">
      <li data-ask="form">
        <svg className="turn-ask-icon" viewBox="0 0 48 48" aria-hidden="true">
          <g className="turn-form">
            <rect x="11" y="7" width="26" height="34" rx="4" />
            <path className="accent" d="M11 11a4 4 0 0 1 4-4h18a4 4 0 0 1 4 4v4H11z" />
            <path className="turn-form-fields" d="M16 22h16M16 28h16M16 34h9" />
          </g>
          <path className="turn-strike" d="M8 41 40 9" />
        </svg>
        <p>
          It does not ask you to <strong>fill in a form</strong>
        </p>
      </li>
      <li data-ask="app">
        <svg className="turn-ask-icon" viewBox="0 0 48 48" aria-hidden="true">
          <circle className="turn-app-ring" cx="24" cy="24" r="19.5" />
          <g className="turn-app">
            <rect x="11" y="11" width="26" height="26" rx="8" />
            <circle className="accent" cx="19.5" cy="19.5" r="2.6" />
            <circle cx="28.5" cy="19.5" r="2.6" />
            <circle cx="19.5" cy="28.5" r="2.6" />
            <circle cx="28.5" cy="28.5" r="2.6" />
          </g>
          <path className="turn-strike" d="M8 41 40 9" />
        </svg>
        <p>
          It does not ask you to <strong>open another app</strong>
        </p>
      </li>
      <li data-ask="keys">
        <svg className="turn-ask-icon" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="4" y="13" width="40" height="25" rx="5" />
          <g className="turn-keys">
            <rect x="9" y="18" width="4" height="4" rx="1" />
            <rect x="16" y="18" width="4" height="4" rx="1" />
            <rect x="23" y="18" width="4" height="4" rx="1" />
            <rect x="30" y="18" width="4" height="4" rx="1" />
            <rect x="37" y="18" width="2.5" height="4" rx="1" />
            <rect x="11" y="25" width="4" height="4" rx="1" />
            <rect x="18" y="25" width="4" height="4" rx="1" />
            <rect x="25" y="25" width="4" height="4" rx="1" />
            <rect x="32" y="25" width="4" height="4" rx="1" />
            <rect x="15" y="31.5" width="18" height="2.5" rx="1.25" />
          </g>
          <g className="turn-keys-ok">
            <circle className="accent" cx="40" cy="12" r="6" />
            <path d="m37.4 12.1 1.8 1.8 3.4-3.6" />
          </g>
        </svg>
        <p>
          It does not ask you to <strong>change how you write</strong>
        </p>
      </li>
    </ul>
  );
}

function TurnMessages() {
  return (
    <ol className="turn-messages" data-chat="">
      <li className="turn-msg" data-turn-message="">
        <i>R</i>
        <div>
          <small>
            Rina <time>09:40</time>
          </small>
          <p>
            morning all <span className="turn-sun">☀</span>
          </p>
        </div>
      </li>
      <li className="turn-msg is-read" data-turn-message="" data-turn-signal="">
        <i>R</i>
        <div>
          <small>
            Rina <time>09:41</time>
          </small>
          <p>Mrs. Sri’s payment is in.</p>
          <span className="turn-meaning">
            <b>↗</b> <span>Payment confirmed</span>
          </span>
        </div>
      </li>
      <li className="turn-msg turn-msg--sticker" data-turn-message="">
        <i>B</i>
        <div>
          <small>
            Budi <time>09:41</time>
          </small>
          <span className="turn-sticker">🙌</span>
        </div>
      </li>
      <li className="turn-msg is-read" data-turn-message="" data-turn-signal="">
        <i>B</i>
        <div>
          <small>
            Budi <time>09:44</time>
          </small>
          <p>Mrs. Sri’s 3 boxes ship this afternoon.</p>
          <span className="turn-meaning">
            <b>↗</b> <span>Ready to ship · ORD-0091</span>
          </span>
        </div>
      </li>
      <li className="turn-msg turn-msg--out" data-turn-message="">
        <div>
          <small>
            You <time>09:44</time>
          </small>
          <p>on it!</p>
        </div>
      </li>
      <li className="turn-msg turn-msg--voice" data-turn-message="">
        <i>S</i>
        <div>
          <small>
            Siti <time>09:45</time>
          </small>
          <span className="turn-voice">
            <b>▶</b>
            <svg className="turn-wave" viewBox="0 0 120 24">
              <path d="M2 10v4M8 7v10M14 4v16M20 9v6M26 2v20M32 6v12M38 9v6M44 4v16M50 1v22M56 7v10M62 3v18M68 9v6M74 5v14M80 2v20M86 8v8M92 4v16M98 9v6M104 6v12M110 10v4M116 11v2" />
            </svg>
            <em>0:08</em>
          </span>
        </div>
      </li>
      <li className="turn-msg" data-turn-message="">
        <i>S</i>
        <div>
          <small>
            Siti <time>09:46</time>
          </small>
          <p>yesterday’s one?</p>
        </div>
      </li>
      <li className="turn-msg" data-turn-message="">
        <i>H</i>
        <div>
          <small>
            Mr. Hendra <time>09:47</time>
          </small>
          <p>ok, thanks</p>
        </div>
      </li>
    </ol>
  );
}

function TurnWindow() {
  return (
    <div className="turn-window" aria-hidden="true">
      <div className="turn-window-head">
        <span className="turn-faces">
          <i>R</i>
          <i>B</i>
          <i>S</i>
          <i>H</i>
        </span>
        <span className="turn-window-name">
          <b>Team group</b>
          <small>Rina, Budi, Siti, Mr. Hendra</small>
        </span>
      </div>
      <div className="turn-feed">
        <TurnMessages />
      </div>
    </div>
  );
}

export function TurnStage() {
  return (
    <figure className="turn-stage">
      {/* An ordinary group chat. It keeps moving; the layer on top never changes it. */}
      <TurnWindow />
      {/* The layer: clear glass over the chat. It adds a reading line and nothing else. */}
      <div className="turn-layer" aria-hidden="true">
        <span className="turn-layer-sheen" />
        <span className="turn-layer-tab">
          simpul<span className="dot">.</span>
        </span>
        <span className="turn-reading">
          <span className="turn-reading-dot" />
        </span>
      </div>
      <p className="turn-accessible">
        In this example, Simpul highlights Mrs. Sri&apos;s payment confirmation and delivery update.
        The greeting, the sticker, the voice note and the replies pass unchanged.
      </p>
      <figcaption className="turn-stage-foot">
        <p>
          <span className="turn-legend-line" />
          Only the next steps stand out.
        </p>
        <button className="turn-pause" type="button" aria-pressed="false" hidden>
          Pause chat motion
        </button>
      </figcaption>
    </figure>
  );
}
