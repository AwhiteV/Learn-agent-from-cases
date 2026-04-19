# Chapters 05-06 Real Chat Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade chapters `05-memory-and-skills` and `06-remote-and-multi-provider` to use real model-backed chat, session persistence, root `.env.local` loading, and the same three-column workspace style as chapters `01-04`.

**Architecture:** Reuse the proven session storage, SSE streaming, and root-env-loading patterns from earlier chapters, then layer chapter-specific right-rail teaching panels on top. Chapter 05 injects selected skills and memories into real model requests; chapter 06 routes one chat contract through provider implementations that preserve chapter-specific execution metadata while still producing real model output.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, `@anthropic-ai/claude-agent-sdk`, JSONL session storage, Node filesystem APIs, pnpm test/lint/build.

---

## File Structure

- Modify: `05-memory-and-skills/package.json`
- Delete: `05-memory-and-skills/.env.local.example`
- Create: `05-memory-and-skills/app/api/sessions/route.ts`
- Create: `05-memory-and-skills/app/api/sessions/[id]/route.ts`
- Create: `05-memory-and-skills/components/session-list.tsx`
- Create: `05-memory-and-skills/lib/model-config.ts`
- Create: `05-memory-and-skills/lib/storage/config.ts`
- Create: `05-memory-and-skills/lib/storage/index.ts`
- Create: `05-memory-and-skills/lib/storage/session.ts`
- Modify: `05-memory-and-skills/app/api/chat/route.ts`
- Modify: `05-memory-and-skills/components/chat-interface.tsx`
- Modify: `05-memory-and-skills/lib/types.ts`
- Modify: `05-memory-and-skills/lib/learning-assistant-script.ts`
- Create: `05-memory-and-skills/tests/model-config.test.ts`
- Create: `05-memory-and-skills/tests/session-api.test.ts`
- Modify: `05-memory-and-skills/tests/learning-assistant-script.test.ts`
- Modify: `05-memory-and-skills/README.md`
- Modify: `05-memory-and-skills/AGENTS.md`

- Modify: `06-remote-and-multi-provider/package.json`
- Delete: `06-remote-and-multi-provider/.env.local.example`
- Create: `06-remote-and-multi-provider/app/api/sessions/route.ts`
- Create: `06-remote-and-multi-provider/app/api/sessions/[id]/route.ts`
- Create: `06-remote-and-multi-provider/components/session-list.tsx`
- Create: `06-remote-and-multi-provider/lib/model-config.ts`
- Create: `06-remote-and-multi-provider/lib/storage/config.ts`
- Create: `06-remote-and-multi-provider/lib/storage/index.ts`
- Create: `06-remote-and-multi-provider/lib/storage/session.ts`
- Modify: `06-remote-and-multi-provider/app/api/chat/route.ts`
- Modify: `06-remote-and-multi-provider/components/chat-console.tsx`
- Modify: `06-remote-and-multi-provider/lib/providers/base.ts`
- Modify: `06-remote-and-multi-provider/lib/providers/local-agent.ts`
- Modify: `06-remote-and-multi-provider/lib/providers/mock-remote.ts`
- Modify: `06-remote-and-multi-provider/lib/types.ts`
- Modify: `06-remote-and-multi-provider/lib/learning-assistant-script.ts`
- Create: `06-remote-and-multi-provider/tests/model-config.test.ts`
- Create: `06-remote-and-multi-provider/tests/session-api.test.ts`
- Modify: `06-remote-and-multi-provider/tests/providers.test.ts`
- Modify: `06-remote-and-multi-provider/tests/chat-route.test.ts`
- Modify: `06-remote-and-multi-provider/tests/learning-assistant-script.test.ts`
- Modify: `06-remote-and-multi-provider/README.md`
- Modify: `06-remote-and-multi-provider/AGENTS.md`

- Modify: `README.md`
- Modify: `AGENTS.md`

### Task 1: Chapter 05 Model Config and Session Infrastructure

