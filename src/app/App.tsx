import { useLayoutEffect } from 'react';
import { SECTIONS } from '../sections';

interface AppProps {
  onMount?: () => () => void;
}

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
