---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable tracker issues using tracer-bullet vertical slices. Tracker vocabulary, language, labels, and publishing rules come from injected context.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

## Required injected context
Before publishing, obtain from active context or the tracker: provider/tools, issue language, issue types and label vocabulary, triage/readiness policy, issue body template, and parent/dependency conventions. If publishing conventions are unavailable, draft the breakdown but do not invent metadata.

## Process

### 1. Gather context
Work from current context and provided artifacts. If an issue reference is provided and the tracker is accessible, read its full body and relevant comments.

### 2. Explore the codebase only when useful
Inspect enough code to use project domain vocabulary and respect relevant ADRs. Do not browse broadly when source material already establishes boundaries.

### 3. Draft vertical slices
Each issue should deliver a thin but complete path through all necessary integration layers, not a horizontal slice. Use `HITL` / `AFK` only when active project context defines those categories. Prefer independent thin slices and explicit dependencies.

### 4. Review with the user
For each slice show title, interaction type when used, blockers/dependencies, and covered source stories/requirements. Ask for approval before publishing unless the user explicitly requested direct publication and project policy permits it.

### 5. Apply project language and template
Use injected language/template. Do not translate labels, issue types, or system metadata unless context requires it. Fallback template:

```md
## Parent
<parent reference, omit when not applicable>

## What to build
<concise end-to-end behavior>

## Acceptance criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by
<issue reference(s), or state that none block start>
```

Avoid volatile file paths unless they encode an explicit technical decision that must be preserved.

### 6. Publish
Publish approved issues in dependency order when the configured tracker is available. Apply only labels/types defined by context. Do not close or modify the parent issue unless explicitly requested.

## Token policy
Use tracker APIs, shell, Git, test tools, or CI directly for deterministic tasks. Send only relevant failures/context to an LLM when interpretation is required.
