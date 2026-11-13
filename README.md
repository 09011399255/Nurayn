# Nurayn Studio — portfolio edition

Open the local preview at http://127.0.0.1:4175/ on this computer.

To restart it, open a terminal in this folder and run `npm start`. Node.js is required. Keep the terminal running while viewing the site. No installation or build step is needed for local development.

## Deploy to Vercel

Import this repository with its root directory left at the repository root. The included `vercel.json` selects the Other framework preset, runs `npm run build`, and publishes `dist/`. The build copies the website and its assets into that directory. `server.mjs` is only the local preview server and is not part of the deployed output.

Push changes to the connected production branch (`main`) to trigger a new deployment. If a dashboard root-directory override was added, clear it so Vercel can read the root-level configuration. The deployment can be checked at https://nurayn-lilac.vercel.app/.

## What is included

Your original vector Nurayn wordmark appears in the header, hero and footer, with its N used for the favicon. The layout combines off-white and near-black, with a sliding full-screen transition between light and dark modes.

The eight sections are Home, Studio, Selected Work, a Honeydrop identity feature, Capabilities, the Open Studio, Process and Contact. Selected Work contains Reloop first, Honeydrop second, Little Fixers and PACE (the chosen working name for the fitness app). Each opens a project preview using the supplied imagery. These are previews, ready for fuller stories when more screens and project details arrive.

## Explore

- Move your pointer to reveal the soft binary field.
- Navigate with the bottom dock; use its circular button to switch themes.
- Selected Work opens in Index: hover or focus a project to change the desktop preview, then click to open it. On phones, each project has its own thumbnail and opens with one tap.
- Switch to Gallery for native horizontal swipe scrolling. Use the visible arrows, named project shortcuts, or Left/Right, Home and End when the gallery is focused. Every image opens its project directly.
- Open project previews, browse to the next project, and close with Escape. Keyboard focus returns to the opening control.
- Drag Honeydrop's divider between the monogram and imagery. Arrow keys, Home and End also work.
- Select a discipline to change its example and description. Up/Down keys move through the service tabs.
- In the Open Studio, edit the live identity, resize an actual interface, or spin the record. These are clearly presented as studio experiments.
- Expand the process steps to change their text and accompanying diagram.

## Checks completed

The updated edition was checked at desktop and 390 × 844 phone viewport sizes. The logo is vector in both themes. Gallery/index selection, project opening and closing, the Honeydrop reveal, service tabs and process controls responded correctly. Theme changes preserved scroll position. No page-width overflow or browser console errors were observed during these checks. JavaScript syntax checks passed.

The earlier interactive studio controls were also checked: identity text/palette/weight updates, actual interface reflow and demo bag interaction, and record spin/stop. Keyboard controls and reduced-motion alternatives are included. These are browser viewport checks, not a physical-device or comprehensive accessibility/performance certification.

## Before public launch

Confirm the contact address: `hello@nurayn.build` is still a placeholder. Add the full project stories, your exact role/scope and verified outcomes. Client relationships, testimonials and results have not been invented. Little Fixers remains labelled an app concept, as in the supplied artwork. PACE is a working name, not a cleared trademark.

Fonts load from Google Fonts with system fallbacks. The mini shop is a demonstration with no payments or backend. Review on real touch devices and run a production performance/accessibility pass before publication.

## Source

- `index.html`: page structure, content and inline logo paths.
- `styles/main.css`, `styles/edition.css` and `styles/work.css`: layout, motion, responsive styles and the revised work section.
- `scripts/main.js`: navigation and theme transition.
- `scripts/gallery.js` and `scripts/projects.js`: gallery and project previews.
- `scripts/edition.js`: reveal, capabilities and process controls.
- `scripts/playground.js`: live identity, responsive interface and record physics.
- `scripts/atmosphere.js`: pointer-following binary field.
- `ASSETS.md`: supplied artwork and source history.
- `DESIGN-NOTES.md`: direction, references and next steps.
- `server.mjs`: local static server.

Run `npm run check` for syntax validation. The site uses plain HTML, CSS and JavaScript.
