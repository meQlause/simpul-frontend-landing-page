import './hero.css';
import { HeroActions, HeroIllustration, HeroLockup, HeroTitle } from './Hero.parts';

export function Hero() {
  return (
    <section className="section hero" id="top" data-section="01-hero" aria-labelledby="hero-title">
      <span data-thread-in="" />
      <div className="hero-canvas" data-stage="">
        <div className="hero-kicker">
          <p className="eyebrow">Your information flow</p>
          <span className="hero-edition" aria-hidden="true">
            01 — THE CONNECTION
          </span>
        </div>
        {/* The idea, laid out: busy on the way in, the knot, clear on the way out. */}
        <div className="hero-heading-block">
          <HeroTitle />
          <HeroLockup />
        </div>
        <HeroIllustration />
        <HeroActions />
      </div>
      <footer className="hero-footer">
        <p className="footline">
          <span className="hero-status-dot" aria-hidden="true" />
          AI understands. You decide. Simpul routes.
        </p>
        <a className="hero-scroll" href="#hero-handoff">
          Follow the thread <span aria-hidden="true">↓</span>
        </a>
      </footer>
      <div className="hero-handoff" aria-hidden="true">
        <svg className="hero-release" preserveAspectRatio="none">
          <path />
        </svg>
        <span id="hero-handoff" data-thread-out="" />
      </div>
    </section>
  );
}