**Files:**
- Create: `05-memory-and-skills/lib/model-config.ts`
- Create: `05-memory-and-skills/lib/storage/config.ts`
- Create: `05-memory-and-skills/lib/storage/index.ts`
- Create: `05-memory-and-skills/lib/storage/session.ts`
- Create: `05-memory-and-skills/app/api/sessions/route.ts`
- Create: `05-memory-and-skills/app/api/sessions/[id]/route.ts`
- Create: `05-memory-and-skills/tests/model-config.test.ts`
- Create: `05-memory-and-skills/tests/session-api.test.ts`
- Modify: `05-memory-and-skills/package.json`

- [ ] **Step 1: Write the failing tests for model config and session list/detail routes**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_MODEL, getConfiguredModel } from "../lib/model-config.ts";

test("getConfiguredModel falls back when env is missing", () => {
  assert.equal(getConfiguredModel(undefined), DEFAULT_MODEL);
  assert.equal(getConfiguredModel(""), DEFAULT_MODEL);
  assert.equal(getConfiguredModel("   "), DEFAULT_MODEL);
});

test("getConfiguredModel returns trimmed env value", () => {
  assert.equal(getConfiguredModel(" claude-sonnet-4-6 "), "claude-sonnet-4-6");
});
```

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { GET as listSessions } from "../app/api/sessions/route";

test("sessions route returns a JSON payload with sessions array", async () => {
  const response = await listSessions(new Request("http://localhost/api/sessions"));
  assert.equal(response.status, 200);
  const payload = (await response.json()) as { sessions: unknown[] };
  assert.ok(Array.isArray(payload.sessions));
});
```

- [ ] **Step 2: Run the focused tests and verify they fail for the expected reason**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills && corepack pnpm test tests/model-config.test.ts tests/session-api.test.ts`

Expected: FAIL with module-not-found or missing export errors for `lib/model-config.ts` and `/api/sessions`.

- [ ] **Step 3: Implement the model helper and filesystem-backed session storage**

```ts
export const DEFAULT_MODEL = "claude-sonnet-4-6";

