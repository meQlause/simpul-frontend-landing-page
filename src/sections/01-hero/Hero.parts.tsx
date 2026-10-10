// The hero's blocks, split out so each one stays inside the JSX depth limit. Each renders exactly the
// markup it replaces in Hero.tsx: no wrapper of its own.

export function HeroTitle() {
  return (
    <h1 className="headline hero-title" id="hero-title">
      <span className="hero-heading-line hero-busy">Busy conversations.</span>
      <span className="hero-heading-line hero-clear">
        Clear next steps<span className="hero-dot">.</span>
      </span>
    </h1>
  );
}

export function HeroLockup() {
  return (
    <div className="hero-lockup" aria-hidden="true">
      <div className="hero-mark-tilt">
        <div className="hero-mark-breathe">
          <div className="hero-symbol">
            <img src="/simpul-mark.png" width="160" height="160" alt="" />
          </div>
        </div>
      </div>
      <span className="hero-wordmark-exit">
        <span className="hero-wordmark">
          simpul<span className="hero-dot">.</span>
        </span>
      </span>
    </div>
  );
}

export function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      {/* Tangled threads bring messages in to the knot; a few straight ones carry them out. */}
      <svg className="hero-lines" />
      <div className="hero-chat hero-chat--one">
        <span className="hero-chat-meta">
          <i>R</i> Rina <span>09:41</span>
        </span>
        <p>Pembayaran Bu Sri sudah masuk.</p>
        <span className="hero-chat-tag">
          ORD-0091 <b>↗</b>
        </span>
      </div>
      <div className="hero-chat hero-chat--two">
        <span className="hero-chat-meta">
          <i>B</i> Budi <span>09:42</span>
        </span>
        <p>Siap dikirim sore ini.</p>
        <span className="hero-chat-tag">
          Pengiriman <b>↗</b>
        </span>
      </div>
      <div className="hero-chat hero-chat--three">
        <span className="hero-chat-meta">
          <i>S</i> Siti <span>09:43</span>
        </span>
        <p>yg kemarin gimana?</p>
      </div>
      <div className="hero-chat hero-chat--four">
        <p>
          udah?? <span>09:44</span>
        </p>
      </div>
    </div>
  );
}

export function HeroActions() {
  return (
    <div className="hero-bottom">
      {/* On the same axis as the heading: the pilot under busy, the way down under the knot, the video under clear. */}
      <a className="hero-join" href="#join">
        <span>Join the pilot</span>
        <i aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </i>
      </a>
      <a className="hero-secondary" href="#how-it-works">
        <i aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />
          </svg>
        </i>
        <span>See how it works</span>
      </a>
      <button className="hero-film" type="button" data-film="">
        <i className="hero-film-play" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 6.2v11.6l9.4-5.8z" />
          </svg>
        </i>
        <span>Watch the video</span>
      </button>
    </div>
  );
}
