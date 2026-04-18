# Chapter Learning Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a drawer-first, chapter-specific learning assistant to the runnable web chapters `01` through `06`, with matching documentation and validation.

**Architecture:** Keep each chapter self-contained instead of introducing a new cross-chapter package. Reuse one shared information architecture and mirrored file layout in every chapter: a chapter-local `LearningAssistant` component, a chapter-local learning script, and `data-learning-target` hooks added to the existing UI. This preserves the repository’s standalone chapter model while still giving learners a consistent experience.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript 5, Tailwind CSS 4, pnpm, local chapter docs in `README.md` and `AGENTS.md`

---

### Task 1: Lock The Rollout Boundary And Chapter Doc Contracts

**Files:**
- Create: `01-quick-start/AGENTS.md`
- Create: `02-tools-and-mcp/AGENTS.md`
- Create: `03-agent-with-permission/AGENTS.md`
- Create: `04-agent-teams/AGENTS.md`
- Modify: `05-memory-and-skills/AGENTS.md`
- Modify: `06-remote-and-multi-provider/AGENTS.md`

- [ ] **Step 1: Confirm the implementation scope stays on web chapters `01` through `06`**

Run:

```bash
find . -maxdepth 1 -type d \( -name '0[1-6]-*' \) | sort
```

Expected: the output lists `01-quick-start` through `06-remote-and-multi-provider`, which are the chapters this plan targets.

- [ ] **Step 2: Create `01-quick-start/AGENTS.md` with learning-assistant ownership notes**

Add this file:

```md
# AGENTS.md

This file provides guidance for working inside `01-quick-start`.

## Project Purpose

This chapter is the learner's first runnable web agent for understanding streaming output, session persistence, resume behavior, and workspace awareness.

## Key Files

- `app/page.tsx`: chapter entry page
- `components/chat-interface.tsx`: three-column learning surface
- `components/session-list.tsx`: session history and new chat actions
- `components/file-explorer.tsx`: workspace browser
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content

## Documentation Sync Expectations

- Any UI change in this chapter must keep `README.md` and `AGENTS.md` aligned.
- If you add or rename learning steps, targets, or highlighted regions, update both this file and the README.
- Keep the learning assistant aligned with the actual visible UI. Do not describe targets that are not on the page.
```

- [ ] **Step 3: Create `02-tools-and-mcp/AGENTS.md` with tool-activity guidance**

Add this file:

```md
# AGENTS.md

This file provides guidance for working inside `02-tools-and-mcp`.

## Project Purpose

This chapter teaches how an agent becomes actionable through tools, MCP-style integration, and visible tool lifecycle events.

## Key Files

- `app/page.tsx`: chapter entry page
- `components/chat-interface.tsx`: main learning surface
- `components/tool-activity-list.tsx`: visible tool lifecycle panel
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content

## Documentation Sync Expectations

- Keep `README.md`, `AGENTS.md`, and the learning assistant script in sync.
- If tool activity regions or labels change, update the learning targets and docs in the same task.
```

- [ ] **Step 4: Create `03-agent-with-permission/AGENTS.md` with approval-flow guidance**

Add this file:

```md
# AGENTS.md

This file provides guidance for working inside `03-agent-with-permission`.

## Project Purpose

This chapter teaches permission-gated agent behavior, approval decisions, and structured user input through `AskUserQuestion`.

## Key Files

- `app/page.tsx`: chapter entry page
- `components/chat-interface.tsx`: main learning surface
- `components/permission-selector.tsx`: approval and question UI
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content

## Documentation Sync Expectations

- Keep `README.md`, `AGENTS.md`, and the learning assistant script in sync.
- If approval actions, copy, or question handling change, update the guide steps at the same time.
```

- [ ] **Step 5: Create `04-agent-teams/AGENTS.md` with teammate-flow guidance**

Add this file:

```md
# AGENTS.md

This file provides guidance for working inside `04-agent-teams`.

## Project Purpose

This chapter teaches orchestrator/subagent collaboration, task decomposition, and team-state observability.

## Key Files

- `app/page.tsx`: chapter entry page
- `components/chat-interface.tsx`: main learning surface
- `components/agent-team-view.tsx`: teammate state panel
- `components/agent-task-list.tsx`: task lifecycle display
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content

## Documentation Sync Expectations

- Keep `README.md`, `AGENTS.md`, and the learning assistant script in sync.
- If teammate or task UI changes, update the learning targets and chapter docs in the same task.
```