export function getConfiguredModel(envValue: string | undefined): string {
  const trimmedValue = envValue?.trim();
  return trimmedValue ? trimmedValue : DEFAULT_MODEL;
}
```

```ts
export function getDefaultPaths(projectRoot: string) {
  const dataDir = path.join(projectRoot, ".data");
  return {
    dataDir,
    configPath: path.join(dataDir, "config.json"),
    sessionsDir: path.join(dataDir, "sessions"),
  };
}
```

```ts
export async function GET() {
  const storage = getStorage(process.cwd());
  await storage.initialize();
  const sessions = await storage.listSessions();

  return new Response(JSON.stringify({ sessions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

- [ ] **Step 4: Run the focused tests again and verify they pass**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills && corepack pnpm test tests/model-config.test.ts tests/session-api.test.ts`

Expected: PASS with both test files green.

- [ ] **Step 5: Commit the infrastructure slice**

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 05-memory-and-skills/package.json \
  05-memory-and-skills/lib/model-config.ts \
  05-memory-and-skills/lib/storage/config.ts \
  05-memory-and-skills/lib/storage/index.ts \
  05-memory-and-skills/lib/storage/session.ts \
  05-memory-and-skills/app/api/sessions/route.ts \
  05-memory-and-skills/app/api/sessions/[id]/route.ts \
  05-memory-and-skills/tests/model-config.test.ts \
  05-memory-and-skills/tests/session-api.test.ts
git commit -m "feat: 为05章节补齐会话与模型配置基础设施"
```

### Task 2: Chapter 05 Real Chat Route and Unified Three-Column UI

**Files:**
- Modify: `05-memory-and-skills/app/api/chat/route.ts`
- Modify: `05-memory-and-skills/components/chat-interface.tsx`
- Create: `05-memory-and-skills/components/session-list.tsx`
- Modify: `05-memory-and-skills/lib/types.ts`
- Modify: `05-memory-and-skills/lib/learning-assistant-script.ts`
- Modify: `05-memory-and-skills/tests/learning-assistant-script.test.ts`

- [ ] **Step 1: Write a failing test for the updated request shape and learning targets**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { learningScript } from "../lib/learning-assistant-script.ts";

test("chapter 05 exposes session-list and prompt-preview learning targets", () => {
  const targetIds = learningScript.steps.map((step) => step.targetId).filter(Boolean);
  assert.ok(targetIds.includes("session-list"));
  assert.ok(targetIds.includes("prompt-preview"));
});
```

```ts
test("chat request body supports sessionId alongside skill and memory selectors", () => {
  const body = {
    message: "Explain generics",
    sessionId: "session-123",
    selectedSkillId: "teacher",
    memoryIds: ["memory-1"],
  };

  assert.equal(body.sessionId, "session-123");
});
```

- [ ] **Step 2: Run the targeted tests and verify they fail**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills && corepack pnpm test tests/learning-assistant-script.test.ts`

Expected: FAIL because `session-list` and `prompt-preview` targets are not yet exposed by the chapter 05 workbench.

- [ ] **Step 3: Replace the local teaching reply route with real SSE chat and rebuild the UI around session history**

```ts
let rootEnvLoaded = false;

function ensureRootEnvLoaded() {
  if (rootEnvLoaded) return;
  process.loadEnvFile(path.resolve(process.cwd(), "../.env.local"));
  rootEnvLoaded = true;
}
```

```ts
const systemPrompt = [
  "You are the chapter 05 learning assistant.",
  `Active skill: ${selectedSkill.name}`,
  selectedSkill.systemPrompt,
  selectedMemories.length > 0 ? buildMemoryContext(selectedMemories) : "No injected memories.",
].join("\n\n");
```

```tsx
<div className="flex h-screen overflow-hidden">
  <SessionList
    currentSessionId={sessionId}
    onNewChat={handleNewChat}
    onSessionSelect={loadSession}
    refreshTrigger={refreshTrigger}
  />
  <div className="flex flex-1 flex-col overflow-hidden">
    <header className="shrink-0 border-b bg-background px-6 py-4">
      <h1 className="text-2xl font-semibold">05 Memory and Skills</h1>
      {sessionId ? <p className="text-sm text-muted-foreground">Session: {sessionId}</p> : null}
    </header>
    <main className="grid flex-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-h-0 flex-col">{/* transcript + composer */}</section>
      <aside className="min-h-0 overflow-y-auto border-l">{/* memory/skill/prompt */}</aside>
    </main>
  </div>
</div>
```

- [ ] **Step 4: Run the chapter 05 test suite and verify the new route/UI contract is green**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills && corepack pnpm test`

Expected: PASS including model config, memory store, session API, and learning assistant contract tests.

- [ ] **Step 5: Commit the chapter 05 behavior slice**

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 05-memory-and-skills/app/api/chat/route.ts \
  05-memory-and-skills/components/chat-interface.tsx \
  05-memory-and-skills/components/session-list.tsx \
  05-memory-and-skills/lib/types.ts \
  05-memory-and-skills/lib/learning-assistant-script.ts \
  05-memory-and-skills/tests/learning-assistant-script.test.ts
git commit -m "feat: 将05章节升级为真实流式聊天工作台"
```

### Task 3: Chapter 06 Model Config, Session Infrastructure, and Real Provider Routing

**Files:**
- Create: `06-remote-and-multi-provider/lib/model-config.ts`
- Create: `06-remote-and-multi-provider/lib/storage/config.ts`
- Create: `06-remote-and-multi-provider/lib/storage/index.ts`
- Create: `06-remote-and-multi-provider/lib/storage/session.ts`
- Create: `06-remote-and-multi-provider/app/api/sessions/route.ts`
- Create: `06-remote-and-multi-provider/app/api/sessions/[id]/route.ts`
- Modify: `06-remote-and-multi-provider/app/api/chat/route.ts`
- Modify: `06-remote-and-multi-provider/lib/providers/base.ts`
- Modify: `06-remote-and-multi-provider/lib/providers/local-agent.ts`
- Modify: `06-remote-and-multi-provider/lib/providers/mock-remote.ts`
- Modify: `06-remote-and-multi-provider/tests/providers.test.ts`
- Modify: `06-remote-and-multi-provider/tests/chat-route.test.ts`
- Create: `06-remote-and-multi-provider/tests/model-config.test.ts`
- Create: `06-remote-and-multi-provider/tests/session-api.test.ts`

- [ ] **Step 1: Write failing tests for model config and provider metadata on real chat responses**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_MODEL, getConfiguredModel } from "../lib/model-config.ts";

test("chapter 06 model config trims and falls back", () => {
  assert.equal(getConfiguredModel(undefined), DEFAULT_MODEL);
  assert.equal(getConfiguredModel(" claude-sonnet-4-6 "), "claude-sonnet-4-6");
});
```

```ts
test("provider summaries keep executionMode metadata", async () => {
  const response = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        providerId: "mock-remote",
        message: "Summarize this week",
      }),
    }),
  );

  assert.equal(response.headers.get("content-type"), "text/event-stream");
});
```

- [ ] **Step 2: Run the chapter 06 focused tests and verify they fail first**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider && corepack pnpm test tests/model-config.test.ts tests/chat-route.test.ts tests/providers.test.ts`

