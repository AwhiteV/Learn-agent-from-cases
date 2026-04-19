import assert from "node:assert/strict";
import test from "node:test";

import { parseMemoryDecision } from "../lib/memory-extraction";

test("parseMemoryDecision returns skipped when model decides not to remember", () => {
  const decision = parseMemoryDecision(
    JSON.stringify({
      shouldRemember: false,
      reason: "This turn contains only a one-off question.",
    }),
  );

  assert.equal(decision.shouldRemember, false);
  assert.equal(decision.reason, "This turn contains only a one-off question.");
});

test("parseMemoryDecision extracts a valid memory payload", () => {
  const decision = parseMemoryDecision(
    '```json\n{"shouldRemember":true,"reason":"The user stated a stable preference.","memory":{"title":"偏好具体例子","content":"解释时多用具体例子。","category":"preference"}}\n```',
  );

  assert.equal(decision.shouldRemember, true);
  assert.equal(decision.memory?.title, "偏好具体例子");
  assert.equal(decision.memory?.content, "解释时多用具体例子。");
  assert.equal(decision.memory?.category, "preference");
});

test("parseMemoryDecision falls back to skip on malformed payload", () => {
  const decision = parseMemoryDecision("not-json");

  assert.equal(decision.shouldRemember, false);
  assert.equal(typeof decision.reason, "string");
});
