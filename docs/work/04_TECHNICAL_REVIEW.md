# Baseline review and architecture decisions

Audit date: 2026-10-27 (America/New_York). Input: attached formforge-work-input(1).zip. No implementation source was changed. Paths/line numbers below refer to extracted baseline, not proposed files. All seven specifications are implementation instructions, not evidence of features already delivered.

## What was actually run

| Check | Result |
|---|---|
| `npm test` in formforge-studio | PASS: 8 tests, 0 failed, 0 skipped under Node v24.22.1 |
| `npm run check` | PASS: node syntax checks of main.js and scene-core.mjs; this is not lint, typecheck or browser execution |
| Additional direct Node probes | Reproduced future-version acceptance, duplicate IDs after huge numeric ID import, and restore clamping an out-of-range model position |
| `npm run dev` | Printed startup URL; subsequent local HTTP probe returned connection refused. No successful page response established |
| Python Playwright → /usr/bin/chromium | Attempted headless Chromium with software-rendering flags; launch aborted with `socket() failed: Operation not permitted` and TargetClosedError before page creation |
| Real browser interactions, GLB/STL/PNG download/roundtrip, Firefox/WebKit, real GPU, mobile, deployment, AI | NOT VERIFIED / NOT RUN. Browser launch failure is an environment limitation, not an observed app runtime defect |

The local browser failure must not be counted as a passing fallback test. No public URL or remote repository was supplied/created. Unit probes below are data-model evidence only.

## Complete file audit

| File(s) | Inspection result |
|---|---|
| README.md | Correctly labels rule parser/non-verified renderer, but broad Node20+ is inadequate for current Vite; roadmap booleans conflict with recommended narrow MVP |
| docs/WORK_BRIEF.md, RESEARCH.md | Research hypotheses, not proof of novelty or installed compatibility; exact release/date claims require rechecking |
| docs/ARCHITECTURE.md | Good authoritative-model/typed-operations direction; database/auth/assets/export jobs overbuild local MVP and server apply risks two sources of truth |
| docs/CODEX_HANDOFF.md | Useful tests, but four proposed PRs are too broad; splits in 06 replace them |
| index.html | Pinned Three 0.180.0 CDN import map, inline 12-second boot fallback, static LIVE/WEBGL labels, CSS illustration, file input and toolbar. File type filter is not validation. Numeric material sliders lack programmatic labels |
| package.json | No dependencies, build, lint, typecheck, lockfile or CI; npm test/check run only local pure tests/syntax |
| scripts/serve.mjs | Minimal all-interface dev server, lexical traversal protection and generic static file read; not production hosting, no auth/security headers; symlink escapes not prevented by lexical check |
| src/scene-core.mjs | Pure model, five geometry types, five bounded-count recipes, sanitizing importer, rule parser; version, counter and silent coercion gaps below |
| src/main.js | 377 lines combine state/history/storage/render/UI/export; cleanup on mesh delete exists; transform and inspector use inconsistent validation paths; DOM string escaping for layer names/IDs is present |
| src/styles.css | Reviewed complete stylesheet, including placeholder and layer-pick styles. External Google Fonts; fixed min-height 600; inspector hidden <=900 px, Create hidden <=610 px; no alternate panel controls |
| tests/core.test.mjs | Eight useful data tests; none execute main.js, DOM, controls, browser storage, exports, resource cleanup, startup or accessibility |

## Findings: evidence versus hypotheses

Severity P0 = release blocker, P1 = important before wider beta, P2 = later improvement. “Source-confirmed” means reachable code behavior is clear, but interactive consequences have not been tested in a browser.

