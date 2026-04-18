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
  assert.equal(payload.error, "Request body must be valid JSON.");
});
