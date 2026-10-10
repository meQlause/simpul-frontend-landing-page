# Porting plan: the Simpul landing page to React + TypeScript

This file is the work list. It is written so that an agent with no memory of how the page was built
can port it one phase at a time, check its own work, and stop at the right moment. Read sections
0 to 3 completely before starting any phase. Then do **one phase**, pass **every** exit check, commit,
and stop.

**The page is one unit.** The vanilla page was built section by section against stubs. This port
is not: the page has one scroll (ScrollSmoother), one thread, one carried object's journey, and it
is ported **in page order**, each section joined to the one above it the moment it lands. A phase is
done only when the page from the top down to the new section scrolls as one piece, forwards and
backwards.

---

## 0. Rules (read every time)

1. **Parity, not invention.** The React page must look, read and move exactly like the vanilla page
   in `../landing`. Same words, same class names, same `data-*` attributes, same CSS, same motion,
   same timings. Do not redesign, rename, "clean up" or "improve" anything. If the vanilla page does
   something odd, copy the odd thing. The only sanctioned differences are listed in 1.4.
2. **One unit.** Never build a section only in isolation. `?solo=NN` exists for debugging; every
   exit check is run on the **whole page** (`/`, no query). A section must start exactly where the
   one above it ends: same object, same state, same place, no jump, no flash, no double.
3. **`../landing` is read-only.** It is the source of truth. Never edit a file in it. The only
   commands you run there are `npm install`, `npm run build` and `npm run dev` (see 1.3).
4. **Never edit the toolchain files.** These are copied byte for byte from pspt and checked by hash:
   `eslint.config.mjs`, `knip.json`, `.prettierrc.json`, `.prettierignore`, `commitlint.config.mjs`,
   `.husky/pre-commit`, `.husky/commit-msg`. If a rule blocks you, change your code, not the rule.
5. **Lint is part of done.** `npm run check` must pass with zero warnings (`--max-warnings=0` turns
   every warning into a failure). Never add a file-wide `eslint-disable`. A one-line disable is
   allowed only for the cases listed in 3.4, and always with `-- reason`.
6. **One phase per run.** Do the phase's tasks in order. Run its exit checks. If all pass, commit
   (0.2) and stop. Do not start the next phase in the same run.
7. **When blocked, stop and write it down.** If the same error survives three honest attempts, stop.
   Add an entry under "Blocked" at the end of this file: the phase, the task, the exact command, the
   exact error text, and what you tried. Never weaken a test, skip a test, or delete an assertion to
   get green.
8. **Tick as you go.** In the phase you are doing, change `- [ ]` to `- [x]` for each exit check that
   passed. Commit `phases.md` with the phase.

### 0.1 Commands

Run every command from the repository root (`frontend-landing-page/`).

| Command                                | What it does                                                            | Must be                                      |
| -------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| `npm run check`                        | Prettier, ESLint (0 warnings), `tsc`, knip                              | exit 0                                       |
| `npm test`                             | Vitest: unit tests, including parity with `../landing/dist`             | all pass, parity **not** skipped (1.3)       |
| `npm run build`                        | Typecheck, client build, server build, prerender into `dist/index.html` | exit 0, prints `Prerendered dist/index.html` |
| `npm run test:e2e`                     | Builds, serves `dist/` on :4174, runs Playwright on desktop and phone   | all pass                                     |
| `npm run dev`                          | Dev server on http://localhost:5174 (not prerendered)                   |                                              |
| `npm run parity -- 08` / `-- 08 phone` | Screenshots of one section, vanilla beside React, into `parity/`        | both dev servers running                     |
| `npm run format`                       | Rewrites files to Prettier style. Run it before `check`                 |                                              |

### 0.2 Committing

**Every phase ends in a commit, and only once every exit check has passed.** A phase with a failing
check is not committed (rule 7 instead).

**Where.** This repository is a git submodule of `D:\simpul` (the main repository). Commit **only
here**, inside `frontend-landing-page/`. Never run `git add` or `git commit` in the main repository,
and never stage its submodule pointer: the owner moves it.

**Who.** Every commit is authored and committed as the GitHub account `meQlause`, and nobody else.
Before the first commit of every run, check all three, and stop (rule 7) if any differs:

```sh
gh auth status                  # "Active account: true" is on the meQlause line
git config user.name            # Ardial
git config user.email           # 127029513+meQlause@users.noreply.github.com
```

If the name or email is wrong, set them **for this repository only** (never `--global`):
`git config user.name "Ardial"` and `git config user.email "127029513+meQlause@users.noreply.github.com"`.

After committing, verify:

```sh
git log -1 --format='%an <%ae> | %cn <%ce>%n%B'
```

Both identities must read `Ardial <127029513+meQlause@users.noreply.github.com>`, and the message
must contain no `Co-Authored-By`, no "Generated with" and no session link. If it does, amend
the message (`git commit --amend`) before doing anything else.

- Stage explicit paths only: `git add src/sections/01-hero tests/unit/hero.test.ts ...`.
  Never `git add -A` or `git add .`.
- The pre-commit hook runs `npm run check`. If it fails, fix the code and commit again. Never use
  `--no-verify`.
- The message is a conventional commit. Use the exact message given in the phase. Body lines are at
  most 100 characters.
- **No `Co-Authored-By`, no "Generated with", no session link** anywhere in the message. commitlint
  rejects them (rule SR-6).
- Never `git push`. The owner pushes.

---

## 1. Where things are

### 1.1 The source: `../landing`

| Path in `../landing`                                                                  | What it is                                                                                               |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `README.md`                                                                           | The idea of the page, and **the hand-off table**: what crosses each boundary. Read it once, keep it open |
| `gsap.md`                                                                             | GSAP rules the page follows                                                                              |
| `sections/NN-name.md`                                                                 | The brief for one section: what it must say, what moves, "Connects", "Must hold", "Done when"            |
| `src/sections/NN-name/markup.html`                                                    | The section's HTML, exactly as it is in the page                                                         |
| `src/sections/NN-name/style.css`                                                      | The section's CSS                                                                                        |
| `src/sections/NN-name/index.js`                                                       | The section's motion: `export default { id, receives, init(root, shared) }`                              |
| `src/sections/05-for-each-person/knots.js`, `src/sections/06-quiet-by-design/heap.js` | Pure helper modules (numbers only, no DOM)                                                               |
| `src/sections/02-problem/people/*.svg`, `src/sections/07-the-panel/screens/*`         | Section assets                                                                                           |
| `src/shared/*`                                                                        | Shared motion pieces. **Already ported** to `src/motion/` here                                           |
| `src/main.js`                                                                         | The page orchestrator. **Already ported** to `src/motion/page.ts` here                                   |
| `scripts/check-*.mjs`                                                                 | One check per section. You port each one to a Vitest test                                                |
| `../assets/simpul-mark.svg`, `.png`                                                   | The logo. **Already copied** to `src/assets/` and `public/` here                                         |
| `simpul_full_v9.mp4`                                                                  | The film (29 MB). Copied in Phase 1, never committed                                                     |

### 1.2 This repository