| ID / severity | Evidence / location | Effect and required repair |
|---|---|---|
| D01 P0, reproduced | scene-core.mjs:55–71 ignores raw.version; normalizeProject({version:999,objects:[]}) returns version 1 | Future project can be silently misread. Reject unknown versions; explicit legacy migration and loss report |
| D02 P0, reproduced | scene-core.mjs:69–70 converts digit suffix to Number; addShape:42 increments counter | Import `shape-999999999999999999999999999999999999`; add twice produces `shape-1e+36` twice, violating uniqueness/regex. Replace allocator with collision-checked stable IDs independent of unsafe numeric suffixes |
| D03 P0, source-confirmed + model probe | main.js:261–265 gizmo writes position/rotation without bounds and scale without max; inspector:317 clamps; restore:75 normalizes | Moving beyond bounds can save a value later changed by restore/undo. Probe: stored X=101 restores to 100. Apply shared validation at commit, keep transient drag separate, resync mesh to accepted values |
| D04 P0, source-confirmed | main.js:47–58 catches errors but never restores before snapshot | Partial state can survive failed mutation/sync and history/persist can disagree. Apply to cloned document and commit only after validation; rollback display/model on failure |
| D05 P0, source-confirmed | main.js:351–356 handles Ctrl/Cmd+Z/Y before typing guard | Native text undo gets intercepted; move input/editable guard before scene shortcuts |
| D06 P0, source-confirmed | styles.css @media <=900 hides Inspector; <=610 hides Create; no drawer exists in HTML | Numeric editing and core controls inaccessible at these sizes; add drawers/sheets and persistent history/file actions |
| D07 P0, source-confirmed | main.js:40–45, index.html save-marker; CSS hides marker | Successful save state not reflected; delayed storage write can be lost; corrupt restore silently replaced by demo. Add status/recovery and explicit lifecycle handling |
| D08 P0, source-confirmed | main.js:115 and 376–377; handlers installed before renderer init; grid click:307 dereferences grid | syncAll skips all DOM updates without renderer; some controls throw or appear to save nonexistent visible state on failure. Separate DOM/model from renderer and independently keep JSON rescue operational |
| D09 P1, source-confirmed | main.js:223 only checks total objects, getExportObject skips hidden ones | All-hidden scene exports empty geometry; reject empty visible export and explain |
| D10 P1, source-confirmed | main.js:224–238 cleanup after await rather than finally; toBlob may return null at 222 | Export error skips temporary material disposal; null PNG can be downloaded as invalid content. finally cleanup and explicit blob/error handling |
| D11 P1, source-confirmed | main.js:349–361 hide menu without aria-expanded updates; generated visibility buttons lack object-specific names; input sliders lack labels | State and accessible name gaps. Implement full disclosure/focus/label contracts |
| D12 P1, source-confirmed | scene-core.mjs:15/61 coercion, unknown objects skipped | Invalid types can be coerced, unsupported objects silently removed. Keep explicit legacy repair separate from strict current model/AI validation |
| H01 P0, hypothesis | main.js:273–281 pointer picking has no gizmo/pointer-cancel exclusion | Short gizmo interactions may trigger scene ray selection; test actual event order before calling it a reproduced defect |
| H02 P1, hypothesis | main.js:244,252,288 preserveDrawingBuffer, 2048 shadows, perpetual rendering | Battery/frame-time pressure possible; no benchmark performed. Measure and introduce demand/invalidation + low-quality option |
| H03 P1, hypothesis | main.js:166 rebuilds inspector input markup on sync | Focus/caret loss during edits likely; browser-test before claiming observed loss |
| H04 P1, unverified | exports and pinned CDN imports | Runtime/export API compatibility and lighting/material fidelity require browser fixture tests; no specific exporter crash established |

Positive evidence: name/ID HTML escaping exists; object cap enforced on normal add/template paths; geometry/material resources disposed on deletion/type replacement; export clones remove selection emissive; gizmo uses getHelper and disables orbit on dragging-changed. Do not “fix” these APIs based on outdated examples. GLTF exporter clone geometry is shared, so dispose cloned materials but never dispose live geometry through the export cleanup path.

## Architecture decision record

