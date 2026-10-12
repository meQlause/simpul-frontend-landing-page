import { readFile, rm, writeFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const server = new URL('server/entry-server.js', dist);
const page = new URL('index.html', dist);
const PLACEHOLDER = '<!--app-html-->';

const { render } = (await import(server.href)) as { render: () => string };
const html = await readFile(page, 'utf8');

if (!html.includes(PLACEHOLDER)) {
  throw new Error(`dist/index.html has no ${PLACEHOLDER}`);
}

// Defer the full stylesheet so the inline loading screen can paint on a slow connection.
const deferred = html.replaceAll(
  /<link\b[^>]*rel="stylesheet"[^>]*>/g,
  (link) =>
    link.replace(
      'rel="stylesheet"',
      'rel="stylesheet" media="print" data-page-styles onload="this.media=\'all\'" onerror="this.dataset.failed=\'true\';document.dispatchEvent(new Event(\'page-load-error\'))"',
    ) +
    '<noscript>' +
    link +
    '</noscript>',
);

await writeFile(page, deferred.replace(PLACEHOLDER, render()));
await rm(new URL('server/', dist), { recursive: true });
console.log('Prerendered dist/index.html');
