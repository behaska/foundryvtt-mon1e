# Implementation plan — CI workflow gates pull requests to main
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/23 (parent: #21, blocked by: #22 — baseline audit, plan exists, F2/F8/F10 feed this issue)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `.github/workflows/ci.yml` (new), GitHub repo settings (branch protection on `main`), `docs/DEVELOPMENT.md`

Target file on approval: `documentation/plans/issue-23-ci-workflow-gates-pull-requests-to-main.md` (flat, English; no collision). Written here first because plan mode only allows this file; copy verbatim on approval.
Framing source: `documentation/cadrage/cicd/implementation-cicd.md`, Lot 1.

## 1. Objective
Every PR to `main` and every push to `main` runs `npm ci` + `npm run check` in one job named `quality`. `main` accepts changes only through a PR whose `quality` check passed. Nothing else (no release, no packaging).

## 2. Scope
### Included
- `.github/workflows/ci.yml`: triggers `pull_request` (branches `main`) and `push` (branches `main`); `ubuntu-latest`; Node 26; job id/name `quality`; `permissions: contents: read`; no secrets; `concurrency` cancelling stale PR runs; external actions pinned to full SHAs.
- Branch protection on `main`: PR required, required status check `quality`, force-push blocked, deletion blocked, **no** required approving reviews.
- Evidence for the four acceptance criteria using throwaway PRs.
- Short CI section in `docs/DEVELOPMENT.md` (what CI runs, that it does not prove Foundry runtime behavior, how protection is set).

### Out of scope
- `release.yml`, ZIP packaging, manifest checks, Dependabot, lint, extending `checkJs`, Foundry runtime tests.
- Restricting repo-wide Actions permissions (F8 follow-up), secret scanning enablement (F4), `.idea/` untracking (F6), `engines` field (F10).
- Any change to `src/`, `package.json`, `system.json`, tests.

## 3. Existing state
- No `.github/`. `main` unprotected (404 on protection and no rulesets, verified via `gh api`); repo public; user has admin rights.
- `package.json`: `check` = `typecheck` then `node --test tests/`. Lockfile present, so `npm ci` works. Documented env: Node v26.11.1, npm 11.20.0.
- Latest tags resolved read-only: `actions/checkout` v7.0.1 → `3d3c42e5aac5ba805825da76410c181273ba90b1`; `actions/setup-node` v7.1.0 → `949feb2413d6458794dcd2491c4babbbce0c15c1`. Re-verify at implementation time (tag → commit, not annotated-tag object).
- Cadrage Lot 1 spec table matches the issue exactly.

## 4. Architecture decisions
- One workflow, one job, steps: checkout → setup-node (`node-version: 26`, `cache: npm`) → `npm ci` → `npm run check`. No matrix, no build step.
- SHA pins with trailing `# vX.Y.Z` comment. SHAs verified through `gh api .../git/ref/tags/<tag>` and confirmed to be commit objects.
- `actions/checkout` with `persist-credentials: false` (no push needed).
- Concurrency: `group: ci-${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: ${{ github.event_name == 'pull_request' }}` so pushes to `main` are never cancelled.
- Job name `quality` is the contract with branch protection; do not set a different `name:` and do not make it conditional (a skipped required check blocks merge).
- Protection via classic branch protection API (`gh api -X PUT repos/.../branches/main/protection`): `required_status_checks {strict: false, contexts: ["quality"]}`, `required_pull_request_reviews {required_approving_review_count: 0}`, `allow_force_pushes: false`, `allow_deletions: false`, `enforce_admins: true`. `enforce_admins: true` is needed so criterion 4 holds for the sole admin maintainer; trade-off is no direct push to `main`, accepted by the issue ("requiring a PR"). Confirm with the maintainer before applying (outward-facing, hard to notice later).
- Order matters: protection requiring `quality` can only reference the check once it has run at least once; the workflow lands through its own PR first, protection is enabled after the first green run.

## 5. Work plan
1. Re-resolve and record SHAs for `actions/checkout` and `actions/setup-node` (read-only `gh api`); confirm they are commits and the tags are current stable.
2. On a feature branch, create `.github/workflows/ci.yml` per section 4.
3. Local sanity: `npm ci && npm run check` green; YAML syntax check (e.g. `actionlint` if installed, else careful review); confirm no secret or token reference.
4. Open PR to `main`; confirm job `quality` runs and passes (criterion 1). Merge (protection not yet on).
5. Maintainer-approved: apply branch protection on `main` per section 4; read it back with `gh api .../protection` and record.
6. Criterion 2: throwaway PR introducing a deliberate type error; `quality` fails; merge blocked. Close without merging, delete branch.
7. Criterion 3: throwaway PR with a deliberately failing test; same outcome.
8. Criterion 4: on a PR with failing/pending `quality`, confirm merge button blocked / `gh pr merge` rejected; confirm direct push, force-push and delete of `main` rejected (use a harmless no-op push attempt only, or rely on the API read-back for force-push/delete).
9. Add the CI section to `docs/DEVELOPMENT.md` (workflow summary, evidence with PR links and dates, protection settings, limits: not Foundry runtime, Actions allow-list still open under F8). Update F2 as resolved in the audit table if that table is meant to track state.
10. Wrap-up: final PR for docs passes `quality`; hand evidence to maintainer to tick the four criteria.

## 6. Likely modified files
- New: `.github/workflows/ci.yml`.
- Modified: `docs/DEVELOPMENT.md`.
- GitHub settings (not in repo): branch protection on `main`.
- Not touched: `src/`, `tests/`, `package.json`, `system.json`, `.gitignore`.

## 7. Expected tests
- Local: `npm run check` green before PR (existing 3+ tests, typecheck clean).
- CI: four acceptance criteria, each with a PR/run link: valid PR green; type-error PR red; failing-test PR red; unmet `quality` blocks merge.
- Settings read-back: protection JSON shows `quality` required, PR required, 0 approvals, force-push and deletion disabled.
- No Foundry runtime test (no functional change).

## 8. Risks and mitigations
- Required check name mismatch → protection never satisfied; mitigate by enabling protection only after seeing `quality` run, and reading the exact context name from the run.
- Node 26 unavailable to `setup-node` yet → run fails at step 4; fallback: stop and ask (do not silently downgrade, docs target 26).
- `enforce_admins` locks the maintainer out of direct pushes → deliberate; document the escape hatch (temporarily disable in settings).
- Cancelling runs on `main` pushes → avoided by conditional `cancel-in-progress`.
- Fork PRs: `pull_request` has no secrets and read-only token; fine since none are used.
- Pinned SHAs go stale → Dependabot is a later issue; note in docs.
- Throwaway failing PRs leave noise → close unmerged, delete branches.

## 9. Stop criteria
- Stop if Node 26 cannot be installed on `ubuntu-latest` or `npm run check` fails on CI but not locally; record and ask.
- Stop before applying branch protection until the maintainer confirms the settings (including `enforce_admins`).
- Stop if the protection API returns 403/404 for plan or permission reasons; record "not verifiable", do not guess.
- Done when all four criteria have linked evidence and the docs section is merged through a green `quality` PR.
