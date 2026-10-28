# Codex implementation backlog

Decision date: 2026-10-27. Execute one PR at a time in the owner-approved repository. No repository, branch, implementation PR or deployment was created by this research assignment. Do not treat proposed filenames or commands as existing code. Read 01–05 and 07 before starting.

## First Codex instruction

Obtain/confirm the intended formforge-3d-studio repository and authorization before implementation. Put the supplied formforge-studio contents at repository root and copy these seven files to docs/work/. Preserve the original input ZIP outside the source tree as backup. Start **PR01 only**. Run existing Node checks, reproduce D01/D02, inspect changes and return a small PR with real evidence. Do not combine PR01–PR14 into one rewrite.

Each PR description must state concrete behavior changed, requirements addressed, tests actually run (including failures/skips), commit/environment, migration risk and screenshots where visual behavior changed. Do not invent screenshots/URLs. If a PR expands beyond its stated feature boundary, split it. Research specs control scope over the older four broad handoff PRs.

## Dependency order and four-sprint plan

These are provisional two-week sprints for one engineer; estimates are sequencing aids, not delivery promises. Acceptance gates determine progress.

| Sprint | PRs in order | Exit |
|---|---|---|
| 1: data safety + reproducible runtime | PR01 → PR02 → PR03 → PR04 | Valid model, bundled runtime, actual browser evidence and geometry export tests |
| 2: interaction + usable recovery | PR05 → PR06 → PR07 → PR08 | Transactional history, keyboard correctness, truthful save/recovery, responsive accessible controls |
| 3: release qualification | PR09 → PR10 | Performance/failure checks, static release candidate and verified preview; local MVP can ship |
| 4: maintainability / measured follow-on | PR11 → PR12 → PR13; PR14 only if capacity and R11 demand | Typed core and optional React adapter without behavioral regressions; parametric geometry scoped separately |

AI is after these stability gates, not a committed fourth-sprint feature. Cloud accounts, collaboration, booleans and GLB import are not included. A release can remain vanilla Three after PR10 if React cost exceeds benefit.

## PR01 — Fix project version/ID integrity

Priority P0. Depends on approved baseline repository only. Requirements R05/R10; issues D01/D02/D12.

Touched: src/scene-core.mjs, tests/core.test.mjs; add tests/fixtures/project-v1.json and bad-project fixtures; README.md import limitations if needed.

Implement explicit version policy, safe collision-resistant ID allocation independent of imported numeric suffix, and non-lossy valid-v1 roundtrip. Distinguish strict current schema validation from explicit legacy repair result/warnings. Do not silently drop unknown geometry; provide a structured rejection or repair report for UI integration later. Preserve supported existing property defaults.

Acceptance: existing eight tests pass (update expectations only where newly specified rejection is intentional); U02/U04 regressions pass including huge ID, duplicates, invalid ID and future version; valid baseline fixtures are semantically stable across normalize/export/reload. Failed import leaves caller's input/document unchanged.

Scope guard: no bundler, renderer, React, backend, schema-v2 or UI redesign. Risk: legacy behavior changed; include explicit migration notes and sample errors. Recommended first PR.

## PR02 — Bundle exact baseline Three with Vite

Priority P0. Depends PR01. R09; H04.

Touched: package.json, new package-lock.json, vite.config.js, index.html import map removal, src/styles.css font loading, README.md; scripts/serve.mjs retained only as documented legacy dev tool or removed from scripts.

Resolve tested stable Vite/Node versions using 02; pin Three 0.180.0 first, bundle addons from same package, use local/system fonts. Add build/preview commands and a build artifact. Bind dev/preview to loopback. Preserve source behavior and project schema. Produce dependency/advisory report and chosen license-notice inventory; request repository owner's project-license choice before labeling it open source.

