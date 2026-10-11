const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
};

export const sectionOf = (html: string, id: string) =>
  html.match(new RegExp(`<section\\b[^>]*data-section="${id}"[\\s\\S]*?</section>`))?.[0] ?? '';

const stripTags = (html: string) =>
  html
    .split('<')
    .map((part, index) => (index ? part.slice(part.indexOf('>') + 1) : part))
    .join(' ');

export const textOf = (html: string) =>
  stripTags(html.replace(/<!--[\s\S]*?-->/g, ''))
    .replace(/&[#\w]+;/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .replace(/ ([.,])/g, '$1')
    .trim();

const tokens = (html: string, pattern: RegExp) =>
  [
    ...new Set(
      [...html.matchAll(pattern)].flatMap((match) => match[1].split(/\s+/)).filter(Boolean),
    ),
  ].sort();

export const classesOf = (html: string) => tokens(html, /\sclass="([^"]*)"/g);

export const hooksOf = (html: string) => tokens(html, /\s(data-[\w-]+)(?==|\s|>)/g);
