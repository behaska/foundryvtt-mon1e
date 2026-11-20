/**
 * One blank Talent row: a free-text label and a whole-number value (docs/RULES.md A4, A9).
 * @returns {{ label: string, value: number }}
 */
export function blankTalent() {
  return { label: "", value: 0 };
}

/**
 * Starting Talent rows: 14 blanks (the printed 2 columns by 7 rows). Presentation seed,
 * NOT a Mon rule: there is no limit on Talents (docs/RULES.md A4). Fresh array and rows on each call.
 * @returns {{ label: string, value: number }[]}
 */
export function defaultTalentRows() {
  return Array.from({ length: 14 }, blankTalent);
}

/**
 * New list without the row at `index`. Returns a copy; an invalid index returns an unchanged copy.
 * @template T
 * @param {T[]} rows
 * @param {number} index
 * @returns {T[]}
 */
export function removeRow(rows, index) {
  if (!Number.isInteger(index) || index < 0 || index >= rows.length) return [...rows];
  return rows.filter((_, i) => i !== index);
}
