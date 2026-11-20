import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ATTRIBUTE_KEYS, APTITUDE_KEYS, defaultStatRows } from "../src/rules/base-stats.mjs";

test("8 base attributes in printed order", () => {
  assert.deepEqual(ATTRIBUTE_KEYS, [
    "strength", "toughness", "agility", "perception", "charisma", "resolve", "intelligence", "spirit"
  ]);
});

test("7 base aptitudes in printed order", () => {
  assert.deepEqual(APTITUDE_KEYS, [
    "closeCombat", "rangedCombat", "battle", "moonMagic", "spiritMagic", "kaonMagic", "cosmicMagic"
  ]);
});

test("keys are unique inside each list", () => {
  assert.equal(new Set(ATTRIBUTE_KEYS).size, ATTRIBUTE_KEYS.length);
  assert.equal(new Set(APTITUDE_KEYS).size, APTITUDE_KEYS.length);
});

test("default rows hold the key and value 0", () => {
  assert.deepEqual(defaultStatRows(["a", "b"]), [{ key: "a", value: 0 }, { key: "b", value: 0 }]);
});

test("default rows are independent objects", () => {
  const rows = defaultStatRows(ATTRIBUTE_KEYS);
  rows[0].value = 5;
  assert.equal(rows[1].value, 0);
  assert.equal(defaultStatRows(ATTRIBUTE_KEYS)[0].value, 0);
});

test("every base key has an i18n label and the section titles exist", async () => {
  const lang = JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8"));
  for (const key of ATTRIBUTE_KEYS) assert.equal(typeof lang.MON1E.Attributes[key], "string", key);
  for (const key of APTITUDE_KEYS) assert.equal(typeof lang.MON1E.Aptitudes[key], "string", key);
  assert.equal(typeof lang.MON1E.Character.attributes, "string");
  assert.equal(typeof lang.MON1E.Character.aptitudes, "string");
});
