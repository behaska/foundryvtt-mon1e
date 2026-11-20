import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  HEALTH_STATE_KEYS, COMPOSURE_STATE_KEYS, DISPLAY_MIN_BOXES, adjustFilled, boxesToDraw
} from "../src/rules/tracks.mjs";

test("state flags in printed order", () => {
  assert.deepEqual(HEALTH_STATE_KEYS, ["unconscious", "dying", "dead"]);
  assert.deepEqual(COMPOSURE_STATE_KEYS, ["rattled", "discomfited", "humiliated"]);
});

test("adjustFilled adds and removes one box", () => {
  assert.equal(adjustFilled(2, 1), 3);
  assert.equal(adjustFilled(2, -1), 1);
});

test("adjustFilled never goes below 0", () => {
  assert.equal(adjustFilled(0, -1), 0);
});

test("adjustFilled has no upper bound", () => {
  assert.equal(adjustFilled(DISPLAY_MIN_BOXES + 10, 1), DISPLAY_MIN_BOXES + 11);
});

test("boxesToDraw never shows fewer boxes than filled or the display minimum", () => {
  assert.equal(boxesToDraw(0), DISPLAY_MIN_BOXES);
  assert.equal(boxesToDraw(DISPLAY_MIN_BOXES + 3), DISPLAY_MIN_BOXES + 3);
  assert.equal(boxesToDraw(2, 1), 2);
  assert.equal(boxesToDraw(0, 4), 4);
});

test("state flags and group titles have i18n labels", async () => {
  const lang = JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8"));
  for (const key of [...HEALTH_STATE_KEYS, ...COMPOSURE_STATE_KEYS]) {
    assert.equal(typeof lang.MON1E.Tracks[key], "string", key);
  }
  for (const key of ["increase", "decrease"]) assert.equal(typeof lang.MON1E.Tracks[key], "string", key);
  assert.equal(typeof lang.MON1E.Character.health, "string");
  assert.equal(typeof lang.MON1E.Character.composure, "string");
});