Acceptance: fresh npm ci, existing checks and npm run build pass; npm ls has no invalid peers; production output has no jsDelivr/Google Fonts requirement; static build returns entry/assets without missing imports. Run actual browser startup where available and report any blocker. No claim of secure full dependency graph without audit results.

Scope guard: no React, Three upgrade, store rewrite or feature additions. Do not hide exporter failure by swapping renderer library. Risk: import paths/base URL; keep base configurable for host path.

## PR03 — Establish browser smoke and CI

Priority P0. Depends PR02. R01/R09; H04.

Touched: package.json/lockfile, new playwright.config.js, tests/e2e/startup.spec.js, tests/helpers/static-server.mjs if needed, .github/workflows/ci.yml, docs/browser-evidence.md (proposed).

Pin Playwright and matching browsers. Serve dist, add startup/actual frame/mesh diagnostics tests, no-WebGL and module failure checks. Separate model/UI boot from renderer sufficiently for JSON rescue; minimal new src/bootstrap.js if appropriate. Capture page errors and diagnostic traces. CI runs Node, build, Chromium/Firefox smoke and WebKit smoke. Test diagnostics read state only; user actions remain UI-driven.

Acceptance: B01/B12/B15 startup/failure portions pass on real browser processes, fallback preserves JSON rescue; all jobs have artifact upload and explicit failure on required skips. Evidence includes exact browsers and renderer backend. Renderer-ready flag alone cannot pass. If environment cannot run browser, PR remains blocked pending a capable CI runner.

Scope guard: no scene rewrite, React or exports beyond test harness. Fix actual startup defects found, document each separately from speculative risks.

## PR04 — Verify and harden geometry/image exports

Priority P0. Depends PR03. R06; D09/D10/H04.

Touched: src/main.js export paths (or small new src/exporters.js), tests/e2e/exports.spec.js, tests/helpers/glb-viewer.*, tests/fixtures/export-scene.json, package.json if validator tooling required.

Snapshot accepted scene at export start, reject no-visible-mesh GLB/STL, exclude helpers/highlight, catch PNG null, dispose temporary materials in finally without disposing shared live geometry. Add explicit STL units/printability acknowledgment. Keep export busy/failure states honest.

Acceptance: U07 and B06–B08 actual downloads/parse/parity checks pass, including independent GLTFLoader page and glTF validator zero errors; success and injected failures keep live scene usable, repeated exports do not grow owned resources. Record independent viewer manual check before release.

Scope guard: no production GLB import, boolean union, texture upload, server export or print-ready guarantee. Do not upgrade Three in this PR unless proven necessary; if necessary separate compatibility PR.

## PR05 — Extract transactional commands/history

Priority P0. Depends PR04. R03/R04/R10; D03/D04.

Touched: new src/commands.mjs and tests/commands.test.mjs, src/scene-core.mjs, src/main.js mutation/history/gizmo integration.

Implement clone/validate/atomic document commit, shared transform invariants, nonlossy history restoration and one batch per template/gesture. Revision changes on commit/undo/redo; renderer is a projection. Cancellation reverts drag preview. Apply failure cannot leave partial document/history. Preserve 65-state history and stable IDs.

Acceptance: U03/U05, B03 and every action undo/redo; simulate a failure after first proposed batch step and assert full rollback; command and gizmo boundaries consistent. Store values never change silently on reload. Record actual transform pointer tests.

Scope guard: no framework migration, hierarchy or geometry-parameter feature. Separate UI drafts from committed document; avoid scene-core importing Three/DOM.

## PR06 — Correct pointer, focus and text-edit shortcuts

Priority P0. Depends PR05. R03/R08; D05/H01/H03.

Touched: src/main.js selection/keyboard/inspector code, tests/e2e/interactions.spec.js, index.html labels only as needed.

Test then fix gizmo/pick arbitration; explicit pointercancel handling and orbit restoration. Keep focused inspector drafts stable. Native text undo takes priority while typing; outside inputs scene shortcuts remain. Prevent Backspace navigation/destructive repeats. Add button alternatives where missing.

