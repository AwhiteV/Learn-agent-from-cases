import assert from "node:assert/strict";
import test from "node:test";

import {
  getProviderById,
  getProviderSummaries,
} from "@/lib/providers";

test("provider summaries expose both local and remote modes", () => {
  const summaries = getProviderSummaries();

  assert.equal(summaries.length, 2);
  assert.deepEqual(
    summaries.map((summary) => summary.id),
    ["local-agent", "mock-remote"],
  );
  assert.deepEqual(
    summaries.map((summary) => summary.executionMode),
    ["local", "remote"],
  );
});

test("local provider returns a unified local result", async () => {
  const provider = getProviderById("local-agent");

  assert.ok(provider);

  const result = await provider.run({
    message: "Prepare a short release summary for learners.",
  });

  assert.equal(result.providerId, "local-agent");
  assert.equal(result.providerName, "Local Agent");
  assert.equal(result.executionMode, "local");
  assert.match(result.output, /Local execution completed in-process/);
  assert.ok(result.notes.length >= 2);
});

test("mock remote provider stays honest about being a simulation", async () => {
  const provider = getProviderById("mock-remote");

  assert.ok(provider);

  const result = await provider.run({
    message: "Prepare a short release summary for learners.",
  });

  assert.equal(result.providerId, "mock-remote");
  assert.equal(result.providerName, "Mock Remote Path");
  assert.equal(result.executionMode, "remote");
  assert.match(result.output, /latency-only remote-style simulation/);
  assert.match(result.output, /same Next\.js server process/);
  assert.match(result.notes[0] ?? "", /Latency-only simulation/);
});
