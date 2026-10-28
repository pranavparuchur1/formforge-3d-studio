# Release, deployment and handoff checklist

Decision date: 2026-10-27. This checklist defines future release gates. Unchecked boxes are pending work, not completed results. Research output is seven Markdown specifications in formforge-work-deliverables.zip; no implementation, repository, production build or live deployment was produced.

## Current honest status

- [x] Read assignment, README and all four starter planning documents; inspect complete source, tests, HTML/CSS, package and dev server.
- [x] Run baseline Node tests: 8 pass, 0 failures, 0 skips; syntax checks pass under Node v24.22.1.
- [x] Reproduce version/ID/model-normalization issues with direct Node probes; distinguish other source findings from browser hypotheses.
- [x] Verify official technology/competitor evidence, record dates/URLs and unresolved package/audit caveats in 02.
- [x] Attempt Chromium browser verification; blocked before page creation by socket permission failure. This is evidence of an attempted check, not a render pass.
- [ ] Actual browser model/gizmo/export/roundtrip functionality verified.
- [ ] Production lockfile/build/audit, CI, performance, accessibility, real-device review complete.
- [ ] Real AI provider integrated and evaluated.
- [ ] Hosting/domain configured and external URL tested.

## A. Handoff integrity and ownership (Codex + repository owner)

- [ ] Repository owner confirms exact new/existing repository and authorizes implementation; avoid accidentally editing an unrelated project.
- [ ] Baseline repository root contains package.json/index.html/src/tests/scripts/docs; seven files are directly in docs/work/.
- [ ] Original input ZIP preserved as backup; no credentials copied into repository or issue bodies.
- [ ] Review precedence: these work specs override the starter's broad migration, booleans/cloud/GLB-import roadmap where scope conflicts.
- [ ] PR01 starts alone; subsequent PRs follow 06 and report real evidence. Select project source license before public open-source claims.
- [ ] Requirements R01–R10, findings D01–D12/H01–H04 and tests U/B/A/P are traceable in issues/PRs.

## B. Reproducible build and CI (frontend owner)

- [ ] Exact Node/package-manager version, direct dependencies and lockfile committed; npm ci from fresh checkout succeeds.
- [ ] Three core/addons come from one exact version; no runtime core/font CDN requirement; all new peer requirements verified, no force-installed mismatches.
- [ ] npm test/check/lint/typecheck/build and required Playwright browser projects pass; scripts not applicable before their PR are clearly identified.
- [ ] Production dist tested through a static HTTP server and preview target; missing asset requests, page errors and unexpected network destinations fail CI.
- [ ] CI WebGL backend documented; Chromium/Firefox suites and WebKit smoke pass without skipped rendering gates. Match browser binaries to Playwright pin.
- [ ] Artifact contains no API credentials, environment secrets, raw prompts/scenes, dev files or private source maps.
- [ ] npm audit including tooling and dependency advisory review recorded; backend pip-audit/pip check only when backend exists. Fix applicable exploitable issues; document owner/expiry/rationale for accepted exceptions. No applicable critical/high exploit or exposed dev-server issue remains.
- [ ] License notices and transitive license inventory included; third-party asset/font rights checked.

Proposed implementation-stage commands: npm ci; npm test; npm run check; npm run lint; npm run typecheck; npm run build; npm run test:e2e; npm audit. These are separate commands whose failures must be retained, not suppressed with shell chaining. Only npm test/check existed in the research baseline.

## C. Functional, portability and quality gates (QA + frontend owner)

- [ ] B01 actual completed frame/podium evidence, not merely illustration or readiness flag.
- [ ] All primitives/templates editable; inspector/gizmo share bounds; pointer cancel/orbit arbitration and one-gesture undo pass.
- [ ] New/Open/JSON rescue valid in degraded rendering mode; unknown versions, unsafe IDs and quota failure cannot destroy working data.
- [ ] Saved status reflects successful persistence; refresh/JSON import restore semantic properties and IDs; invalid input leaves state intact.
- [ ] GLB actual browser download, fresh-loader numeric comparison, validator zero errors and independent viewer manual check complete.
- [ ] STL parse/triangle/bounds checks pass; units, no materials and no guaranteed printability shown before export. UI label “STL mesh” avoids “3D Print Mesh” implying readiness.
- [ ] PNG decodes and changes with camera; GPU export failure yields no false success or corrupt download.
- [ ] Accessibility A01–A04 and all responsive widths pass; real keyboard/AT task evidence exists; no unsupported conformance claim.
- [ ] Real integrated-GPU measurements satisfy P01–P05; device/browser/quality and sample counts recorded. CI software renderer results are separate.
- [ ] Chrome/Edge Windows, Firefox, macOS Safari and real touch-device qualification recorded for advertised platforms. If a platform is unsupported, explain it and retain JSON export; don't silently skip a claimed platform.
- [ ] All P0 defects closed; known limitations visible in README/help and release notes with issue owners.

## D. Hosting, headers and domain (repository owner + deploy owner)

