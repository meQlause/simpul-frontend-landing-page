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

await writeFile(page, html.replace(PLACEHOLDER, render()));
await rm(new URL('server/', dist), { recursive: true });
console.log('Prerendered dist/index.html');
