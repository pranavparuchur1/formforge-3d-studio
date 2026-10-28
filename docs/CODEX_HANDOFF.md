# Paste into Codex — implementation assignment

You are the principal frontend/3D engineer responsible for transforming **FormForge Studio** into a reliable deployable project. Work in a dedicated `formforge-3d-studio` GitHub repository with an attached baseline archive. Read `README.md`, `docs/RESEARCH.md` and `docs/ARCHITECTURE.md` first.

## What exists

- HTML/CSS/JS zero-install browser editor.
- Pure model in `src/scene-core.mjs`: geometry definitions, serialization, presets, prompt parser.
- Three.js editor in `src/main.js`: OrbitControls, TransformControls, properties, local storage, GLB/STL/PNG exports.
- Initial Node unit tests passing.
- Dependencies loaded via a pinned CDN import map; authoring environment couldn't access a normal Chrome browser or CDN so the renderer **has not been e2e verified**. Treat this as a starter, not a production-ready finished product.

## Work order — make small, reviewable PRs

### PR1: Runtime hardening (blocker)
1. Clone the repo and run `npm test` and `npm run check`.
2. Open the app in actual Chromium and Firefox. Verify Canvas starts, default product podium renders, selection works, transform controls drag and synchronize inspector, orbit does not steal gizmo drags.
3. Fix any JS runtime errors, import map/CDN issues, stray pointer interaction bugs, z-order and resizing problems. Test browser offline error state.
4. Add Playwright tests for initial render, add shape, edit material and XYZ transform, drag gizmo, duplicate/delete, undo/redo, persistence after refresh, JSON round-trip, GLB download (read result with GLTFLoader), STL download, screenshot export.
5. Add CI to run Node tests, lint, typecheck where applicable and browser smoke checks (WebGL with software rendering supported). Document any environmental skips accurately.

### PR2: Production frontend architecture
1. Introduce Vite, React 19, TypeScript, `@react-three/fiber@9`, Drei, Zustand. Install compatible package versions, commit lockfile. Follow official R3F pairing. Bundle Three locally—no runtime CDN dependencies for core functionality.
2. Preserve design: dark indigo sidebars, white/lavender headings, central 3D viewport, editable layers and precise inspector.
3. Preserve JSON schema versioning and reversible command history. Do not let direct Three object mutation be authoritative outside a typed editor state.
4. Ensure keyboard and screen-reader paths work for inspector, layer controls, file inputs and export menus.
5. Produce static production build; make app deployable to Vercel/Netlify. Do not falsely claim a live deployment.

### PR3: Genuine modeling abilities
1. Primitive parameters beyond scale: cylinder radii, torus tube radius, sphere segments, subdivision controls with upper bounds.
2. Parenting/grouping and multi-select, transform snapping, grid unit selection, object origin controls, precise measurements.
3. GLB import, sanitize size and formats, display imported asset materials; round-trip GLB exports.
4. Scene previews and versioned browser storage.
5. Track memory leaks and dispose geometry/textures on delete/scene changes.

### PR4: AI-assisted scene planner, only after PR1-3 are stable
1. Add a small FastAPI/Pydantic backend with a strict scene-plan schema and a deterministic compiler. The LLM emits **JSON instructions**, never arbitrary browser JS or Python to execute.
2. Add API key handling via environment variables, quotas, retries, max tokens, error handling, validation and safe fallback. No API key needed for the core editor.
3. Build prompt examples + a 30-case evaluation harness including malicious prompts, too-many-shapes requests, unsupported geometry and impossible parameter ranges.
4. Add human approval of scene plan, individual operation explanations, and full undoability.
5. Only label the product **AI-assisted** when a real AI service is successfully connected and tested.

## Mandatory acceptance checklist

- New user can load site and see a real interactive 3D podium.
- Users add any primitive, click to select, move/rotate/scale, and see live inspector value updates.
- Add a lamp via Quick Build; changes are editable and undoable.
- Refresh retains the scene. JSON export/import preserves shapes/materials and unique IDs.
- GLB exported and loaded elsewhere preserves materials/transforms; STL warns that meshes may not be print ready.
- No blank screen when WebGL fails. Render errors explain resolution steps.
- Unit tests + browser e2e + build checks pass; CI artifacts and deployment link documented.
- Mobile layout avoids blocking project saving/export; desktop editor is excellent at 1440x900.
- Never claim full Blender-like modeling, real AI text-to-mesh, collaboration or deployment unless implemented and verified.

## Definition of done

Create PRs with before/after screenshots, test commands/output, risk notes and migration notes. Where a deployment destination is available, deploy a preview and personally inspect all major flows. Return the actual URL, tested browser, tests passed, failures and remaining limitations.
