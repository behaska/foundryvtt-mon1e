# Implementation plan — Record character sheet page 1 as a source and field inventory
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/11 (parent: #10, blocked by: none)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `docs/RULES.md`, `docs/DECISIONS.md`

Target path once plan mode ends: `documentation/plans/issue-11-record-character-sheet-page-1-as-source-and-field-inventory.md` (convention `issue-{number}-{slug}.md`, flat, English). Plan mode allows only this file; copy it there on approval.

## 1. Objective
Add `Character Sheet ALPHA Page 1.pdf` to `docs/RULES.md` under Sources, marked as layout and labels only (not rules). Write its full field inventory. List every unknown (box counts, value ranges, derived values, Talents shape) without guessing. Feeds #10 (sheet milestone) and the later data-model issue.

## 2. Scope
### Included
- Source entry: title, version/date if shown, location, status "layout and labels, not rules".
- Field inventory of page 1: every label, grouped as it appears on the sheet, with its apparent kind (text, number, checkbox track, free text, list), as seen only.
- Unknowns list for: Health / Composure / scars box counts, value ranges, derived values, Talents shape, plus anything else the inventory exposes.
- Record the creator's confirmation (who, when, how).

### Out of scope
- Any code, data model, Actor/Item type choice, template, sheet, test, `system.json` change.
- Inventing bounds, derived values, rolls or box counts.
- Pages 2-4 of the sheet (own issues).
- Ticking issue boxes (maintainer does).
- Editing generated files (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`).

## 3. Existing state
- `docs/RULES.md`: Sources "None yet", Confirmed "None", 3 unknowns (types, fields, first mechanic). Same file edited by #6; merge carefully if #6 landed first.
- `docs/DECISIONS.md`: dated table of decisions.
- PDF **not in repo** (searched: no `*sheet*`, no tracked `.pdf`). Location unknown.

## 4. Architecture decisions
- Docs only. Inventory is descriptive: labels as printed, no semantic interpretation.
- Keep the layout/labels vs rules distinction explicit in the source entry and in the section heading, so code never treats the inventory as confirmed rules.
- Keep the inventory in `RULES.md` (single place per project guidance); do not add a new doc file unless `RULES.md` becomes unwieldy.
- Do not copy the PDF into the repo unless the maintainer asks; cite its location instead (licensing unknown).
- Original labels stay verbatim (language of the sheet); descriptions around them in English.
- Unknowns are phrased as questions for the creator; nothing moves to "Confirmed rules" (inventory is not a rule).

## 5. Work plan
1. Ask the maintainer for the PDF path or link and the creator contact. Stop if unavailable.
2. Read the PDF page 1 (Read tool, `pages: "1"`).
3. Add entry under `RULES.md` > Sources: file name, location, status "layout and labels only, not rules".
4. Add a "Character sheet page 1 — field inventory" section: groups and fields in sheet order, with kind as visible (box track, text line, etc.). Record only what is printed.
5. Add unknowns: box counts (Health, Composure, scars), value ranges, derived values, shape of Talents, plus new ones from step 4. Mark each "unknown, not guessed".
6. Maintainer submits inventory + unknowns to the creator; record confirmation (who, when, how) in `RULES.md`; add a `DECISIONS.md` row.
7. Check links resolve and the file stays scannable.
8. Wrap-up: evidence per acceptance criterion; maintainer ticks. Commit docs-only.

## 6. Likely modified files
- `docs/RULES.md` (main).
- `docs/DECISIONS.md` (one row).

## 7. Expected tests
- None automated, no code.
- Validation: every inventoried label matches the PDF; no number or range appears that is not printed on the sheet; creator confirmation recorded; links resolve.
- `npm run check` once as regression guard (no code touched).

## 8. Risks and mitigations
- PDF unavailable → block and ask; do not reconstruct from memory.
- Printed box counts read as rules → they are layout; list counts as unknowns unless the creator confirms.
- Merge conflict with #6 in `RULES.md` → rebase, keep both Sources entries.
- Creator unavailable → keep status "Unconfirmed"; acceptance criterion 3 stays open.
- Illegible or ambiguous label → record as unknown, do not interpret.

## 9. Stop criteria
- PDF not accessible.
- Any step needs deciding a value, range or derived rule.
- Work drifts into models, sheets or code: out of scope, escalate.
