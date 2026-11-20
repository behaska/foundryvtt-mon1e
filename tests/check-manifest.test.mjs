import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateManifest } from "../scripts/check-manifest.mjs";

/** @returns {Record<string, any>} A valid manifest, fresh on every call. */
function validManifest() {
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

/** @type {(relativePath: string) => boolean} */
const exists = () => true;
const check = (
  /** @type {any} */ manifest,
  /** @type {(relativePath: string) => boolean} */ fileExists = exists,
  packageVersion = "0.0.1",
) =>
  validateManifest(manifest, { packageVersion, fileExists });

test("a valid manifest yields no errors", () => {
  assert.deepEqual(check(validManifest()), []);
});

test("a missing esmodule file is reported with its path", () => {
  const errors = check(validManifest(), (p) => p !== "src/main.mjs");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /esmodules/);
  assert.match(errors[0], /src\/main\.mjs/);
});

test("a missing style file is reported", () => {
  const errors = check(validManifest(), (p) => p !== "styles/mon1e.css");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /styles\/mon1e\.css/);
});

test("a missing language file is reported", () => {
  const errors = check(validManifest(), (p) => p !== "lang/en.json");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /lang\/en\.json/);
});

test("a missing id is reported", () => {
  const manifest = validManifest();
  delete manifest.id;
  assert.match(check(manifest).join("\n"), /\bid\b/);
});

test("compatibility.minimum above verified is reported", () => {
  const manifest = validManifest();
  manifest.compatibility = { minimum: 15, verified: 14 };
  assert.match(check(manifest).join("\n"), /compatibility/);
});

test("compatibility.maximum below verified is reported", () => {
  const manifest = validManifest();
  manifest.compatibility = { minimum: 14, verified: 14, maximum: 13 };
  assert.match(check(manifest).join("\n"), /compatibility/);
});

test("a package.json version mismatch is reported", () => {
  const errors = check(validManifest(), exists, "0.0.2");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /version/);
});

test("parent-directory and absolute paths are rejected", () => {
  const manifest = validManifest();
  manifest.esmodules = ["../outside.mjs", "/abs.mjs"];
  const errors = check(manifest);
  assert.equal(errors.length, 2);
});

test("a language entry without lang, name or path is reported", () => {
  const manifest = validManifest();
  manifest.languages = [{ lang: "en" }];
  assert.ok(check(manifest).length >= 2);
});

test("documentTypes entries must map type ids to objects", () => {
  const manifest = validManifest();
  manifest.documentTypes = { Actor: ["character"] };
  assert.match(check(manifest).join("\n"), /documentTypes/);
});

test("the repository manifest is valid and consistent with package.json", async () => {
  const read = async (/** @type {string} */ name) =>
    JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), "utf8"));
  const manifest = await read("system.json");
  const pkg = await read("package.json");
  const { existsSync } = await import("node:fs");
  const errors = validateManifest(manifest, {
    packageVersion: pkg.version,
    fileExists: (p) => existsSync(new URL(`../${p}`, import.meta.url)),
  });
  assert.deepEqual(errors, []);
});
