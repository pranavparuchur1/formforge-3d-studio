# FormForge: research notes and product strategy

Research date: 2026-10-27. Official project websites and documentation were reviewed. This is a practical implementation proposal, not a formally validated market survey.

## Opportunity and competitive map

- **Spline** (https://spline.design and https://docs.spline.design/basics/what-is-spline) already offers interactive 3D design, browser editing, collaboration, AI agents, modeling, and export. Spline's October 19, 2026 changelog also documents remote MCP connectivity. Competing head-on on features would be unrealistic for an MVP. FormForge needs a more focused niche.
- **Vectary** (https://www.vectary.com/studio-3d/index.html) positions itself around online 3D design, interactive product presentations, no-code configurators, and embedded experiences.
- **Tinkercad** (https://www.tinkercad.com/) is a highly approachable, educational browser 3D design tool. FormForge should be comparably approachable but orient around product scene composition and inspectable AI plans.

## Proposed differentiation

**FormForge = explainable, AI-assisted parametric 3D creation for people who are learning 3D modeling.** Instead of competing to replace Blender or Spline, target students, junior designers, developers, and product teams who want an editable scene created in under a minute and want to understand the resulting geometry.

Unique experience for Phase 2:

1. User writes: `Make a purple minimal desk lamp with a wide round base`.
2. AI planner returns strictly validated typed scene operations (add cone, add cylinder, set material, etc.).
3. The user sees a readable build plan and its individual steps: geometry added, dimensions, coordinate transformations.
4. Editor applies operations one at a time; every operation is undoable, diffable and explainable.
5. Export to a portable GLB or editable FormForge project.

**Do not present this as a new generative 3D mesh model.** This is a structured scene composition system; text-to-full-mesh diffusion/3D reconstruction is a separate, much more complex research area.

## Technology evaluation

| Concern | Recommended approach | Rationale |
|---|---|---|
| Web 3D | Three.js | Official maintained WebGL 3D ecosystem, editor controls and exports |
| Editor app | React 19 + TypeScript + Vite + React Three Fiber v9 | Component composition and compatible renderer pairing |
| Gizmos | Three TransformControls / Drei | Move/rotate/scale attached mesh transforms |
| Navigation | OrbitControls | Orbit, pan and zoom |
| Export | Three GLTFExporter and STLExporter | GLB visual model, STL geometry for mesh workflows |
| Client state | Zustand + command reducer + history | Explicit undoable changes, predictable selection |
| API | FastAPI + Pydantic | Strict scene plan validation, auth and project APIs |
| Database | PostgreSQL | Scene versions, users, operations and project metadata |
| Blob storage | S3-compatible | Exported GLBs, previews and uploaded asset blobs |
| AI scenes | LLM → Pydantic scene plan → validator → deterministic compiler | Avoids unsafe direct code execution and keeps actions inspectable |
| Delivery | CI + preview deploy + browser tests | Catch broken 3D code before release |

Official sources:
- Three.js TransformControls: https://threejs.org/docs/pages/TransformControls
- Three.js OrbitControls: https://threejs.org/docs/pages/OrbitControls
- Three.js GLTFExporter: https://threejs.org/docs/pages/GLTFExporter
- Three.js STLExporter: https://threejs.org/docs/pages/STLExporter
- React Three Fiber version pairing: https://r3f.docs.pmnd.rs/
- Vite Node requirements: https://vite.dev/guide/
- Spline current feature set: https://docs.spline.design/basics/what-is-spline
- Spline changelog: https://spline.design/changelog

## Initial MVP scope

Prioritize editable primitive modeling, five reusable templates, layered selection, precise property inspector, serialized scenes, undo/redo, GLB export and a polished experience. Keep entirely local-first and zero-account until basic editing proves valuable.

## Risks, mitigations and non-goals

| Risk | Mitigation |
|---|---|
| 3D performance and GPU variance | Cap objects, test lower-end hardware, reduce shadows/DPR on constrained devices |
| 3D exporter differences | Validate GLB round-trip and vertex/material counts with fixtures |
| Non-manifold STL surfaces | Explicit warning; validate union/watertightness before promising 3D printing |
| LLM hallucinations or unsafe code | Typed, schema-limited commands; scene operation compiler with no arbitrary script execution |
| Cloud costs and abuse | Rate limiting, quotas, telemetry without content logging, max shapes and per-scene bounds |
| Competing with Spline too broadly | Focus on explainable scene construction and teaching instead of comprehensive sculpting |
| Browser file or privacy concerns | Validate import, escape visible text, do not upload by default; sanitize HTML asset previews |

Do not promise: advanced organic sculpting, metrology-grade CAD, CAD constraints/booleans, photorealistic offline rendering, or ready-to-print STL at MVP.
