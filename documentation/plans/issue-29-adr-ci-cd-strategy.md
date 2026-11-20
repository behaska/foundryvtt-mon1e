# Implementation plan — ADR: CI/CD strategy
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/29 (parent: #21, blocked by: none)
**ADR**: this plan produces `docs/adr/ADR-001-ci-cd-strategy.md`
**Likely impacted modules**: `docs/adr/` (new), `docs/DECISIONS.md`

Framing source: `documentation/cadrage/cicd/implementation-cicd.md` (sections 2.1, 7, 8). It names the file `docs/adr/ADR-001-ci-cd-strategy.md`.

## 1. Objective
Record, as one ADR, the CI/CD decisions already taken and partly implemented (#23-#28), so later work can cite one stable reference.

## 2. Scope
### Included
- New `docs/adr/ADR-001-ci-cd-strategy.md`, English, short. Status: **Accepted** (decisions are already live in `ci.yml`/`release.yml`; the framing said "proposed" only until validated, maintainer confirms at review). Sections: Context, Decision, Consequences, Out of scope.
- Decisions recorded:
  1. GitHub public repo + GitHub Actions.
  2. Two workflows only: `ci.yml` (PR + push to `main`, `contents: read`) and `release.yml` (`workflow_dispatch` only, draft release, human publishes, `verify-published` afterwards).
  3. No build/bundler/transpile step; package is a ZIP of the source tree.
  4. Release is manual and controlled; a push to `main` never publishes. Write permission only in release jobs; fork PRs get none.
  5. Foundry qualification stays separate from CI: manual, on the candidate ZIP, protocol in `docs/QUALIFICATION.md` (#28).
  6. Green CI = technical consistency only, not Mon rules (`docs/RULES.md`) and not proof it works in Foundry.
- Explicit out-of-scope list: self-hosted runners, Docker, SonarQube, multi-OS matrix, permanent Foundry test server / Foundry per PR, catalog auto-publish, global coverage target.
- **Licence statement** (AC): public repo does not imply open-source licence; no licence file exists; code licence and Mon/Fringe Worlds content terms are undecided and tracked in `docs/DEVELOPMENT.md` (finding F1). ADR must not choose a licence.
- `docs/DECISIONS.md`: one table row dated 2026-11-20 linking the ADR (relative link `adr/ADR-001-ci-cd-strategy.md`), reason "Issue #29". Keep existing row format.

### Out of scope
- Choosing or adding a licence; any workflow, script, `system.json` or `src/` change.
- Branch protection / required check settings (belongs to #23 follow-up, GitHub settings).
- Editing the French framing brief; modifying issues; commits/PR.
- Creating an ADR template or index beyond the link in `DECISIONS.md`.

## 3. Existing state
- `docs/adr/` does not exist; `docs/DECISIONS.md` is a flat dated table with no ADR links.
- `.github/workflows/ci.yml` (job `quality`, Node 26, ubuntu-latest) and `release.yml` (manual, `permissions: {}` top level, jobs scope own permissions) exist.
- No LICENSE file; `docs/DEVELOPMENT.md` F1 and "Licence" open question already document the gap.
- Working tree has uncommitted unrelated changes (`docs/DEVELOPMENT.md`, `docs/QUALIFICATION.md`, framing doc, plan #28); do not touch or stage them.

## 4. Architecture decisions
- ADR numbering `ADR-001-ci-cd-strategy.md` per framing; no ADR root configured in profile, so `docs/adr/` follows the issue AC.
- ADR states decisions and rationale only; operational detail stays in `docs/DEVELOPMENT.md` and `docs/QUALIFICATION.md` (link, do not duplicate).
- Facts about workflows cited from the actual files, not the framing, to avoid drift. Unverified claims (e.g. branch protection state) are not asserted.
- "Mon rules unconfirmed" wording matches `docs/RULES.md` as written.

## 5. Work plan
1. Re-read `ci.yml`, `release.yml`, `docs/DEVELOPMENT.md` release section and `docs/QUALIFICATION.md` headings to cite accurately.
2. Create `docs/adr/ADR-001-ci-cd-strategy.md` with the sections above, status, date 2026-11-20, links to related docs and issues #21, #23-#28.
3. Add the row to `docs/DECISIONS.md`.
4. Proofread: English, short, no invented facts, licence statement present.

## 6. Likely modified files
- New: `docs/adr/ADR-001-ci-cd-strategy.md`
- Edit: `docs/DECISIONS.md`

## 7. Expected tests
- No code. `npm run check` unaffected; run once to confirm nothing broke.
- Manual: link in `DECISIONS.md` resolves; ADR contains the licence sentence and every out-of-scope item from the issue; claims match workflow files.

## 8. Risks and mitigations
- Status "Accepted" vs "Proposed": maintainer confirms at review; default Accepted because implemented.
- Drift between ADR and workflows: cite files, keep ADR at decision level.
- Overstating legal position: ADR only says "not decided", no licence advice.

## 9. Stop criteria
- Both acceptance criteria met (ADR under `docs/adr/` linked from `docs/DECISIONS.md`; licence statement recorded).
- Stop and ask if maintainer wants a licence decided inside this ADR.
