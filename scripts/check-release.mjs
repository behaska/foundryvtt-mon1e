import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Plain `MAJOR.MINOR.PATCH`, optional pre-release suffix; no leading `v`. */
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z.-]+)?$/;

/**
 * @typedef {object} ReleaseInput
 * @property {string} input Version requested for the release, without `v`.
 * @property {string} packageVersion Version from package.json.
 * @property {string} manifestVersion Version from system.json.
 * @property {string[]} existingTags Git tag names already in the repository.
 * @property {string[]} existingReleases Release tag names already on GitHub, drafts included.
 */

/**
 * Decide whether a release version may be cut. Pure: tags and releases come from the caller.
 * @param {ReleaseInput} info
 * @returns {string[]} Error messages, empty when the release may proceed.
 */
export function checkReleaseVersion(info) {
  /** @type {string[]} */
  const errors = [];
  const { input, packageVersion, manifestVersion, existingTags, existingReleases } = info;
  const tag = `v${input}`;

  if (!SEMVER.test(input)) {
    errors.push(`version "${input}" must be semver MAJOR.MINOR.PATCH without a "v" prefix`);
  }
  if (input !== packageVersion) {
    errors.push(`version "${input}" does not match package.json version "${packageVersion}"`);
  }
  if (input !== manifestVersion) {
    errors.push(`version "${input}" does not match system.json version "${manifestVersion}"`);
  }
  if (existingTags.includes(tag)) errors.push(`tag ${tag} already exists`);
  if (existingReleases.includes(tag)) errors.push(`release ${tag} already exists`);
  return errors;
}

/** @param {string | undefined} value @returns {string[]} */
const splitList = (value) => (value ?? "").split(/[\s,]+/).filter(Boolean);

/**
 * CLI entry: `--version <v> [--tags "<t1> <t2>"] [--releases "<r1> <r2>"] [--root <dir>]`.
 * The workflow passes the tag and release lists it read from GitHub.
 * @param {string[]} argv Arguments after the script name.
 * @returns {number} Process exit code.
 */
export function run(argv) {
  /** @param {string} flag */
  const arg = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const root = arg("--root")
    ? path.resolve(/** @type {string} */ (arg("--root")))
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  /** @param {string} name */
  const readJson = (name) => JSON.parse(readFileSync(path.join(root, name), "utf8"));
  try {
    const input = arg("--version");
    if (!input) throw new Error("--version is required");
    const errors = checkReleaseVersion({
      input,
      packageVersion: String(readJson("package.json").version),
      manifestVersion: String(readJson("system.json").version),
      existingTags: splitList(arg("--tags")),
      existingReleases: splitList(arg("--releases")),
    });
    for (const error of errors) console.error(`check-release: ${error}`);
    if (errors.length === 0) console.log(`check-release: v${input} OK`);
    return errors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(`check-release: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = run(process.argv.slice(2));
}