```
frontend-landing-page/
  index.html                  meta, hero-boot script, #smooth-wrapper > #smooth-content > main#page > div#sections
  src/
    main.tsx                  hydrates (build) or renders (dev) <App>, then starts the motion
    entry-server.tsx          render(): the page as an HTML string (prerender + unit tests)
    app/App.tsx               renders SECTIONS in order; calls onMount once after mount
    sections/
      index.ts                SECTIONS: { id, Component } in page order (server-safe, no motion)
      motions.ts              MOTIONS: { id, receives, init } in page order (client only)
      stub.tsx                placeholder section; each port phase replaces one use of it
      NN-name/                one folder per ported section (you create these)
    motion/                   the shared motion layer (ported from ../landing/src/shared + main.js)
      gsap.ts                 gsap, ScrollTrigger, ScrollSmoother, conditions, ease, duration, scroll
      page.ts                 startPage(): film, thread, carried, handoff, the one scroll, solo stub
      thread.ts               the page-length thread layer
      carried.ts              the carried object (order → message → label → notification → card)
      handoff.ts              where the previous section left its object
      film.ts                 the film dialog for any [data-film] button
      random.ts               seeded(seed): deterministic random
      types.ts                Shared, Conditions, SectionMotion
    styles/tokens.css, base.css   copied from ../landing/src/shared (base.css holds the hover rules)
    assets/simpul-mark.svg    the logo as SVG source
  public/simpul-mark.png      favicon and still logo
  scripts/prerender.ts        writes the rendered sections into dist/index.html
  scripts/parity.ts           side-by-side screenshots
  tests/unit/                 Vitest (page.test, motion.test, parity.test, html.ts helpers, ported.ts)
  tests/e2e/page.spec.ts      Playwright against the built page
```

How a page load works:

1. `npm run build` renders `<App/>` to HTML on the server and writes it into `dist/index.html`. Every
   word is in the HTML before any script runs.
2. In the browser, `main.tsx` hydrates `<App onMount=...>` into `#sections`.
3. After mount, `App` calls `onMount`, which calls `startPage(page, MOTIONS)`.
4. `startPage` creates the film, the thread, the carried object and the hand-off. Then, inside one
   `gsap.matchMedia`, it creates **the one scroll** (`ScrollSmoother`, not with reduced motion), then
   calls every section's `init(root, shared)` **in page order**, then draws the thread.
5. From then on the DOM belongs to GSAP. **Section components never re-render** and hold no state.

### 1.3 Running the vanilla page beside this one

```sh
cd ../landing && npm install   # once
cd ../landing && npm run build # before every `npm test`: parity.test.ts reads ../landing/dist/index.html
cd ../landing && npm run dev   # http://localhost:5173, for npm run parity
```

`tests/unit/parity.test.ts` is **skipped** when `../landing/dist/index.html` does not exist (in CI).
Locally it must **run**. If Vitest reports it as skipped, build the vanilla page and run again.

### 1.4 The one scroll, and the only sanctioned differences from the vanilla page

The whole page scrolls through one `ScrollSmoother` (`src/motion/page.ts`). It is created before any
section's ScrollTrigger, so every pin and every scrub in the page runs on the same smoothed clock and
the hand-offs between sections land on the same frame. Its consequences, which every phase must
respect:

| Rule                                                             | Why                                               | What to do                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| CSS `position: sticky` does not work inside the smoothed content | ScrollSmoother moves the content with a transform | Replace it with a ScrollTrigger pin (`pinSpacing: false`). Only section 6 has it (Phase 7) |
| `position: fixed` inside a section behaves like `absolute`       | same                                              | Nothing in the sections uses it today; never add it                                        |
| Do not listen to `scroll` or `wheel` events                      | the smoother owns them                            | Use ScrollTrigger (`onUpdate`, `scrub`)                                                    |
| In-page links (`#join`, `#how-it-works`)                         | they must go through the smoother                 | Already handled in `page.ts` (`routeAnchors`). Do not add your own handlers                |
| `shared.smoother`                                                | the instance, or `null` with reduced motion       | Use it only to scroll programmatically (`shared.smoother?.scrollTo(...)`)                  |

Differences from the vanilla shared API (the only ones):

| Vanilla                                                                  | Here                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| native scroll                                                            | one `ScrollSmoother` (`shared.smoother`)                     |
| `thread.color` (a getter)                                                | `thread.color()` (a function)                                |
| `carried.forms`                                                          | removed (nothing used it)                                    |
| `?solo=` removed the other sections                                      | `?solo=` sets `hidden` on them (React owns them)             |
| `createFilm()` called in `main.js`                                       | called inside `startPage`                                    |
| `import { seeded } from '../../shared/random.js'`                        | `import { seeded } from '../../motion/random'`               |
| `import mark from '../../../../assets/simpul-mark.svg?raw'`              | `import { mark } from '../../motion/mark'` (made in Phase 1) |
| section 6: `.quiet-stage` and `.quiet-index-view` are `position: sticky` | a ScrollTrigger pin (Phase 7)                                |

---

## 2. The section recipe

Every port phase (2 to 10) follows these steps. The phase adds only the details that are particular
to its section.

### 2.1 Folder and file names

For section `08-your-data`, with the component name `YourData` and the file stem `your-data`:

```
src/sections/08-your-data/
  YourData.tsx            the section's markup as one component (the root <section>)
  YourData.parts.tsx      sub-components, when JSX gets deeper than 5 levels or a file passes 400 lines
  your-data.css           ../landing/src/sections/08-your-data/style.css, copied verbatim
  your-data.motion.ts     export const initYourData: SectionMotion['init']
  your-data.tuning.ts     every number the motion uses, as named constant objects
  your-data.shapes.ts     (only if needed) large repeated SVG data, as arrays of objects
tests/unit/your-data.test.ts   the port of ../landing/scripts/check-data.mjs
tests/e2e/your-data.spec.ts    the section's own browser checks
```

| #   | Folder               | Component       | File stem         | Vanilla check script | Pinned                    |
| --- | -------------------- | --------------- | ----------------- | -------------------- | ------------------------- |
| 1   | `01-hero`            | `Hero`          | `hero`            | `check-hero.mjs`     | no                        |
| 2   | `02-problem`         | `Problem`       | `problem`         | (none)               | yes                       |
| 3   | `03-turn`            | `Turn`          | `turn`            | `check-turn.mjs`     | no                        |
| 4   | `04-how-it-works`    | `HowItWorks`    | `how-it-works`    | `check-how.mjs`      | yes (desktop)             |
| 5   | `05-for-each-person` | `ForEachPerson` | `for-each-person` | `check-people.mjs`   | no                        |
| 6   | `06-quiet-by-design` | `QuietByDesign` | `quiet-by-design` | `check-quiet.mjs`    | stage pinned (was sticky) |
| 7   | `07-the-panel`       | `ThePanel`      | `the-panel`       | `check-panel.mjs`    | yes (desktop)             |
| 8   | `08-your-data`       | `YourData`      | `your-data`       | `check-data.mjs`     | no                        |
| 9   | `09-close`           | `Close`         | `close`           | `check-close.mjs`    | no                        |

### 2.2 Step A: read

Read, in full: the brief `../landing/sections/NN-name.md` (especially "Connects": what it receives
and what it hands on), the hand-off table in `../landing/README.md`, then `markup.html`, `style.css`
and `index.js` of the section, and its check script. Write down (in your scratch notes, not in a
file): every selector `index.js` queries, every element it creates, every CSS custom property it
sets, every ScrollTrigger it creates (trigger, start, end, pin, scrub), how it uses `handoff`,
`carried` and `thread`, and what its cleanup removes.

### 2.3 Step B: CSS

1. Copy `style.css` to `<stem>.css` **unchanged**.
2. Import it at the top of the component: `import './your-data.css';`
3. The only allowed edits: asset URLs that pointed into `../landing` (point them at the copied
   assets), and the sticky rules of section 6 (1.4). Nothing else.

### 2.4 Step C: markup to JSX

