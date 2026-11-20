import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DIAGRAM_NUMBER_KEYS, DIAGRAM_FLAG_KEYS } from "../src/rules/diagram.mjs";

test("diagram numbers in printed order", () => {
  assert.deepEqual(DIAGRAM_NUMBER_KEYS, ["willpower", "burden", "charge", "discord", "groupFocus"]);
});

test("diagram flags in printed order", () => {
  assert.deepEqual(DIAGRAM_FLAG_KEYS, [
    "wayward", "roadFanatic", "driveFanatic", "aimless",
    "burdened", "laden", "radical", "shaken"
  ]);
});

test("no duplicate keys across numbers and flags", () => {
  const all = [...DIAGRAM_NUMBER_KEYS, ...DIAGRAM_FLAG_KEYS];
  assert.equal(new Set(all).size, all.length);
});

test("diagram keys and group title have i18n labels", async () => {
  const lang = JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8"));
  for (const key of [...DIAGRAM_NUMBER_KEYS, "focusStatement", "groupArchetype", "diagram"]) {
    assert.equal(typeof lang.MON1E.Character[key], "string", key);
  }
  for (const key of DIAGRAM_FLAG_KEYS) assert.equal(typeof lang.MON1E.Flags[key], "string", key);
});
