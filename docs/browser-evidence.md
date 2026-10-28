# PR1 runtime and export evidence

Tested against baseline commit `290282321058d3f7d76bbe3ff81baac54aedd012` plus the working-tree changes in this task. No PR has been published or deployment performed. React migration is untouched.

Read `docs/CODEX_HANDOFF.md`, `docs/ARCHITECTURE.md` and all seven `docs/work/` specifications. `FORMFORGE_CODEX_START_HERE.md` is absent from both the checkout and fetched `origin/main`. The newer Work backlog divides the original broad runtime PR1 into PR01–PR10. This task follows the owner's explicit request to exercise runtime, viewport, exports and browser tests together; it does not claim completion of every later release gate.

## Changes and observed behavior

The baseline successfully rendered in actual Chromium. Its external Google Fonts request was blocked by the environment policy. No baseline exporter crash was established. Local exact-pinned Three imports and system fonts remove those network dependencies, without upgrading Three or introducing React/Vite.

Model probes confirmed future-version acceptance and unsafe arithmetic allocation from huge imported IDs. The allocator now checks collisions independently of imported numeric suffixes, including near-overflow counters. Unknown versions and invalid current-v1 transforms/materials/IDs/geometry reject before replacing the document. Valid v1 snapshots preserve allocator and semantic properties. Missing-version legacy files require an explicit UI warning before the existing repair path; field-by-field legacy repair preview is still later work.

Runtime hardening adds transient gizmo previews with bounds checks, one commit per gesture, Escape/pointer-cancel rollback, gizmo/picking arbitration, native input undo priority and stable transform input nodes. Error paths reject all-hidden geometry exports and null PNG captures, dispose temporary export materials in `finally`, and explain STL's geometry/units/printability limits before download. WebGL failure keeps numeric editing/JSON available; a separate bootstrap offers raw saved JSON when the main module cannot load. Context loss pauses drawing and restores the current document after the browser restores the context. Save text updates after an actual write rather than assuming success.

These are protective fixes and tested current behaviors; suspected baseline pointer/focus issues were not all separately reproduced before their repairs.

## Test environment

- Debian GNU/Linux 13, Node 24.19.0, npm 11.9.0.
- Playwright 1.64.1 driving system Chromium 154.0.8037.57; explicit `CHROMIUM_PATH=/usr/bin/chromium` override.
- Headless real browser process, ANGLE/SwiftShader software WebGL2 (`--use-angle=swiftshader --enable-unsafe-swiftshader`), 1440×900, DPR 1. This is not a hardware GPU benchmark.
- Three core, controls, exporters and fresh-page GLTFLoader all 0.180.0.
- Khronos `gltf-validator` 2.0.0-dev.3.10.
- Lockfile SHA-256: `ad614009b6f4f5f5c88e241569d0cd74a9ee20d33ba8d854f86d1fdc932fdcb0`.

## Results

- Baseline eight assertions passed; the original isolated runner reported the file as one passing test. Explicit non-isolated Node execution now reports individual tests.
- `npm ci`: passed with frozen lockfile; `npm ls --depth=0`: valid exact direct dependencies.
- `npm test`: 13 passed, zero failed/skipped.
- `npm run check` and `git diff --check`: passed. Syntax checking is not lint/type checking.
- Final Chromium run: 11 passed, zero failed/skipped. Machine-readable results are in `../artifacts/browser-results.json`.
- `npm audit`: zero reported advisories in the selected five-package dependency graph. This is not a security certification.
- Mixed-primitive exported GLB: zero Khronos errors, zero warnings, eight informational unused UV-coordinate entries (untextured materials). Fresh-page GLTFLoader verifies visible mesh count, world matrices and precise world-space bounds (4 decimal tolerance), triangle counts, material color/metallic/roughness, nonzero vertices and absence of selection emissive.
- Binary STL: nonzero triangles, exact `84 + 50 * triangleCount` byte length and every normal/vertex float finite; triangle totals and world bounds match the visible source geometry. PNG: actual browser download, decoded dimensions equal canvas buffer; changing the camera changes output bytes.

The automated scenarios exercise actual completed frames and pixel variation, four bounded podium meshes, ray selection/orbit/resize, all five primitives, XYZ/material edits, duplicate/delete, undo/redo, Quick Build, persistence, JSON/new/import, invalid import preservation, real move/rotate/scale pointer drags with camera freeze, one-step gesture history, Escape and pointer-cancel gesture rollback, text undo, invalid numeric input, all-hidden export rejection, null PNG error, no-WebGL JSON recovery, blocked-module raw recovery, no external runtime requests and context loss/restoration. UI actions drive mutations; the opt-in diagnostics adapter returns copied read-only observations.

## Artifacts and reproduction

Run `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --project=chromium` here, or install pinned browsers and run `npm run test:e2e` elsewhere. The full editor regression suite serves the development editor through `scripts/serve.mjs`. The publishing build produces a standalone HTML artifact; its rendering/editing/GLB smoke check was also exercised separately.

Artifacts live outside tracked source under `artifacts/`: `before.png` (baseline, 1280×720), `podium.png`, `edited-scene.png`, `gizmo.png`, `no-webgl.png`, `export.glb`, `export.stl`, `export.png`, `gltf-validation.json`, `export-parity.json`, `npm-audit.json`, `browser-results.json`. Screenshots show actual rendered canvas output. The baseline font request failed; final images use local/system fonts. Failure traces and screenshots are under `test-results/`; CI uploads these and `playwright-report/` even on failure.

## Remaining gates and risks

The owner explicitly waived Firefox testing on October 28, 2026 and selected Chrome/Chromium for PR1. The test configuration, CI and setup guidance now use Chromium only. The earlier Firefox download failure is historical and no longer blocks the requested PR1 browser verification. No Firefox compatibility claim is made. CI is configured but has not run remotely.

PR1 runtime verification uses the requested Chrome/Chromium scope. React migration remains a separate task. WebKit/Safari, independent-engine manual GLB inspection, GLB re-export/reload qualification, manual accessibility/mobile, hardware performance, detailed legacy repair preview, corrupt-storage preservation and the remaining Work P0 gates are pending. The current responsive baseline still hides panels at narrow widths. Lint/type tooling, broader release qualification and command/storage refactors remain separate backlog work. A subsequent publishing change adds an esbuild static bundle and GitHub Pages workflow. No service worker or cold-offline reload support is claimed.

Migration risk: strict v1 validation intentionally rejects malformed files previously silently coerced. Keep original files; unversioned legacy imports retain a separately warned repair path. Local storage remains origin-specific and is not a backup; export JSON before moving origins.

## Restored environment verification — October 28, 2026

The published snapshot restored the implementation and dependencies successfully. The owner-selected browser scope is now Chrome/Chromium only; Firefox is neither a required check nor a blocker. CI and the default Playwright command select Chromium. The startup-instruction draft was updated only for this new preference; install/network settings were preserved and nothing was published. Additional export parity and pointer-cancel regressions are included in the final browser run.