The component returns the section's HTML as JSX. The rendered HTML must match the vanilla HTML:
same elements, same order, same classes, same attributes, same text. `tests/unit/parity.test.ts`
checks words, classes and `data-*` names; the screenshots check the rest.

Skeleton:

```tsx
import type { CSSProperties } from 'react';
import './your-data.css';

export function YourData() {
  return (
    <section
      className="section data"
      id="your-data"
      data-section="08-your-data"
      aria-labelledby="data-title"
    >
      <span data-thread-in="" />
      {/* … the rest of markup.html … */}
      <span data-thread-out="" />
    </section>
  );
}
```

Conversion rules. Apply every one.

| HTML                                                                                                                                                                                         | JSX                                                                                        | Note                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `class="a b"`                                                                                                                                                                                | `className="a b"`                                                                          | also inside `<svg>`                                                                                  |
| `for="x"`                                                                                                                                                                                    | `htmlFor="x"`                                                                              |                                                                                                      |
| `tabindex="0"`                                                                                                                                                                               | `tabIndex={0}`                                                                             |                                                                                                      |
| `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`, `fill-rule`, `clip-rule`, `stop-color`, `font-size`, `text-anchor`, any other hyphenated SVG/presentation attribute | `strokeWidth`, `strokeLinecap`, … (camelCase)                                              | React prints them back hyphenated                                                                    |
| `viewBox`, `preserveAspectRatio`                                                                                                                                                             | unchanged                                                                                  | already camelCase                                                                                    |
| `xlink:href`                                                                                                                                                                                 | `xlinkHref`                                                                                |                                                                                                      |
| `data-*`, `aria-*`                                                                                                                                                                           | unchanged                                                                                  |                                                                                                      |
| `data-film` (no value)                                                                                                                                                                       | `data-film=""`                                                                             | every valueless `data-*` gets `=""`                                                                  |
| `novalidate`, `playsinline`, `autocomplete`, `autoplay`, `readonly`, `maxlength`, `srcset`                                                                                                   | `noValidate`, `playsInline`, `autoComplete`, `autoPlay`, `readOnly`, `maxLength`, `srcSet` |                                                                                                      |
| `hidden`, `required`, `disabled`, `checked` (boolean)                                                                                                                                        | `hidden`, `required` … (bare, in JSX)                                                      |                                                                                                      |
| `style="--at: 13.75%"`                                                                                                                                                                       | `style={{ '--at': '13.75%' } as CSSProperties}`                                            | custom properties need the cast                                                                      |
| `style="top: 13.75%"`                                                                                                                                                                        | `style={{ top: '13.75%' }}`                                                                |                                                                                                      |
| `<img …>`, `<br>`, `<input …>`, `<path …>`                                                                                                                                                   | `<img … />` etc.                                                                           | every void or empty element self-closes                                                              |
| `<!-- comment -->`                                                                                                                                                                           | `{/* comment */}`                                                                          | keep the comment text: it explains the design                                                        |
| `&nbsp;`, `&amp;`, `&times;`                                                                                                                                                                 | the character itself (`{' '}`, `&`, `×`)                                                   |                                                                                                      |
| a space between two inline elements on the same HTML line, e.g. `<b>Not</b> <span>…`                                                                                                         | keep it on one JSX line, or write `{' '}`                                                  | **JSX drops whitespace at line breaks.** The parity test cannot see a lost space; the screenshot can |
| `<img src="/simpul-mark.png">`                                                                                                                                                               | `<img src="/simpul-mark.png" />`                                                           | files in `public/` keep their absolute path                                                          |
| `<img src="/src/sections/07-the-panel/screens/home.webp">`                                                                                                                                   | `import home from './screens/home.webp';` then `src={home}`                                | files next to the section are imported                                                               |

Keep the attribute **order** the same as in `markup.html`. Several ported checks match raw HTML with
a regular expression (for example `<button\b[^>]*type="submit"[^>]*>Join the pilot</button>`), and
React prints attributes in JSX order.

What React prints differently, and how the ported test must allow for it:

| Vanilla HTML                          | React's HTML                                          |
| ------------------------------------- | ----------------------------------------------------- |
| `<input required>`                    | `<input required=""/>`                                |
| `<img …>`                             | `<img …/>`                                            |
| `data-film`                           | `data-film=""`                                        |
| text next to an expression, `a {b} c` | `a <!-- -->b<!-- --> c` (comments between text parts) |

Use `textOf()` from `tests/unit/html.ts` for every assertion about words: it strips tags and those
comments. Only use a raw-HTML regular expression for structure (an attribute, an element count).

Size rules that force splitting (see 3.3): `react/jsx-max-depth` is 5. A section is deeper than that,
so cut it into sub-components in `<Component>.parts.tsx`, one per meaningful block (for example
`DataKept`, `DataStack`, `DataLayer`). Name each after its main class. Each must render exactly the
same HTML it replaces: a sub-component adds **no** wrapper element.

