import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SCAR_KEYS, DISORDER_KEYS, defaultDisorderLines } from "../src/rules/scars.mjs";

test("scar keys in printed order", () => {
  assert.deepEqual(SCAR_KEYS, ["roadScars", "driveScars", "groupScars"]);
});

test("disorder keys in printed order", () => {
  assert.deepEqual(DISORDER_KEYS, ["roadDisorders", "driveDisorders", "groupDisorders"]);
});

test("default disorder lines are three blanks, fresh each call", () => {
  const a = defaultDisorderLines();
  assert.deepEqual(a, ["", "", ""]);
  a.push("x");
  assert.deepEqual(defaultDisorderLines(), ["", "", ""]);
});

test("scar and disorder keys have i18n labels", async () => {
  const lang = JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8"));
  for (const key of SCAR_KEYS) assert.equal(typeof lang.MON1E.Tracks[key], "string", key);
  for (const key of DISORDER_KEYS) assert.equal(typeof lang.MON1E.Disorders[key], "string", key);
  assert.equal(typeof lang.MON1E.Disorders.add, "string");
  assert.equal(typeof lang.MON1E.Disorders.line, "string");
});
