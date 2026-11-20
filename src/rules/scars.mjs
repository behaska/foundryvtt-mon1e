/** Scar gauges, in the order printed on page 1. Each is a count of checked boxes. */
export const SCAR_KEYS = Object.freeze(["roadScars", "driveScars", "groupScars"]);

/** Disorder lists, in the order printed on page 1. Each is a list of free-text lines. */
export const DISORDER_KEYS = Object.freeze(["roadDisorders", "driveDisorders", "groupDisorders"]);

/**
 * Starting lines of a disorder list: three blank lines as printed. Presentation seed,
 * NOT a Mon rule (three is not a limit, docs/RULES.md A8). Fresh array on each call.
 * @returns {string[]}
 */
export function defaultDisorderLines() {
  return ["", "", ""];
}