- [ ] **Step 6: Extend `05-memory-and-skills/AGENTS.md` and `06-remote-and-multi-provider/AGENTS.md`**

Apply this patch:

```diff
*** Begin Patch
*** Update File: 05-memory-and-skills/AGENTS.md
@@
- `components/chat-interface.tsx`: main teaching workbench that combines all panels
+ `components/chat-interface.tsx`: main teaching workbench that combines all panels
+ `components/learning-assistant.tsx`: in-page drawer and floating hint shell
+ `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
@@
- Any code change in this chapter must keep `05-memory-and-skills/AGENTS.md`
+ Any code change in this chapter must keep `05-memory-and-skills/AGENTS.md`
   and `05-memory-and-skills/README.md` in sync.
+ If memory targets, skill targets, or learning steps change, update the script and docs in the same task.
*** Update File: 06-remote-and-multi-provider/AGENTS.md
@@
- `components/chat-console.tsx`: main teaching workbench and transcript
+ `components/chat-console.tsx`: main teaching workbench and transcript
+ `components/learning-assistant.tsx`: in-page drawer and floating hint shell
+ `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
@@
- Any code change in this chapter must keep
+ Any code change in this chapter must keep
   `06-remote-and-multi-provider/AGENTS.md` and
   `06-remote-and-multi-provider/README.md` in sync.
+ If provider targets, execution labels, or learning steps change, update the script and docs in the same task.
*** End Patch
```

- [ ] **Step 7: Verify the chapter docs exist and mention the new assistant**

Run:

```bash
for f in 01-quick-start/AGENTS.md 02-tools-and-mcp/AGENTS.md 03-agent-with-permission/AGENTS.md 04-agent-teams/AGENTS.md 05-memory-and-skills/AGENTS.md 06-remote-and-multi-provider/AGENTS.md; do
  echo "CHECK $f"
  rg -n "learning-assistant|LearningAssistant|学习助手" "$f"
done
```

Expected: all six chapter AGENTS files contain learning-assistant references.

- [ ] **Step 8: Commit the chapter documentation contract**

Run:

```bash
git add 01-quick-start/AGENTS.md 02-tools-and-mcp/AGENTS.md 03-agent-with-permission/AGENTS.md 04-agent-teams/AGENTS.md 05-memory-and-skills/AGENTS.md 06-remote-and-multi-provider/AGENTS.md
git commit -m "docs: add chapter learning assistant guidance"
```

Expected: commit succeeds with chapter-specific maintenance guidance.

### Task 2: Build The Reusable Drawer Pattern In `01-quick-start`

**Files:**
- Create: `01-quick-start/components/learning-assistant.tsx`
- Create: `01-quick-start/lib/learning-assistant-script.ts`
- Modify: `01-quick-start/components/chat-interface.tsx`
- Modify: `01-quick-start/README.md`

- [ ] **Step 1: Add the chapter-local learning script contract**

Create `01-quick-start/lib/learning-assistant-script.ts` with this shape:

```ts
export interface LearningStep {
  id: string;
  title: string;
  type: "action" | "observation" | "comparison" | "term" | "checkpoint";
  targetId?: string;
  doThis: string;
  watchHere: string;
  notice: string;
  whyItMatters: string;
  termNote?: string;
}

export interface LearningScript {
  chapterId: string;
  chapterTitle: string;
  summary: string;
  steps: LearningStep[];
}

export const learningScript: LearningScript = {
  chapterId: "01-quick-start",
  chapterTitle: "Quick Start Learning Assistant",
  summary: "Follow the first message, session, and workspace loop.",
  steps: [
    {
      id: "send-first-message",
      title: "Send your first message",
      type: "action",
      targetId: "chat-input",
      doThis: "Type one short question and send it.",
      watchHere: "The center chat panel and input row.",
      notice: "The page starts a new assistant turn immediately.",
      whyItMatters: "This is the start of the active session, not just a static form post.",
      termNote: "Streaming UI shows work in progress instead of waiting for one final blob.",
    },
    {
      id: "watch-streaming",
      title: "Watch the response grow",
      type: "observation",
      targetId: "message-list",
      doThis: "Do not navigate away yet.",
      watchHere: "The assistant message body.",
      notice: "The content grows token by token and shows a live cursor.",
      whyItMatters: "Agent products surface ongoing execution instead of hiding the whole generation phase.",
    },
    {
      id: "inspect-session-list",
      title: "Look for the new session",
      type: "observation",
      targetId: "session-list",
      doThis: "Look at the left sidebar after the response completes.",
      watchHere: "The session list.",
      notice: "A new session entry appears.",
      whyItMatters: "Session persistence is visible in the UI, not hidden in memory only.",
    },
    {
      id: "start-new-session",
      title: "Compare a new session",
      type: "comparison",
      targetId: "new-chat-button",
      doThis: "Start a new chat and ask what the previous turn was.",
      watchHere: "The empty transcript and the next assistant reply.",
      notice: "The new chat does not remember the old turn.",
      whyItMatters: "A new session resets context instead of inheriting history automatically.",
    },
    {
      id: "inspect-workspace",
      title: "Inspect the workspace panel",
      type: "checkpoint",
      targetId: "file-explorer",
      doThis: "Scan the right sidebar files and folders.",
      watchHere: "The file explorer.",
      notice: "The agent UI is tied to a concrete workspace view.",
      whyItMatters: "Workspace is part of the application boundary, not a hidden implementation detail.",
      termNote: "Resume means returning to a persisted session instead of rebuilding context manually.",
    },
  ],
};
```

