# Implementation plan — Foundry v14 qualification protocol
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/28 (parent: #21, blocked by: #26)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `docs/QUALIFICATION.md` (new), `docs/DEVELOPMENT.md`

Framing source: `documentation/cadrage/cicd/implementation-cicd.md`, Lot 5.

## 1. Objective
A versioned Markdown test protocol that qualifies a **candidate ZIP** in Foundry v14 before a human publishes the draft release (#27). It is run by hand, once on the candidate, and the result (with exact Foundry build) is recorded in the repo. No automation.

## 2. Scope
### Included
- `docs/QUALIFICATION.md`: protocol, with stable scenario IDs (`Q1`…), each with preconditions, steps, expected result, pass/fail. Scenarios from the issue:
  1. Install the candidate (see decision below), system listed, version matches `system.json`.
  2. Create a world on a clean data folder, launch it.
  3. Create a Character actor; open the sheet; every tab/section shown, labels localized, no raw `MON1E.*` key.
  4. Edit every field family (identity, attributes, aptitudes, skills, brawls, encounters, tracks, centre diagram, scars/disorders, talents, add/remove rows), close and reopen the sheet.
  5. Persistence after full Foundry restart (stop server, restart, reopen world).
  6. Permissions: GM vs Player with Owner / Observer / Limited / None on the actor; who can open and edit.
  7. Console: no error or deprecation warning during Q1–Q6 (record warnings that are Foundry/GPU noise separately).
  8. Non-regression on existing data: reopen an actor created by a previous version on a **backed-up copy** of the world. Migrations (none today) get their own scenarios, always on backed-up copies.
- Result record template (date, tester, Foundry build and OS/browser, package version, ZIP SHA-256 from `SHA256SUMS`, per-scenario pass/fail/skipped, console notes, defects found).
- One executed record on a candidate package built from the current `main` (`npm run package`): results and Foundry build recorded in the doc.
- Mandatory statement: green CI, a green release workflow and a passing protocol do **not** validate Mon rules. `docs/RULES.md` has no confirmed rule; the protocol proves load, edit, persistence and permissions only.
- `docs/DEVELOPMENT.md`: one link/summary where #27 says "issue #28 protocol", plus how it gates publishing.

### Out of scope
- Automation (Playwright etc.).
- Changing the release workflow, package scripts, `system.json`, or `src/`.
- Fixing defects the run finds (separate issues).
- Publishing any release, creating tags.
- Validating or inventing Mon rules.
- Data migrations (none exist); only the rule that they get separate scenarios on backed-up copies.

## 3. Existing state
- `docs/DEVELOPMENT.md` holds ad hoc per-issue verification records; most say "Foundry build not recorded". Last build tested: **14.369**; target **14.370**.
- #26 gives `npm run package` → `dist/mon1e.zip`, `system.json`, `SHA256SUMS`, and `verify:package`.
- #27 draft → human qualifies ZIP → human publishes. Its docs already point to this protocol as a human gate. Release manifest URLs are targets, not live until a first release is published.
- `docs/RULES.md`: no confirmed rules.
- No `docs/QUALIFICATION.md` exists. The sheet registers a single Character type; no permissions code in `src/` (default Foundry ownership applies).

## 4. Architecture decisions
- Documentation only; no code, no new test file. Protocol is Markdown in `docs/` as the AC says.
- **Install-from-manifest vs. pre-publication**: a draft release has no public manifest URL, so Q1 has two modes. *Pre-publication (the gate)*: unzip the candidate `mon1e.zip` into a clean `<User Data>/Data/systems/mon1e/` (a copy, **not** the dev symlink, so the shipped file set is what is tested), verify its SHA-256 against `SHA256SUMS`. *Post-publication (once, after the human publishes)*: install from the stable manifest URL in Foundry's Install System dialog and confirm the same version and ZIP hash. Record both separately; the second is allowed to remain pending on the first release and is noted as such.
- Use a dedicated clean Foundry data folder or world, never the maintainer's dev world; the symlinked dev install must be removed/renamed during the run and restored after.
- Scenarios cite the exact artifact (SHA-256), so the tested ZIP is the one released; re-packaging after qualification invalidates the record.
- A record is valid for one package version + one Foundry build. Other builds are not claimed.
- Permission scenario is described by observed outcome in the record, without asserting Mon-specific permission rules (none exist). Unknown/unconfirmed behaviors are recorded as such, not guessed.
- Foundry v14 UI names/menus are verified against the official v14 docs at write time and cited in the doc; unverified wording is flagged, following the repo's existing convention.

## 5. Work plan
1. Read the framing Lot 5 and #27 gate wording; check the Foundry v14 docs for system install, world creation, user permission levels (Owner/Observer/Limited/None); note sources in the doc.
2. Draft `docs/QUALIFICATION.md`: purpose and the "does not validate Mon rules" statement (top, not buried); prerequisites (clean data folder, candidate ZIP + hash, test users GM + two players); scenarios Q1–Q8; defect handling (a failed scenario blocks publication; link a GitHub issue); record template.
3. Ask the maintainer to run it on a candidate ZIP built from `main` (cannot be run by Claude: needs Foundry GUI). Collect results, Foundry build and console notes. Do not fill in results that were not reported.
4. Paste the executed record into the doc with date, build, package version, ZIP hash, and any scenario skipped with the reason.
5. Update `docs/DEVELOPMENT.md` to link the protocol from the release section and state that qualification precedes publication.
6. Run `npm run check` to confirm nothing else broke; commit; PR to `main`.

## 6. Likely modified files
- New: `docs/QUALIFICATION.md`
- Modified: `docs/DEVELOPMENT.md` (pointer, gate wording only)
- Not touched: `src/`, `scripts/`, `.github/`, `system.json`, `package.json`, `tests/`.

## 7. Expected tests
- No automated test added (doc only); `npm run check` stays green.
- The executed protocol *is* the test evidence: filled record with Foundry build, package hash and per-scenario results.
- State plainly: this covers load, sheet editing, persistence, permissions, console. It does not cover Mon rule conformity, other Foundry builds, other browsers or OS unless listed.

## 8. Risks and mitigations
- Run on the dev symlink hides packaging omissions → require a copied clean install from the ZIP.
- Candidate ZIP differs from the one finally published → record the SHA-256; re-run or re-qualify if repackaged.
- Draft has no manifest URL → pre/post-publication split above.
- Foundry 14.370 vs 14.369 mismatch → record the real build; do not claim 14.370 unless run on it; update the manifest `verified` claim only via a separate decision.
- Permission semantics misread → cite v14 docs; record observed behavior only.
- Past records say "build not recorded" → protocol makes build mandatory; do not backfill unknowns.
- Tester bias / unreported console → console check is a named scenario with a required explicit answer (no "ambiguous").
- Defects discovered mid-run → log as separate issues, do not widen this one.

## 9. Stop criteria
- Stop and ask if no candidate ZIP can be produced from `main` (#26 not merged) or the maintainer cannot run Foundry v14 to execute the protocol.
- Stop rather than record results the maintainer did not report.
- Done when: `docs/QUALIFICATION.md` exists with the scenarios and the "no Mon rules validated" statement; it records one execution on a candidate package with Foundry build, package version and ZIP hash; `docs/DEVELOPMENT.md` links it as the pre-publication gate; `npm run check` green; PR open.

## Verification (of this deliverable)
- Read the doc end to end: every issue scenario maps to a Q-ID; the disclaimer is present; record has build and hash filled.
- `shasum -a 256 -c dist/SHA256SUMS` on the tested ZIP matches the recorded hash.
- `npm run check` exits 0.
