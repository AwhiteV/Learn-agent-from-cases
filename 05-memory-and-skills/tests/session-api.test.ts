import assert from "node:assert/strict";
import test from "node:test";

import { GET as listSessions } from "../app/api/sessions/route";

test("sessions route returns a JSON payload with sessions array", async () => {
  const response = await listSessions(new Request("http://localhost/api/sessions"));

  assert.equal(response.status, 200);

  const payload = (await response.json()) as { sessions: unknown[] };

  assert.ok(Array.isArray(payload.sessions));
});