- [ ] **Step 2: Create the drawer-first `LearningAssistant` shell**

Create `01-quick-start/components/learning-assistant.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";

import { learningScript } from "@/lib/learning-assistant-script";

export function LearningAssistant() {
  const [isOpen, setIsOpen] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const step = useMemo(() => learningScript.steps[stepIndex], [stepIndex]);

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-40 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        学习助手
      </button>

      {isOpen ? (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {learningScript.chapterTitle}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-stone-950">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {learningScript.summary}
              </p>
            </div>
            <button
              className="rounded-full border px-3 py-1 text-sm text-stone-600"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              关闭
            </button>
          </div>

          <div className="mt-6 space-y-4 rounded-3xl border bg-stone-50 p-4 text-sm leading-6 text-stone-700">
            <p><strong>去做什么：</strong>{step.doThis}</p>
            <p><strong>看哪里：</strong>{step.watchHere}</p>
            <p><strong>你会看到什么：</strong>{step.notice}</p>
            <p><strong>这说明什么：</strong>{step.whyItMatters}</p>
            {step.termNote ? <p><strong>术语速记：</strong>{step.termNote}</p> : null}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              className="rounded-full border px-4 py-2 text-sm"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              type="button"
            >
              上一步
            </button>
            <p className="text-sm text-stone-500">
              {stepIndex + 1} / {learningScript.steps.length}
            </p>
            <button
              className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
              disabled={stepIndex === learningScript.steps.length - 1}
              onClick={() =>
                setStepIndex((current) =>
                  Math.min(learningScript.steps.length - 1, current + 1),
                )
              }
              type="button"
            >
              下一步
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
```

- [ ] **Step 3: Add learning targets and mount the shell in `chat-interface.tsx`**

Apply this patch:

```diff
*** Begin Patch
*** Update File: 01-quick-start/components/chat-interface.tsx
@@
-import { SessionList } from './session-list';
-import { FileExplorer } from './file-explorer';
-import { MarkdownRenderer } from './markdown-renderer';
+import { SessionList } from './session-list';
+import { FileExplorer } from './file-explorer';
+import { LearningAssistant } from './learning-assistant';
+import { MarkdownRenderer } from './markdown-renderer';
@@
-    <div className="flex h-screen overflow-hidden">
+    <div className="flex h-screen overflow-hidden">
+      <LearningAssistant />
@@
-        <div
+        <div
           ref={scrollRef}
-          className="flex-1 overflow-y-auto p-6"
+          className="flex-1 overflow-y-auto p-6"
+          data-learning-target="message-list"
         >
@@
-              <Input
+              <Input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Type your message..."
                 disabled={isStreaming}
                 className="flex-1"
+                data-learning-target="chat-input"
               />
*** End Patch
```

Then add these attributes manually in the same file if they are not already present:

```tsx
<div data-learning-target="session-list">
<button data-learning-target="new-chat-button">
<aside data-learning-target="file-explorer">
```

- [ ] **Step 4: Update the chapter README to mention the in-page assistant**

Add this paragraph to `01-quick-start/README.md` near the hands-on section:

```md
现在章节页面里也会带一个“学习助手”抽屉。你可以按抽屉里的步骤顺序操作，也可以把它当成运行时版的观察清单：先做动作，再对照“看哪里 / 会看到什么 / 这说明什么”来理解 session、streaming 和 workspace。
```