Large repeated SVG (section 8's 180 cells and 108 ghosts): do not hand-type hundreds of lines. Put the
data in `<stem>.shapes.ts` as an array of objects (numbers inside object literals are allowed by the
lint rules) and `.map()` it in JSX, with a stable `key`. The output must be identical: same element,
same attribute order, same values.

```ts
// your-data.shapes.ts
export const CELLS = [
  { className: 'cell cell--a', points: '120,40 140,50 120,60 100,50', far: 0.12 },
  // …
] as const;
```

Static means static. A section component has **no** `useState`, `useEffect`, `useRef`, event
handlers or conditional rendering. Behaviour (forms, buttons, hover) stays in the motion file, as in
the vanilla page. (Reason: GSAP rewrites this DOM; a React re-render would undo it.)

### 2.5 Step D: the motion file

Port `index.js` to `<stem>.motion.ts`. **Behaviour identical**: same selectors, same triggers, same
starts and ends, same eases, same durations, same order of operations, same cleanup.

Skeleton:

```ts
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { SplitText } from 'gsap/SplitText';
import { all, one } from '../../motion/dom';
import type { SectionMotion, Shared } from '../../motion/types';
import { CLOCK, FLOW } from './your-data.tuning';

// Everything the motion holds between calls, in one place.
interface Scene {
  root: HTMLElement;
  svg: SVGSVGElement;
  clock: { progress: number };
  // …
}

function buildScene(root: HTMLElement): Scene {
  // the elements index.js created and the ones it looked up
}

function revealText(scene: Scene, shared: Shared): SplitText[] {
  // the SplitText + ScrollTrigger text reveals, returned so cleanup can revert them
}

function measure(scene: Scene): void {
  // index.js measure()
}

function render(scene: Scene): void {
  // index.js render(), split further if it is long
}

export const initYourData: SectionMotion['init'] = (root, shared) => {
  if (shared.conditions.reduce) {
    return undefined; // the vanilla early return: the still page
  }
  shared.gsap.registerPlugin(MotionPathPlugin, SplitText);
  root.dataset.motion = '';
  const scene = buildScene(root);
  const splits = revealText(scene, shared);
  measure(scene);
  // … the scroll clock, the refresh listener …
  return () => {
    // exactly what the vanilla cleanup did, in the same order
    splits.forEach((split) => split.revert());
    scene.svg.remove();
    delete root.dataset.motion;
  };
};
```

How to get there from the vanilla `init`:

1. **Imports.** `gsap`, `ScrollTrigger`, `smoother`, `ease`, `duration`, `thread`, `carried`,
   `handoff` and `conditions` come from `shared`. Do not import `gsap` from `'gsap'` in a section,
   except plugins (`import { SplitText } from 'gsap/SplitText'`) and types.
2. **The vanilla `init` is one long closure.** The lint limits (3.3) do not allow that. Move its local
   variables into a typed `Scene` object made by `buildScene`. Turn each inner function into a
   module-level function that takes the scene (and `shared` if it needs it). `init` itself only wires
   things together, in the vanilla order.
3. **Numbers.** Every number other than -1, 0, 1 and 2 moves into `<stem>.tuning.ts`, grouped by
   meaning, with the vanilla comment kept:
   ```ts
   // your-data.tuning.ts
   export const CLOCK = {
     forked: 0.23, // of the clock: both lines have reached their sides
     full: 0.84, // the last layer is full and the left line has reached the bottom
     every: 0.11, // a layer starts this long after the one above
     takes: 0.15,
   } as const;
   ```
   Values inside a GSAP vars object (`{ duration: 0.6, yPercent: 110 }`) are object properties and
   are allowed in place. Keep them there, as in the vanilla code, so the timeline reads the same.
   Strings in `start: 'top 80%'` are strings: allowed.
4. **DOM lookups.** Use `one(root, '.data-title')` and `all(root, '.data-layers li')` from
   `src/motion/dom.ts` (made in Phase 1). `one` throws if the element is missing; that is a bug in
   your markup, so fix the markup.
5. **Types.** Give every function parameter a type. Element types: `HTMLElement`, `SVGSVGElement`,
   `SVGPathElement`, `SVGGElement`, `HTMLImageElement`. GSAP types: `gsap.core.Timeline`,
   `gsap.core.Tween`, `ScrollTrigger`, `SplitText`. MotionPath raw paths:
   `ReturnType<typeof MotionPathPlugin.getRawPath>`. Never use `any`. When the DOM API returns
   `Element`, narrow with `one<SVGPathElement>(root, 'path')`.
6. **Created SVG elements.** `document.createElementNS(SVG_NS, 'path')` with `SVG_NS` from
   `src/motion/dom.ts`.
7. **Cleanup.** Return a function that undoes **everything** `init` added: SplitText reverts, created
   elements removed, `ScrollTrigger` event listeners removed, `gsap.ticker` callbacks removed,
   observers disconnected, `data-motion` deleted, inline styles cleared where the vanilla cleanup
   cleared them. Tweens and ScrollTriggers created inside `init` are reverted by `gsap.matchMedia`
   automatically; you do not kill them by hand unless the vanilla code did.
8. **Comments.** Keep the vanilla comments that explain why. Do not keep commented-out code
   (`sonarjs/no-commented-code`) or `TODO` (`sonarjs/todo-tag`).
9. **The one scroll (1.4).** Never `addEventListener('scroll' | 'wheel')`. If the vanilla code reads
   `scrollY` or `innerHeight` to place things, keep it: ScrollSmoother keeps the native scroll
   position.

### 2.6 Step E: register the section

In `src/sections/index.ts`, replace the section's `stubSection(...)` entry:

```ts
import { YourData } from './08-your-data/YourData';
// …
{ id: '08-your-data', Component: YourData },
```

In `src/sections/motions.ts`, replace `init: still` for the section:

```ts
import { initYourData } from './08-your-data/your-data.motion';
// …
{ id: '08-your-data', receives: { form: 'card', thread: 'green' }, init: initYourData },
```

Never change an `id` or a `receives` value: they are the hand-off contract.

### 2.7 Step F: tests

1. Port `../landing/scripts/check-<name>.mjs` to `tests/unit/<stem>.test.ts`. Skeleton:
   ```ts
   import { describe, expect, it } from 'vitest';
   import { render } from '../../src/entry-server';
   import { sectionOf, textOf } from './html';

   const html = sectionOf(render(), '08-your-data');
   const text = textOf(html);

   describe('section 8, your data', () => {
     it('says everything with no motion', () => {
       for (const copy of ['Your data stays yours.', 'Keep it in your own database.']) {
         expect(text).toContain(copy);
       }
     });
     // one `it` per assert block of the check script, same meaning, same numbers
   });
   ```
   Every assertion in the check script becomes an `expect`. Keep the check's failure message as the
   `it` title or as the second argument of `expect`. Assertions about the **whole page** (for example
   "nine sections, in this order") already live in `tests/unit/page.test.ts`; skip those.
   Assertions that read `index.js` source as text (for example "no `pin:`") read `<stem>.motion.ts`
   instead, with `readFileSync(new URL('../../src/sections/…', import.meta.url), 'utf8')`.
2. Pure helper modules (`knots.js`, `heap.js`) become `<name>.ts` next to the motion file, typed, and
   the check's assertions about them move to the unit test.
3. Add the section id to `tests/unit/ported.ts`:
   ```ts
   export const PORTED: readonly string[] = ['01-hero', '02-problem'];
   ```
   `PORTED` is always a prefix of the page order: `01`, then `01, 02`, then `01, 02, 03`, …
4. Add the section's own e2e test to `tests/e2e/<stem>.spec.ts`: at least (a) the whole page loads
   with no page errors, (b) after scrolling through the section its root has `data-motion`, and (c)
   anything the brief says a visitor can do (a button, a form, a focusable card) works. Use
   `expect.poll` or `toHaveCount`, never `waitForTimeout` (`sonarjs/no-fixed-wait-in-tests`).
5. The page-flow test (`tests/e2e/flow.spec.ts`, made in Phase 1) covers every ported section
   automatically. It must pass.

### 2.8 Step G: visual parity, and the seam

1. Build and start the vanilla page (1.3). Start this one: `npm run dev`.
2. Run `npm run parity -- NN` and `npm run parity -- NN phone`.
3. Open every pair `parity/NN-<device>-<stop>-vanilla.png` and `…-react.png` and compare them. Look
   at: text position and wrapping, colours, sizes, spacing, the thread's path, what has moved by
   that point, what is visible or hidden.
4. Fix every difference. Then run the parity script again and look again. Repeat until there is none.
   Allowed differences: sub-pixel anti-aliasing, and the stub sections below the ported ones.
5. **The seam.** Open `http://localhost:5174/` (the whole page, no `?solo`). Scroll slowly from the
   middle of the section above into this one and on to its end, then back up to the section above.
   At the boundary: the object the README's hand-off table says crosses it is in exactly one place,
   in the same state on both sides, and never disappears, doubles or jumps. The thread is unbroken.
   Do the same in the vanilla page and compare: the React seam must be at least as smooth.

### 2.9 Step H: exit checks (the same for every port phase)

- [ ] `npm run format` then `npm run check` exits 0
- [ ] `npm test` passes, and the parity test **ran** (not skipped) for every id in `PORTED`
- [ ] `npm run build` exits 0 and prints `Prerendered dist/index.html`
- [ ] `npm run test:e2e` passes on desktop and phone, including `flow.spec.ts`
- [ ] The section's ported unit test passes and contains every assertion of the vanilla check script
- [ ] `npm run parity -- NN` and `npm run parity -- NN phone`: no visible difference at any stop
- [ ] The seam with the section above (2.8 step 5) is clean, forwards and backwards, desktop and phone
- [ ] With "prefers-reduced-motion: reduce" (DevTools → Rendering), the section reads correctly and
      has no `data-motion` attribute
- [ ] The brief's "Done when" list (`../landing/sections/NN-name.md`) holds, item by item
- [ ] No `console.error` or page error in the browser console while scrolling the whole page
- [ ] `src/sections/index.ts` and `motions.ts` no longer use the stub for this section

---

## 3. Lint survival guide

The ESLint config is strict. The vanilla code breaks most of these rules on almost every line, so
porting is mostly restructuring. Here is each rule, what it means and what to do.

### 3.1 Names: `id-length` (min 3)

Every variable, parameter, function and destructured name must be at least 3 characters. Allowed
short names: `id`, `db`, `to`, `up`, `fn`. Object **property** names are exempt (`{ x: 1, y: 2 }` is
fine; `const { x } = point` is not, because `x` becomes a variable).

| Vanilla                | Use                                                         |
| ---------------------- | ----------------------------------------------------------- |
| `i`, `j`, `k`, `n`     | `index`, `inner`, `step`, `count`                           |
| `el`, `li`, `g`        | `node`, `item`, `group`                                     |
| `e`, `ev`              | `event`                                                     |
| `x`, `y` (variables)   | `left`, `top` or `posX`, `posY`                             |
| `cx`, `cy`, `r`        | `centreX`, `centreY`, `radius`                              |
| `W`, `H`               | `width`, `height`                                           |
| `p`, `t`, `u`, `v`     | `progress`, `time`, `share`, `value`                        |
| `a`, `b`               | `start`, `end` (or `from`, `upto`)                          |
| `tl`                   | `timeline`                                                  |
| `d`                    | `pathData`                                                  |
| `NS`                   | `SVG_NS` (from `src/motion/dom.ts`)                         |
| `_` (unused parameter) | `_unused` (any name starting with `_` is treated as unused) |

Keep **property** names as they are when they are part of a data shape GSAP or the DOM uses
(`{ x, y, rotation }` in tween vars, `dataset.exitX`).

### 3.2 Numbers: `no-magic-numbers`

Allowed literally: `-1`, `0`, `1`, `2`, array indexes, default parameter values, and **any number
that is the value of a property in an object literal** (`{ duration: 0.6 }`). Also allowed: a number
that is the whole initialiser of a `const` (`const SNAP = 3.72;`).

Not allowed: a number in an expression (`x * 0.55`), in an array literal (`[1.2, 1.9]`), as a
function argument (`seg(p, 0.08, 0.23)`), in a comparison (`v > 0.002`).

Fix: name it in `<stem>.tuning.ts`. Arrays of numbers become objects or arrays of objects:
`[[1.2, 1.9], [2.1, 2.8]]` → `[{ start: 1.2, end: 1.9 }, { start: 2.1, end: 2.8 }]`.

Numbers inside template strings that build SVG paths (`` `M${x},${y + 30}` ``) are expressions
too: name the offset.

### 3.3 Size and shape

| Rule                                                          | Limit                                                  | What to do                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| `max-lines-per-function`                                      | 100 lines                                              | split                                                              |
| `max-lines`                                                   | 500 lines per file                                     | move parts to `.parts.tsx`, `.shapes.ts`, or a second `.ts` module |
| `max-statements`                                              | 15 per function                                        | split into named steps; group setup in `buildScene`                |
| `max-params`                                                  | 4                                                      | pass one object: `place({ node, left, top, angle })`               |
| `complexity`                                                  | 8                                                      | fewer branches per function; split                                 |
| `sonarjs/cognitive-complexity`                                | 10                                                     | flatten: early returns, small helpers                              |
| `max-depth`                                                   | 2 nested blocks                                        | extract the inner loop body into a function                        |
| `react/jsx-max-depth`                                         | 5                                                      | sub-components (2.4)                                               |
| `sonarjs/no-nested-functions`                                 | functions nested more than 4 deep                      | module-level functions                                             |
| `sonarjs/no-nested-template-literals`                         | no template inside a template                          | build the inner string in a `const` first                          |
| `sonarjs/no-nested-conditional`                               | no nested ternary                                      | `if` statements or a lookup object                                 |
| `no-else-return`, `no-lonely-if`, `sonarjs/no-collapsible-if` |                                                        | return early; merge conditions                                     |
| `curly`                                                       | always braces                                          | `if (done) { return; }`                                            |
| `sonarjs/no-parameter-reassignment`                           |                                                        | copy to a local first                                              |
| `sonarjs/no-selector-parameter`                               | no boolean parameter that switches behaviour           | two functions, or an options object                                |
| `sonarjs/no-duplicate-string`                                 | the same string 3 times                                | a `const` (selectors especially)                                   |
| `sonarjs/super-linear-regex`                                  | no backtracking regex                                  | simpler pattern, or `split`                                        |
| `sonarjs/no-fixed-wait-in-tests`                              | no `waitForTimeout` in tests                           | `expect.poll`, `toHaveCount`, `toBeVisible`                        |
| `unused-imports/*`, knip                                      | no unused import, variable, export, file or dependency | delete it; export only what another file imports                   |
| `@typescript-eslint/no-explicit-any`                          |                                                        | real types; `unknown` plus narrowing                               |

### 3.4 When a one-line disable is allowed

Only these, always on the line above and always with a reason after `--`:

```ts
// eslint-disable-next-line import/no-unresolved -- Vite's ?raw suffix: Vite resolves it, the import plugin cannot
import markSource from '../assets/simpul-mark.svg?raw';
```

```tsx
{/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the card is a pull target: keyboard users focus it to untie its knot, as in the vanilla page */}
<li className="person" tabIndex={0} data-person="rina">
```

Anything else: change the code. If the code cannot change without changing behaviour, stop (rule 7).

---

## 4. The phases

Order: the shared pieces, then the sections **in page order**, so the page grows downward as one
piece and every phase joins its section to the one above it.

| Phase | What                                                            | Joins onto                                     | Size of the vanilla code             |
| ----- | --------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------ |
| 0     | Scaffold, with the one scroll (done)                            |                                                |                                      |
| 1     | Foundation: helpers, assets, film, parity and page-flow tooling |                                                |                                      |
| 2     | Section 1, Hero                                                 | the top of the page                            | 357 js · 122 css · 30 html           |
| 3     | Section 2, Problem                                              | 1 → 2: the loosened thread carrying the order  | 331 js · 66 css · 30 html + people   |
| 4     | Section 3, Turn                                                 | 2 → 3: the order, lying where it fell          | 311 js · 111 css · 39 html           |
| 5     | Section 4, How it works                                         | 3 → 4: the order, lifted and outlined          | 414 js · 160 css · 75 html           |
| 6     | Section 5, For each person                                      | 4 → 5: the completed, green thread             | 306 js + knots.js · 56 css · 57 html |
| 7     | Section 6, Quiet by design                                      | 5 → 6: four strands rejoined into one          | 488 js + heap.js · 139 css · 30 html |
| 8     | Section 7, The panel                                            | 6 → 7: the one notification, carrying a card   | 304 js · 65 css · 29 html + screens  |
| 9     | Section 8, Your data                                            | 7 → 8: a bare thread                           | 227 js · 88 css · 82 html            |
| 10    | Section 9, Close                                                | 8 → 9: nothing crosses (8 ties its thread off) | 250 js · 68 css · 40 html            |
| 11    | The whole page: every seam, the one scroll tuned                |                                                |                                      |
| 12    | Hardening: no-JS, reduced motion, phone, performance, deploy    |                                                |                                      |

---

### Phase 0: Scaffold (done)

Already in place: the toolchain, the build with prerender, the one scroll (ScrollSmoother, with
in-page links routed through it), the shared motion layer, nine stub sections, unit tests (page,
motion, parity), e2e tests (desktop, phone, no-JS, reduced motion, one smoother), CI.

Exit checks:

- [x] `npm run check` exits 0
- [x] `npm test` passes (7 tests)
- [x] `npm run build` prerenders nine sections into `dist/index.html`
- [x] `npm run test:e2e` passes (8 tests)
- [x] The seven toolchain files are byte-identical to `../frontend`'s (same sha256)

---

### Phase 1: Foundation

**Goal:** the helpers every section needs, the shared assets, and the tooling that keeps the page one
unit (parity screenshots and the page-flow test), so Phase 2 can start porting straight away.

Tasks:

1. Create `src/motion/dom.ts`, exactly:
   ```ts
   export const SVG_NS = 'http://www.w3.org/2000/svg';

   // Typed lookups inside a section root. `one` throws when the markup and the motion disagree:
   // that is a bug to fix in the markup, not a case to handle.
   export function one<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
     const found = root.querySelector<T>(selector);
     if (!found) {
       throw new Error(`Missing ${selector}`);
     }
     return found;
   }

   export function all<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
     return [...root.querySelectorAll<T>(selector)];
   }

   // How far a value has got from start to end, clamped to 0..1. The vanilla `seg(v, a, b)`.
   export function segment(value: number, start: number, end: number): number {
     return Math.min(1, Math.max(0, (value - start) / (end - start)));
   }
   ```
   Then change `src/motion/thread.ts` to import `SVG_NS` from `./dom` instead of declaring its own.
2. Create `src/motion/mark.ts`, exactly:
   ```ts
   // eslint-disable-next-line import/no-unresolved -- Vite's ?raw suffix: Vite resolves it, the import plugin cannot
   import markSource from '../assets/simpul-mark.svg?raw';

   // The logo as SVG markup, for the sections that draw it (1 and 9).
   export const mark: string = markSource;
   ```
3. Add `tests/unit/dom.test.ts`: `segment` (below start → 0, above end → 1, the middle → 0.5);
   `one` (throws on a missing selector, returns the element otherwise) and `all`, with a tiny fake
   such as `{ querySelector: () => null } as unknown as ParentNode`; and `mark` starts with `<svg`.
   These tests also keep knip green until the sections use the helpers.
4. Create `tests/e2e/flow.spec.ts`, the page-flow test that holds the page together as it grows.
   It scrolls the **whole built page** from the top to the bottom and back in even steps (use 30
   steps; at each step `scrollTo` then `expect.poll` until the smoothed content has caught up:
   `document.querySelector('#smooth-content').getBoundingClientRect().top` equals `-scrollY`
   within 2 px). At every step assert:
   - no page error and no `console.error` so far;
   - at most one **visible** carried object: count elements matching `.carried` whose computed
     `visibility` is `visible`, `opacity` is above 0.05 and box is inside the viewport; it must be
     `<= 1`;
   - the thread layer exists once (`.thread-layer` count 1).
     At the bottom also assert the thread colour: `document.querySelector('.thread-layer').dataset.color`
     is `green` once section 4 is ported (read `PORTED` from `tests/unit/ported.ts`; before then,
     `sage`). Back at the top: `sage`.
5. Copy the film for local use (never commit it; `public/film/` is in `.gitignore`):
   `mkdir -p public/film && cp ../landing/simpul_full_v9.mp4 public/film/`.
6. Build the vanilla page and run `npm test`: confirm the parity test is **not** skipped (it reports
   `(none ported yet)` and passes).
7. Start both dev servers and run `npm run parity -- 01`. Confirm 12 images appear in `parity/`
   (6 vanilla, 6 react; the react ones show the empty stub). This proves the tooling.

Exit checks:

- [x] `npm run check` exits 0
- [x] `npm test` passes; the parity test ran (not skipped)
- [x] `npm run build` exits 0
- [x] `npm run test:e2e` passes, including `flow.spec.ts` on desktop and phone
- [x] `parity/01-desktop-0-vanilla.png` and `parity/01-desktop-0-react.png` exist
- [x] `git status` shows no `public/film/` and no `parity/` files to commit

Commit: `feat(motion): add the DOM helpers, the logo source and the page-flow test`

---

### Phase 2: Section 1, Hero

**Goal:** the top of the page, and the pattern every later phase follows. Take the extra care: the
hero is the largest single file and the first impression.

Source: `../landing/src/sections/01-hero/*`, `../landing/sections/01-hero.md`,
`../landing/scripts/check-hero.mjs`.

Particulars:

- **The opening race.** `index.html` already adds `hero-boot` (hiding `.hero-lockup`,
  `.hero-heading-line`, `.hero-kicker`, `.hero-bottom`, `.hero-footer`) with a 9 s safety timeout.
  The motion builds its intro inside `document.fonts.ready.then(...)`, and `open()` sets every final
  state and removes `hero-boot`. Keep all of it: nothing may flash before the intro.
- The motion puts the logo SVG (`mark` from `src/motion/mark`) into `.hero-symbol`.
- `seeded(19)` from `src/motion/random` makes the tangled lines the same on every visit: keep the seed.
- The "Watch the video" button is `<button className="hero-film" type="button" data-film="">`; the
  film dialog comes from `startPage`. Do not add a click handler in the hero.
- "Join the pilot" (`href="#join"`) and "See how it works" (`href="#how-it-works"`) are plain links:
  `page.ts` already routes them through the smoother.
- Busy letters loop (`restless`), threads loop (`flow()`), both pause when the hero leaves the view
  (`sleep()`). On scroll the knot releases a thread and the carried order follows it down: the hero
  appends `shared.carried.el` to its own out-anchor and sets its form to `order`. **This is the start
  of the journey the whole page follows.**
- Hover tilt only when `matchMedia('(hover: hover) and (pointer: fine)')` matches.
- It listens to `ScrollTrigger`'s `refreshInit` to re-measure: keep it, remove it in cleanup.

Tasks: steps A to H of section 2. Extra exit checks:

- [x] Reload the built page 5 times (desktop): the headline, eyebrow and buttons never show before
      the intro reveals them
- [x] e2e: clicking "Watch the video" opens a `<dialog class="film">`; Escape closes it
- [x] e2e: clicking "See how it works" moves the page (scroll position increases) with no error

Commit: `feat(hero): port section 1 to React`

---

### Phase 3: Section 2, Problem

Source: `../landing/src/sections/02-problem/*` (including `people/*.svg`), the brief (no check script).

Particulars:

- Install the physics engine at the exact versions: `npm install --save-exact matter-js@0.20.0`
  and `npm install --save-exact --save-dev @types/matter-js@0.20.2`. Commit `package.json` and
  `package-lock.json` with this phase. Load it **only** as the section approaches: keep the vanilla
  `IntersectionObserver` + `import('matter-js')`. Never import it statically.
- The five people icons: copy `people/*.svg` next to the section and keep
  `import.meta.glob<string>('./people/*.svg', { query: '?raw', import: 'default', eager: true })`;
  the motion injects them into `.chain-face` exactly as before.
- **Pinned**: `end: () => \`+=${innerHeight * (phone ? 3.4 : 4)}\``. The physics runs once ahead
  of time and is played back by scroll.
- After the snap (`SNAP = 3.72`): the broken link and the order's thread turn red with the scroll
  (`--lost` on the svg and on the broken halves), then Warehouse, Finance and the last Sales turn red
  one after another, each with a red "!" badge.
- **The seam 1 → 2.** The hero hands on the loosened thread carrying the order. This section draws
  its own copy of the order (`createCarried()` from `src/motion/carried`, class `problem-order`,
  `data-handoff-object`) and shows it only from `start: 'top 35%'` (the vanilla `ScrollTrigger` with
  `onToggle`); before that the hero's copy is the one in view. At no scroll position may both be
  visible (the flow test checks it).
- The order writes `data-exit-x/y/angle` in `measure()`: section 3 reads these. Keep the names.
- There is no check script: write the unit test from the brief's "What is here" table (every
  string), plus: six `.chain-person`, five `.chain-link`, five `.failures .card`.