Expected: FAIL because model-config and streaming provider route behavior do not exist yet.

- [ ] **Step 3: Implement shared storage plus provider-backed real SSE chat**

```ts
export abstract class BaseProvider {
  abstract readonly id: string;
  abstract readonly executionMode: "local" | "remote";

  buildSystemPrompt(message: string): string {
    return `Provider ${this.id} (${this.executionMode}) is handling: ${message}`;
  }
}
```

```ts
const provider = getProviderById(payload.providerId);
const systemPrompt = provider.buildSystemPrompt(trimmedMessage);
const result = query({
  prompt: trimmedMessage,
  options: {
    resume: sessionId,
    systemPrompt,
    includePartialMessages: true,
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
  },
});
```

```ts
const resultData = JSON.stringify({
  type: "result",
  data: {
    sessionId: finalSessionId,
    provider: provider.toSummary(),
    durationMs: sdkMessage.duration_ms,
    numTurns: sdkMessage.num_turns,
  },
});
```

- [ ] **Step 4: Run the chapter 06 test suite and verify it passes**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider && corepack pnpm test`

Expected: PASS including provider, chat-route, model-config, session-api, and learning assistant tests.

- [ ] **Step 5: Commit the chapter 06 backend slice**

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 06-remote-and-multi-provider/lib/model-config.ts \
  06-remote-and-multi-provider/lib/storage/config.ts \
  06-remote-and-multi-provider/lib/storage/index.ts \
  06-remote-and-multi-provider/lib/storage/session.ts \
  06-remote-and-multi-provider/app/api/sessions/route.ts \
  06-remote-and-multi-provider/app/api/sessions/[id]/route.ts \
  06-remote-and-multi-provider/app/api/chat/route.ts \
  06-remote-and-multi-provider/lib/providers/base.ts \
  06-remote-and-multi-provider/lib/providers/local-agent.ts \
  06-remote-and-multi-provider/lib/providers/mock-remote.ts \
  06-remote-and-multi-provider/tests/providers.test.ts \
  06-remote-and-multi-provider/tests/chat-route.test.ts \
  06-remote-and-multi-provider/tests/model-config.test.ts \
  06-remote-and-multi-provider/tests/session-api.test.ts
git commit -m "feat: 将06章节接入真实provider聊天链路"
```

### Task 4: Chapter 06 Unified UI, Docs, and Final Verification

