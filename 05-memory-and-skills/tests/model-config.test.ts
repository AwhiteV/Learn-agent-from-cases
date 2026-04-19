import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_MODEL, getConfiguredModel } from "../lib/model-config";

test("getConfiguredModel falls back to the default model when env is missing", () => {
  assert.equal(getConfiguredModel(undefined), DEFAULT_MODEL);
  assert.equal(getConfiguredModel(""), DEFAULT_MODEL);
  assert.equal(getConfiguredModel("   "), DEFAULT_MODEL);
});

test("getConfiguredModel returns the trimmed env model when provided", () => {
  assert.equal(getConfiguredModel(" claude-sonnet-4-6 "), "claude-sonnet-4-6");
});
