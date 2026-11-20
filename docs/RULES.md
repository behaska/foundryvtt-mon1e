# Mon rules

Single place to separate **confirmed** rules from **unknowns**. Code must only implement rules listed as confirmed. Never guess or silently change a rule: ask the Mon author.

## Sources

| Source | Location | Used for | Status |
|---|---|---|---|
| `Character Sheet ALPHA Page 1.pdf` (page 1 of 4, ALPHA) | Maintainer's local copy, not in the repo | **Layout and field labels only. Not rules.** | Inventory below is **unconfirmed** by the Mon creator. |

Pages 2-4 of the sheet are not provided yet and have their own issues.

## Confirmed rules
None. The field inventory below is not a rule.

## Character sheet page 1: field inventory (layout and labels, not rules)

Documentary verification (2026-11-20, against the PDF, no interpretation):
- Every label below matches the PDF text layer exactly. Counts: 8 attributes, 7 aptitudes, 21 skills in 3 columns of 7.
- The PDF is an AcroForm with 153 fields on page 1: 112 text fields, 41 checkboxes, of which 1 text field is multiline (the one under Focus Statement). Field names are auto-generated (`text_…`), so they carry no meaning.
- The form layer was added with a third-party PDF form tool (a `Sejda` entry is present). It shows how the sheet was made fillable, not what the creator intends. It is not evidence of box counts or value types.
- Checkbox total (41) is recorded as a fact only. It is not mapped to Health, Composure, scars or tracks.

Labels are copied as printed. "Kind" describes only what the page shows (a blank line, a box, a box track). It does not state a type, a range or a meaning. Anything not printed is listed under Unknowns.

### Header
| Label | Kind as printed |
|---|---|
| Name | line |
| Species | line |
| Ancestry | line |
| Moon Signature | line |
| Kaon | short line |
| Zaon | short line |
| Zaon Scars | short line |
| Archetype | large box |
| Class / Sub-Class / Level | three columns, three rows of lines; the Level lines are printed in a lighter shade |
| Might | single box |

### Centre diagram
Printed as one diagram of hexagons and boxes. Labels:

| Label | Kind as printed |
|---|---|
| Willpower | hexagon |
| Burden | hexagon with a box track on its left edge |
| Charge | hexagon with a box track on its right edge |
| Discord | hexagon and a small tilted box |
| Group Focus | hexagon |
| Wayward, Road Fanatic, Drive Fanatic, Aimless | one checkbox each |
| Burdened, Laden, Radical, Shaken | one checkbox each |
| Road Scars, Drive Scars, Group Scars | a short row of small boxes each |
| Road Disorders, Drive Disorders, Group Disorders | three lines each |
| Focus Statement | label; no box is drawn, but the PDF form places one multiline text area under it |
| Group Archetype | large box |

### Base Attributes
STRENGTH, TOUGHNESS, AGILITY, PERCEPTION, CHARISMA, RESOLVE, INTELLIGENCE, SPIRIT: one short line each.

### Base Aptitudes
CLOSE COMBAT, RANGED COMBAT, BATTLE, MOON MAGIC, SPIRIT MAGIC, KAON MAGIC, COSMIC MAGIC: one short line each.

### Brawls and Encounters
| Group | Label | Kind as printed |
|---|---|---|
| Brawls | Armour, Weapon | short line each |
| Encounters | Philosophy, Adornment | short line each |

### Health and Composure
| Group | Printed labels | Kind as printed |
|---|---|---|
| Health | Unconscious, Dying, Dead | a row of boxes, followed by a separate small group of boxes carrying these three labels |
| Composure | Rattled, Discomfited, Humiliated | a row of boxes, followed by a separate small group of boxes carrying these three labels |

### Skills
Three columns of short lines, one per label:
- Alchemy, Animal Ken, Arts, Athletics, Command, Communication, Craft
- Divination, Empathy, Folk Lore, Healing, Land Lore, Marksmanship, Meditation
- Melee, Mysteries, Stealth, Stewardship, Survival, Thievery, Vigilance

### Talents
Two side-by-side columns of rows. Each row is a long line followed by a short line. No label is printed on the lines.

## Unknowns
Nothing below is guessed. Each item needs an answer from the Mon creator. All inventory content stays **unconfirmed** until then.

### A. Blocking: answer before the first persistent Actor data model and editable sheet
| # | Question | Why implementation needs it |
|---|---|---|
| A1 | Is page 1 one character Actor? Do Group Focus, Group Scars, Group Disorders and Group Archetype belong to each character, or to something shared (a party)? | Decides which document stores these fields. Moving them later needs a data migration. |
| A2 | What kind of value does each blank line hold (whole number, text, other)? Needed for Kaon, Zaon, Zaon Scars, Might, Level, Attributes, Aptitudes, Skills, Brawls, Encounters and the short Talent line. | The data model must declare a field type per value. A wrong type breaks stored data. |
| A3 | Are the 8 attributes, 7 aptitudes and 21 skills fixed lists, and are the printed names the ones to use? | Fixed lists become fixed fields. Extensible lists need a different structure (array or Items). |
| A4 | What do the two parts of a Talent row hold (long line, short line)? Is the 2 columns by 7 rows layout a limit, and are Talents data of the character or separate objects? | Decides between a list inside the Actor and embedded Items. This is the largest structural choice on the page. |
| A5 | What does each hexagon (Willpower, Burden, Charge, Discord, Group Focus) and the Might box hold: a number, a track, text? Is each entered by hand, with no calculation, on this page? | Decides whether a stored field exists. A computed value must not be stored. #10 states raw values only, so this asks the creator to confirm it. |
| A6 | Box tracks (Health, Composure, Road/Drive/Group Scars, Burden and Charge edge boxes): how many boxes, and what do the separate small groups labelled Unconscious/Dying/Dead and Rattled/Discomfited/Humiliated mean for the layout? | The sheet must draw a known number of boxes, and the model must store them (count or per-box). Not answerable from the PDF. |
| A7 | Are the 8 checkboxes (Wayward, Road Fanatic, Drive Fanatic, Aimless, Burdened, Laden, Radical, Shaken) independent on/off flags? | Decides boolean fields versus a choice among options. |
| A8 | Are Archetype, Group Archetype, Focus Statement, Disorders (3 lines each) and Class/Sub-Class/Level (3 rows) free text? Is each row a separate entry? | Decides text fields versus lists, and how many entries are stored. |
| A9 | What does an empty field mean (blank or 0)? | Sets the default value of every new character. |

