// The one object that crosses every section boundary. It is an order, then a message, a label, a
// notification and a card, and it must stay recognisably the same thing.
const TEXT = {
  order: 'Order · Mrs. Sri',
  message: 'Three cases for Mrs. Sri are ready to ship.',
  label: 'Order · ready to ship · ORD-0091',
  notification: 'ORD-0091 · Mrs. Sri',
  card: 'ORD-0091',
} as const;

export type CarriedForm = keyof typeof TEXT;

export interface Carried {
  el: HTMLDivElement;
  setForm: (form: CarriedForm) => void;
}

export function createCarried(): Carried {
  const node = document.createElement('div');
  node.className = 'carried';
  node.setAttribute('aria-hidden', 'true'); // illustration; the sections' own text says the same thing
  const setForm = (form: CarriedForm) => {
    node.dataset.form = form;
    node.textContent = TEXT[form];
  };
  setForm('order');
  return { el: node, setForm };
}
