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
  assert.equal(result.providerName, "本地 Agent");
  assert.equal(result.executionMode, "local");
  assert.match(result.output, /本地执行已在当前进程内完成/);
  assert.ok(result.notes.length >= 2);
});

test("mock remote provider stays honest about being a simulation", async () => {
  const provider = getProviderById("mock-remote");

  assert.ok(provider);

  const result = await provider.run({
    message: "Prepare a short release summary for learners.",
  });

  assert.equal(result.providerId, "mock-remote");
  assert.equal(result.providerName, "模拟远程路径");
  assert.equal(result.executionMode, "remote");
  assert.match(result.output, /仅延迟的远程风格模拟/);
  assert.match(result.output, /同一个 Next\.js 服务进程/);
  assert.match(result.notes[0] ?? "", /仅延迟模拟/);
});
