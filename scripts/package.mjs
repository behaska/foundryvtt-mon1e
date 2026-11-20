import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateManifest } from "./check-manifest.mjs";

/** Repository root URL; release URLs are targets, not proof that a release exists. */
export const REPO_URL = "https://github.com/behaska/foundryvtt-mon1e";

/** Top-level directories shipped in the package. Anything else must be listed in the manifest. */
export const PACKAGE_DIRS = ["src", "templates", "styles", "lang"];

/** @param {Record<string, any>} manifest @returns {string} */
export const zipName = (manifest) => `${manifest.id}.zip`;

/**
 * Build the release manifest from the source manifest. Never mutates the input.
 * @param {Record<string, any>} manifest Parsed source system.json.
 * @returns {Record<string, any>}
 */
export function buildReleaseManifest(manifest) {
  return {
    ...manifest,
    url: REPO_URL,
    manifest: `${REPO_URL}/releases/latest/download/system.json`,
    download: `${REPO_URL}/releases/download/v${manifest.version}/${zipName(manifest)}`,
    bugs: `${REPO_URL}/issues`,
  };
}

/**
 * Decide which files go into the ZIP. Pure: the candidate list comes from the caller.
 * Included: files under {@link PACKAGE_DIRS} (dotfiles excluded) and every path the manifest references.
 * `system.json` is not listed: the release manifest is added separately.
 * @param {Record<string, any>} manifest Parsed source system.json.
 * @param {string[]} candidates Repo-relative POSIX paths found on disk.
 * @returns {{ files: string[], releaseManifest: Record<string, any> }}
 */
export function buildPackagePlan(manifest, candidates) {
  const referenced = [
    ...(manifest.esmodules ?? []),
    ...(manifest.scripts ?? []),
    ...(manifest.styles ?? []),
    ...(manifest.languages ?? []).map((/** @type {{ path: string }} */ l) => l.path),
    ...(manifest.packs ?? []).map((/** @type {{ path?: string }} */ p) => p.path).filter(Boolean),
  ];
  const shipped = candidates.filter(
    (file) =>
      file !== "system.json" &&
      PACKAGE_DIRS.some((dir) => file.startsWith(`${dir}/`)) &&
      !file.split("/").some((segment) => segment.startsWith(".")),
  );
  const files = [...new Set([...shipped, ...referenced])].sort();
  return { files, releaseManifest: buildReleaseManifest(manifest) };
}

/**
 * Format checksums in `sha256sum` format.
 * @param {Array<{ name: string, hash: string }>} items
 * @returns {string}
 */
export function formatChecksums(items) {
  return items.map(({ name, hash }) => `${hash}  ${name}`).join("\n") + "\n";
}

/** @param {string | Buffer} data @returns {string} */
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");

/** @param {string} root @param {string} dir @returns {string[]} */
function walk(root, dir) {
  const base = path.join(root, dir);
  if (!existsSync(base)) return [];
  return readdirSync(base, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.posix.join(dir, path.relative(base, path.join(entry.parentPath, entry.name)).split(path.sep).join("/")));
}

/**
 * CLI entry: write `<root>/dist/{id}.zip`, `system.json` and `SHA256SUMS`. Sources are only read.
 * @param {string[]} argv `--root <dir>` overrides the repo root.
 * @returns {number} Process exit code.
 */
export function run(argv) {
  const rootFlag = argv.indexOf("--root");
  const root =
    rootFlag >= 0 && argv[rootFlag + 1]
      ? path.resolve(argv[rootFlag + 1])
      : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  try {
    const manifest = JSON.parse(readFileSync(path.join(root, "system.json"), "utf8"));
    const packageVersion = String(JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version);
    const errors = validateManifest(manifest, { packageVersion, fileExists: (p) => existsSync(path.join(root, p)) });
    if (errors.length > 0) {
      for (const error of errors) console.error(`package: ${error}`);
      return 1;
    }

    const { files, releaseManifest } = buildPackagePlan(
      manifest,
      PACKAGE_DIRS.flatMap((dir) => walk(root, dir)),
    );
    const dist = path.join(root, "dist");
    const zipFile = path.join(dist, zipName(manifest));
    rmSync(dist, { recursive: true, force: true });
    mkdirSync(dist, { recursive: true });
    writeFileSync(path.join(dist, "system.json"), `${JSON.stringify(releaseManifest, null, 2)}\n`);

    // Sources from the repo, then the release manifest from dist/ so it lands at the ZIP root.
    execFileSync("zip", ["-X", "-q", zipFile, "-@"], { cwd: root, input: `${files.join("\n")}\n` });
    execFileSync("zip", ["-X", "-q", zipFile, "system.json"], { cwd: dist });

    writeFileSync(
      path.join(dist, "SHA256SUMS"),
      formatChecksums(
        [zipName(manifest), "system.json"].map((name) => ({ name, hash: sha256(readFileSync(path.join(dist, name))) })),
      ),
    );
    console.log(`package: wrote dist/ (${files.length + 1} files in ${zipName(manifest)})`);
    return 0;
  } catch (error) {
    console.error(`package: ${error instanceof Error ? error.message : error}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = run(process.argv.slice(2));
}