Acceptance: B02–B04 pass; short gizmo click/drag does not select background; orbit stays unchanged during drag and resumes afterward; numeric field focus/caret survives unrelated UI updates. Report which suspected defects were reproduced.

Scope guard: no visual redesign, storage or new camera feature set beyond fixing existing interactions.

## PR07 — Truthful persistence and recovery

Priority P0. Depends PR06. R05; D07/D08.

Touched: new src/storage.mjs, tests/storage.test.mjs, src/main.js storage/New/Open paths, index.html save/recovery UI, src/styles.css state visibility, tests/e2e/storage.spec.js.

Saving/Saved/Save failed reflect actual writes; latest commit wins debounce; last-good copy/recovery exists; flush pending save on pagehide best effort. JSON import fully validates before replace, displays legacy repair warnings and preserves old scene on error. File actions and text model UI stay usable if GPU fails. Warn on replacement and failed save; export raw corrupt stored bytes as rescue when feasible.

Acceptance: U06/B05/B13 and degraded-mode JSON rescue pass; denied/quota/corrupt data never silently replaced with demo or reported saved; import/new remain undoable; no network backend/key needed.

Scope guard: no multi-project gallery, IndexedDB migration, service worker or cloud sync. Risk: origin/storage behavior; document browser-local limitations.

## PR08 — Accessible responsive panels and camera alternatives

Priority P0. Depends PR07. R08; D06/D11.

Touched: index.html, src/styles.css, src/main.js panel/menu/keyboard controls (or small src/panels.mjs), tests/e2e/accessibility.spec.js, tests/e2e/responsive.spec.js.

Implement 03 desktop/drawer/mobile-sheet states; persistent history/file access, labels/toggle state, disclosure focus behavior, named numeric camera buttons and scene summary. Real slider/hex labels, readable text and touch targets. Handle dynamic viewport/keyboard and reduced motion.

Acceptance: B10/B14 and A01–A04 pass with manual AT results clearly separated from automated checks; required actions reachable at all test widths and via keyboard; dialogs restore focus and no hidden controls remain tabbable.

Scope guard: no React, animation redesign or new scene features. Keep accessible DOM separate from canvas so GPU failure does not erase controls.

## PR09 — Performance and renderer lifecycle

Priority P0 release qualification; P1 optimizations. Depends PR08. R10; H02.

Touched: src/main.js renderer/resize/lifecycle, new src/render-quality.mjs only if useful, tests/e2e/lifecycle.spec.js, scripts/benchmark.* and docs/performance-results.md (proposed).

Measure first, then optimize invalidation/frame scheduling, DPR/shadow quality and cleanup. Pause hidden-tab work; dispose render resources/controls/observer on teardown; keep PNG capture correct. Keep resource budgets in 04.

Acceptance: P01–P05 with real hardware report; B11/B15 context-loss recovery and all export regressions pass. If target cannot be reached, supply measured scope/quality adjustment for product review; do not silently weaken thresholds.

Scope guard: no instancing rewrite, worker renderer or WebGPU without demonstrated need and separate PR. Shared materials/geometry must retain clear ownership.

## PR10 — Static release and verified preview

Priority P0. Depends PR09 and all local-MVP gates. R01–R10.

Touched: .github/workflows/ci.yml, host config (one chosen provider), README.md, docs/release-evidence.md, optional headers config.

Complete release checklist 07, fresh-clone build, audit, headers/content types/cache policy, real external preview smoke and rollback record. Configure hosting only after owner selects target and access is authorized. Until then create a deployable dist artifact and clearly mark deployment pending. No fake URL/host account.

Acceptance: full applicable suite passes, manual GPU/AT/mobile/independent viewer checks documented; preview URL/commit/browser evidence exists before “deployed” claim; rollback and JSON backup path rehearsed. No outstanding P0 issue.

