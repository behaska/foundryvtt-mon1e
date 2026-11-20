import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * @typedef {object} ManifestContext
 * @property {string} packageVersion Version from package.json.
 * @property {(relativePath: string) => boolean} fileExists True when the repo-relative path exists.
 */

/** @param {unknown} value @returns {value is Record<string, any>} */
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

/** @param {unknown} value @returns {value is string} */
const isFilled = (value) => typeof value === "string" && value.trim() !== "";

/**
 * Validate a Foundry v14 system manifest. Pure: all disk access goes through `ctx.fileExists`.
 * Only fields documented by Foundry are checked; unknown keys are ignored.
 * @param {unknown} manifest Parsed system.json.
 * @param {ManifestContext} ctx
 * @returns {string[]} Error messages, empty when valid.
 */
export function validateManifest(manifest, ctx) {
  /** @type {string[]} */
  const errors = [];
  if (!isObject(manifest)) return ["system.json must be a JSON object"];

  for (const key of ["id", "title", "description"]) {
    if (!isFilled(manifest[key])) errors.push(`${key} must be a non-empty string`);
  }

  const version = manifest.version;
  if (!isFilled(version) && typeof version !== "number") {
    errors.push("version must be a non-empty string or a number");
  } else if (String(version) !== ctx.packageVersion) {
    errors.push(`version "${version}" does not match package.json version "${ctx.packageVersion}"`);
  }

  validateCompatibility(manifest.compatibility, errors);

  /** @param {string} field @param {unknown} value */
  const checkPath = (field, value) => {
    if (!isFilled(value)) {
      errors.push(`${field}: path must be a non-empty string`);
    } else if (value.startsWith("/") || value.includes("\\") || value.split("/").includes("..")) {
      errors.push(`${field}: "${value}" must be a relative path with forward slashes and no ".."`);
    } else if (!ctx.fileExists(value)) {
      errors.push(`${field}: file not found: ${value}`);
    }
  };

  for (const field of ["esmodules", "scripts", "styles"]) {
    const list = manifest[field];
    if (list === undefined) continue;
    if (!Array.isArray(list)) errors.push(`${field} must be an array`);
    else list.forEach((entry) => checkPath(field, entry));
  }

  if (manifest.languages !== undefined) {
    if (!Array.isArray(manifest.languages)) {
      errors.push("languages must be an array");
    } else {
      manifest.languages.forEach((entry, index) => {
        const where = `languages[${index}]`;
        if (!isObject(entry)) return void errors.push(`${where} must be an object`);
        if (!isFilled(entry.lang)) errors.push(`${where}.lang must be a non-empty string`);
        if (!isFilled(entry.name)) errors.push(`${where}.name must be a non-empty string`);
        checkPath(`${where}.path`, entry.path);
      });
    }
  }

  if (manifest.documentTypes !== undefined) {
    if (!isObject(manifest.documentTypes)) {
      errors.push("documentTypes must be an object keyed by document type");
    } else {
      for (const [documentName, subtypes] of Object.entries(manifest.documentTypes)) {
        if (!isObject(subtypes)) {
          errors.push(`documentTypes.${documentName} must be an object mapping subtype ids to objects`);
          continue;
        }
        for (const [subtype, config] of Object.entries(subtypes)) {
          if (!isObject(config)) errors.push(`documentTypes.${documentName}.${subtype} must be an object`);
        }
      }
    }
  }

  // The Foundry page does not document a pack `path`, so it is only checked when present.
  if (manifest.packs !== undefined) {
    if (!Array.isArray(manifest.packs)) errors.push("packs must be an array");
    else
      manifest.packs.forEach((pack, index) => {
        if (isObject(pack) && pack.path !== undefined) checkPath(`packs[${index}].path`, pack.path);
      });
  }

  return errors;
}

/** @param {unknown} compatibility @param {string[]} errors */
function validateCompatibility(compatibility, errors) {
  if (!isObject(compatibility)) {
    errors.push("compatibility must be an object with minimum and verified");
    return;
  }
  const { minimum, verified, maximum } = compatibility;
  const num = (/** @type {unknown} */ v) => Number(v);
  if (minimum === undefined || verified === undefined) {
    errors.push("compatibility.minimum and compatibility.verified are required");
    return;
  }
  if (Number.isNaN(num(minimum)) || Number.isNaN(num(verified))) {
    errors.push("compatibility.minimum and compatibility.verified must be numeric");
    return;
  }
  if (num(minimum) > num(verified)) errors.push("compatibility.minimum must not exceed compatibility.verified");
  if (maximum !== undefined && (Number.isNaN(num(maximum)) || num(maximum) < num(verified))) {
    errors.push("compatibility.maximum must be numeric and not below compatibility.verified");
  }
}

/**
 * CLI entry: validate `<root>/system.json` against `<root>/package.json` and the disk.
 * @param {string[]} argv Arguments after the script name; `--root <dir>` overrides the repo root.
 * @returns {number} Process exit code.
 */
export function run(argv) {
  const rootFlag = argv.indexOf("--root");
  const root =
    rootFlag >= 0 && argv[rootFlag + 1]
      ? path.resolve(argv[rootFlag + 1])
      : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  /** @param {string} name */
  const readJson = (name) => JSON.parse(readFileSync(path.join(root, name), "utf8"));
  try {
    const errors = validateManifest(readJson("system.json"), {
      packageVersion: String(readJson("package.json").version),
      fileExists: (p) => existsSync(path.join(root, p)),
    });
    for (const error of errors) console.error(`check-manifest: ${error}`);
    if (errors.length === 0) console.log("check-manifest: system.json OK");
    return errors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(`check-manifest: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = run(process.argv.slice(2));
}
