// The problem's blocks, split out so each one stays inside the JSX depth limit. Each renders exactly the
// markup it replaces in Problem.tsx: no wrapper of its own.

// The chain: one order, passed person to person. Pinned; the link snaps at the third hand-over.
export function ProblemChain() {
  return (
    <ol className="chain" data-chain="">
      <li className="chain-person">
        <span className="chain-face" data-face="customer" aria-hidden="true">
          C
        </span>
        <strong>Customer</strong>
        <span>orders by chat</span>
        <b className="chain-link" aria-hidden="true">
          <s />
          <s />
        </b>
      </li>
      <li className="chain-person">
        <span className="chain-face" data-face="sales" aria-hidden="true">
          S
        </span>
        <strong>Sales</strong>
        <span>forwards it by hand</span>
        <b className="chain-link" aria-hidden="true">
          <s />
          <s />
        </b>
      </li>
      <li className="chain-person">
        <span className="chain-face" data-face="admin" aria-hidden="true">
          A
        </span>
        <strong>Admin</strong>
        <span>notes it, then asks</span>
        <b className="chain-link" aria-hidden="true">
          <s />
          <s />
        </b>
      </li>
      <li className="chain-person">
        <span className="chain-face" data-face="warehouse" aria-hidden="true">
          W
        </span>
        <strong>Warehouse</strong>
        <span>confirms stock</span>
        <b className="chain-link" aria-hidden="true">
          <s />
          <s />
        </b>
      </li>
      <li className="chain-person">
        <span className="chain-face" data-face="finance" aria-hidden="true">
          F
        </span>
        <strong>Finance</strong>
        <span>confirms payment</span>
        <b className="chain-link" aria-hidden="true">
          <s />
          <s />
        </b>
      </li>
      <li className="chain-person">
        <span className="chain-face" data-face="sales" aria-hidden="true">
          S
        </span>
        <strong>Sales</strong>
        <span>updates the customer</span>
      </li>
    </ol>
  );
}

// The floor: where the order falls and the questions pile up. The failures are the list with no motion.
export function ProblemFloor() {
  return (
    <div className="problem-floor">
      <p className="lead problem-close">Every arrow is something a person has to remember.</p>
      <ul className="grid grid--5 failures" data-failures="">
        <li className="card">A hand-off is missed</li>
        <li className="card">Nobody knows the status</li>
        <li className="card">The context is gone</li>
        <li className="card">A decision is not written down</li>
        <li className="card">The boss finds out too late</li>
      </ul>
    </div>
  );
}
