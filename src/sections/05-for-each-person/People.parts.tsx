import type { ReactNode } from 'react';

function PersonCard({
  person,
  face,
  name,
  job,
  quote,
  change,
}: {
  person: string;
  face: ReactNode;
  name: ReactNode;
  job: string;
  quote: string;
  change: string;
}) {
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the card is a pull target: keyboard users focus it to untie its knot, as in the vanilla page */}
      <li className="person" tabIndex={0} data-person={person}>
        <div className="person-knot" data-knot="" aria-hidden="true">
          <svg className="person-still" viewBox="0 0 200 120" preserveAspectRatio="none">
            <path d="M100 0V120" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="person-who">
          <span className="person-face" aria-hidden="true">
            {face}
          </span>
          <h3>
            {name} <small>{job}</small>
          </h3>
        </div>
        <div className="person-say">
          <blockquote>{quote}</blockquote>
          <p>{change}</p>
        </div>
      </li>
    </>
  );
}

export function PeopleCards() {
  return (
    <ul className="people-cards" data-people="">
      <PersonCard
        person="rina"
        name="Rina"
        job="sales admin"
        quote="“Tired of asking over and over. Sometimes I forget which are done.”"
        change="She never has to remember who to tell."
        face={
          <svg viewBox="0 0 48 48">
            <path d="M9.5 44c0-7.6 6.5-12.5 14.5-12.5S38.5 36.4 38.5 44" />
            <path d="M16.4 22c-1.9 4.3-1.7 8.4.1 11.6M31.6 22c1.9 4.3 1.7 8.4-.1 11.6" />
            <circle cx="24" cy="21" r="7.5" />
            <path d="M16.8 19.2c3.2-.3 6.2-1.8 8.2-4.4 1.5 2.4 3.6 3.9 6.2 4.4" />
            <circle className="eye" cx="21.2" cy="21.4" r="1" />
            <circle className="eye" cx="26.8" cy="21.4" r="1" />
            <path className="person-mouth" d="M21 24.6 Q24 27.2 27 24.6" />
            <path
              className="accent"
              d="M34.5 5.5h7.5a2 2 0 0 1 2 2V12a2 2 0 0 1-2 2h-4.2l-3 2.6V14h-.3a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z"
            />
          </svg>
        }
      />
      <PersonCard
        person="budi"
        name="Budi"
        job="warehouse lead"
        quote="“They keep asking, and I already said it yesterday.”"
        change="He reports once. One tap stops the reminders."
        face={
          <svg viewBox="0 0 48 48">
            <path d="M9.5 44c0-7.6 6.5-12.5 14.5-12.5S38.5 36.4 38.5 44" />
            <circle cx="24" cy="21" r="7.5" />
            <path className="accent" d="M16.5 19.4c.4-4.1 3.6-7 7.5-7s7.1 2.9 7.5 7z" />
            <path d="M31.5 19.4h4.6" />
            <circle className="eye" cx="21.2" cy="22" r="1" />
            <circle className="eye" cx="26.8" cy="22" r="1" />
            <path className="person-mouth" d="M21 25 Q24 27.4 27 25" />
            <rect className="accent" x="31" y="33.5" width="11" height="9" rx="1.5" />
            <path d="M31 37.5h11M36.5 33.5v4" />
          </svg>
        }
      />
      <PersonCard
        person="siti"
        name="Siti"
        job="operations manager"
        quote="“I only find out after the customer complains.”"
        change="She sees what is stuck before it becomes a problem."
        face={
          <svg viewBox="0 0 48 48">
            <path d="M9.5 44c0-7.6 6.5-12.5 14.5-12.5S38.5 36.4 38.5 44" />
            <path d="M15.6 30.6c-1.4-2-2.1-4.4-2.1-7.1 0-6.3 4.6-11 10.5-11s10.5 4.7 10.5 11c0 2.7-.7 5.1-2.1 7.1-2.4 2-5.2 3-8.4 3s-6-1-8.4-3z" />
            <circle cx="24" cy="22.5" r="6.4" />
            <circle className="eye" cx="21.6" cy="22.4" r="1" />
            <circle className="eye" cx="26.4" cy="22.4" r="1" />
            <path className="person-mouth" d="M21.4 25.4 Q24 27.6 26.6 25.4" />
            <circle className="accent" cx="39.5" cy="9.5" r="5" />
            <path d="M39.5 7v2.5l1.7 1.1" />
          </svg>
        }
      />
      <PersonCard
        person="hendra"
        name="Mr. Hendra"
        job="director"
        quote="“I am told when it is already late.”"
        change="One digest. Never a flood of operational pings."
        face={
          <svg viewBox="0 0 48 48">
            <path d="M9.5 44c0-7.6 6.5-12.5 14.5-12.5S38.5 36.4 38.5 44" />
            <circle cx="24" cy="21" r="7.5" />
            <path d="M16.7 18.6c.9-3.7 3.8-6 7.3-6s6.4 2.3 7.3 6c-2.6-.2-5.2-1.2-7.3-3-2.1 1.8-4.7 2.8-7.3 3z" />
            <circle cx="21" cy="21.4" r="2.3" />
            <circle cx="27" cy="21.4" r="2.3" />
            <path d="M23.3 21.4h1.4" />
            <path className="person-mouth" d="M21.4 25.2 Q24 27.4 26.6 25.2" />
            <path d="M20.4 31.8 24 34l3.6-2.2" />
            <path className="accent" d="M24 34l-2 2.6 2 6.4 2-6.4z" />
          </svg>
        }
      />
    </ul>
  );
}