- [ ] **Step 5: Verify `01` builds cleanly**

Run:

```bash
cd 01-quick-start
pnpm lint
pnpm build
```

Expected: both commands pass without TypeScript or ESLint errors.

- [ ] **Step 6: Commit the baseline pattern**

Run:

```bash
git add 01-quick-start/AGENTS.md 01-quick-start/README.md 01-quick-start/components/chat-interface.tsx 01-quick-start/components/learning-assistant.tsx 01-quick-start/lib/learning-assistant-script.ts
git commit -m "feat: add learning assistant to quick start"
```

Expected: commit succeeds with the baseline drawer pattern.

### Task 3: Port The Pattern To `02`, `03`, And `04`

**Files:**
- Create: `02-tools-and-mcp/components/learning-assistant.tsx`
- Create: `02-tools-and-mcp/lib/learning-assistant-script.ts`
- Modify: `02-tools-and-mcp/components/chat-interface.tsx`
- Modify: `02-tools-and-mcp/README.md`
- Create: `03-agent-with-permission/components/learning-assistant.tsx`
- Create: `03-agent-with-permission/lib/learning-assistant-script.ts`
- Modify: `03-agent-with-permission/components/chat-interface.tsx`
- Modify: `03-agent-with-permission/README.md`
- Create: `04-agent-teams/components/learning-assistant.tsx`
- Create: `04-agent-teams/lib/learning-assistant-script.ts`
- Modify: `04-agent-teams/components/chat-interface.tsx`
- Modify: `04-agent-teams/README.md`

- [ ] **Step 1: Copy the `01` shell into `02`, `03`, and `04`**

Run:

```bash
cp 01-quick-start/components/learning-assistant.tsx 02-tools-and-mcp/components/learning-assistant.tsx
cp 01-quick-start/components/learning-assistant.tsx 03-agent-with-permission/components/learning-assistant.tsx
cp 01-quick-start/components/learning-assistant.tsx 04-agent-teams/components/learning-assistant.tsx
```

Expected: the three new files exist and can now be customized.

- [ ] **Step 2: Create `02` script content around tools and MCP**

Create `02-tools-and-mcp/lib/learning-assistant-script.ts` with five steps whose `targetId` values include:

```ts
"chat-input"
"tool-activity-list"
"message-list"
"session-list"
```

Use these exact titles:

```ts
"Ask for real repo inspection"
"Watch the tool activity panel"
"Match tool events to the final answer"
"Compare visible actions with plain chat"
"Remember what MCP changes"
```

- [ ] **Step 3: Create `03` script content around approval and `AskUserQuestion`**

Create `03-agent-with-permission/lib/learning-assistant-script.ts` with five steps whose `targetId` values include:

```ts
"chat-input"
"permission-panel"
"message-list"
"ask-user-question-form"
```

Use these exact titles:

```ts
"Trigger a permission request"
"Deny once on purpose"
"Repeat and allow"
"Watch the behavior branch"
"Answer an AskUserQuestion form"
```

- [ ] **Step 4: Create `04` script content around teams and task decomposition**

Create `04-agent-teams/lib/learning-assistant-script.ts` with five steps whose `targetId` values include:

```ts
"chat-input"
"agent-team-view"
"agent-task-list"
"message-list"
```

Use these exact titles:

```ts
"Submit a decomposable request"
"Watch teammate activity"
"Inspect the task list"
"Check for resume and aggregation"
"Judge the final synthesis"
```

- [ ] **Step 5: Mount the shell and add targets in each chapter UI**

For each of `02-tools-and-mcp/components/chat-interface.tsx`, `03-agent-with-permission/components/chat-interface.tsx`, and `04-agent-teams/components/chat-interface.tsx`:

```tsx
import { LearningAssistant } from "./learning-assistant";

<LearningAssistant />
```

Add `data-learning-target` attributes to the already-rendered regions that match each script:

```tsx
data-learning-target="chat-input"
data-learning-target="message-list"
data-learning-target="tool-activity-list"
data-learning-target="permission-panel"
data-learning-target="ask-user-question-form"
data-learning-target="agent-team-view"
data-learning-target="agent-task-list"
```

- [ ] **Step 6: Mention the drawer in each chapter README**

Add one paragraph like this to each README:

```md
页面里的“学习助手”会把这一章最值得操作和观察的路径收进一个右侧抽屉里。建议先跟着抽屉走一遍，再回头自由实验，这样最容易把页面行为和概念对应起来。
```

