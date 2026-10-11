const FILM = import.meta.env.VITE_FILM_URL || '/film/simpul_full_v9.mp4';

export function createFilm(): () => void {
  const dialog = document.createElement('dialog');

  dialog.className = 'film';
  dialog.setAttribute('aria-label', 'Simpul, the film');
  dialog.innerHTML = `<form method="dialog"><button class="film-close" aria-label="Close the film">Close <span aria-hidden="true">×</span></button></form><video controls playsinline preload="none" src="${FILM}"></video>`;
  document.body.append(dialog);
  const video = dialog.querySelector('video');
  const onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest('[data-film]')) {
      dialog.showModal();
      video?.play().catch(() => undefined);

      return;
    }

    if (event.target === dialog) {
      dialog.close();
    }
  };

  const onClose = () => video?.pause();

  document.addEventListener('click', onClick);
  dialog.addEventListener('close', onClose);

  return () => {
    document.removeEventListener('click', onClick);
    dialog.remove();
  };
}
