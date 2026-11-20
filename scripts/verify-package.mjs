import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateManifest } from "./check-manifest.mjs";
import { PACKAGE_DIRS, sha256, zipName } from "./package.mjs";

const RELATIVE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*)["'](\.{1,2}\/[^"']+)["']/g;

/**
 * @typedef {object} PackageInfo
 * @property {string[]} entries File paths inside the ZIP.
 * @property {(name: string) => string | undefined} readText Text of a ZIP entry.
 * @property {string} distManifestText Contents of dist/system.json.
 * @property {string} packageVersion Version from package.json.
 * @property {string | undefined} checksums Contents of dist/SHA256SUMS.
 * @property {Record<string, string>} actualHashes Recomputed SHA-256 per dist file name.
 */

/**
 * Inspect a built package. Pure: all ZIP and disk access goes through `info`.
 * @param {PackageInfo} info
 * @returns {string[]} Error messages, empty when the package is valid.
 */
export function verifyPackage(info) {
  /** @type {string[]} */
  const errors = [];
  const entries = info.entries.filter((name) => !name.endsWith("/"));
  const present = new Set(entries);

  const manifestText = present.has("system.json") ? info.readText("system.json") : undefined;
  if (manifestText === undefined) return ["system.json is not at the ZIP root"];

  /** @type {Record<string, any>} */
  let manifest;
  /** @type {unknown} */
  let distManifest;
  try {
    manifest = JSON.parse(manifestText);
    distManifest = JSON.parse(info.distManifestText);
  } catch {
    return ["system.json (ZIP or dist/) is not valid JSON"];
  }
  if (JSON.stringify(manifest) !== JSON.stringify(distManifest)) {
    errors.push("system.json inside the ZIP differs from dist/system.json");
  }
  for (const key of ["manifest", "download"]) {
    if (typeof manifest[key] !== "string" || manifest[key] === "") errors.push(`release manifest is missing "${key}"`);
  }
  errors.push(...validateManifest(manifest, { packageVersion: info.packageVersion, fileExists: (p) => present.has(p) }));

  for (const name of entries) {
    if (name === "system.json") continue;
    if (name.split("/").some((segment) => segment.startsWith("."))) errors.push(`forbidden hidden entry: ${name}`);
    else if (!PACKAGE_DIRS.some((dir) => name.startsWith(`${dir}/`))) errors.push(`unexpected entry outside ${PACKAGE_DIRS.join(", ")}: ${name}`);
  }

  // Every relative import of a shipped module must be shipped too.
  for (const name of entries.filter((entry) => entry.endsWith(".mjs"))) {
    const text = info.readText(name) ?? "";
    for (const match of text.matchAll(RELATIVE_IMPORT)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), match[1]));
      if (!present.has(target)) errors.push(`${name} imports ${match[1]} but ${target} is not in the ZIP`);
    }
  }

  const expected = new Map(
    (info.checksums ?? "")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, ...rest] = line.split("  ");
        return /** @type {[string, string]} */ ([rest.join("  "), hash]);
      }),
  );
  if (info.checksums === undefined) errors.push("SHA256SUMS is missing");
  for (const [name, actual] of Object.entries(info.actualHashes)) {
    const hash = expected.get(name);
    if (hash === undefined) errors.push(`SHA256SUMS has no entry for ${name}`);
    else if (hash !== actual) errors.push(`SHA256SUMS mismatch for ${name}`);
  }

  return errors;
}

/**
 * CLI entry: verify `<root>/dist`.
 * @param {string[]} argv `--root <dir>` overrides the repo root.
 * @returns {number} Process exit code.
 */
export function run(argv) {
  const rootFlag = argv.indexOf("--root");
  const root =
    rootFlag >= 0 && argv[rootFlag + 1]
      ? path.resolve(argv[rootFlag + 1])
      : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const dist = path.join(root, "dist");
  try {
    const distManifestText = readFileSync(path.join(dist, "system.json"), "utf8");
    const zipFile = path.join(dist, zipName(JSON.parse(distManifestText)));
    if (!existsSync(zipFile)) throw new Error(`ZIP not found: ${path.relative(root, zipFile)}`);
    const checksumFile = path.join(dist, "SHA256SUMS");
    const entries = execFileSync("unzip", ["-Z1", zipFile], { encoding: "utf8" }).split("\n").filter(Boolean);
    const errors = verifyPackage({
      entries,
      readText: (name) => execFileSync("unzip", ["-p", zipFile, name], { encoding: "utf8" }),
      distManifestText,
      packageVersion: String(JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version),
      checksums: existsSync(checksumFile) ? readFileSync(checksumFile, "utf8") : undefined,
      actualHashes: Object.fromEntries(
        [path.basename(zipFile), "system.json"].map((name) => [name, sha256(readFileSync(path.join(dist, name)))]),
      ),
    });
    for (const error of errors) console.error(`verify-package: ${error}`);
    if (errors.length === 0) console.log(`verify-package: ${path.basename(zipFile)} OK (${entries.length} entries)`);
    return errors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(`verify-package: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = run(process.argv.slice(2));
}
