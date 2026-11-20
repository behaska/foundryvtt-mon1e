/** Foundry system identifier (must match `id` in system.json). */
export const SYSTEM_ID = "mon1e";

/**
 * Diagnostic message logged when the system loads.
 * @param {string} [version] System version.
 * @returns {string}
 */
export function diagnosticMessage(version = "unknown") {
  return `${SYSTEM_ID} | system loaded (v${version})`;
}

/** Actor type id for a player character (must match `documentTypes.Actor` in system.json). */
export const CHARACTER_TYPE = "character";

/** Template path prefix, relative to the Foundry data root. */
export const TEMPLATE_ROOT = `systems/${SYSTEM_ID}/templates`;
