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
  node.setAttribute('aria-hidden', 'true');
  const setForm = (form: CarriedForm) => {
    node.dataset.form = form;
    node.textContent = TEXT[form];
  };

  setForm('order');

  return { el: node, setForm };
}