#### Answers received (unconfirmed)
Given by the maintainer on 2026-11-20, in two rounds. They are **not** confirmed by the Mon creator and are not rules yet.

| # | Answer | Status |
|---|---|---|
| A1 | Page 1 is one character. The Group fields belong to that character. | Answered |
| A2 | Whole numbers (integers): Kaon, Zaon, Zaon Scars, Might, Level, Attributes, Aptitudes, Skills, Brawls, Encounters, short Talent line. | Answered |
| A3 | Attributes, Aptitudes and Skills are three separate lists. Each element is a label (text) and a value (number). The printed names are the starting entries and cannot be removed. The user can add other elements with a (+) button. | Answered |
| A4 | A Talent is a label (text) and a value (number). No limit on the number of Talents, added with a (+) button like Skills. | Answered |
| A5 | Willpower, Burden, Charge, Discord, Group Focus and Might each hold a number. Raw values only, as stated in #10. | Answered |
| A6 | Health, Composure, Road/Drive/Group Scars, Burden and Charge edge boxes are gauges: boxes checked in sequence, adjusted with (+) and (-) buttons. No fixed number of boxes; (+) beyond the drawn boxes adds a box. Unconscious/Dying/Dead and Rattled/Discomfited/Humiliated are independent checkboxes for a character state. | Answered |
| A7 | The 8 checkboxes are independent on/off flags (boolean). | Answered |
| A8 | Free text. Disorders (per group) and Class/Sub-Class/Level are lists of separate entries. Three is not a limit. | Answered |
| A9 | Empty number is 0, empty gauge is 0, empty text is blank, unchecked flag is false. | Answered |

All A items are answered. Nothing is open before the data model, except that the creator has not confirmed any of it (section C). Minimum and maximum values, including whether negatives are allowed, stay deferred under B.

#### Stored for Health and Composure (issue #16, not a rule)
Per gauge: the count of checked boxes (whole number, default 0) and three independent state flags (default off). The total number of boxes is **not stored and not known**: the sheet draws a placeholder minimum of 6 boxes (presentation only) and adds boxes as (+) goes beyond it. Box counts printed on the sheet remain **unconfirmed by the Mon creator** and must be asked. Floor at 0 in the (+)/(-) buttons is a UI guard, not a Mon rule.

#### Stored for the centre diagram (issue #17, not a rule)
Whole numbers (default 0): Willpower, Burden, Charge, Discord, Group Focus. Free text (default blank): Focus Statement, Group Archetype. Eight independent on/off flags (default off): Wayward, Road Fanatic, Drive Fanatic, Aimless, Burdened, Laden, Radical, Shaken. Raw values only: no bound, no computation, no effect. Still **unconfirmed by the Mon creator**. **Open gap**: the Burden and Charge edge box gauges (A6) are not stored yet and no open issue covers them.

#### Stored for scars and disorders (issue #18, not a rule)
Road, Drive and Group Scars: each a count of checked boxes (whole number, default 0), same placeholder display as Health and Composure. Road, Drive and Group Disorders: each a list of free-text lines, 3 blank lines by default, more can be added. Raw values only: no bound, no effect, no link between Scars and Disorders. Still **unconfirmed by the Mon creator**, including the scar box count (the issue mentions 3 per the PDF) and whether three disorder lines is a limit.

#### Stored for talents (issue #19, not a rule)
A list of rows, each a free-text label (default blank) and a whole number (default 0). 14 blank rows by default (printed layout, not a limit), more can be added with (+), any row can be removed. Embedded list rather than Items. Raw values only: no bound, no effect, no roll link. Still **unconfirmed by the Mon creator**, including list vs Items.

### B. Deferred: answer when the matching mechanic is implemented
- Value ranges (minimum, maximum, negatives allowed or not) and clamping for every numeric line. #10 allows raw values with no bounds.
- Derived values: whether any of Might, Willpower, Burden, Charge, Discord, Group Focus, Health or Composure is computed.
- What Kaon, Zaon, Zaon Scars, Moon Signature, Ancestry and Might mean in play.
- Effect of the 8 flags (Wayward … Shaken) and any link to the diagram.
- What Unconscious/Dying/Dead and Rattled/Discomfited/Humiliated trigger.
- Relation between Scars and Disorders, and whether three lines is a limit.
- Rolls: how Attributes, Aptitudes, Skills, Brawls, Encounters and Talents combine.
- Which mechanic is implemented first (issue #6).

### C. Process
- Creator confirmation of the inventory and of the answers above (who, when, how): pending. No decision entry is added until it is recorded.