Choose one static host such as Vercel or Netlify after access and target are authorized. Vite output is dist; install with npm ci and build with npm run build. Configure provider according to current official docs at deployment time; no host account/domain/credentials were supplied here and no deployment is authorized by mere availability of a connector.

- [ ] Deploy static dist, never scripts/serve.mjs, Vite dev server or preview server as production.
- [ ] Check base path/hashed asset URLs; single-page fallback only where needed, never serve index.html for missing JS with wrong MIME.
- [ ] HTTPS valid, no mixed content; correct JS/CSS/JSON/GLB/PNG types; nosniff; Referrer-Policy; CSP tested with bundled resources and explicit API origins; no unsafe-eval requirement.
- [ ] Index uses revalidation/short cache; content-hashed assets immutable; no service-worker stale-shell trap. Any service worker is separate reviewed scope.
- [ ] Host preview URL recorded with commit/build ID and external browser test time/browser. Independently navigate that URL and run J1–J4; successful API deploy status alone is insufficient.
- [ ] Optional custom domain chosen by owner; DNS and TLS verified before claiming domain live; no domain purchase without authorization.
- [ ] Explain that localStorage is per origin: preview→production or domain change does not migrate local projects. Prompt JSON export from old origin first and import on new origin.
- [ ] AI backend, if later deployed, runs separately with server-only secrets, same-origin proxy or explicit CORS, auth/invite quotas, HTTPS and no raw content telemetry.

If hosting access is absent, hand off the reproducible build and checklist with deployment marked pending. Never fabricate a public URL or call the site deployed.

## E. Rollback and data preservation (deploy owner)

- [ ] Retain last known-good immutable deployment and matching commit/lockfile; record provider-specific promote/rollback action after target selection.
- [ ] Rehearse staging rollback to previous build; verify fresh load, assets and representative JSON fixture afterward.
- [ ] Before a schema release, retain raw local project backup and migration test fixtures; new schema writes use a new storage key, with previous key retained until explicit confirmation.
- [ ] Rollback old application cannot be assumed to read new schema. Provide JSON rescue and restore from pre-migration copy; do not overwrite new data silently. No irreversible storage migration in local MVP.
- [ ] Trigger rollback for data loss/false save/duplicate IDs, blank renderer, corrupted export, key exposure or major keyboard/file-access regression. Halt promotion while investigating.
- [ ] Communicate known issue and JSON-backup workaround. Avoid adding rushed telemetry that uploads private local scenes.

## F. Five-minute public demo script (presenter + QA)

Run on the exact release URL/browser beforehand. Use a fresh test profile, then test persistence in the same profile. Do not reset a user's existing scene.

1. Load site. Point to actual orbiting interactive four-part podium and “Saved on this browser”; explain no account or AI key required. If renderer doesn't load, stop the demo and report failure, not the CSS illustration.
2. Add Lamp via local Quick Build “purple lamp”. Say “This is a deterministic preset parser.” Select the foot in Objects and edit X=1.2, roughness and color; demonstrate viewport selection and Move gizmo with orbit disabled during drag.
3. Undo/redo one gesture and one template action. Rename scene; wait for confirmed save; refresh and show retained scene. Explain local storage can be cleared and isn't a backup.
4. Export JSON, create a blank scene after backup, reopen JSON. Show IDs/count/properties retained; invalid-file failure must keep scene intact.
5. Hide one part, export GLB and open it in the prequalified independent viewer. Show correct geometry/material/transform preservation. Export PNG and open it. If showing STL, acknowledge arbitrary units/geometry-only/possible overlapping non-manifold shells first.
6. Narrow viewport to mobile layout; open Objects/Inspector and demonstrate numeric editing, undo and project export. Use keyboard for the same task briefly.
7. If real AI is not integrated/tested, present only a roadmap slide/text. If later enabled, show consent → real provider → readable plan → preview → approval → one-step undo, with model identity and quota/error behavior available.

Any failed flow is a defect to report; a demo walkthrough is not a substitute for the automated test matrix. No browser test in this script was completed during the research assignment.

## G. Required release evidence record

Fill in actual values before promotion: commit SHA; dependency lock hash; build artifact ID; public preview/production URL if any; host/domain; test commands and pass/fail/skips; Chromium/Firefox/WebKit and manual browser versions; OS/GPU/device; export viewer/validator versions and outputs; accessibility findings; performance samples; unresolved issue IDs/owners; rollback build/action; release approver. Unfilled fields mean pending verification, not implicitly passing.

## Known baseline limitations and recommended next action

Local scene primitives only; no real AI, GLB import, booleans, groups, cloud sync or collaboration. Runtime relies on pinned CDN in baseline and browser behavior/exports remain unverified. Core tests do not cover DOM/rendering. Silent version coercion, unsafe numeric ID allocation, inconsistent transform bounds and mobile controls need the staged repairs in 06. No release, hosting or AI claims are justified today.

First Codex PR: PR01, project version and ID integrity with focused regression fixtures. Then bundle dependencies and establish actual browser/GLB evidence before architecture migration.
