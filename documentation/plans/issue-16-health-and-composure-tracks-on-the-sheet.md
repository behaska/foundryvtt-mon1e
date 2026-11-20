# Implementation plan — Health and Composure tracks on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/16 (parent: #10, blocked by #12 and #11, both done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/rules/tracks.mjs` (new), `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/tracks.test.mjs` (new), `docs/`

Target path once plan mode ends: `documentation/plans/issue-16-health-and-composure-tracks-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Add Health and Composure to the `character` Actor as gauges (filled-box count) plus three independent state flags each, editable on sheet page 1, persistent, labels via i18n. Raw values only.

## 2. Scope
### Included
- Per gauge: one integer `filled` (checked boxes, default 0) with (+)/(-) buttons.
- Health flags: Unconscious, Dying, Dead. Composure flags: Rattled, Discomfited, Humiliated. Independent booleans, default false (RULES.md A6, A7, A9).
- Pure helpers for gauge adjust and boxes-to-draw, model fields, sheet section, i18n, CSS, tests, docs record.

### Out of scope
- Any effect or trigger of the states, linking states to the gauge, clamping or maximum (RULES.md section B).
- Road/Drive/Group Scars, Burden/Charge edge tracks, other flags, hexagons, Talents.
- Migrations, new Item types, build step, framework, `.ts` files.
- Editing generated files; ticking issue boxes.

## 3. Existing state
- #13-#15 shipped: `integerField()`, `integerGroupField(keys)`, `statRowsField` in `src/models/character.mjs`; key lists in `src/rules/base-stats.mjs`; page 1 template has stat fieldsets bound with `name="system.x.y"` directly from `source.system`; `_prepareContext` in `src/sheets/character-sheet.mjs` builds label rows; form `submitOnChange`.
- No `actions` in `DEFAULT_OPTIONS` yet and no `BooleanField` use yet: (+)/(-) buttons and checkboxes are new patterns.
- `docs/RULES.md` A6 (maintainer answer, **unconfirmed by creator**): gauges are boxes checked in sequence, adjusted with (+)/(-), no fixed box count, (+) beyond drawn boxes adds a box; the six state labels are independent character-state checkboxes. A9: empty gauge 0, unchecked false. Box counts not readable from the PDF.

## 4. Architecture decisions
- Model (user-chosen, "filled count only"): `health: { filled, unconscious, dying, dead }`, `composure: { filled, rattled, discomfited, humiliated }`. `filled` uses `integerField()`; flags use `BooleanField({ required: true, initial: false })`. No total-box count stored: nothing is invented as a rule.
- Number of drawn boxes = `max(filled, DISPLAY_MIN_BOXES)` plus the (+) button. `DISPLAY_MIN_BOXES` is a presentation constant only, not a Mon rule; its value is a placeholder chosen at implementation, recorded in `RULES.md` and `DECISIONS.md` as unconfirmed and replaceable once the creator answers.
- Keys in `src/rules/tracks.mjs` (pure, no Foundry): `TRACK_KEYS`/state key lists per track, `adjustFilled(current, delta)` (floor 0 only because a negative box count is meaningless for drawing; stated as a UI guard, not a rule; confirm in RULES.md note), `boxesToDraw(filled, min)`.
- Sheet: add `actions: { adjustTrack }` to `DEFAULT_OPTIONS`; static handler reads `data-track` and `data-delta`, computes via `adjustFilled`, applies with `this.document.update({ "system.<track>.filled": next })`. Never mutate `actor.system`. Boxes rendered in `_prepareContext` (array of `{ checked }`); clicking a box is not required, (+)/(-) are the control per A6. Flags are plain checkboxes bound to `system.health.dying` etc. (submitOnChange).
- i18n: `MON1E.Character.health`, `MON1E.Character.composure`, `MON1E.Tracks.*` for the six states and button labels (a11y titles).
- Verify `BooleanField` and `actions` handler signatures against Foundry v14 docs before use.

## 5. Work plan
1. Gate: #12-#15 code present (`integerField`, `character-page1.hbs`, `_prepareContext`); RULES.md A6, A7, A9 present. Else stop.
2. Tests first, `tests/tracks.test.mjs`: state key lists exact and in printed order; `adjustFilled` +1/-1/floor at 0; `boxesToDraw` never below filled; every state key and group title has an i18n label.
3. Create `src/rules/tracks.mjs` (pure).
4. `CharacterData.defineSchema`: add `health`, `composure`; add `BooleanField` import; update class doc.
5. `lang/en.json`: titles, six state labels, button titles.
6. Sheet: `actions.adjustTrack`, `_prepareContext` boxes for both tracks.
7. `character-page1.hbs`: Health and Composure fieldsets: box row, (-)/(+) buttons, three checkboxes. Minimal CSS in `styles/mon1e.css`.
8. `npm run check`.
9. In-Foundry check (section 7); fix, re-check.
10. Docs: `docs/DEVELOPMENT.md` verification record; `docs/DECISIONS.md` row (gauge = filled count, flags, placeholder display minimum, unconfirmed); `docs/RULES.md` note of what is stored and the open creator confirmation of box counts (criterion 1 stays open).
11. Wrap-up with evidence per criterion; criterion 1 reported as not met (maintainer answer only). Commits: code (+docs), then plan, separately.

## 6. Likely modified files
- New: `src/rules/tracks.mjs`, `tests/tracks.test.mjs`.
- Modified: `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, `docs/RULES.md`.
- `tests/base-stats.test.mjs`/`identity.test.mjs`: only if hard-coded checks need it.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: key order, `adjustFilled`, `boxesToDraw`, i18n coverage.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model, sheet and buttons), world `mon1e-test`, Foundry build noted:
  1. Existing actor opens: gauges 0, flags unchecked, no migration, console clean.
  2. New actor: same.
  3. (+) fills boxes in sequence; (+) past the drawn minimum adds a box; (-) removes; never below 0.
  4. Toggle each of the six flags independently; close and reopen sheet; intact.
  5. Reload (F5), close and reopen world; intact.
  6. Labels localized, no raw `MON1E.*`; other sections unaffected.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Box counts unconfirmed by creator → filled-count-only model, no total stored; placeholder minimum flagged; cheap to change.
- First use of `actions` and `BooleanField` → verify in Foundry v14 docs and in-world.
- Existing actors lack the new data → schema initial fills; verify on existing actor.
- Unchecked checkbox not submitted on form → ApplicationV2 form handling submits booleans; confirm in-world, else template fix.
- Scope creep into scars/Burden/Charge tracks → they reuse the same helper in separate issues.

## 9. Stop criteria
- #12-#15 code or RULES.md A6/A7/A9 missing.
- Needs a maximum, clamp above 0, state trigger or any rule not in `RULES.md`.
- Booleans or nested fields do not persist and cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
