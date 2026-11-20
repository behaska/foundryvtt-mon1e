/** Number of Class / Sub-Class / Level rows printed on page 1 of the character sheet. */
export const CLASS_LEVEL_ROW_COUNT = 3;

/**
 * @typedef {object} ClassLevelRow
 * @property {string} class Class, free text.
 * @property {string} subClass Sub-Class, free text.
 * @property {number} level Level, whole number.
 */

/**
 * An empty Class / Sub-Class / Level row: blank text, level 0.
 * @returns {ClassLevelRow}
 */
export function emptyClassLevelRow() {
  return { class: "", subClass: "", level: 0 };
}

/**
 * Initial Class / Sub-Class / Level rows of a new character.
 * @param {number} [count] Number of rows (defaults to the 3 printed rows; not a limit).
 * @returns {ClassLevelRow[]}
 */
export function defaultClassLevelRows(count = CLASS_LEVEL_ROW_COUNT) {
  return Array.from({ length: count }, emptyClassLevelRow);
}