Scope guard: no custom domain purchase, accounts/AI or feature additions. Domain remains optional; never block honest local build delivery on unavailable credentials.

## PR11 — Type the pure document and command boundary

Priority P1 maintainability. Depends stable PR10. R03–R05.

Touched: scene-core.mjs→scene-core.ts, commands.mjs→commands.ts, tsconfig.json, package.json/lock, imports/test configuration, shared schema fixtures.

Preserve runtime semantics and format; strict noEmit typecheck plus existing tests. Type units/operation variants; do not make TypeScript the runtime input validator.

Acceptance: every v1 fixture, U/B regression and static build pass unchanged; no implicit any at public command boundaries; no framework dependency in core.

Scope guard: no React or schema version bump; mechanical typing and module boundary changes only.

## PR12 — React 19 shell with existing viewport adapter

Priority P1, optional after cost review. Depends PR11.

Touched: new src/App.tsx, src/ui/*, src/main.tsx, index.html, package/lock, viewport adapter module, tests using retained accessible names.

Mount React DOM shell using the verified compatible versions in 02, retain direct Three viewport through lifecycle adapter. Preserve document/command API, responsive/accessibility/file behavior. Zustand only if needed as a thin UI adapter.

Acceptance: full regression suite unchanged; mount/unmount removes observers/listeners/render loop; no duplicate canvases/contexts; no schema/history/export change.

Scope guard: do not combine with Fiber migration or visual redesign. React Strict Mode lifecycle must be tested.

## PR13 — Optional Fiber 9 viewport adapter

Priority P1, conditional on demonstrable maintenance benefit. Depends PR12.

Touched: src/viewport/*, package/lock, tests/e2e/render-regressions.*, disposal fixtures.

Replace only viewport adapter with Fiber9/Drei10 stable; continue deterministic core and command dispatcher. Pick exactly one orbit/gizmo implementation per function; no simultaneous controls. Recheck exact peers/Three addon version.

Acceptance: B01–B15, export numeric parity and P02–P05 pass; no mount/unmount resource leak. Provide before/after evidence; broad semver peer support is not test evidence.

Scope guard: no AI, geometry/schema changes or imports. If it does not improve maintainability, defer without blocking the already released local MVP.

## PR14 — Geometry parameters and version-2 migration

Priority P1 feature; only after R11 demand. Depends PR11 and current stable renderer (PR13 if adopted).

Touched: typed scene schema/migrations, geometry factory/adapter, inspector geometry section, fixtures and migration/export tests.

Bound primitive dimensions/segments and triangle budget, preserve baseline default geometry, separate scale from parameters, regenerate/dispose geometry deterministically.

Acceptance: U08, version-1 compatibility, all exports, undo/reload and resource budgets pass; geometry remains editable from known params; future v2 files rejected by old clients without data loss.

Scope guard: no booleans, grouping, multiselect, STL guarantee or external meshes.

## Next-release AI PRs, gated separately

AI01: Pydantic schema/validator + deterministic shared fixtures + mock API only. Touch server/schemas.py, server/validation.py, tests and schema export; no paid provider. U09 and 30-case malicious/budget/revision contracts pass.

AI02: single provider adapter, access control/quotas/deadline/retries/cost-safe telemetry. Touch server/planner.py, settings.py, API route and tests. Disabled-key mode returns 503; auth, request limits and shared-worker quotas verified; no secret in client artifacts. No project database or apply endpoint.

AI03: consent + plan preview + local atomic approval. Touch client plan UI and command adapter; stale/expired/double-apply/undo/evaluation harness pass. Run genuine provider evaluation before enabling “AI-assisted” label. Preserve complete local editor when API unavailable. See 04 protocol and 05 evaluation thresholds.

These are separate PRs with the same repository/evidence rules. Do not add LangChain/LangGraph or extra agents without a measured need; deterministic validation is code, not an LLM persona.
