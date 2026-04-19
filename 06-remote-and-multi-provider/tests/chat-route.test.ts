import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "@/app/api/chat/route";

test("chat route returns 400 for malformed JSON", async () => {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{",
  });

  const response = await POST(request);
  const payload = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.equal(payload.error, "请求体必须是合法的 JSON。");
});

test("chat route returns 500 when anthropic api key is missing for a valid request", async () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  try {
    const request = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId: "local-agent",
        message: "Prepare a short release summary for learners.",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { error?: string };

    assert.equal(response.status, 500);
    assert.equal(payload.error, "ANTHROPIC_API_KEY not configured");
  } finally {
    if (originalApiKey) {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    }
  }
});
