# FormForge 3D Studio

A polished, local-first **browser-based 3D modeling editor**. Build scenes from primitive geometry, manipulate objects using 3D gizmos, adjust materials, create example furniture/product scenes, save locally, and export GLB/STL/JSON/PNG.

**Status:** runnable research prototype / MVP source code. Core data tests pass. Full rendered-WebGL browser verification and deployment are **not yet complete** in the restricted authoring environment. The runtime loads pinned Three.js ES modules from jsDelivr; you need an internet connection for those modules and a recent WebGL2-enabled browser.

## Quick start (Windows / macOS / Linux)

Requires Node.js 20+ and internet access for the Three.js CDN.

```bash
npm run dev
```

Then visit **http://localhost:5173** in Chrome or Edge. No `npm install` is necessary for this prototype; only built-in Node APIs and browser ESM are used.

Run the test suite:

```bash
npm test
npm run check
```

Alternative Python server: `python -m http.server 5173` from the repository root.

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
index.html              Application shell and import map
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

- Browser/WebGL interaction **has not been verified end-to-end in the authoring environment** because local browser navigation and external CDN access were blocked. Do not describe this as production-validated.
- The viewer needs the browser to load Three.js modules from the public CDN. For production, Codex should bundle/package dependencies locally with Vite.
- Only primitive + multi-object composition modeling, not true polygon sculpting, sculpt brushes or Boolean mesh operations.
- No account sign-in, cloud sync, real-time collaboration, permissions, hosted storage, or AI inference.
- For 3D printing, exported overlapping shells may need mesh repair/boolean union in a CAD tool.
- No publicly hosted URL has been deployed in this deliverable.

## Roadmap

1. Get current MVP running in real browser; add Playwright Chromium e2e tests and debug its WebGL render/export paths.
2. Migrate to React 19 + TypeScript + Vite + React Three Fiber 9 with bundled dependencies and reproducible builds.
3. Add object hierarchy/groups, per-primitive dimensions, selection multi-select, boolean tools, import GLB, scene thumbnails, templates.
4. Add authenticated projects and cloud persistence using FastAPI, Pydantic, PostgreSQL and object storage.
5. Add **guardrailed AI text-to-parametric scene planner** with structured scene plans and operations, preview/undo; never run arbitrary LLM-produced scripts.
6. Add share/publish views, collaborative editing and scene analytics if users demonstrate demand.

## Research, handoff, architecture

See `docs/RESEARCH.md`, `docs/WORK_BRIEF.md`, `docs/CODEX_HANDOFF.md` and `docs/ARCHITECTURE.md`.
