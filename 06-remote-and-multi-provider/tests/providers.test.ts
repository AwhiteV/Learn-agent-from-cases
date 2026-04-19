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

test("local provider exposes a real-chat system prompt contract", async () => {
  const provider = getProviderById("local-agent");

  assert.ok(provider);

  const prompt = provider.buildSystemPrompt({
    message: "Prepare a short release summary for learners.",
  });

  assert.match(prompt, /本地 Agent/);
  assert.match(prompt, /同一个 Next\.js 进程/);
});

test("mock remote provider stays honest about being a simulation", async () => {
  const provider = getProviderById("mock-remote");

  assert.ok(provider);

  const prompt = provider.buildSystemPrompt({
    message: "Prepare a short release summary for learners.",
  });

  assert.match(prompt, /模拟远程路径/);
  assert.match(prompt, /远程风格/);
  assert.match(prompt, /同一个 Next\.js 服务进程/);
});
