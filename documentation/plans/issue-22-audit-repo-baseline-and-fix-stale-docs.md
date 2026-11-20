# Implementation plan — Audit repo baseline and fix stale docs
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/22 (parent: #21, blocked by: none)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `docs/DEVELOPMENT.md`, `docs/RULES.md` (open question only), `~/.llm-workbench/projects/mon1e/context/project-guidance.md` (source of generated `CLAUDE.md`/`AGENTS.md`)

Target file on approval: `documentation/plans/issue-22-audit-repo-baseline-and-fix-stale-docs.md` (flat, English; no collision, nearest plans are #20, #3).
Framing source: `documentation/cadrage/cicd/implementation-cicd.md` (French, staged, not yet committed: `AM` in git status).

## 1. Objective
Reproducible, recorded baseline before any CI work (#21): verified commands and versions, inventory of repo and GitHub settings, classified findings, and generated guidance no longer claiming the repo has no `system.json` or working commands. No functional change.

## 2. Scope
### Included
- Run `npm ci` and `npm run check`; record Node, npm, TypeScript versions and results.
- Inventory: `.github/` (absent), `system.json` resources (esmodules, styles, languages, URLs), GitHub settings via `gh` read-only (branch protection, Actions permissions, tags, releases, visibility).
- Review versioned noise: `.idea/*` (5 tracked files despite a JetBrains `.gitignore` template), `.llm-workbench/project.json` (absolute path `/Users/hervedarritchon/.llm-workbench`).
- Secrets check over history (`gitleaks` if installed, else `git log -p` grep for key/token/password patterns).
- Classify each finding: blocking / important / optional.
- Record the report in `docs/DEVELOPMENT.md`.
- Fix stale claims in guidance source, then `llm sync` (via `update-context`).
- Record "licence of code vs Mon / Fringe Worlds content" as an open question for the maintainer (in the report; mirror in `docs/RULES.md` unknowns only if it fits that file's scope).

### Out of scope
- Any CI workflow, `.github/` creation, branch protection change, release, tag.
- Untracking `.idea/` or `.llm-workbench/project.json` (report only; fixes belong to a follow-up issue).
- Choosing a licence; editing generated `CLAUDE.md` / `AGENTS.md` / `.claude/` by hand.
- Any source, template, style or manifest change.

## 3. Existing state
- `package.json` scripts: `typecheck`, `test`, `check`; devDeps `@types/node` ^26.6.6, `typescript` ^7.0.2.
- `docs/DEVELOPMENT.md` already holds prerequisites, commands, daily loop, `checkJs` coverage, verification records (#3, #4). Report goes in a new section there, same style (date, versions, result).
- `system.json`, `src/`, `tests/`, `lang/`, `styles/`, `templates/`, `README.md` all exist.
- **Stale guidance**: "Project state" (scaffold only, placeholder `index.js`, no `system.json`/`src/`, issue #1 as current work) and "Commands" ("No working commands exist yet... `npm test` exits 1") in `project-guidance.md`. Also "Target architecture" phrasing is future-tense for things that exist; verify and adjust minimally.
- Source of generated files lives outside the repo: `~/.llm-workbench/projects/mon1e/context/project-guidance.md`; repo only has `.llm-workbench/project.json` pointing at the workbench.
- No `.github/` directory.
- Versioned noise: `.idea/.gitignore`, `.iml`, `material_theme_project_new.xml`, `modules.xml`, `vcs.xml`.

## 4. Architecture decisions
- Docs-only plus guidance-source change. Generated files are changed only through `update-context` then `llm sync`, never directly (CLAUDE.md rule).
- Guidance fix stays minimal: replace scaffold/no-commands claims with current facts (manifest exists, three commands work), drop the obsolete "current work" line rather than rewrite roadmap. Keep rules (language, no invented Mon rule, vertical slices) untouched.
- GitHub inventory uses read-only `gh api` calls only; if a setting is not readable (permissions), record "not verifiable" rather than guess.
- Findings table in `docs/DEVELOPMENT.md`: id, finding, severity, evidence, suggested follow-up. Severity rubric stated once: blocking = prevents CI/CD or leaks data; important = should be fixed before CI; optional = hygiene.
- Licence recorded as open question, stating the public repo is not automatically open source (per cadrage section 1); no licence text added.

## 5. Work plan
1. `npm ci` then `npm run check`; capture `node -v`, `npm -v`, `tsc -v`, test count, exit codes.
2. Inventory `system.json`: id, version, compatibility, esmodules/styles/languages paths exist on disk; `url`/`manifest`/`download` fields present or absent.
3. `gh` read-only: repo visibility, default branch, branch protection on `main`, Actions permissions, tags, releases, secrets scanning status if exposed.
4. Review `.idea/` and `.llm-workbench/project.json`: why each is tracked, whether `.gitignore` covers them, machine-specific content.
5. Secrets scan over full history; record tool, range, result.
6. Classify findings; write the "Baseline audit (issue #22)" section in `docs/DEVELOPMENT.md` with date, versions, table, open licence question. Keep it scannable.
7. Run `update-context` to edit `project-guidance.md` (stale "Project state" and "Commands"), then `llm sync`; confirm `CLAUDE.md` and `AGENTS.md` diffs are only the intended lines.
8. Wrap-up: `git status`/diff shows docs + regenerated files only; run `npm run check` again (still green); hand evidence to maintainer to tick the four criteria; commit docs and generated-file changes separately.

## 6. Likely modified files
- Modified: `docs/DEVELOPMENT.md`.
- Regenerated by `llm sync`: `CLAUDE.md`, `AGENTS.md` (and any `.claude/`/`.agents/` output if sync touches them).
- Outside repo (via `update-context`): `~/.llm-workbench/projects/mon1e/context/project-guidance.md`.
- Possibly `docs/RULES.md` (one unknown line for licence), only if consistent with its scope.
- Not touched: `src/`, `system.json`, `package.json`, `.gitignore`, `.idea/`, `.llm-workbench/project.json`.

## 7. Expected tests
- `npm run check` green before and after (3+ tests, exit 0; unchanged count unless other issues added tests).
- Manual: grep generated `CLAUDE.md`/`AGENTS.md` for "no `system.json`", "placeholder", "No working commands" → zero hits.
- Manual: every command and path cited in the report was actually run or checked; relative links in docs resolve.
- No Foundry runtime test needed (no functional change).

## 8. Risks and mitigations
- `llm sync` may rewrite more than the stale lines → review diff, keep commit separate, revert if unrelated churn.
- Guidance source is outside the repo → record in the report that the fix was made in the workbench and synced; note it is not versioned here.
- `gh` may lack admin rights for branch protection → mark "not verifiable", do not infer.
- Secret scan false positives/negatives → state tool and scope; do not claim "no secrets" beyond what was scanned.
- Tempting to fix `.idea/` tracking now → out of scope; list as follow-up to keep "no functional change".

## 9. Stop criteria
- Stop and ask if a real secret is found in history (do not publish details in docs; escalate to maintainer).
- Stop if `npm ci` or `npm run check` fails: record as blocking finding, do not fix source in this issue.
- Stop if `llm sync` is unavailable or would overwrite unrelated hand edits.
- Done when the four acceptance criteria have evidence and the diff contains no functional change.
