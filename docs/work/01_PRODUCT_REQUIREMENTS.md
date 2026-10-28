# FormForge product requirements

Decision date: 2026-10-27 (America/New_York). Status: research specification for Codex, not implemented release functionality. These seven work specifications supersede conflicting roadmap suggestions in the starter documents. Read 04 for evidence and 05 for release tests.

## Product decision

Build a local-first, account-free primitive scene editor for beginners creating small product studies and learning how a scene is assembled. The first release is **FormForge Studio with local Quick Build**. The next release may add **AI-assisted parametric scene planning** after a real provider and its evaluation pass. Neither phrase means generative mesh synthesis.

Explainable scene construction is a positioning hypothesis, not a novelty claim: Spline already offers editable AI scene operations and undo. FormForge's narrower promise is a small, inspectable scene model, portable project files, no required account, and useful editing without a network AI service. See official competitor evidence in [02](02_VERIFIED_TECH_RESEARCH.md).

## People and jobs

| Persona | Job and situation | Success signal |
|---|---|---|
| Primary: student or beginner designer | Assemble a lamp or product display, understand its parts, change dimensions without learning a full DCC tool | Completes a template-to-GLB journey with editable parts |
| Secondary: frontend developer | Make a lightweight illustrative object for a website and take a portable visual model elsewhere | GLB opens in an independent viewer with correct transforms/materials |
| Secondary: product teammate | Explore color and composition rapidly and send a screenshot or project file | Changes and exports without creating an account |

Professional CAD engineers, manufacturing users, children requiring school administration, and teams requiring shared cloud files are not initial supported personas. Do not claim regulatory, engineering, or educational certification.

## Priorities and acceptance contract

P0 blocks release; P1 is desirable after P0 and may ship separately; P2 belongs to later releases. Requirement identifiers are used in 05 and 06.

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| R01 | P0 | Actual WebGL2 scene and honest loading/failure UI | Fresh storage produces four podium objects; real canvas render is tested; module/WebGL failure exposes recovery and JSON rescue without a fake live-render claim |
| R02 | P0 | Five primitives and five existing templates | Box, sphere, cylinder, cone, torus; podium/lamp/chair/rocket/table add 4/4/6/6/5 parts respectively; every part selectable and editable |
| R03 | P0 | Numeric and gizmo transforms, materials and object actions | Position, rotation, scale, color, metallic, roughness, rename, hide/show, clone, delete obey one validation contract; inspector and canvas agree after commit |
| R04 | P0 | Reversible edits | Every committed user action adds one history entry; one gizmo gesture and one preset each count once; undo/redo restore identical semantic scene, including IDs; retain at least 65 committed undo states within the scene cap |
| R05 | P0 | Safe local save and project portability | Autosave status reflects actual successful write; JSON export/import preserves all supported properties and unique IDs; invalid/future formats cannot replace existing project; 2,000,000-byte JSON maximum |
| R06 | P0 | GLB, STL and PNG export | GLB material/transform roundtrip passes 05; only visible project geometry included; STL states geometry-only/arbitrary units/no printability guarantee; PNG captures current view and decodes successfully |
| R07 | P0 | Truthful local Quick Build | Supported shape/template and color commands work; unsupported text offers examples without partial edits; UI says rule-based local presets; no AI or text-to-mesh claims |
| R08 | P0 | Accessible editing and responsive controls | Keyboard path via layers/inspector reaches all editing/save/export actions; no disappearing inspector on narrow screens; WCAG 2.2 AA-oriented checks in 03/05 pass |
| R09 | P0 | Reproducible, local-dependency production build | Lockfile, CI, static build, no core runtime CDN imports; production output contains no credentials or raw scene telemetry |
| R10 | P0 | Bounded resources and reliable errors | 200-object hard cap, atomic rejected actions, resource cleanup, storage/WebGL/export recovery and performance thresholds in 04/05 |
| R11 | P1 | True primitive geometry parameters | Version-2 model and migration; bounded per-primitive dimensions and segments separate from transform scale; old fixtures retain geometry within tolerance |
| R12 | P1 | Better construction aids | Grid snapping and unit display; grouping/multi-select only as separately approved later work, with world-transform and history tests |
| R13 | P2, next release | AI scene-plan proposal/preview/approve | Strict typed operations, consent before sending scene context, explicit approval, base revision checks, atomic application and one-step undo; tested real provider |
| R14 | P2, later | Imported GLB assets | Separate threat model/schema/storage design and asset bounds; JSON project import is the only MVP import |
| R15 | P2, later | Accounts, collaboration and hosted projects | Demand and ownership/access model first; no PostgreSQL or object storage required for local MVP |

