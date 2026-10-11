import './close.css';

// Section 9, the close: the headline, the four "is not" lines, the lead, the knot with the one form in it,
// and the footer. The form works from the first paint; the motion only wires its submit and tightens the knot.
export function Close() {
  return (
    <section
      className="section close"
      id="join"
      data-section="09-close"
      aria-labelledby="close-title"
    >
      <span data-thread-in="" />
      <div className="close-body">
        <header className="close-head">
          <span className="close-chapter" aria-hidden="true">
            09 — THE KNOT
          </span>
          <h2 className="headline headline--section close-title" id="close-title">
            <span>Stay informed.</span>
            <span className="soft">Important updates are accounted for.</span>
          </h2>
          <ul className="is-not" data-is-not="">
            <li>Not a new chat app.</li>
            <li>Not an ERP.</li>
            <li>Not a dashboard.</li>
            <li>Not surveillance.</li>
          </ul>
          <p className="lead close-lead">
            Made first for <mark>distributors</mark>, <mark>trading companies</mark>,{' '}
            <mark>B2B services</mark> and <mark>small manufacturers</mark> whose day runs in group
            chats.
          </p>
        </header>
        {/* The knot: every strand of the page gathers into the logo, and the form is held inside it.
            The form is real and usable from the first paint; the knot is decoration around it. */}
        <div className="close-knot" data-knot="">
          <div className="close-mark" aria-hidden="true">
            <img src="/simpul-mark.png" width="520" height="520" alt="" />
          </div>
          <form className="join" data-join="" noValidate>
            <label htmlFor="join-email">Work email</label>
            <div className="join-row">
              <input id="join-email" name="email" type="email" autoComplete="email" required />
              <button className="button button--primary" type="submit">
                Join the pilot
              </button>
            </div>
            {/* Only a bot fills this. */}
            <input
              className="join-trap"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <p className="join-note">We will only use it to contact you about the pilot.</p>
            <p className="join-status" data-status="" role="status" aria-live="polite" />
          </form>
        </div>
      </div>
      <span data-thread-out="" />
      <footer className="page-foot">
        <strong className="page-foot-mark">
          simpul<span className="dot">.</span>
        </strong>
        <div className="page-foot-side">
          <span className="page-foot-line">
            Made for work that <span className="page-foot-flow">flows.</span>
          </span>
          <nav className="page-foot-nav" aria-label="Footer">
            <a href="#how-it-works">How it works</a>
            <a href="#page">Back to top</a>
          </nav>
        </div>
      </footer>
    </section>
  );
}
