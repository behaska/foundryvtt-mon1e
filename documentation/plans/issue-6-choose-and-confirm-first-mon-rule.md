# Implementation plan — Choose and confirm the first Mon rule to implement
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/6 (parent: #2, blocked by #5)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `docs/RULES.md`, `docs/DECISIONS.md`

Framing source: `documentation/cadrage/bootstrap/bootstraping-initial-project.md` (French), P3 (inventory rule documents, identify data for first feature) and P5 (mechanic choice belongs to the Mon creator).

Target path once plan mode ends: `documentation/plans/issue-6-choose-and-confirm-first-mon-rule.md` (convention `issue-{number}-{slug}.md`, flat, English). Plan mode allows only this file; copy it there on approval.

## 1. Objective
Record in `docs/RULES.md` one rule, chosen and confirmed by the Mon creator, with expected behavior, edge cases and the data it needs. Unblocks data models (P3) and sheets (P4).

## 2. Scope
### Included
- Inventory available Mon rule documents; list them under "Sources" in `RULES.md`.
- Shortlist candidate first rules from those documents, as questions for the creator.
- Write the chosen rule: behavior, edge cases, required data (Actor/Item types, fields).
- Capture the creator's confirmation (who, when, how) in `RULES.md` and `DECISIONS.md`.

### Out of scope
- Inventing, completing or reinterpreting any Mon rule.
- Data models, `src/rules`, sheets, templates, code, tests, `system.json` changes.
- Ticking issue boxes (maintainer does).
- Editing generated files (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`).

## 3. Existing state
- `docs/RULES.md`: Sources "None yet", Confirmed "None", 3 unknowns (Actor/Item types, fields, first mechanic).
- `docs/DECISIONS.md`: dated table, 7 entries; none about rules.
- No rule document in repo. Only `documentation/cadrage/bootstrap/` (French brief, no rules).
- #5 (blocker) docs done, per recent commits.

## 4. Architecture decisions
- Docs-only. Decision issue: the creator chooses the rule, not Claude.
- Structure each confirmed rule in `RULES.md` as: rule statement, source reference, expected behavior, edge cases, required data, confirmation. Matches brief "Règle confirmée, comportement attendu, cas limites".
- Unconfirmed items stay under "Unknowns". Draft status is explicit until the creator confirms.
- Actor/Item types are only *proposed as needs* here; they are fixed in the P3 issue after confirmation.
- Prefer a rule that is pure and testable (fits future `src/rules`, no Foundry dependency) — offered as selection criterion to the creator, not imposed.

## 5. Work plan
1. Ask the maintainer where Mon rule documents live (path, PDF, link) and who the creator contact is. Stop if none exist.
2. Read those documents; list them under `RULES.md` > Sources (title, version/date, location).
3. Draft 2-4 candidate first rules, each with: what it does, data it touches, why it is small enough for one vertical slice. Quote the source, no paraphrased guesses.
4. Maintainer submits candidates to the creator; creator picks one and answers open edge-case questions.
5. Write the chosen rule in `RULES.md` under "Confirmed rules" with behavior, edge cases, required data (fields, types, ranges, defaults as stated by source only).
6. Move resolved items out of "Unknowns"; keep the rest, add new unknowns found.
7. Add `DECISIONS.md` row: date, "First rule: <name>", reason, confirmed by whom.
8. Check docs stay short; check links resolve.
9. Wrap-up: report evidence for the three acceptance criteria; maintainer ticks them. Commit docs-only.

## 6. Likely modified files
- `docs/RULES.md` (main).
- `docs/DECISIONS.md` (one row).
- Possibly `README.md` only if its "no rule confirmed" statement becomes stale.

## 7. Expected tests
- None automated. No code.
- Validation: creator's explicit confirmation recorded; every statement in `RULES.md` traces to a cited source; all relative links resolve.
- `npm run check` should still exit 0 (no code touched), run only as regression guard in the implement step.

## 8. Risks and mitigations
- No rule documents available → block, ask maintainer; do not invent a rule.
- Creator unavailable → issue stays open; leave rule as "Proposed, unconfirmed" and never under "Confirmed".
- Rule too large for a slice → propose a narrower candidate; creator decides.
- Ambiguous source text → record as an unknown or edge-case question, not an assumption.
- Rule choice drives Actor/Item types prematurely → list data needs only, defer type choice to next issue.

## 9. Stop criteria
- No rule documents accessible.
- Any step requires choosing or altering a rule without creator confirmation.
- Source contradicts itself or the brief: stop and report the conflict.
- Work drifts into models, code or sheets: out of scope, escalate.