**Files:**
- Modify: `06-remote-and-multi-provider/components/chat-console.tsx`
- Create: `06-remote-and-multi-provider/components/session-list.tsx`
- Modify: `06-remote-and-multi-provider/lib/types.ts`
- Modify: `06-remote-and-multi-provider/lib/learning-assistant-script.ts`
- Modify: `06-remote-and-multi-provider/tests/learning-assistant-script.test.ts`
- Modify: `06-remote-and-multi-provider/README.md`
- Modify: `06-remote-and-multi-provider/AGENTS.md`
- Modify: `05-memory-and-skills/README.md`
- Modify: `05-memory-and-skills/AGENTS.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Delete: `05-memory-and-skills/.env.local.example`
- Delete: `06-remote-and-multi-provider/.env.local.example`

- [ ] **Step 1: Write failing assertions for unified UI targets and root-env documentation**

```ts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("chapter 06 workbench exposes session-list target", () => {
  const file = fs.readFileSync(
    path.join(process.cwd(), "components", "chat-console.tsx"),
    "utf8",
  );
  assert.match(file, /data-learning-target="session-list"/);
});
```

```ts
test("chapter 06 README points learners to the repository root env file", () => {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  assert.match(readme, /根目录的 \.env\.local/);
});
```

- [ ] **Step 2: Run the relevant tests and verify they fail before the UI/doc updates**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider && corepack pnpm test tests/learning-assistant-script.test.ts tests/ui-copy.test.ts`

Expected: FAIL because the unified session rail target and updated copy are not yet present.

- [ ] **Step 3: Rebuild the chapter 06 page into the same three-column shell and synchronize docs**

```tsx
<div className="flex h-screen overflow-hidden">
  <SessionList
    currentSessionId={sessionId}
    onNewChat={handleNewChat}
    onSessionSelect={loadSession}
    refreshTrigger={refreshTrigger}
  />
  <div className="flex flex-1 flex-col overflow-hidden">
    <header className="shrink-0 border-b bg-background px-6 py-4">
      <h1 className="text-2xl font-semibold">06 Remote and Multi-Provider</h1>
      {sessionId ? <p className="text-sm text-muted-foreground">Session: {sessionId}</p> : null}
    </header>
    <main className="grid flex-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-h-0 flex-col">{/* transcript */}</section>
      <aside className="min-h-0 overflow-y-auto border-l">{/* provider tools */}</aside>
    </main>
  </div>
</div>
```

```md
`05-06` 章节现在默认复用仓库根目录 `.env.local`，并且都使用和 `01-04` 一致的真实聊天 + session 持续对话工作台。
```

- [ ] **Step 4: Run lint, build, and both chapter test suites as final verification**

Run: `cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills && corepack pnpm lint && corepack pnpm build && corepack pnpm test`

Expected: PASS with zero lint errors, successful build, and all tests green.

Run: `cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider && corepack pnpm lint && corepack pnpm build && corepack pnpm test`

Expected: PASS with zero lint errors, successful build, and all tests green.

- [ ] **Step 5: Commit the UI/documentation slice**

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 05-memory-and-skills/README.md \
  05-memory-and-skills/AGENTS.md \
  06-remote-and-multi-provider/components/chat-console.tsx \
  06-remote-and-multi-provider/components/session-list.tsx \
  06-remote-and-multi-provider/lib/types.ts \
  06-remote-and-multi-provider/lib/learning-assistant-script.ts \
  06-remote-and-multi-provider/tests/learning-assistant-script.test.ts \
  06-remote-and-multi-provider/README.md \
  06-remote-and-multi-provider/AGENTS.md \
  README.md \
  AGENTS.md
git commit -m "docs: 同步05-06章节真实聊天与统一工作台说明"
```

## Self-Review

- Spec coverage check:
  - Real chat in chapter 05: covered by Task 2.
  - Real provider-backed chat in chapter 06: covered by Task 3.
  - Three-column UI unification: covered by Task 2 and Task 4.
  - Root `.env.local` reuse and model config: covered by Task 1, Task 3, and Task 4.
  - Session persistence and resume behavior: covered by Task 1 and Task 3.
  - README / AGENTS / learning assistant sync: covered by Task 4.
- Placeholder scan:
  - No `TODO`, `TBD`, or “implement later” placeholders remain.
  - Each task includes explicit files, commands, and concrete code anchors.
- Type consistency:
  - `sessionId`, `selectedSkillId`, `memoryIds`, `providerId`, `executionMode`, and `provider` metadata names are used consistently across tasks.
