/** Base attributes, in the order printed on page 1 of the character sheet. */
export const ATTRIBUTE_KEYS = Object.freeze([
  "strength", "toughness", "agility", "perception", "charisma", "resolve", "intelligence", "spirit"
]);

/** Base aptitudes, in the order printed on page 1 of the character sheet. */
export const APTITUDE_KEYS = Object.freeze([
  "closeCombat", "rangedCombat", "battle", "moonMagic", "spiritMagic", "kaonMagic", "cosmicMagic"
]);

/** Base skills, in the order printed on page 1 (three columns of seven, read column by column). */
export const SKILL_KEYS = Object.freeze([
  "alchemy", "animalKen", "arts", "athletics", "command", "communication", "craft",
  "divination", "empathy", "folkLore", "healing", "landLore", "marksmanship", "meditation",
  "melee", "mysteries", "stealth", "stewardship", "survival", "thievery", "vigilance"
]);

/** Brawls, in the order printed on page 1. */
export const BRAWL_KEYS = Object.freeze(["armour", "weapon"]);

/** Encounters, in the order printed on page 1. */
export const ENCOUNTER_KEYS = Object.freeze(["philosophy", "adornment"]);

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
