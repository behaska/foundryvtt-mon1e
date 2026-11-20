import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { blankTalent, defaultTalentRows, removeRow } from "../src/rules/talents.mjs";

test("blank talent is an empty label and a zero value", () => {
  assert.deepEqual(blankTalent(), { label: "", value: 0 });
});

test("default talent rows are 14 blanks, fresh array and fresh rows each call", () => {
  const a = defaultTalentRows();
  assert.equal(a.length, 14);
  for (const row of a) assert.deepEqual(row, { label: "", value: 0 });
  a[0].label = "x";
  a.push(blankTalent());
  const b = defaultTalentRows();
  assert.equal(b.length, 14);
  assert.equal(b[0].label, "");
});

test("removeRow drops the row at the index and returns a new array", () => {
  const rows = [{ label: "a", value: 1 }, { label: "b", value: 2 }, { label: "c", value: 3 }];
  const next = removeRow(rows, 1);
  assert.deepEqual(next, [{ label: "a", value: 1 }, { label: "c", value: 3 }]);
  assert.notEqual(next, rows);
  assert.equal(rows.length, 3);
});

test("removeRow ignores bad indexes", () => {
  const rows = [{ label: "a", value: 1 }];
  for (const bad of [-1, 1, 5, 0.5, NaN, "0", undefined]) {
    assert.deepEqual(removeRow(rows, /** @type {any} */ (bad)), rows, String(bad));
  }
});

test("talent keys have i18n labels", async () => {
  const lang = JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8"));
  assert.equal(typeof lang.MON1E.Character.talents, "string");
  for (const key of ["label", "value", "add", "remove"]) assert.equal(typeof lang.MON1E.Talents[key], "string", key);
});
