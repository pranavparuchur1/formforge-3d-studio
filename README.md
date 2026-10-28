# FormForge 3D Studio

A polished, local-first **browser-based 3D modeling editor**. Build scenes from primitive geometry, manipulate objects using 3D gizmos, adjust materials, create example furniture/product scenes, save locally, and export GLB/STL/JSON/PNG.

**Status:** local vanilla Three.js prototype with automated Chromium/WebGL and export verification. Chrome/Chromium is the supported PR1 verification target; Firefox testing was waived by the owner. This is not a production release. React migration has not started. See [PR1 evidence](docs/browser-evidence.md).

## Use the portable editor

[Download the standalone HTML](https://github.com/pranavparuchur1/formforge-3d-studio/raw/refs/heads/main/download/formforge-studio.html), save it, and open it in Chrome. No Node installation is needed for this file. Export JSON backups of your projects. Regenerate the downloadable file with `npm run build` and copy `dist/index.html` to `download/formforge-studio.html` when publishing a new preview.

## Quick start

Use Node.js 24.19.0 (the tested version) and npm 11.9.0:

```bash
npm ci
npm run dev
```

The development server listens on port 5173. Three.js 0.180.0 and its addons load from the installed local package; the editor no longer requests CDN modules or external fonts. No API key is required. Development uses a local import map; `npm run build` creates a self-contained static production artifact in `dist/index.html`. Serve the checkout only in a trusted development environment.

```bash
npm test
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

On this cloud machine, the existing system Chromium can run the suite without downloading a browser:

```bash
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --project=chromium
```

That system-browser override is explicit; CI uses the browsers matching the pinned Playwright runner. Browser installation needs `cdn.playwright.dev` network access. Screenshots, download samples, validator output and JSON results are written to `artifacts/`; the HTML report is in `playwright-report/`. CI uploads both reports and failure traces.

## Features implemented

- Five primitive geometries: cube, sphere, cylinder, cone, torus.
- Five multi-part scene recipes: podium, chair, lamp, rocket, table.
- Interactive mouse/touch orbit, zoom, pan, object picking, and transform gizmos (move/rotate/scale).
- Object layers with rename, select, show/hide, duplicate, delete.
- Inspector: XYZ position, rotation (degrees), scale, color, metallic and roughness.
- Quick Build commands such as `create a red chair`, `add a blue sphere`.
- LocalStorage autosave, undo/redo, import/export editable JSON projects.
- GLB export (materials included), STL export (geometry only), viewport PNG export.
- Initial product display demo scene, keyboard shortcuts, responsive sidebar layout.

**Important:** Quick Build is a **deterministic rule-based parser, not AI**. AI text-to-scene generation is a Phase 2 backend architecture, specified in `docs/ARCHITECTURE.md`. The app is not comparable in depth to Blender or Spline yet. STL output is not guaranteed manifold or print-ready.

## Controls

| Action | Control |
| --- | --- |
| Orbit | Left-drag empty viewport |
| Pan | Right-drag |
| Zoom | Mouse wheel |
| Select object | Click object or layer |
| Move / Rotate / Scale | `1` / `2` / `3` |
| Frame selected | `F` |
| Duplicate | `Shift+D` |
| Delete | `Delete` or `Backspace` |
| Undo / Redo | `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` |
| Focus Quick Build | `/` |
| Clear selection | `Escape` |

## Structure

```text
index.html              Application shell and local import map
src/main.js             Three.js renderer, editor controls, browser interaction
src/scene-core.mjs      Pure scene model, serialization, templates, prompt parser
src/styles.css          Responsive visual design
scripts/serve.mjs       Local zero-dependency web server
tests/core.test.mjs     Node data-model tests
docs/RESEARCH.md        Competitor research and technology choices
docs/ARCHITECTURE.md    Roadmap to AI-assisted, production-grade architecture
docs/CODEX_HANDOFF.md   Copy/paste assignment for Codex
docs/WORK_BRIEF.md      ChatGPT Work research/delegation assignment
```

## Current limitations

- Chromium software-WebGL interaction and exports are tested. Other browser engines, real GPU performance, assistive technology and real mobile-device qualification remain pending.
- Dependencies are local and locked. The static build bundles them into `dist/index.html`; GitHub Pages publishes only `dist/`.
- Only primitive + multi-object composition modeling, not true polygon sculpting, sculpt brushes or Boolean mesh operations.
- No account sign-in, cloud sync, real-time collaboration, permissions, hosted storage, or AI inference.
- For 3D printing, exported overlapping shells may need mesh repair/boolean union in a CAD tool.
- No publicly hosted URL has been deployed in this deliverable.

## Roadmap

1. Complete the remaining Work release gates using Chrome/Chromium as the owner-selected browser target.
2. Consider the staged TypeScript/React migration only after the remaining Work quality gates; the current vanilla editor already has a reproducible static build.
3. Add object hierarchy/groups, per-primitive dimensions, selection multi-select, boolean tools, import GLB, scene thumbnails, templates.
4. Add authenticated projects and cloud persistence using FastAPI, Pydantic, PostgreSQL and object storage.
5. Add **guardrailed AI text-to-parametric scene planner** with structured scene plans and operations, preview/undo; never run arbitrary LLM-produced scripts.
6. Add share/publish views, collaborative editing and scene analytics if users demonstrate demand.

## Research, handoff, architecture

See `docs/RESEARCH.md`, `docs/WORK_BRIEF.md`, `docs/CODEX_HANDOFF.md` and `docs/ARCHITECTURE.md`.

## GitHub Pages

`npm run build` produces a standalone editor (including Three.js and its license notice) with no runtime CDN dependency. `.github/workflows/pages.yml` runs Node and Chromium checks, builds the site, and deploys only `dist/` to GitHub Pages on pushes to main. React migration is not part of this publishing change.

Projects are stored per browser origin. Export a JSON backup before moving from the downloaded HTML or development server to the hosted site, then use Open to import it.
