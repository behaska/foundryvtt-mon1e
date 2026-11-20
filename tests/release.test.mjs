import { test } from "node:test";
import assert from "node:assert/strict";
import { checkReleaseVersion } from "../scripts/check-release.mjs";

/** @param {Record<string, any>} [over] */
const check = (over = {}) =>
  checkReleaseVersion({
    input: "0.1.0",
    packageVersion: "0.1.0",
    manifestVersion: "0.1.0",
    existingTags: [],
    existingReleases: [],
    ...over,
  });

test("accepts a version matching package.json and system.json with no tag or release", () => {
  assert.deepEqual(check(), []);
});

test("ignores unrelated tags and releases", () => {
  assert.deepEqual(check({ existingTags: ["v0.0.9"], existingReleases: ["v0.0.9"] }), []);
});

test("rejects a v-prefixed input", () => {
  assert.equal(check({ input: "v0.1.0" }).length > 0, true);
});

test("rejects a non-semver input", () => {
  assert.equal(check({ input: "1.0", packageVersion: "1.0", manifestVersion: "1.0" }).length > 0, true);
});

test("rejects a mismatch with package.json", () => {
  const errors = check({ packageVersion: "0.2.0" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /package\.json/);
});

test("rejects a mismatch with system.json", () => {
  const errors = check({ manifestVersion: "0.2.0" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /system\.json/);
});

test("rejects an existing tag", () => {
  const errors = check({ existingTags: ["v0.1.0"] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /tag v0\.1\.0 already exists/);
});

test("rejects an existing release, including a draft", () => {
  const errors = check({ existingReleases: ["v0.1.0"] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /release v0\.1\.0 already exists/);
});

test("collects several errors at once", () => {
  const errors = check({ packageVersion: "9.9.9", manifestVersion: "8.8.8", existingTags: ["v0.1.0"], existingReleases: ["v0.1.0"] });
  assert.equal(errors.length, 4);
});

test("does not mutate its inputs", () => {
  const existingTags = ["v0.1.0"];
  check({ existingTags });
  assert.deepEqual(existingTags, ["v0.1.0"]);
});
