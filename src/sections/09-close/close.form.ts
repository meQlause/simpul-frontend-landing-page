import { one } from '../../motion/dom';
import { STAND_IN } from './close.tuning';

const FORM_URL: string | undefined = import.meta.env.VITE_PILOT_FORM_URL;

async function send(email: string): Promise<void> {
  if (!FORM_URL) {
    await new Promise((resolve) => setTimeout(resolve, STAND_IN.waitMs));

    if (email.includes(STAND_IN.failWord)) {
      throw new Error('stand-in failure');
    }

    return;
  }

  const response = await fetch(FORM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(String(response.status));
  }
}

export interface Press {
  tighten: () => void;
}

function say(status: HTMLElement, state: string, text: string) {
  status.dataset.state = state;
  status.textContent = text;
}

async function deliver(form: HTMLFormElement, email: string) {
  const button = one<HTMLButtonElement>(form, '[type="submit"]');
  const status = one<HTMLElement>(form, '[data-status]');

  try {
    await send(email);
    one<HTMLElement>(form, '.join-row').hidden = true;
    one<HTMLElement>(form, 'label').hidden = true;
    say(status, 'done', 'Thank you. You are on the pilot list.');
  } catch {
    button.disabled = false;
    say(status, 'error', 'That did not go through. Try again.');
  }
}

export function wireForm(root: HTMLElement, press: Press): () => void {
  const form = one<HTMLFormElement>(root, '[data-join]');
  const field = one<HTMLInputElement>(form, '#join-email');
  const button = one<HTMLButtonElement>(form, '[type="submit"]');
  const status = one<HTMLElement>(form, '[data-status]');
  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(form);

    if (data.get('company')) {
      return;
    }

    if (!field.validity.valid) {
      say(status, 'error', 'Enter a work email address.');

      return;
    }

    button.disabled = true;
    say(status, '', '');
    press.tighten();
    await deliver(form, String(data.get('email')));
  };

  form.addEventListener('submit', onSubmit);

  return () => form.removeEventListener('submit', onSubmit);
}
