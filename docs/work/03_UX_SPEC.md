# FormForge UX specification

Decision date: 2026-10-27. Proposed interactions, not browser-verified behavior. Requirement IDs refer to 01; test IDs refer to 05. Preserve dark indigo surfaces, lavender accents and the recognizable central studio, while increasing legibility and control access.

## Layout wireframes in text

### Desktop: 1440 × 900 reference; >=1100 CSS pixels wide

Header (64 px): brand; editable project name; visible local-save state; New, Open project and Export. Export is always reachable. Workspace below: Create/Layers sidebar (240 px), flexible viewport (minimum 360 px), Inspector (280 px). Each sidebar scrolls independently. Viewport header holds camera/view actions; viewport contains transform toolbar, orientation cue and actual renderer state. Below viewport, a compact Quick Build field and supported examples. Footer shows selection and units. No placeholder can remain marked LIVE when initialization fails.

Create sidebar has Add shape and Templates tabs followed by an Objects list. For MVP use a semantic list of buttons, not a partially implemented ARIA tree. Row shows name/type, selected state and a named visibility toggle. Inspector sections: object identity; position XYZ in meters; rotation XYZ in degrees; scale XYZ; color; metallic/roughness; duplicate/delete. Geometry parameters are a later section only when R11 ships. New/Open are separate from shape add.

### Compact desktop/tablet: 768–1099 CSS pixels

Header keeps project name, save state and Export; secondary file actions use a labeled File disclosure. Viewport occupies full available workspace. A persistent rail opens Create, Objects or Inspector as a single side drawer; drawers never simply disappear. On >=900 px, a pinned drawer may occupy 280 px if viewport retains 360 px. Bottom Quick Build may collapse to a labeled button opening a panel. Undo/Redo stay visible above the viewport or in a persistent action bar. This replaces the current CSS rule that hides the right panel below 900 px.

### Mobile: 320–767 CSS pixels; test 390 × 844 and 320 × 568

Header row: project name and File/Export. Second row: save state and undo/redo. Viewport uses remaining dynamic viewport height; bottom navigation has Create, Objects, Inspector and Build buttons with text labels. Tapping a tab opens one bottom sheet, max 60% of available height, with an explicit Close control; selection stays intact. Numeric inspector is available in the sheet. File menu never sits behind a sheet. Use `100dvh` with fallback, safe-area insets and scrollable sheets; the software keyboard must not hide the focused field or primary action. Mobile export may use browser download UI with clear instructions; no File System Access API dependency.

MVP touch viewing supports orbit/pinch/pan where available; numeric controls are the reliable transform path on small screens. If a particular mobile browser cannot support tested WebGL2/export flows, show that limitation and preserve JSON rescue; do not silently declare full support. No horizontal document overflow at 320 px or at 200% zoom. Reflow surrounding controls at 400%; the spatial canvas may remain a bounded 2D surface with accessible alternatives.

## Navigation and control contract

Tab order: skip-to-editor/objects link, project/file actions, Create controls, object list, viewport actions, Quick Build, Inspector, history. For mobile, hidden sheets have no tabbable descendants. Opening a sheet moves focus to its heading/first control; Escape/Close restores focus to the opener. Drawers that block the rest of UI are dialogs with focus containment and inert background; nonmodal pinned panels do not trap focus.

Prefer native buttons, inputs and a disclosure containing export buttons. A disclosure avoids pretending to implement an ARIA menu. If a menu pattern is chosen, implement its complete keyboard semantics. Export close/outside click/Escape updates `aria-expanded` and returns focus appropriately. Transform mode and grid/visibility toggles expose pressed state; selection exposes its name/state without relying on color. Every slider has a real label and numerical value, editable by keyboard; color has a text hex alternative plus accessible named swatches.

Viewport has a descriptive region label, instructions and a text scene summary (object count, selected name/type/position). Provide named buttons for orbit left/right/up/down, zoom in/out, pan directions, reset and frame selection; these make camera adjustment possible without dragging. Layers and numeric inspector provide equivalent selection and editing without ray picking. Dragging is never the only way to move an object. The visual canvas cannot be treated as a complete screen-reader representation.

Shortcuts when focus is outside editing fields: 1/2/3 select transform mode; F frames selection/all; Shift+D duplicates; Delete/Backspace deletes selected; slash opens/focuses Quick Build. Ctrl/Cmd+Z and redo affect scene history only outside inputs/contenteditable; while typing they retain native text undo. Provide buttons for every shortcut. On delete, focus goes to the nearest remaining layer or Add shape; announce deleted name and undo option. Escape first closes the topmost menu/sheet, then clears selection only when no overlay is open. Ignore repeated destructive key events and call preventDefault where browser navigation could occur.

## Five user journeys

