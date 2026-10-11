import type { ReactNode } from 'react';

export function QuietHead() {
  return (
    <header className="quiet-head">
      <div className="quiet-kicker">
        <p className="eyebrow">By design</p>
        <span className="quiet-chapter" aria-hidden="true">
          06 — WHAT IT REFUSES
        </span>
      </div>
      <h2 className="headline headline--section quiet-title" id="quiet-title">
        <span>Fewer notifications.</span>
        <span className="soft">More clarity.</span>
      </h2>
      <p className="lead quiet-lead">
        Most messages should go nowhere. That is the product working.
      </p>
    </header>
  );
}

export function QuietStage() {
  return (
    <figure className="quiet-stage" aria-hidden="true">
      <div className="quiet-panel">
        <article className="quiet-card">
          <p className="quiet-card-app">
            <b>simpul.</b>
            <small>now</small>
          </p>
          <p className="quiet-card-to">For Siti Aminah · Backup for Rina</p>
          <h4>ORD-0091 · Mrs. Sri</h4>
          <p>
            Aqua 600 ml · 3 cases ready since yesterday 16:02. Shipping is awaiting confirmation.
          </p>
        </article>
      </div>
    </figure>
  );
}

interface RuleProps {
  name: string;
  title: string;
  text: string;
  children: ReactNode;
}

function RuleItem({ name, title, text, children }: RuleProps) {
  return (
    <li className="quiet-rule" data-rule={name}>
      <span className="quiet-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">{children}</svg>
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </li>
  );
}

export function QuietRules() {
  return (
    <ul className="quiet-rules" data-commitments="">
      <RuleItem
        name="waits"
        title="It waits"
        text="Every notification is held for 60 seconds, so a correction can cancel it."
      >
        <circle cx="12" cy="13.5" r="7.5" />
        <path d="M12 10v3.5l2.4 1.6M9.5 3h5M12 3v3" />
      </RuleItem>
      <RuleItem
        name="limit"
        title="It has a limit"
        text="No more than 6 per person per hour. The rest become one summary."
      >
        <path d="M3.5 20h17M6.5 20v-5M10 20v-8M13.5 20v-6M17 20V9.5M3.5 7h17" />
      </RuleItem>
      <RuleItem
        name="sleeps"
        title="It sleeps"
        text="Quiet from 21:00 to 07:00. What can wait arrives in the morning."
      >
        <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z" />
        <path d="M16.5 4.5v3M15 6h3" />
      </RuleItem>
      <RuleItem
        name="asks"
        title="It asks instead of guessing"
        text="When unsure, one short question in the chat. If nobody answers, it stays silent."
      >
        <path d="M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5v-3.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
        <path d="M10.2 9a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.8-.9 1.4M12 14.4v.1" />
      </RuleItem>
      <RuleItem
        name="reads"
        title="It reads, it does not watch"
        text="Summaries only. Raw conversations stay restricted. It is not a tool for monitoring staff."
      >
        <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M4 20 20 4" />
      </RuleItem>
    </ul>
  );
}
