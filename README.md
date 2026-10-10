# Simpul landing page

The Simpul landing page in React and TypeScript: a port of the vanilla page in `../landing`, kept
identical in words, look and motion. The port is planned step by step in [`phases.md`](phases.md).

```sh
npm install
npm run dev          # http://localhost:5174, not prerendered
npm run build        # dist/, prerendered: every word is in the HTML before any script runs
npm run preview      # serves dist/ on http://localhost:4174
npm run check        # prettier, eslint, tsc, knip: the commit hook runs this
npm test             # unit tests, including parity with ../landing/dist
npm run test:e2e     # the built page in Chromium, desktop and phone
npm run parity -- 08 # screenshots of section 8, vanilla beside React, into parity/
```

`?solo=08` runs one section alone against its stub. Copy `.env.example` to `.env` for the pilot
form address and the film.

## Architecture

| Path                                           | Holds                                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/sections/NN-name/`                        | One section: its markup as a component (static, no state), its CSS, its motion                                |
| `src/sections/index.ts`                        | The sections' markup, in page order. Server-safe                                                              |
| `src/sections/motions.ts`                      | Each section's motion and its hand-off contract, in page order. Client only                                   |
| `src/motion/`                                  | The shared motion layer: GSAP setup, the page thread, the carried object, the hand-off, the film, `startPage` |
| `src/styles/`                                  | Tokens and the base layer, shared by every section                                                            |
| `src/entry-server.tsx`, `scripts/prerender.ts` | The build-time render into `dist/index.html`                                                                  |

React renders the markup once. After mount the DOM belongs to GSAP, which is why section
components hold no state and never re-render. `startPage` runs every section's `init(root, shared)`
in page order inside one `gsap.matchMedia`, exactly as the vanilla `main.js` does.

The toolchain (`eslint.config.mjs`, `knip.json`, Prettier, commitlint, husky) is pspt's canonical
React set, byte for byte the same as `../frontend`. Never edit those files.