| Journey | Sequence | Observable success / recovery |
|---|---|---|
| J1 First creation | Open fresh app → actual four-part podium → choose Lamp → select foot in Objects → set position X=1.2 and purple material → undo/redo | Added four editable lamp parts; name/type announced; numeric/canvas state agree; rejected values leave previous commit intact |
| J2 Precise mouse editing | Select hero sphere → Move gizmo → drag X → release → Rotate → inspector edit | Orbit does not move during gizmo drag; one history entry per gesture; empty-space click clears selection; pointer cancel restores or explicitly commits documented state, never leaves a stuck drag |
| J3 Save and resume | Rename scene → see Saving then Saved on this browser → reload → Export JSON → New → Open JSON | Semantic scene and IDs preserved; warning explains replacing active local project; history can undo successful replacement; storage failure yields Export project action |
| J4 Deliver a visual asset | Hide a part → Export GLB → open in independent viewer → Export STL or PNG | Hidden part omitted in mesh exports; camera/grid/gizmo/ground omitted from GLB/STL; STL warning appears before download; PNG includes current visual viewport intentionally |
| J5 Keyboard/mobile use and future plan | Open Objects → select lamp shade → Inspector sheet → numeric transform → Build local example; future: opt into AI → review diff → approve | No drag required; file controls always available; local commands have explicit supported scope. Future AI cancel leaves scene unchanged; stale plan explains regeneration |

## Editing details

Commit numbers on Enter or blur; Escape cancels an uncommitted draft. Keep incomplete text such as '-' while editing; do not convert blank input to zero on blur. Show field-specific finite/range validation, linked with `aria-describedby`; move focus only if submission needs correction. Use 0.1 display increments but preserve model precision; display more decimals on focus if needed. Do not rebuild the entire inspector DOM while its field is focused. Sliders preview continuously but make one undo transaction on release/keyboard interaction completion. Restore focus after commits and selections.

Clone uses an offset within bounds; if no valid offset is available, keep original position with an explicit announcement rather than violate the model bounds. Templates and Quick Build apply atomically. At 200 objects, disable add/clone actions with an explanation and keep delete/export available. Unsupported Quick Build: “Try a shape or template: blue sphere, red chair, lamp.” Preserve the typed prompt after an error. Rename “Generate” to “Build from presets” in MVP to reduce ambiguity.

New/Open warns when unsaved changes could be lost and offers Export project, Continue, Cancel. Import parses/validates before asking to replace anything; repairs show a field/object summary. Bad input never clears the working scene. Future-version files show supported version and keep the file intact. On corrupt autosave, offer recovery/JSON rescue of raw saved data, then start a demo only through an explicit choice. Saved locally means this browser/origin, not a backup or cross-device sync.

## States and errors

| State | Required UI and action |
|---|---|
| Boot loading | “Starting 3D…”; placeholder marked illustration; no LIVE/WEBGL success until first actual frame and model sync |
| Module load failure | “Editor resources could not load”; Retry, supported-browser guidance, rescue JSON from stored data via independent bootstrap path |
| WebGL unavailable/context lost | Keep scene model and file actions; disable GPU exports; Retry renderer or reload after backup; announce issue once; no false claim of restored rendering |
| Empty project / no selection | Add shape/template CTA; inspector explains select an object; JSON remains exportable |
| All objects hidden | Text says no visible objects; enable Objects; GLB/STL disabled with reason; do not download empty model |
| Saving / quota denied | Visible pending state; failure persists until resolved, with Export project; never report Saved just because debounce elapsed |
| Exporting / export failure | Disable duplicate export requests; progress text; retry and JSON alternative; failure keeps scene and disposes temporary resources |
| Future AI unavailable / rate limited | Local editor fully usable; retry-after or disabled-state explanation; no fake locally generated response labeled AI |
| AI preview / stale revision | Removed/changed objects and resource counts readable; Approve and Cancel; stale base blocks Apply and offers regenerate |

## Accessibility and presentation gates

Target WCAG 2.2 AA; see [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) (Recommendation update 2024-12-12; accessed 2026-10-27). Text contrast >=4.5:1 (large text >=3:1), essential control/selected/focus boundaries >=3:1. Minimum pointer target 24×24 CSS px or compliant spacing; aim 44×44 for mobile actions. Selection and errors use text/icon plus color. Respect prefers-reduced-motion; no mandatory camera animation. Avoid flashing and unbounded decorative movement. Use 14 px base controls/body and no tiny all-caps instructions as the only guidance.

Polite live region announces completed actions/save failure/selection once; urgent blocking failures use an alert without repeated frame-loop announcements. Do not announce each drag frame. Manual screen-reader check with NVDA/Chrome and VoiceOver/Safari, keyboard-only task run and zoom/reflow review are required. Automated accessibility scans alone cannot certify the canvas workflow. Current baseline has not passed these checks.