- [ ] **Step 7: Validate the three chapters**

Run:

```bash
for dir in 02-tools-and-mcp 03-agent-with-permission 04-agent-teams; do
  echo "VALIDATE $dir"
  (cd "$dir" && pnpm lint && pnpm build)
done
```

Expected: all three chapters pass lint and build.

- [ ] **Step 8: Commit the middle-chapter rollout**

Run:

```bash
git add 02-tools-and-mcp 03-agent-with-permission 04-agent-teams
git commit -m "feat: add guided learning assistants to tools permission and teams chapters"
```

Expected: commit succeeds with chapter-local scripts and targets.

### Task 4: Adapt The Pattern For `05` And `06`

**Files:**
- Create: `05-memory-and-skills/components/learning-assistant.tsx`
- Create: `05-memory-and-skills/lib/learning-assistant-script.ts`
- Modify: `05-memory-and-skills/components/chat-interface.tsx`
- Modify: `05-memory-and-skills/README.md`
- Create: `06-remote-and-multi-provider/components/learning-assistant.tsx`
- Create: `06-remote-and-multi-provider/lib/learning-assistant-script.ts`
- Modify: `06-remote-and-multi-provider/components/chat-console.tsx`
- Modify: `06-remote-and-multi-provider/README.md`
- Test: `05-memory-and-skills/tests/chat-engine.test.ts`
- Test: `06-remote-and-multi-provider/tests/providers.test.ts`

- [ ] **Step 1: Copy the shell into `05` and `06`**

Run:

```bash
cp 01-quick-start/components/learning-assistant.tsx 05-memory-and-skills/components/learning-assistant.tsx
cp 01-quick-start/components/learning-assistant.tsx 06-remote-and-multi-provider/components/learning-assistant.tsx
```

Expected: both files exist and are ready for chapter-specific scripts.

- [ ] **Step 2: Create the `05` memory-and-skills script**

Create `05-memory-and-skills/lib/learning-assistant-script.ts` with these exact titles:

```ts
"Create two memories"
"Inject only one memory"
"Switch the skill preset"
"Compare context combinations"
"Remove one memory and repeat"
```

Use these `targetId` values:

```ts
"memory-panel"
"skill-selector"
"chat-input"
"prompt-preview"
```

- [ ] **Step 3: Create the `06` provider-abstraction script**

Create `06-remote-and-multi-provider/lib/learning-assistant-script.ts` with these exact titles:

```ts
"Send through the default provider"
"Switch provider and repeat"
"Inspect the provider panel"
"Compare execution mode"
"Confirm the stable contract"
```

Use these `targetId` values:

```ts
"provider-switcher"
"provider-inspector"
"chat-input"
"transcript"
"request-payload"
```

- [ ] **Step 4: Mount the shell and add chapter-specific targets**

In `05-memory-and-skills/components/chat-interface.tsx`, add:

```tsx
import { LearningAssistant } from "@/components/learning-assistant";

<LearningAssistant />
```

And add:

```tsx
data-learning-target="memory-panel"
data-learning-target="skill-selector"
data-learning-target="chat-input"
data-learning-target="prompt-preview"
```

In `06-remote-and-multi-provider/components/chat-console.tsx`, add:

```tsx
import { LearningAssistant } from "@/components/learning-assistant";

<LearningAssistant />
```

And add:

```tsx
data-learning-target="provider-switcher"
data-learning-target="provider-inspector"
data-learning-target="chat-input"
data-learning-target="transcript"
data-learning-target="request-payload"
```

- [ ] **Step 5: Add one small test assertion per chapter that protects the teaching contract**

Extend `05-memory-and-skills/tests/chat-engine.test.ts` with:

```ts
test("teacher preset remains visible in the teaching response", async () => {
  const response = await generateTutorialResponse({
    message: "How should I learn TypeScript generics?",
    selectedSkillId: "teacher",
    selectedMemories: [],
  });

  assert.match(response.response, /Teacher|teacher/i);
});
```

Extend `06-remote-and-multi-provider/tests/providers.test.ts` with:

```ts
test("provider summaries keep both local and remote execution modes visible", () => {
  const summaries = getProviderSummaries();

  assert.equal(summaries.some((summary) => summary.executionMode === "local"), true);
  assert.equal(summaries.some((summary) => summary.executionMode === "remote"), true);
});
```

- [ ] **Step 6: Mention the learning assistant in both READMEs**

Add this paragraph to both chapter READMEs:

