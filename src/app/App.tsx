import { useLayoutEffect } from 'react';
import { SECTIONS } from '../sections';

interface AppProps {
  // Starts the page's motion once the sections are in the DOM; returns its cleanup. Omitted on the
  // server, so no motion code is ever part of the prerender.
  onMount?: () => () => void;
}

// The nine sections, in page order. They render once and never re-render: after mount the DOM
// belongs to GSAP, so a section component holds no state.
export function App({ onMount }: AppProps) {
  useLayoutEffect(() => onMount?.(), [onMount]);
  return (
    <>
      {SECTIONS.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </>
  );
}