Tasks: steps A to H. Extra exit checks:

- [ ] Scroll to the end of section 2 and back to the top: every bubble is gone and the order is back
      at the start
- [ ] The first JavaScript file loaded by `dist/index.html` does not contain `matter` (it is a
      separate chunk)

Commit: `feat(problem): port section 2 to React`

---

### Phase 4: Section 3, Turn

Source: `../landing/src/sections/03-turn/*`, the brief, `check-turn.mjs`.

Particulars:

- **The seam 2 → 3.** Takes the order from section 2 with `handoff.incoming(root)` (the start point
  follows section 2's physics until this section takes over) and `handoff.receive(root, taken)`,
  which hides section 2's copy at the exact moment this one shows its own. Hands it on to section 4
  through its own `data-handoff-object` copy (`data-exit-x/y/angle`).
- The chat loops on its own clock (`gsap.ticker`) plus the scroll; a second copy of the messages is
  cloned for the loop and removed in cleanup. The **Pause chat motion** button (`.turn-pause`,
  `hidden` until motion runs, `aria-pressed`) must keep working; the loop also stops when off screen
  (`IntersectionObserver`) or when the tab is hidden (`visibilitychange`).
- `check-turn.mjs` runs `init` with reduced motion through a Proxy that fails on any DOM access. Port
  it as: call `initTurn(root, shared)` with `shared.conditions.reduce = true` and `root` a Proxy that
  throws on any property access; expect no throw. Its hand-off assertions are already in
  `tests/unit/motion.test.ts`: skip them.
- Not pinned; the brief and the check require it (`no pin:` in the motion file).

Tasks: steps A to H. Extra exit checks:

- [ ] e2e: the Pause button toggles `aria-pressed` and its label
- [ ] The seam 2 → 3: section 2's order and section 3's are never visible together, and the order
      does not jump when section 3 takes it (compare with the vanilla page)

Commit: `feat(turn): port section 3 to React`

---

### Phase 5: Section 4, How it works

Source: `../landing/src/sections/04-how-it-works/*`, the brief, `check-how.mjs`.

Particulars:

- Desktop: **pinned**, one master timeline (`end: () => \`+=${innerHeight * 4.2}\``, `scrub: 0.7`),
with the legs table `LEGS` (`[start, end, from, to]`) → an array of objects in the tuning file.
- **The page thread turns green here**: `thread.setColor(on ? 'green' : 'sage')`. It is the **only**
  place that calls `setColor`. From this phase the flow test expects `green` at the bottom.
- **The seam 3 → 4.** Makes its own carried copy and uses the hand-off with section 3
  (`incoming`, `receive`); the order arrives lifted and outlined and becomes a message, then a label.
- The phone mockup scales with `--fit`, measured in `measure()` and removed in cleanup.
- Phones: top to bottom, one station per screen, not pinned.
- Its CSS has a `position: sticky` rule under `.how:not([data-motion])` only (no motion, so no
  smoother): leave it.

Tasks: steps A to H. Extra exit check:

- [ ] Scrolling through section 4 and back: the page thread is green after it, sage before it

Commit: `feat(how): port section 4 to React`

---

### Phase 6: Section 5, For each person

Source: `../landing/src/sections/05-for-each-person/{markup.html,style.css,index.js,knots.js}`, the
brief, `check-people.mjs`.

Particulars:

- Port `knots.js` to `src/sections/05-for-each-person/knots.ts` first, with its numbers named. It
  is pure (no DOM). `check-people.mjs` asserts things about it (the ends never move; untied means
  straight): port those assertions to the unit test **before** porting the motion, and make them
  pass.
- Each card `<li class="person" tabindex="0">` needs the one allowed a11y disable (3.4).
- Uses `Draggable` (`import { Draggable } from 'gsap/Draggable'`). Each card's knot unties when the
  card reaches the middle of the screen, on hover, on keyboard focus (`:focus-visible`), or when
  pulled. The listeners use an `AbortController` signal: keep it, abort it in cleanup.
- **The seam 4 → 5.** The completed green thread splits into four strands, one per card, and they
  rejoin below into one. Not pinned.

Tasks: steps A to H. Extra exit checks:

- [ ] e2e: Tab focuses each of the four cards in order
- [ ] The knots unit test passes with every assertion from `check-people.mjs`

Commit: `feat(people): port section 5 to React`

---

### Phase 7: Section 6, Quiet by design

Source: `../landing/src/sections/06-quiet-by-design/{markup.html,style.css,index.js,heap.js}`, the
brief, `check-quiet.mjs`.

Particulars:

- `matter-js` is installed (Phase 3). Same rule: dynamic import only, behind the
  `IntersectionObserver`, as the vanilla code does.
- Port `heap.js` to `heap.ts` first (pure, seeded, takes the Matter module as a parameter). Port the
  `check-quiet.mjs` assertions about the heap to the unit test before the motion. The test may import
  `matter-js` directly.
- **Sticky becomes a pin (1.4).** In the vanilla CSS, `.quiet[data-motion] .quiet-stage` and
  `.quiet-index-view` are `position: sticky`. Inside the smoother that does nothing. In
  `quiet-by-design.css`, change those two `position: sticky` declarations to `position: relative`
  (and only those), and in the motion pin each one for the length of its column with
  `ScrollTrigger.create({ trigger: <the element>, pin: true, pinSpacing: false, start: 'top top+=<its sticky top>', endTrigger: <its column>, end: 'bottom bottom' })`.
  Use the same `top` the sticky rule used. Compare with the vanilla page at every parity stop: the
  stage must stay in view exactly as long and exactly where it did.
- Desktop builds a `.quiet-index` overlay (one commitment at a time, each with its own drawn icon
  and loop) over the real list, which stays in the DOM, hidden, for scroll and screen readers.
- A `gsap.ticker` callback (`restless`) runs the board: remove it in cleanup.
- **The seam 5 → 6.** Four strands rejoined into one green thread arrive; the one notification
  that survives the storm rides the thread on to section 7.

Tasks: steps A to H. Extra exit checks:

- [ ] The heap unit test passes with every assertion from `check-quiet.mjs`
- [ ] The stage stays in view for the same scroll distance as in the vanilla page (parity stops)

Commit: `feat(quiet): port section 6 to React`

---

### Phase 8: Section 7, The panel

Source: `../landing/src/sections/07-the-panel/*` (including `screens/`), the brief, `check-panel.mjs`.

Particulars:

- Copy `screens/` (7 `.webp` and `spots.json`) to `src/sections/07-the-panel/screens/`.
- The vanilla code uses `import.meta.glob('./screens/*.webp', { eager: true, query: '?url', import: 'default' })`.
  Keep it, typed: `import.meta.glob<string>(…)`. The three `<img>` in the markup import their files
  directly (2.4).
- `import spots from './screens/spots.json'` works as is (`resolveJsonModule` is on).
- Desktop: **pinned**, `end: () => \`+=${innerHeight * 2.9}\``. Name 2.9 in the tuning file.
- **The seam 6 → 7.** Takes over the card section 6 hands on through `shared.handoff`
  (`incoming` / `receive`); the vanilla fallback (`{ x: root.offsetWidth / 2, y: 0, angle: 0 }`)
  stays for `?solo`.
- A `pointermove` listener leans the window: remove it in cleanup.
- `../landing/scripts/capture-panel.mjs` is **not** ported: the screens are copied as files.

Tasks: steps A to H. Exit checks: 2.9.

Commit: `feat(panel): port section 7 to React`

---

### Phase 9: Section 8, Your data

Source: `../landing/src/sections/08-your-data/{markup.html,style.css,index.js}`,
`../landing/sections/08-your-data.md`, `../landing/scripts/check-data.mjs`.

Particulars:

- The markup has 4 SVGs, 5 `<g data-layer>` with 36 cells each (180 `.cell`), 108 `.ghost` cells and
  3 drawn things (`g.thing[data-thing]`). Generate cells and ghosts from `your-data.shapes.ts` (2.4).
  The check asserts the exact counts: 180 `class="cell `, 3 `<g class="thing" data-thing>`.
  React prints `data-thing=""`; adjust that one regex to `/<g class="thing" data-thing="">/g`.
- `<ol class="data-layers">` items carry `style="top: 13.75%"` etc.; `.data-kept li` carry
  `style="--at: …"`. Copy every value exactly.
- The motion inserts its own `<svg class="data-threads">` as the root's first child and draws: a
  stem, a mirrored fork (left/right in, left down, both out to a tied knot, a `<circle>`), bits
  (`rect`) running down the right line, layers filling cell by cell, things landing on the left.
  It measures `--reach` from the stack and sets it on the root. Cleanup removes the svg, clears the
  cells' and things' inline styles, removes `is-in`, removes `--reach`, restores the chapter text.
- Not pinned. One scroll clock: `start: 'top 70%'`, `end: 'bottom 98%'`, `scrub: 0.6`.
- The phone branch draws one rail on the right instead of the fork.
- **The seam 7 → 8.** A bare green thread arrives from the panel. In `?solo`, the carried card is
  hidden (`gsap.set(carried.el, { autoAlpha: 0 })` when the root contains it): keep that. This
  section **ties its thread off** in a knot: nothing crosses into section 9.

Tasks: steps A to H. Exit checks: 2.9.

Commit: `feat(your-data): port section 8 to React`

---

### Phase 10: Section 9, Close

Source: `../landing/src/sections/09-close/*`, `../landing/sections/09-close.md`,
`../landing/scripts/check-close.mjs`.

Particulars:

- **The form must work with no motion** and from the first paint. The vanilla `init` wires the
  submit handler **before** the reduced-motion return; keep that order: wire the form, then
  `if (reduce) return cleanup;`. The handler stays imperative in the motion file (no React state).
- `send(email)`: when `import.meta.env.VITE_PILOT_FORM_URL` is empty, a stand-in waits 600 ms and
  fails if the address contains `fail`; otherwise it POSTs JSON. Keep both paths.
- The honeypot input `name="company"` (`tabIndex={-1}`, `aria-hidden="true"`) stays.
- The logo: the motion replaces `.close-mark`'s `<img>` with the SVG from `mark` (Phase 1), renaming
  `simpul-colour`/`simpul-glow` ids to `close-colour`/`close-glow`, and restores the `<img>` on cleanup.
- The four "is not" lines get a red scribble each, drawn at the line's own width in `measure()`;
  the lead's four `<mark>` get a highlighter sweep; the footer's `.page-foot-flow` letters ride a
  looping wave over a running `.page-foot-stream` svg, played only while the footer is in view.
- **The seam 8 → 9.** Nothing crosses: the close starts clean, and its strands come in from the
  edges. The page ends here: its last frame is still apart from the footer wave.
- **This is the last stub.** After registering section 9: delete `src/sections/stub.tsx` and the
  `still` function in `motions.ts` (knip reports them unused otherwise).

Tasks: steps A to H. Extra exit checks:

- [ ] e2e, keyboard only (Tab to the field, type, Enter): `someone@company.com` → "Thank you. You are
      on the pilot list."; `fail@company.com` → "That did not go through. Try again."; `nope` →
      "Enter a work email address."
- [ ] e2e: with JavaScript disabled, the form, its label and the button are present
- [ ] e2e: the hero's "Join the pilot" link lands on the form (`#join` in view)
- [ ] `src/sections/stub.tsx` no longer exists; searching `src/` for `stubSection` or `still` finds
      nothing

Commit: `feat(close): port section 9 to React`

---

### Phase 11: The whole page as one piece

**Goal:** the nine sections scroll as one continuous piece, at least as smoothly as the vanilla page.

Tasks:

1. Extend `scripts/parity.ts` with a whole-page mode: `npm run parity -- page` scrolls the full page
   in 24 even stops (no `?solo`) and saves both screenshots per stop. Compare every pair, desktop and
   phone.
2. Walk every seam (1→2 … 8→9) in the React page and the vanilla page side by side, slowly, forwards
   and backwards, desktop and phone, against the hand-off table in `../landing/README.md`.
3. **Tune the one scroll.** Try `scroll.smooth` in `src/motion/gsap.ts` at 0.8, 1 and 1.2 and
   `scroll.touch` at 0 and 0.1. Keep the values where the pinned sections (2, 4, 7) enter and leave
   without a visible jolt and the scroll still feels direct. Record the chosen values and why in the
   comment above `scroll`.
4. Extend `tests/e2e/flow.spec.ts`: at every step also assert that no `.pin-spacer` is taller than
   the vanilla page's for the same section (read the vanilla heights once with the parity script and
   write them into the test as named constants).