### ADR-01: local document is authoritative

Keep framework-independent document schema and deterministic transaction compiler. UI state (selection, mode, camera, drafts, panels) is separate from saved scene/history. All document mutations go through command dispatch; renderer projects the accepted document. A gizmo may manipulate a transient Three object during a gesture; on release validate a complete transform, dispatch one command, and project committed values back. Escape/pointercancel reverts the transient gesture. Renderer failure must not disable document serialization or numeric editing.

Commands for MVP: addPrimitive, addPresetBatch, setTransform, setMaterial, renameObject, setVisibility, duplicateObject, deleteObject, replaceProject, renameProject. Each has a typed payload; preconditions (IDs exist, uniqueness, bounds/counts/version) and inverse or before/after snapshot. Clone → validate → commit → increment local revision → persist asynchronously. Validation failure changes neither document, revision, selection nor history. Renderer projection failure marks degraded UI and can retry from the last valid document; never makes raw mesh state authoritative. Internal undo restore must not re-run a lossy importer.

History is in memory, maximum 65 entries, not persisted initially. Use semantic equality ignoring cache/ephemeral state. Counter/ID allocator cannot change merely on restore. Export takes an immutable revision snapshot; edits during export cannot change that export. Export JSON always includes all objects, including hidden ones. GLB/STL includes only visible project meshes, not helpers, ground, lights or camera.

### ADR-02: staged tooling migration

Bundle pinned dependencies with Vite before considering a React rewrite. Preserve baseline Three first to avoid confounding API upgrades. Introduce TypeScript scene/commands before React/Fiber. React 19 + Fiber 9 + compatible Drei are reasonable later shell/viewport tools but are not required for reliability; Zustand is optional, not a second model. Use an isolated viewport adapter to keep Three out of the command module. No SSR or WebGPU in MVP. No “all-at-once” migration. See dependency-ordered PRs in 06.

### ADR-03: versioning and parameter upgrade

Version 1 compatibility is mandatory for valid baseline JSON. Reject unknown versions without replacing current scene. Import has a pure parse/validate/migrate function with warnings, distinct from internal history decoding. Retain original raw input until replacement is accepted. For R11 introduce version 2 geometryParams, with migration setting exact baseline geometry defaults. Segment caps and geometry triangle budget enforced before allocation. Nonuniform scale remains a transform, not a geometry parameter. No groups/assets in v2 until separately designed; future additions require explicit migration/export contracts.

### ADR-04: optional AI planning, local atomic apply

Defer API to next release. Do not implement the starter's server-side apply/project routes alongside local authoritative state. Browser calls a single planning endpoint, reviews the proposal, then locally revalidates and applies to its current document. No Postgres/S3/auth project service required. A hosted AI endpoint still requires access control or invite tokens and abuse limits; never ship an anonymous unlimited proxy. Self-hosted use may bind loopback.

Proposed `POST /v1/ai/scene-plans` request: schemaVersion, clientRequestId, baseRevision, baseSceneHash, bounded prompt and opt-in minimal scene context. Maximum request body 256 KiB, prompt 2,000 characters. Return planId, echoed baseRevision/hash, expiresAt (10 minutes), provider/model identifier, operations, readable explanation, usage when available and estimate explicitly marked as estimate. Stable error shape: code, userMessage, retryable, requestId. Statuses: 400 malformed JSON, 413 size, 422 schema/semantic failure, 401/403 access, 429 quota, 502 invalid provider result, 503 disabled provider, 504 deadline. No /apply endpoint for this phase.