## Shared modeling semantics

Right-handed coordinates, Y-up; one unit displayed as one meter for GLB consistency. Baseline box side, sphere diameter, cylinder diameter/height and cone diameter/height are 1; baseline torus major radius 0.48 and tube radius 0.14. Rotations are Euler XYZ radians internally and degrees in the inspector. This is visual modeling, not metrology.

For version 1, positions are finite numbers in [-100,100] meters, rotations in [-2π,2π], and scales in [0.05,40]. On user input, reject out-of-range values with an inline explanation; do not silently change them on undo/reload. Normalize equivalent gizmo rotation angles before commit. Colors are six-digit hex; metallic and roughness in [0,1]. 200 objects is a hard cap, including hidden objects. Reject unsupported geometry and all-hidden GLB/STL exports with an actionable message. JSON can contain an empty scene.

Retain existing valid version-1 projects. Missing-version legacy data gets an explicit import migration preview; malformed or unknown version data is rejected. When repairing old data, show the changes and obtain confirmation before replacement. Retain a last-good recovery copy. No third-party asset references/scripts in MVP project files. Object names are plain text, 70 characters; project names 100 characters; stable safe IDs have length 1–64 and never depend on unsafe integer arithmetic.

## Persistence and privacy

A single active local project is enough for MVP. New/Open replaces it only through an undoable transaction and a save/export warning when unsaved. Autosave within 500 ms of a successful commit; explicitly expose Saving, Saved on this browser, and Save failed. Flush on pagehide where possible, but always offer JSON download; no browser lifecycle guarantee replaces a backup. Storage is origin-specific and can be erased. No cloud backup claim. Local editing does not upload scene content; external fonts/CDN imports must be removed or locally bundled. First load still needs a network connection unless an offline shell is added later. No service-worker/offline-install promise.

## AI meaning and scope boundary

A plan selects supported primitives, dimensions, transforms and materials and proposes allowed edits. It does not produce arbitrary code, assets, shaders, textures or a fabrication guarantee. V1 AI operates on flat primitive scenes; hierarchy, cloud apply endpoints and asset uploads are deferred. Plan review shows changes/removals and estimated resource impact; full plan applies in one atomic history transaction. Partial step-by-step animation may explain a preview but cannot create hidden partial commits. See 04 for protocol.

## Launch success and learning

Run a moderated five-person beginner pilot after release gates. Target at least four participants completing: add lamp, edit one part and material, undo/redo, export/reopen JSON and export GLB within five minutes without help. Record task time and blockers only with consent; this target has not been measured. Validate that three participants can explain which primitive makes the lamp base. Failure changes onboarding or positioning before adding AI complexity. No analytics SDK is necessary for MVP.

## Explicit exclusions

No sculpting, mesh diffusion/reconstruction, boolean unions, constraints/engineering CAD, animation authoring, collaboration, accounts, hosted projects, arbitrary scripts, plugin marketplace, GLB import or custom shader support in MVP. No guaranteed watertight STL, photorealistic render, full Blender parity, published URL or AI feature claims before corresponding evidence exists. Source changes, repository creation and deployment are Codex follow-on work requiring the correct repository authorization; this assignment produces specifications only.
