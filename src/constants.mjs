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