Use JSON discriminated union: add_primitive, set_transform, set_material, rename_object, set_visibility, delete_object. Maximum 50 operations, 50 added objects and 200 resulting objects; no script/URL/shader/expression/tool field. UUID-like plan-local object references resolved deterministically into client IDs; opId unique in a plan. Explicit add args: type, name, position[3], rotation[3], scale[3], color, metalness, roughness, visible, plus geometryParams only for known version-2 scenes. Existing refs must resolve; reject forward/ambiguous refs and duplicate opIds. Pydantic strict types, extra='forbid', finite floats, exact vectors, enums, regexes and all shared bounds. Mirror JSON schema/fixtures in TypeScript; then perform semantic/budget validation. Names/explanations are textContent, never HTML.

Apply compares both current revision and scene hash with proposal base; any intervening edit/undo/import makes plan stale. Revalidate after approval on a cloned document, atomically commit as one undo transaction. A set of already-applied planIds prevents double-click duplicate apply; idempotency survives for the current session. Closing preview discards it. Preview ghosts do not mutate the working scene. All destructive steps are listed before approval. No generated Python/JS, eval, function construction or model-selected external tools. One model call plus code validator is sufficient; no agent framework/multi-agent orchestration needed.

Server secrets in environment only; never VITE_ variables. Per-user/invite quota defaults: 5 requests/minute, 50/day, one active call; provider max output 4,096 tokens, 30-second overall deadline and at most 2 retries only for transient timeout/429/5xx within deadline, exponential jitter and Retry-After. No recursive “repair until valid.” Quota enforcement must work across deployed workers. Cancellation prevents apply even if provider finishes. Log requestId, model, duration, token counts/status, never raw prompt or scene by default. Same-origin API preferred; explicit CORS allowlist and HTTPS if remote. Consent panel explains transmitted content/provider and retention before first call.

### ADR-05: defer cloud and asset ingestion

PostgreSQL version tables, authenticated collaboration, object storage, signed URLs and server export workers are sensible later architecture only after validated demand. Future GLB import must reject external URIs/scripts and unsupported extensions, cap file bytes, expanded geometry and decoded textures before allocation; a 10 MB upload cap alone does not prevent decompression/GPU exhaustion. No asset ingestion route in MVP.

## Resource/security budgets (proposed gates, not measurements)

Desktop reference target: current stable browser, 4-core laptop, 8 GB RAM, integrated GPU; record actual CPU/GPU/OS/browser in release evidence. 1440×900, DPR capped at 1.5 by default (low quality 1), no network textures, 100-object mixed fixture, <=250,000 rendered triangles. Hard 200-object cap and <=500,000 project triangles. Future geometry params: segments/radial segments integer 3–64, sphere height 2–32, torus tubular 3–96, tube radius >0 and below major radius, dimensions 0.05–40; reject combined triangle overrun even when individual values pass. Meter-space center bounds alone do not imply a maximum overall bounding box.

Target readiness <=3 seconds on cold production load, 10 Mbps/100 ms RTT; <=1 MiB compressed initial JS and <=2 MiB total initial transfer, optional exporters lazy-loaded. At 100 objects, p95 frame interval <=33.3 ms during orbit over 10 seconds after warmup, input-to-visible-commit p95 <=100 ms. Run three samples and require each to pass. At cap no crash/context loss on 30-second orbit. No GPU growth >5 geometries or textures after five warmup add/delete cycles and 100 subsequent cycles. Hide-tab render work should pause. These are scope-controlling targets; change them only with recorded measurements and explicit product decision.

Sanitize import by reconstruction from allowed fields; current valid names are escaped but adding new HTML paths can regress XSS. Enforce JSON bytes before parse and strict depth/field structure (maximum depth 12; schema-owned keys only for current-format files). Block network references, giant strings and nonfinite values. Apply CSP to bundled app (self scripts/styles, no eval; explicit API connect origins, blob image/download needs), local fonts, correct content types, no credentialed wildcard CORS. Dev server is for local trusted use only; lexical path check is not symlink isolation. No credentials, telemetry content or secrets in artifacts. Threats include malicious project files, hostile model output, dependency compromise, storage quota loss and GPU exhaustion. No scan performed here can certify absence of all vulnerabilities.
