// Reading rendered HTML in tests: one section out of the page, and its words or hooks, normalised
// the same way for the React render and the vanilla build.
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
};

// The whole <section data-section="id">…</section>, opening tag included.
export const sectionOf = (html: string, id: string) =>
  html.match(new RegExp(`<section\\b[^>]*data-section="${id}"[\\s\\S]*?</section>`))?.[0] ?? '';

// Tags out without a regex: each '<' starts a tag that runs to the next '>'.
const stripTags = (html: string) =>
  html
    .split('<')
    .map((part, index) => (index ? part.slice(part.indexOf('>') + 1) : part))
    .join(' ');

// The words, as a reader gets them: no tags or comments, entities decoded, whitespace collapsed.
export const textOf = (html: string) =>
  stripTags(html.replace(/<!--[\s\S]*?-->/g, ''))
    .replace(/&[#\w]+;/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .replace(/ ([.,])/g, '$1') // "app ." from "<b>app</b>." reads "app."
    .trim();

const tokens = (html: string, pattern: RegExp) =>
  [
    ...new Set(
      [...html.matchAll(pattern)].flatMap((match) => match[1].split(/\s+/)).filter(Boolean),
    ),
  ].sort();

// Every class name used, once each, sorted.
export const classesOf = (html: string) => tokens(html, /\sclass="([^"]*)"/g);
// Every data-* attribute name used, once each, sorted.
export const hooksOf = (html: string) => tokens(html, /\s(data-[\w-]+)(?==|\s|>)/g);
