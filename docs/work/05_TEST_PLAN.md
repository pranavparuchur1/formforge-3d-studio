# FormForge verification and test plan

Decision date: 2026-10-27. This is a future execution plan. Actual evidence: eight baseline Node tests and syntax checks passed; additional model probes reproduced D01/D02/D03. Chromium failed to launch before navigation. No browser/export test below has passed in this assignment. See 04 for environment details.

## Test environment and evidence contract

Codex records commit SHA, OS, Node/package-manager/browser versions, dependency lock hash, WebGL vendor/renderer, viewport/DPR, commands, pass/fail/skip counts and artifact paths in each PR. Use pinned Playwright browser installs (`npx playwright install --with-deps chromium firefox webkit`) and an isolated origin/storage profile per test. Playwright guidance: [official installation](https://playwright.dev/docs/intro), accessed 2026-10-27. Test the actual production static build after Vite arrives, not only dev mode.

Run deterministic unit tests on every PR. Required Chromium and Firefox browser suites on every frontend PR, WebKit smoke on every PR and full suite before release. Run headed Chrome/Edge on Windows and Safari on macOS plus one real touch phone before advertising those platforms as supported. Playwright WebKit is not installed Safari, and mobile emulation is not real mobile hardware. Record exact versions when run rather than inventing versions today.

CI software WebGL may use explicitly documented SwiftShader/ANGLE flags in an isolated runner. Never promote no-WebGL fallback tests into render passes. A renderer test skipped because no GPU/backend is available is a blocked release gate. Performance gates require real hardware, not software-renderer scores. Include pageerror and console-error collection; narrowly allow only documented benign messages. Retry once for diagnostics, but a first-attempt flake remains a reported issue, not hidden by retries. Attach trace on failure, screenshot, browser console, downloads and numeric comparison report. Avoid nondeterministic remote CDNs/textures/fonts in tests.

Proposed scripts after tooling PRs: `npm ci`, `npm test`, `npm run check`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`. Only the first baseline test/check scripts currently exist; no claim that future commands work yet. Bind static test server to loopback, fail fast if it does not return HTTP 200, and terminate it after suite.

## Fixtures and tolerance policy

Commit fixtures under tests/fixtures: valid baseline v1 podium and every template; empty project; 200-object mixed scene; duplicate/malicious/huge-suffix IDs; invalid types/future version; unknown fields/deep values; boundary transforms; all hidden; corrupted autosave; v2 migration fixtures only when R11 ships. Avoid embedding credentials or third-party copyrighted assets.

Compare semantic JSON including names, IDs, order, transforms, color, metallic/roughness and visibility; ignore only explicitly ephemeral UI/camera/history timestamps and allocator metadata where derived. Internal undo must preserve document equality, not lossy normalization. Float epsilon: 1e-5 for model transform comparisons; GLB world matrices/bounds absolute 1e-4 for small fixtures and relative 1e-5 for large bounds; material scalar/color-channel differences <=1e-4 in linear space. PNG visual matching uses the same pinned browser/software renderer; cross-GPU visual differences do not substitute for numeric scene validation.

## Unit / transaction tests

| ID | Cases | Exact pass/fail |
|---|---|---|
| U01 (R02) | Each primitive; each template; parser synonyms/colors/unsupported/multiple-keyword input | Valid objects match documented defaults and template counts 4/6/4/6/5 for podium/chair/lamp/rocket/table; parser policy deterministic and unsupported input yields no transaction |
| U02 (R05) | Safe IDs, duplicate IDs, huge numeric suffix, 200 subsequent allocations, import then clone | Every resulting ID unique, regex-safe, 1–64 chars; no exponential-number IDs/counter precision failure |
| U03 (R03/R10) | Every bound and +/-epsilon; NaN/Infinity/null/boolean/string/incorrect vector length; all geometry types | Strict current input rejects invalid types/values without mutation; explicitly accepted finite boundary values preserved after save/undo/reload |
| U04 (R05) | v1 roundtrip, missing version legacy migration, future version, malformed/deep/oversize JSON, unknown geometry | Valid v1 preserved; future unsupported rejected; legacy warnings explicit; no silent object removal/replacement; byte/depth guards enforced |
| U05 (R04) | Every command/inverse; 65-entry cap; undo/redo branches; no-op; preset and gesture batch | One entry per committed action; redo invalidated after a new edit; no-op/error adds zero entries; no partial application on thrown command or over-cap preset |
| U06 (R05/R10) | Fake storage quota/security denial, debounce race, recovery copy and pagehide flush | Status only Saved after successful write; save failure leaves working document; last-good bytes preserved; latest pending revision wins |
| U07 (R06) | Export projection built from fixed document revision | Only visible project meshes included; no helpers/highlight; export errors clean temporary resources; no mutation of live model |
| U08 (R11) | v1→v2 and bounded geometry parameters | Baseline shapes' vertices/bounds within tolerance; bad dimension/segment/budget rejected before allocation; no migration until R11 exists |
| U09 (R13) | Frontend/backend shared schema fixtures; transaction preconditions | Same accept/reject decisions; operation budgets, references, idempotency, stale revision/hash and rollback all enforced |

Regression reproducer for U02 (baseline fails; not a passing test):

```js
const p = normalizeProject({version: 1, objects: [
  {id: 'shape-999999999999999999999999999999999999', type: 'box'}
]});
addShape(p); addShape(p);
assert.equal(new Set(p.objects.map(o => o.id)).size, p.objects.length);
```

Also assert future-version input throws and that a shared transform command cannot commit X=101. Do not merely test a validator separately while gizmo bypasses it.

## Playwright / end-to-end tests

Use role/name locators or deliberate test IDs. A test-only read-only document/render diagnostic adapter may expose revision, object state, render frame count and mesh matrices; it must never be the mutation path under test. User actions use real DOM/pointer events. Do not infer a canvas exists/works from the CSS illustration or a ready boolean alone.

| ID | Procedure | Exact pass/fail |
|---|---|---|
| B01 (R01) | Empty storage; navigate; wait for application model sync and a completed WebGL frame | HTTP200; no page errors; four rendered project meshes with nonzero bounds; canvas >300×200 desktop; pixel sample differs from empty background in known podium region; fallback hidden; fake illustration hidden |
| B02 (R02/R03) | Add every primitive; select by layer and ray click; rename, hide/show, clone/delete | Model and mesh counts/names/visibility agree; clone has new ID; ray selection correct; hidden mesh not pickable; selected state announced |
| B03 (R03/R04) | Enter XYZ/material values; move/rotate/scale gizmo using pointer drag; release/cancel; undo/redo | Each successful gesture yields one history entry; camera unchanged during gizmo manipulation; actual mesh matrix/model inspector agree within epsilon; Escape/pointercancel restores prior state; no accidental deselection |
| B04 (R04/R08) | Type into names/Quick Build, use native Ctrl/Cmd+Z; then unfocus and use scene undo/redo | Text undo leaves scene revision unchanged; outside-field shortcut reverses exactly one scene action; redo works on Windows and macOS modifier paths |
| B05 (R05) | Commit edit; wait for Saved; refresh; download JSON; create New; upload downloaded bytes | Same semantic document/IDs after refresh and import; replacement undo restores old project; latest save status truthful; downloaded JSON parses |
| B06 (R06) | Download GLB; parse in fresh viewer; compare fixture report (below) | Header/chunks/geometry/material/world-transform parity pass; no external network fetch; no selection emissive or helper exports |
| B07 (R06) | Download STL of a known visible fixture; toggle hidden object and repeat | Binary length =84+50×triangleCount; count>0; all coordinates/normals finite; bounding box agrees; expected hidden triangles omitted; warning acknowledged |
| B08 (R06) | PNG at nonempty view; rotate camera then export again | Valid PNG signature; decode dimensions equal canvas drawing-buffer dimensions; non-background pixels present; second view changes pixels; null toBlob/error yields message and no bogus success |
| B09 (R07) | Build “purple lamp”; unsupported prompt; at-cap preset | Four lamp parts with expected shade color; one undo removes complete lamp; unsupported/over-cap operation has no scene/history change and keeps prompt |
| B10 (R08) | 1440×900, 1024×768, 768×1024, 390×844, 320×568; keyboard-only and touch emulation | Create/Objects/Inspector/New/Open/Export/history reachable; no document horizontal overflow; focus not clipped; sheets close/restore focus; no hidden tabbables |
| B11 (R10) | 200 objects; add/clone/template rejection; 100 cycles add/delete and repeated exports | Existing scene intact, clear limits, no uncaught exception, geometry/texture leak gate from 04 passes |
| B12 (R01/R09) | Block module URL in baseline; later block all third-party requests on production build | Baseline failure explains load error; final bundled editor still renders/edits with no third-party core requests while origin reachable; independent JSON rescue available if renderer module fails |
| B13 (R05) | Inject quota-denied localStorage adapter and corrupt saved bytes | Save failure persists with export action; raw corrupt data/recovery copy not silently overwritten; opening bad file leaves scene unchanged |
| B14 (R08) | Open/close Export via click, outside click and Escape; change modes/visibility | aria-expanded/pressed/selected state correct; named controls; focus restored; no stale disclosure state |
| B15 (R01/R10) | Force getContext(webgl2) failure and renderer context loss through supported test hook/WEBGL_lose_context | Clear degraded state, local numeric/model editing and JSON export usable, GPU export disabled, retry/recovery tested; no false LIVE status |

For B12 distinguish: (a) third-party outage with origin online, mandatory bundled-app gate; (b) internet disconnected after load, existing session editing should remain usable; (c) cold offline reload, no offline-shell guarantee in MVP. No test should promise a service worker that does not exist.

## GLB roundtrip method (mandatory)

Use a fixture with one instance of each primitive, nonuniform scale, nonzero XYZ rotation/translation, different colors/metallic/roughness, one hidden object and selected-object highlight active. Export using the real UI. Assert magic `glTF`, version 2, total header length equals file bytes and nonempty JSON/BIN chunks. Load bytes with the exact-pinned GLTFLoader in a separate empty test viewer/page, not through the app's own scene deserializer. Record loader version.

Compare visible mesh names/count, triangulation totals, world-space bounds and world matrices, geometry type fixture signatures and PBR material factors within the tolerance policy. Account for exporter decompositions and material sharing without requiring identical node indices or binary byte equality. Confirm no ground/grid/gizmo/camera, external URI or selection-emissive contribution. Re-export loaded scene and reload once more. Run Khronos [glTF Validator](https://github.com/KhronosGroup/glTF-Validator) with recorded tool version: zero errors, warnings individually explained. This validator reference is an implementation tool to verify, not a check run here.

Before release manually open a fixture in an independent engine/viewer (for example Babylon Sandbox or Blender), record viewer/version and compare orientation/scale/materials and screenshot. Different lighting/tone mapping need not look pixel-identical. Do not call a file print-ready because either glTF validation or Three loading passed. Current MVP does not need production GLB import to test a test-only loader roundtrip.

## Accessibility and performance

A01: automated accessibility scan on editor, inspector and every file/drawer state; zero serious/critical findings and all other findings triaged. A02: keyboard-only J1–J4 plus numeric camera controls; zero inaccessible required actions, no focus traps, native input undo intact. A03: NVDA/Chrome and VoiceOver/Safari manual task review with labels/values/status announced and no drag-frame speech flood. A04: contrast thresholds, 24 px minimum targets (44 px mobile goal), 200% zoom/400% reflow and reduced motion as specified in 03. Missing manual AT evidence blocks an accessibility-conformance claim.

P01: three cold production loads at 10 Mbps/100 ms RTT, each usable <=3 s; <=1 MiB compressed initial JS, <=2 MiB initial transfer. P02: three ten-second orbit samples of a 100-object mixed scene after warmup, p95 frame interval <=33.3 ms, p95 input-to-visible-commit <=100 ms. P03: 200-object 30-second interaction without crash/context loss. P04: five warmup create/delete cycles, then 100 measured cycles; settled geometry/texture counts at baseline+5 or less. P05: hidden-tab render pauses and resumes correctly. Record hardware, quality setting, shadow/DPR and triangle/draw-call counts; no hardware evidence means performance remains unverified.

## Next-release AI evaluation (not MVP gate)

Thirty versioned cases: 10 normal supported builds/edits, 5 ambiguous/unsupported tasks, 5 malicious code/HTML/exfiltration/tool requests, 5 size/nonfinite/geometry/count abuse cases, and 5 reliability/revision/idempotency cases. Include quotas, invalid provider JSON, missing credentials, timeout, 429/retry-after, provider5xx, user cancellation, expired plan and duplicate Apply. Run deterministic mocked contracts in CI; run real provider cases with pinned model ID/config before claiming AI functionality.

Pass: all malicious/budget-invalid plans rejected with zero applied edits; all stale/duplicate/cancel cases behave correctly; >=9/10 normal cases satisfy explicit geometry/placement expectations without manual JSON repair; no arbitrary code/network instructions accepted; all applied plans fully undoable. Record token/cost/latency distribution and human review results; schema validity is not aesthetic quality. One genuine end-to-end prompt → provider → validation → preview → approval → editable scene → undo must pass. Core B01–B15 must still pass with backend absent.

## Release verdict rules

All applicable P0/U/B tests, build and CI checks must pass. Any data-loss, ID-uniqueness, false-save, security-boundary, blank-render, GLB-corruption or inaccessible-save failure blocks release. A skipped required browser is a blocker. Known minor visual issues require owner/rationale and cannot weaken data-safety requirements. Report actual counts and links; never copy this proposed test inventory as a completed results report.
