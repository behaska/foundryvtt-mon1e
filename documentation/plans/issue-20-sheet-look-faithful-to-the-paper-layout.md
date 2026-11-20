# Implementation plan — Sheet look faithful to the paper layout
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/20 (parent: #10, blocked by #13 to #19, all done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `styles/mon1e.css`, `templates/character-page1.hbs` (markup/classes only), `templates/character-header.hbs`, `src/sheets/character-sheet.mjs` (window size only), `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`

Target path once plan mode ends: `documentation/plans/issue-20-sheet-look-faithful-to-the-paper-layout.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Restyle and re-lay-out page 1 so it visually matches page 1 of the paper sheet: Burden/Charge cross diagram with hexagons, section headings, fonts, sensible window size. Presentation only: same fields, same names, same behavior.

## 2. Scope
### Included
- Reorder/wrap existing page-1 sections in `character-page1.hbs` to follow the printed arrangement (identity header, class table, centre diagram, attributes/aptitudes, skills in 3 columns, brawls/encounters, health/composure, scars/disorders, talents in 2 columns).
- Cross diagram: CSS grid with Burden left, Charge right, Willpower/Discord/Group Focus in the centre; hexagons by `clip-path: polygon(...)` on a wrapper around the existing number inputs.
- Section headings, fonts (font-family stack only), spacing, colours via CSS custom properties scoped to `.mon1e.character-sheet`.
- Window size in `DEFAULT_OPTIONS.position` (larger default, still resizable).
- Logo decision: **no logo**. Confirmation of usage rights is not obtainable in code; nothing is bundled. Criterion met by absence; report "logo not added, rights unconfirmed".
- Record the in-Foundry check in `docs/DEVELOPMENT.md`; one `docs/DECISIONS.md` row (presentation choices: no logo, no bundled font).

### Out of scope
- Any data, schema, i18n key, action or rule change (criterion: no data or behavior change).
- Burden and Charge edge box tracks (not stored, see DECISIONS #17; drawing them would need a model change). Leave undrawn, flag as visible gap vs paper.
- Pages 2-4, a second tab, print stylesheet, dark/light theme variants beyond using Foundry CSS variables with fallbacks.
- Bundling fonts or images; build step, preprocessors, `.ts` files.

## 3. Existing state
- `styles/mon1e.css` is 53 lines of structural CSS only (grids, flex, scroll pinning). No theme, no fonts.
- `character-page1.hbs`: all sections already present as `<fieldset>` blocks in data-slice order (#12 to #19). Diagram is one `.diagram` fieldset with `diagram-numbers` (5 number fields in a row), `diagram-flags` (8 checkboxes), focus statement, group archetype.
- Sheet: `position: { width: 720, height: 640 }`, `TABS`/`PARTS` unchanged. All actions (`adjustTrack`, `addDisorder`, `addTalent`, `removeTalent`) bind via `data-action`/`name`, independent of markup structure.
- `RULES.md` page-1 inventory records labels and kinds as printed (hexagons: Willpower, Burden, Charge, Discord, Group Focus; Might single box). The PDF is the maintainer's local copy, not in repo.

## 4. Architecture decisions
- CSS-first. Template edits limited to wrappers and class names; never change `name=`, `data-action`, `data-*`, or the context shape. No new context keys, so `_prepareContext` is untouched.
- Hexagon via `clip-path` (no images, no SVG assets). Because `clip-path` clips outlines, put the focus ring on the visible wrapper through `:focus-within`.
- Fonts: system/web-safe stack plus Foundry's own variables; no external font files (licence and offline use). Revisit only if the maintainer supplies a licensed font.
- Colours/borders through `--mon1e-*` custom properties on `.mon1e.character-sheet`, defaulting to Foundry v14 theme variables (`var(--color-text-primary, ...)`) so light/dark themes stay legible.
- Keep the pinned header/tabs + scrolling page layout from the current CSS (`window-content` flex column).
- Open input needed: exact paper geometry. Needs the PDF page (or a screenshot) as reference at implementation time; implementer reads it via the Read tool (PDF pages) if the maintainer provides a path.

## 5. Work plan
1. Gate: #13 to #19 code present (page1 template has attributes, aptitudes, skills, brawls, encounters, health, composure, diagram, scars, disorders, talents). Else stop.
2. Get the reference: maintainer's PDF page 1 path or screenshot. Stop and ask if unavailable (cannot match "visually" blind).
3. Baseline: run `npm run check`; in Foundry open the current sheet, take a "before" screenshot.
4. Template: group sections into layout wrappers (e.g. `.page-top`, `.page-columns`, `.diagram-cross`), wrap diagram numbers in `.hex` elements. Name attributes untouched.
5. CSS: page grid, section heading style for `legend`, cross diagram grid + hexagons, 3-column skills, 2-column talents, field/input styling, sensible `min-width`.
6. Sheet: raise default width/height; keep `resizable`.
7. `npm run check` (nothing should change in test count).
8. In-Foundry check (section 7); screenshot "after"; compare with paper; iterate on CSS only.
9. Docs: `docs/DEVELOPMENT.md` verification record (what was compared, Foundry build if known, known gaps: edge box tracks absent, no logo); `docs/DECISIONS.md` row.
10. Wrap-up with evidence per criterion; flag logo rights and edge boxes as open. Commits: code (+docs), then plan, separately.

## 6. Likely modified files
- Modified: `styles/mon1e.css`, `templates/character-page1.hbs`, possibly `templates/character-header.hbs`, `src/sheets/character-sheet.mjs` (position only), `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`.
- No new source, test, lang or model files expected.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `npm run typecheck`, `npm test`, `npm run check` exit 0, same test count as before (no behavior change). `checkJs`/`node:test` do not cover CSS or templates; state that honestly.
- In-Foundry (only coverage for this issue), world `mon1e-test`, Foundry build noted:
  1. Sheet opens at the new default size; header and tabs stay pinned, page scrolls; console clean.
  2. Side-by-side with paper page 1: section order, cross diagram with hexagons, skills 3 columns, talents 2 columns, headings.
  3. Regression: edit one value in every section, toggle track (+)/(-), add disorder line, add/remove talent; persists after close/reopen and F5.
  4. Keyboard focus visible on hexagon inputs; labels localized; no raw `MON1E.*` keys.
  5. Resize narrow: no overlapping or unreachable fields; light and dark theme legible.
  Record in `docs/DEVELOPMENT.md`.

## 8. Risks and mitigations
- No reference at hand (PDF not in repo) → block step 2 until supplied; do not guess the layout.
- Markup change breaks form binding or actions → keep names/`data-*` untouched; step 8.3 regression pass.
- `clip-path` hides focus outline/overflow → `:focus-within` on wrapper, test keyboard.
- Fixed widths break Foundry themes/small windows → use grid `minmax`, `fr`, container-friendly units; test resize.
- "Matches the paper" is subjective, no automated check → record side-by-side evidence and remaining gaps explicitly.
- Logo temptation → none added; criterion stays "unconfirmed".

## 9. Stop criteria
- #13 to #19 code missing from the template.
- No paper-sheet reference available to the implementer.
- A change needs a model, i18n key, action or rule change (outside this issue): stop, report.
- Needs a build step, preprocessor, bundled font or image asset: escalate.
