import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SYSTEM_ID, diagnosticMessage } from "../src/constants.mjs";

test("diagnosticMessage includes the system id and version", () => {
  assert.equal(diagnosticMessage("0.0.1"), "mon1e | system loaded (v0.0.1)");
});

test("diagnosticMessage falls back to a default version", () => {
  assert.equal(diagnosticMessage(), "mon1e | system loaded (vunknown)");
});

test("SYSTEM_ID matches the id in system.json", async () => {
  const manifest = JSON.parse(await readFile(new URL("../system.json", import.meta.url), "utf8"));
  assert.equal(manifest.id, SYSTEM_ID);
  assert.equal(manifest.type, "system");
  assert.deepEqual(manifest.esmodules, ["src/main.mjs"]);
});