5. `PORTED` holds all nine ids.

Exit checks:

- [ ] Every 2.9 check, for the whole page
- [ ] `npm run parity -- page`: no visible difference at any of the 24 stops, desktop and phone
- [ ] Every seam is clean forwards and backwards (write one line per seam in the commit body)
- [ ] `tests/e2e/flow.spec.ts` passes on desktop and phone
- [ ] `PORTED` lists all nine section ids and the parity test passes for all of them

Commit: `feat(page): tune the one scroll and hold every seam`

---

### Phase 12: Hardening

Tasks:

1. **No JavaScript.** e2e with `javaScriptEnabled: false`: every section's main copy (take one line
   from each brief's "What is here") is visible; the form is present.
2. **Reduced motion.** e2e with `reducedMotion: 'reduce'`: no `[data-motion]`, no `.pin-spacer`, no
   ScrollSmoother (`#smooth-wrapper` is not `position: fixed`), the page height is within 10% of the
   no-JS height.
3. **Phone.** e2e on the `phone` project: no horizontal scroll at any section
   (`document.documentElement.scrollWidth <= innerWidth`), at 10 stops down the page.
4. **Performance.** After `npm run build`, list `dist/assets/`: the first JS chunk is under 200 kB
   gzip; `matter-js` and the film are not in it; images in section 7 have `loading="lazy"`.
5. **Hover.** The hover rules in `src/styles/base.css` apply (desktop): hover a headline line and a
   `.turn-asks li`, assert the computed `translate` changes.
6. **Deploy notes.** Add a "Deploy" section to `README.md`: `dist/` is a static site; set
   `VITE_PILOT_FORM_URL` and `VITE_FILM_URL` at build time; the film is hosted outside the repo.

Exit checks:

- [ ] All 2.9 checks for the whole page
- [ ] The new e2e tests (no-JS, reduced motion, phone overflow, hover) pass on their projects
- [ ] `README.md` has the Deploy section
- [ ] `npm run test:e2e` total runtime under 3 minutes

Commit: `test(page): hold the port to no-JS, reduced motion, phone and performance`

---

## Blocked

(Empty. Add an entry here when rule 7 applies: phase, task, command, exact error, what was tried.)
