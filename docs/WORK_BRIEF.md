# Copy into ChatGPT Work (research/delegation brief)

Act as a senior 3D web engineering research lead and product manager. The attached FormForge Studio archive is the working baseline. This is a browser-based 3D modeling editor with a rule-based quick-build parser, pure scene logic, and a Three.js viewport. Review all files, run the tests, and do **not** assume the interactive renderer works until it is verified in a real browser.

**Goal:** turn this into a polished, accessible, reliable AI-assisted parametric 3D modeling website, with GitHub-based Codex implementation and a public hosted demo.

Deliverables:
1. Research and compare Spline, Vectary, Tinkercad on target audiences, differentiation and current feature depth using official sources. Do not claim novelty just because we plan AI scene editing; Spline already offers it.
2. Verify Three.js, R3F v9/React 19 pairing, Vite, Three exporters, browser WebGL support, accessible editor patterns, GLB import/export reliability. Check current package versions and security advisories before pinning a production lockfile.
3. Produce prioritized PRD and scope split: MVP hardening, next-release AI scene planning, later collaboration. Include measurable acceptance criteria, real risks and out-of-scope items.
4. Write five user journeys, specific wireframe commentary, responsive layout, keyboard accessibility and empty states.
5. Prepare a code-quality and security assessment of the starter repo, prioritized bugs, an issue backlog, and a 4-sprint implementation plan. Ensure browser render/exports have Playwright tests.
6. Prepare Codex tasks as small PRs, not an all-at-once rewrite. Open a GitHub repo or work with an explicitly specified repository when available; preserve the original ZIP as backup.
7. If a deploy target and credentials are connected, use approved deploy workflows and inspect the live website. Never claim it is deployed without the real URL and verified interaction.

Constraints: no arbitrary execution of LLM-generated code; no embedded API keys; no misleading AI claims; local-first editing preserved. Start with deterministic reliability over complexity. Output a final handoff with issues, links to PRs, test results and what remains unverified.
