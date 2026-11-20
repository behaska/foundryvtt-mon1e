# Foundry v14 qualification protocol

Manual test protocol run on a **candidate package** in Foundry VTT v14 before a human publishes a draft release (see "Release workflow" in `DEVELOPMENT.md`). Issue #28. Not automated.

## What this protocol does and does not prove

**Proves**, for one package version on one Foundry build: the packaged system installs, loads, a Character actor can be created, edited and displayed, data persists across a full restart, ownership levels behave as observed, and the console shows no error.

**Does not prove**:
- **Mon rules.** A green CI, a green release workflow and a passing protocol do **not** validate any Mon rule. `RULES.md` lists no confirmed rule; the sheet only stores values. Rule conformity needs the Mon author.
- Other Foundry builds, browsers or operating systems than the ones recorded.
- Visual fidelity to the paper sheet (only "displayed and usable").

A record is valid for **one package version, one ZIP hash, one Foundry build**. Re-packaging, even from the same commit, invalidates it (ZIP bytes embed file mtimes).

## Prerequisites
- Candidate package from `main`: `npm ci && npm run check && npm run package && npm run verify:package`, or the `mon1e.zip`, `system.json` and `SHA256SUMS` attached to the draft release. Verify before testing: `shasum -a 256 -c SHA256SUMS` (run next to the ZIP). Record the ZIP hash.
- A **clean** Foundry data folder (or a throwaway one), never the development world.
- The development symlink `<User Data>/Data/systems/mon1e` must be moved aside for the run and restored after. The test must use an extracted copy of the ZIP, so the shipped file set is what is tested.
- Three users: one Gamemaster, two Players.
- Note the exact Foundry build (Setup screen), OS and browser, before starting.

Foundry UI names below follow the Foundry documentation and the existing records in `DEVELOPMENT.md`; they were **not** re-checked against a v14 page when this was written. Where the UI differs, record the actual wording in the notes.

## Rules for running
- Run scenarios in order. Mark each **pass**, **fail** or **skipped** (with a reason). A blank is a fail.
- Console (F12) stays open for the whole run. Scenario Q7 needs an explicit yes or no, not "probably".
- Any **fail** blocks publication. Open a GitHub issue per defect and link it in the record. Do not fix defects inside the qualification run.
- Report only what was observed.

## Scenarios

### Q1 Install the candidate
Pre-publication (the gate):
1. Extract `mon1e.zip` into `<User Data>/Data/systems/mon1e/` (the ZIP root holds `system.json`, so extract into that folder).
2. Start Foundry, open Setup, Game Systems.

Expected: "Mon1e" is listed; version equals the package version; no error on the Setup screen.

Post-publication (after a human publishes; may stay **pending** on a first release): remove the extracted copy, use Install System with the stable manifest URL (`…/releases/latest/download/system.json`). Expected: same version installs; the installed files match the ZIP hash. Record separately as Q1b.

### Q2 Create and launch a world
1. Create a world with system Mon1e.
2. Launch it as Gamemaster.

Expected: world reaches the canvas; no error.

### Q3 Create a Character and display the sheet
1. Create an Actor of type Character.
2. Open its sheet.

Expected: the sheet opens on the "Page 1" tab; header and tab stay pinned and the page scrolls; sections shown: identity, archetype and class rows, centre diagram, scars and disorders, attributes, aptitudes, brawls, encounters, health, composure, skills, talents; every label is localized, no raw `MON1E.*` key; a new actor's numbers are 0, texts blank.

### Q4 Edit every field family
1. Edit at least one value in each section: identity (name, species, ancestry, moon signature, kaon, zaon, zaon scars, might, archetype, 3 class rows), attributes, aptitudes, skills, brawls, encounters, centre numbers and both texts, each flag family, health and composure (+)/(-) and states, scars (+)/(-), disorder lines (add one), talents (add one, remove a middle one).
2. Close and reopen the sheet.

Expected: every edit displays and is intact; (-) stops at 0; removing a talent keeps each value with its label.

### Q5 Persistence after a full restart
1. Close the world, return to Setup, stop the Foundry server fully, start it again.
2. Launch the world, open the actor.

Expected: every Q4 value intact.

### Q6 Permissions
With the actor as Gamemaster, set the default and per-user ownership in turn, and log in as each Player (second browser or profile):
- Owner: opens the sheet, edits and persists a value.
- Observer: opens the sheet; note whether fields can be edited.
- Limited: note what is visible or openable.
- None: actor not visible.

Expected: **no Mon-specific permission rule exists**, so this scenario records observed behavior and passes when (a) Owner can edit and persist, (b) None cannot see the actor, (c) Observer and Limited outcomes are written down. State plainly if Observer can edit.

### Q7 Console
Answer for the whole run Q1 to Q6.
- Errors: yes or no. Deprecation warnings: yes or no. List each message.
- Warnings caused by Foundry or the GPU (for example `WebGL context was lost`) go in a separate list, not as a pass or a fail by themselves.

Expected: no error and no deprecation warning attributable to Mon1e.

### Q8 Non-regression on existing data
1. Take a **backup copy** of a world that holds an actor created by a previous version (or restore one). Work only on the copy.
2. Install the candidate, open that world, open the existing actor.

Expected: values intact, new fields show their defaults, no error. If no earlier-version data exists, mark **skipped** with the reason.

Data migrations: none exist today. When one is added, give it its own scenario, run on a backed-up copy, before it ships.

## Record template

```
### Qualification record: <package version>
Date:
Tester:
Foundry build:
OS / browser:
Package version:
ZIP SHA-256:
Source commit:

| Scenario | Result (pass / fail / skipped) | Notes / issue link |
|---|---|---|
| Q1 install (pre-publication) | | |
| Q1b install from manifest (post-publication) | | |
| Q2 world | | |
| Q3 sheet display | | |
| Q4 editing | | |
| Q5 restart persistence | | |
| Q6 permissions | | |
| Q7 console | | |
| Q8 existing data | | |

Console errors / deprecations:
Foundry or GPU noise:
Defects (issue links):
Verdict (publish / do not publish):
```

## Records

### Qualification record: 0.0.1
**Not executed yet.** Requires the maintainer to run the protocol in Foundry on a candidate package. No result is recorded here until that is done; earlier per-issue checks in `DEVELOPMENT.md` (build 14.369) do not count as a run of this protocol.
