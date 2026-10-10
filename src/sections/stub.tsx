// A section not yet ported: its root and its two thread anchors, so the page thread already runs
// end to end. Each port phase in phases.md replaces one of these with the real section.
interface StubProps {
  id: string;
  className: string;
  anchor?: string;
}

export function stubSection({ id, className, anchor }: StubProps) {
  function StubSection() {
    return (
      <section className={`section ${className}`} id={anchor} data-section={id} data-stub="">
        <span data-thread-in="" />
        <span data-thread-out="" />
      </section>
    );
  }
  return StubSection;
}
