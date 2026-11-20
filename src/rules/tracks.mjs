/** Health state flags, in the order printed on page 1. Independent on/off flags. */
export const HEALTH_STATE_KEYS = Object.freeze(["unconscious", "dying", "dead"]);

/** Composure state flags, in the order printed on page 1. Independent on/off flags. */
export const COMPOSURE_STATE_KEYS = Object.freeze(["rattled", "discomfited", "humiliated"]);

/**
 * Fewest boxes the sheet draws for a gauge. Presentation placeholder only, NOT a Mon rule:
 * the real box count is unconfirmed by the Mon creator (docs/RULES.md A6).
 */
export const DISPLAY_MIN_BOXES = 6;

/**
 * New filled-box count after pressing (+) or (-). Floors at 0 because a negative
 * number of checked boxes cannot be drawn (UI guard, not a Mon rule). No upper bound.
 * @param {number} current
 * @param {number} delta
 * @returns {number}
 */
export function adjustFilled(current, delta) {
  return Math.max(0, current + delta);
}

/**
 * Number of boxes to draw: the display minimum, or more when more are filled.
 * @param {number} filled
 * @param {number} [min]
 * @returns {number}
 */
export function boxesToDraw(filled, min = DISPLAY_MIN_BOXES) {
  return Math.max(filled, min);
}