```md
章节页面里的“学习助手”会把推荐实验顺序放进右侧抽屉里。建议至少完整走一遍，因为这一章最重要的不是“看懂页面文案”，而是亲手对比一次同题不同 memory / skill，或同题不同 provider 的结果变化。
```

- [ ] **Step 7: Validate `05` and `06`**

Run:

```bash
for dir in 05-memory-and-skills 06-remote-and-multi-provider; do
  echo "VALIDATE $dir"
  (cd "$dir" && pnpm lint && pnpm test && pnpm build)
done
```

Expected: both chapters pass lint, tests, and build.

- [ ] **Step 8: Commit the final chapter integrations**

Run:

```bash
git add 05-memory-and-skills 06-remote-and-multi-provider
git commit -m "feat: add guided learning assistants to advanced tutorial chapters"
```

Expected: commit succeeds with the last two chapters integrated.

### Task 5: Finish The Repository-Wide Teaching Sync And Final Verification

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `01-quick-start/README.md`
- Modify: `02-tools-and-mcp/README.md`
- Modify: `03-agent-with-permission/README.md`
- Modify: `04-agent-teams/README.md`
- Modify: `05-memory-and-skills/README.md`
- Modify: `06-remote-and-multi-provider/README.md`

- [ ] **Step 1: Mention the new in-product learning mode in the root README**

Add this paragraph in the root study guidance:

```md
从 `01` 到 `06` 的 Web 章节现在都带有页面内“学习助手”。你可以把它理解成运行时版的观察清单：它不会替代 README，但会告诉你现在点哪里、看哪里、刚刚发生了什么，以及这说明了哪个概念。
```

- [ ] **Step 2: Add the rollout note to root `AGENTS.md`**

Append this bullet under the tutorial-maintenance sections:

```md
- 如果 `01` 到 `06` 任一 Web 章节的页面结构、关键按钮、面板命名或教学重点发生变化，必须同步检查该章节的页面内学习助手脚本、README 与对应 `AGENTS.md` 是否仍然准确。
```

- [ ] **Step 3: Run the repository-wide validation sweep**

Run:

```bash
for dir in 01-quick-start 02-tools-and-mcp 03-agent-with-permission 04-agent-teams; do
  echo "CHECK $dir"
  (cd "$dir" && pnpm lint && pnpm build)
done

for dir in 05-memory-and-skills 06-remote-and-multi-provider; do
  echo "CHECK $dir"
  (cd "$dir" && pnpm lint && pnpm test && pnpm build)
done
```

Expected: all six chapters pass their chapter-specific validation commands.

- [ ] **Step 4: Verify the docs mention the learning assistant consistently**

Run:

```bash
rg -n "学习助手|learning assistant" README.md AGENTS.md 01-quick-start/README.md 02-tools-and-mcp/README.md 03-agent-with-permission/README.md 04-agent-teams/README.md 05-memory-and-skills/README.md 06-remote-and-multi-provider/README.md
```

Expected: each relevant doc references the assistant in a way that matches the implemented behavior.

- [ ] **Step 5: Commit the repository-wide sync**

Run:

```bash
git add README.md AGENTS.md 01-quick-start/README.md 02-tools-and-mcp/README.md 03-agent-with-permission/README.md 04-agent-teams/README.md 05-memory-and-skills/README.md 06-remote-and-multi-provider/README.md
git commit -m "docs: sync tutorial guidance with in-page learning assistants"
```

Expected: commit succeeds with root and chapter docs aligned.

## Self-Review

### Spec coverage

- Shared drawer-first shell: covered by Tasks 2, 3, and 4.
- Chapter-specific walkthrough scripts: covered by Tasks 2, 3, and 4.
- `01` through `06` chapter mapping: covered by Tasks 2, 3, and 4.
- Documentation sync requirements: covered by Tasks 1 and 5.
- Validation expectations: covered by Tasks 2 through 5.

### Placeholder scan

- No `TODO`, `TBD`, or “similar to above” placeholders remain.
- All chapter files, targets, and commands are named explicitly.

### Type consistency

- The plan uses the same `learning-assistant.tsx` and `learning-assistant-script.ts` naming pattern in every chapter.
- The same `data-learning-target` convention is used across all chapters.
- Step types stay consistent with the agreed design: action, observation, comparison, term, checkpoint.

## Recommendation

Execute this plan in chapter order: build the pattern in `01`, port the same mental model to `02` through `04`, then adapt it to the more specialized surfaces in `05` and `06`.
