import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CHARACTER_TYPE } from "../src/constants.mjs";
import { CLASS_LEVEL_ROW_COUNT, defaultClassLevelRows, emptyClassLevelRow } from "../src/rules/identity.mjs";

test("a new character starts with the 3 printed Class / Sub-Class / Level rows", () => {
  const rows = defaultClassLevelRows();
  assert.equal(rows.length, CLASS_LEVEL_ROW_COUNT);
  assert.equal(CLASS_LEVEL_ROW_COUNT, 3);
});

test("empty row is blank text and level 0", () => {
  assert.deepEqual(emptyClassLevelRow(), { class: "", subClass: "", level: 0 });
});

test("default rows are independent objects", () => {
  const rows = defaultClassLevelRows();
  rows[0].class = "x";
  assert.equal(rows[1].class, "");
});

test("row count is not a limit", () => {
  assert.equal(defaultClassLevelRows(5).length, 5);
});

test("manifest declares the character Actor type and the language file", async () => {
  const manifest = JSON.parse(await readFile(new URL("../system.json", import.meta.url), "utf8"));
  assert.ok(CHARACTER_TYPE in manifest.documentTypes.Actor);
  for (const { path } of manifest.languages) {
    const lang = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
    assert.ok(lang.TYPES.Actor[CHARACTER_TYPE]);
  }
});

test("every MON1E label key used by templates exists in lang/en.json", async () => {
  const lang = JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8"));
  const names = ["character-header", "character-tabs", "character-page1"];
  for (const name of names) {
    const tpl = await readFile(new URL(`../templates/${name}.hbs`, import.meta.url), "utf8");
    for (const [, key] of tpl.matchAll(/localize "([^"]+)"/g)) {
      const value = key.split(".").reduce((o, k) => o?.[k], lang);
      assert.equal(typeof value, "string", `missing i18n key ${key}`);
    }
  }
});
