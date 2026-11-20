/** Base attributes, in the order printed on page 1 of the character sheet. */
export const ATTRIBUTE_KEYS = Object.freeze([
  "strength", "toughness", "agility", "perception", "charisma", "resolve", "intelligence", "spirit"
]);

/** Base aptitudes, in the order printed on page 1 of the character sheet. */
export const APTITUDE_KEYS = Object.freeze([
  "closeCombat", "rangedCombat", "battle", "moonMagic", "spiritMagic", "kaonMagic", "cosmicMagic"
]);

/**
 * @typedef {object} StatRow
 * @property {string} key Stable id of the entry.
 * @property {number} value Raw whole number (no bounds confirmed).
 */

/**
 * Initial rows for a list of base keys: value 0, one new object per row.
 * @param {readonly string[]} keys
 * @returns {StatRow[]}
 */
export function defaultStatRows(keys) {
  return keys.map((key) => ({ key, value: 0 }));
}
