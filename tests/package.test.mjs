import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPackagePlan, buildReleaseManifest, formatChecksums } from "../scripts/package.mjs";
import { verifyPackage } from "../scripts/verify-package.mjs";

/** @returns {Record<string, any>} A valid source manifest, fresh on every call. */
function sourceManifest() {
  return {
    id: "mon1e",
    type: "system",
    title: "Mon1e",
    description: "A system.",
    version: "0.0.1",
    compatibility: { minimum: 14, verified: 14 },
    esmodules: ["src/main.mjs"],
    styles: ["styles/mon1e.css"],
    languages: [{ lang: "en", name: "English", path: "lang/en.json" }],
    documentTypes: { Actor: { character: {} } },
  };
}

const CANDIDATES = [
  "src/main.mjs",
  "src/constants.mjs",
  "src/.DS_Store",
  "templates/character-header.hbs",
  "styles/mon1e.css",
  "lang/en.json",
  "tests/package.test.mjs",
  "node_modules/x/index.js",
  "docs/DEVELOPMENT.md",
  "package.json",
];

test("plan ships manifest files and templates, nothing else", () => {
  const { files } = buildPackagePlan(sourceManifest(), CANDIDATES);
  assert.deepEqual(files, [
    "lang/en.json",
    "src/constants.mjs",
    "src/main.mjs",
    "styles/mon1e.css",
    "templates/character-header.hbs",
  ]);
});

test("plan keeps manifest-referenced files even outside the shipped directories", () => {
  const manifest = sourceManifest();
  manifest.esmodules = ["lib/extra.mjs"];
  assert.ok(buildPackagePlan(manifest, CANDIDATES).files.includes("lib/extra.mjs"));
});

test("release manifest adds release fields and keeps identity", () => {
  const release = buildReleaseManifest(sourceManifest());
  assert.equal(release.id, "mon1e");
  assert.equal(release.version, "0.0.1");
  assert.deepEqual(release.compatibility, { minimum: 14, verified: 14 });
  assert.match(release.manifest, /\/releases\/latest\/download\/system\.json$/);
  assert.match(release.download, /\/releases\/download\/v0\.0\.1\/mon1e\.zip$/);
});

test("building the plan does not mutate the source manifest", () => {
  const manifest = sourceManifest();
  buildPackagePlan(manifest, CANDIDATES);
  assert.deepEqual(manifest, sourceManifest());
});

test("checksums use sha256sum format", () => {
  assert.equal(formatChecksums([{ name: "a.zip", hash: "ab" }]), "ab  a.zip\n");
});

/**
 * A valid package description; override pieces per test.
 * @param {{ entries?: string[], files?: Record<string, string>, checksums?: string | undefined, version?: string }} [overrides]
 * @returns {Parameters<typeof verifyPackage>[0]}
 */
function pkg(overrides = {}) {
  const release = JSON.stringify(buildReleaseManifest(sourceManifest()));
  /** @type {Record<string, string>} */
  const files = {
    "system.json": release,
    "src/main.mjs": 'import { a } from "./constants.mjs";\n',
    "src/constants.mjs": "export const a = 1;\n",
    "styles/mon1e.css": "",
    "lang/en.json": "{}",
    ...overrides.files,
  };
  return {
    entries: overrides.entries ?? Object.keys(files),
    readText: (name) => files[name],
    distManifestText: release,
    packageVersion: overrides.version ?? "0.0.1",
    checksums: "checksums" in overrides ? overrides.checksums : "aa  mon1e.zip\nbb  system.json\n",
    actualHashes: { "mon1e.zip": "aa", "system.json": "bb" },
  };
}

test("a complete package passes", () => {
  assert.deepEqual(verifyPackage(pkg()), []);
});

test("fails when system.json is not at the ZIP root", () => {
  const info = pkg({ entries: ["mon1e/system.json", "src/main.mjs"] });
  assert.match(verifyPackage(info).join("\n"), /not at the ZIP root/);
});

test("fails when a required manifest file is missing", () => {
  const info = pkg({ entries: ["system.json", "src/constants.mjs", "styles/mon1e.css", "lang/en.json"] });
  assert.match(verifyPackage(info).join("\n"), /file not found: src\/main\.mjs/);
});

test("fails when an imported module is missing", () => {
  const info = pkg({ entries: ["system.json", "src/main.mjs", "styles/mon1e.css", "lang/en.json"] });
  assert.match(verifyPackage(info).join("\n"), /src\/main\.mjs imports \.\/constants\.mjs/);
});

test("fails on forbidden entries", () => {
  for (const extra of ["tests/a.test.mjs", "node_modules/x/index.js", "package.json", "docs/a.md", "src/.DS_Store"]) {
    const info = pkg({ files: { [extra]: "" } });
    assert.notDeepEqual(verifyPackage(info), [], extra);
  }
});

test("fails when the ZIP manifest differs from dist/system.json", () => {
  const info = pkg();
  info.distManifestText = JSON.stringify({ ...buildReleaseManifest(sourceManifest()), title: "Other" });
  assert.match(verifyPackage(info).join("\n"), /differs from dist\/system\.json/);
});

test("fails on checksum mismatch or missing SHA256SUMS", () => {
  assert.match(verifyPackage(pkg({ checksums: "zz  mon1e.zip\nbb  system.json\n" })).join("\n"), /mismatch for mon1e\.zip/);
  assert.match(verifyPackage(pkg({ checksums: undefined })).join("\n"), /SHA256SUMS is missing/);
});

test("fails when package.json version differs", () => {
  assert.match(verifyPackage(pkg({ version: "9.9.9" })).join("\n"), /does not match package\.json/);
});
