# Implementation plan — Manual release workflow with draft GitHub Release
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/27 (parent: #21, blocked by: #26, #28)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `.github/workflows/release.yml` (new), `scripts/check-release.mjs` (new), `tests/release.test.mjs` (new), `package.json`, `docs/DEVELOPMENT.md`

Framing source: `documentation/cadrage/cicd/implementation-cicd.md`, Lot 4.

## 1. Objective
A `workflow_dispatch` workflow `release.yml` taking a `version` input. On a validated `main` commit it checks the version against `package.json` and `system.json`, refuses an existing tag or release, reruns `npm run check`, `package` and `verify:package`, then creates the tag and a **draft** GitHub Release with `mon1e.zip`, `system.json` and `SHA256SUMS`. Only the publishing job has `contents: write`. After a human publishes, a separate check confirms the stable manifest URL and the versioned ZIP URL resolve. Nothing publishes automatically; `0.0.1` is not auto-published.

## 2. Scope
### Included
- `scripts/check-release.mjs`: pure `checkReleaseVersion({ input, packageVersion, manifestVersion, existingTags, existingReleases })` returning error strings (version is semver without `v`; equals both versions; tag `v<version>` and release not already present); thin CLI reading files and a tag/release list passed in by the workflow.
- `release.yml`, jobs:
  1. `verify` (`contents: read`): checkout, assert ref is `main` and `GITHUB_SHA` equals the current `origin/main` head, run `check-release`, `npm ci`, `npm run check`, `package`, `verify:package`, upload `dist/` as artifact.
  2. `draft` (`contents: write`, `needs: verify`, `environment: release` if available): download the artifact (no rebuild), recheck tag/release absence, create the tag on the verified SHA, `gh release create v<version> --draft --target <sha>` with the three files.
  3. `verify-public` (`contents: read`, separate manually triggered input or second dispatch `mode: verify-published`): after human publication, `curl -fsSIL` on `…/releases/latest/download/system.json` and `…/releases/download/v<version>/mon1e.zip`; fail on non-2xx; compare downloaded manifest `version`/`download` to the input and ZIP hash to `SHA256SUMS`.
- Concurrency group per workflow, `cancel-in-progress: false`.
- Actions SHA-pinned like `ci.yml`; fork PRs have no trigger (no `pull_request`/`pull_request_target`), so no publishing rights.
- `docs/DEVELOPMENT.md`: how to release, what the workflow proves, immutability note and verification record.

### Out of scope
- Foundry v14 qualification protocol (#28) beyond requiring its result before publishing (human gate, documented).
- Changing `package.mjs`/`verify-package.mjs`, `ci.yml`, source `system.json`, version bumps.
- Publishing `0.0.1` or any real release as part of this issue's merge.
- Enabling GitHub release immutability: repo setting, decided after the flow is validated; documented as a follow-up, not claimed done.
- Branch protection/required checks (other issues).

## 3. Existing state
- `ci.yml`: single `quality` job, `contents: read`, Node 26, `npm ci`, `npm run check`, `package`, `verify:package`, SHA-pinned `upload-artifact` of `dist/`.
- `scripts/package.mjs` builds `dist/{mon1e.zip,system.json,SHA256SUMS}`; release manifest URLs are `…/releases/latest/download/system.json` and `…/releases/download/v<version>/mon1e.zip` (targets, never verified live).
- `package.json` and `system.json` both `0.0.1`; `package.json` `private: true`.
- `scripts/check-manifest.mjs` pattern: pure function plus `pathToFileURL` CLI guard, reused here.
- #26 is on branch `feat/issue-26-installable-package` (not yet merged to `main`); #28 open. Both must land first. No `release.yml` exists.

## 4. Architecture decisions
- Pure core / thin shell: version/tag rules in `scripts/check-release.mjs`, unit-tested with node:test; workflow stays glue (`gh`, `git`, `curl`).
- Manual `workflow_dispatch` only; version input, no auto-bump. Tag is created from the verified SHA, not a moving branch.
- "Validated `main` commit": require the dispatch ref is `main`, SHA equals `origin/main` head, and `ci.yml` check-runs for that SHA are successful (query via `gh api`). Requires `checks: read`/`actions: read` on the verify job.
- Artifact handoff: build once in `verify`, upload, and `draft` consumes that exact artifact so the released ZIP is the verified one (framing: no rebuild after recette). Checksums rechecked with `sha256sum -c` in `draft`.
- Least privilege: top-level `permissions: {}`; `contents: write` only on `draft`. No secrets beyond `GITHUB_TOKEN`; `persist-credentials: false` except where the tag push needs it (use `gh api` to create ref instead).
- Refuse existing tag/release both in `verify` (early) and `draft` (race recheck).
- Post-publication check separated because draft→published is a human act; implemented as a dispatch mode so it can be rerun and does not need write rights.
- Immutability: documented decision point; enabling it is a manual repo setting after first validated release.

## 5. Work plan
1. Confirm against GitHub docs: `gh release create --draft`, tag creation on draft release, `latest/download` redirect behavior (drafts and prereleases are excluded from `latest`), release immutability semantics. Record sources in `docs/DEVELOPMENT.md`.
2. Failing tests first (`tests/release.test.mjs`): accepts matching version; rejects `v`-prefixed or non-semver input; rejects mismatch with `package.json`; rejects mismatch with `system.json`; rejects existing tag; rejects existing release; collects several errors at once.
3. Implement `scripts/check-release.mjs` until tests pass.
4. Add `check:release` script to `package.json` (not part of `npm run check`).
5. Write `release.yml` (verify → draft → verify-public mode), SHA-pinned actions, minimal permissions.
6. Lint the workflow (`actionlint` if available locally; otherwise careful review) and run `npm run check`.
7. Dry runs without publishing: dispatch from a feature branch must fail at the `main` guard; dispatch on `main` with a mismatched version fails; version `0.0.1` on a throwaway fork/test repo (or after explicit user approval on the real repo) produces a draft only, then delete the draft and tag.
8. Re-dispatch with the same version after the draft exists → refused (acceptance 1).
9. Human publishes a test release; run `verify-public`; confirm both URLs resolve (acceptance 3).
10. Confirm a fork PR cannot trigger the workflow or obtain a write token (acceptance 4) by reading triggers/permissions and, if possible, a fork test.
11. Update `docs/DEVELOPMENT.md` (procedure, proves/does not prove, immutability follow-up, verification record with date).
12. PR to `main`; CI green.

## 6. Likely modified files
- New: `.github/workflows/release.yml`, `scripts/check-release.mjs`, `tests/release.test.mjs`.
- Modified: `package.json` (scripts only), `docs/DEVELOPMENT.md`.
- Not touched: `system.json`, `scripts/package.mjs`, `scripts/verify-package.mjs`, `ci.yml`, `src/`.

## 7. Expected tests
- `node --test tests/release.test.mjs` passes all cases of step 2; `npm run check` stays green (typecheck clean under `strict` without `tsconfig` change, ESLint clean).
- Workflow behavior is only testable by dispatching on GitHub: the dry runs of steps 7-10 are the evidence. State plainly that unit tests cover version/tag rules only, not the YAML.
- No Foundry runtime test; green release workflow does not prove the package loads in Foundry (#28 protocol does) nor Mon rule conformity.

## 8. Risks and mitigations
- A test release or tag leaks to the public repo → dry-run on a scratch repo first, or ask user before any real dispatch; draft-only until a human publishes; delete test drafts/tags.
- `latest/download` resolves to the previous release while a newer one is draft → documented; `verify-public` checks the versioned URL strictly and the stable URL's manifest `version`.
- Tag push needs write on a ref while `main` has protection → create the ref via API from the `draft` job only; if rules block it, stop and ask.
- Race between early and final tag check → recheck in `draft`.
- "Validated commit" check depends on `ci.yml` job names/check-runs → name the required check in one place; fails closed if absent.
- Immutability makes mistakes permanent → enable only after a validated cycle; decision logged, not automated.
- Fork PR token exposure → no PR triggers, no `pull_request_target`, no secrets.
- Blockers #26 (unmerged), #28 open → do not implement before #26 is on `main`; publication gate requires #28 result.

## 9. Stop criteria
- Stop and ask if #26 is not merged to `main`, or if any real tag/release would be created in the real repository.
- Stop and ask if repository rules prevent the workflow creating tags, or if "latest" semantics differ from the framing.
- Stop if the same-SHA/same-artifact guarantee cannot be kept without rebuilding.
- Done when: unit tests green; re-running an existing version is refused; draft release carries tag + SHA + ZIP/manifest/checksums from the verified artifact; `verify-public` confirms both URLs after human publication; only `draft` has `contents: write`; fork PRs cannot trigger it; docs record the dry runs and the immutability decision; PR green.
