# Agent Tutorial Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `Learn-agent-from-cases` into a clearer beginner-to-advanced Agent SDK tutorial series by rewriting the learning narrative, improving existing chapter docs, and adding two runnable tutorial chapters for memory/skills and remote/multi-provider concepts.

**Architecture:** Keep the current numbered tutorial progression and existing Next.js project style, then add two new tutorial projects that are intentionally tutorial-scale rather than production-scale. Treat the root README and chapter READMEs as the teaching surface, and the new `05`/`06` apps as runnable learning labs that visualize the concepts they teach.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, pnpm, local JSON persistence patterns already used in this repository

---

### Task 1: Finalize Planning Docs And Root Metadata

**Files:**
- Modify: `AGENTS.md`
- Create: `docs/superpowers/plans/2026-04-18-agent-tutorial-expansion.md`
- Create: `docs/superpowers/specs/2026-04-18-agent-tutorial-expansion-design.zh-CN.md`

- [ ] **Step 1: Verify the planning docs directories and root metadata state**

Run: `find docs/superpowers -maxdepth 2 -type f | sort`
Expected: the spec files are present and the new plan file path is available.

- [ ] **Step 2: Update root AGENTS guidance to mention both specs and plans**

Use this exact patch:

```diff
*** Begin Patch
*** Update File: AGENTS.md
@@
-- **Design docs**: Architecture/spec documents for repo-wide tutorial evolution are stored under `docs/superpowers/specs/`
+- **Design docs**: Architecture/spec documents for repo-wide tutorial evolution are stored under `docs/superpowers/specs/`
+- **Implementation plans**: Execution plans for multi-step tutorial upgrades are stored under `docs/superpowers/plans/`
@@
 ### Tutorial Expansion Specs
 - `docs/superpowers/specs/` 用于存放教程体系升级、章节规划、实现设计等文档
 - 当根目录教程路线、章节结构或新增教程目录发生变化时，需要同步更新这里的设计文档或新增对应 spec
 - 如果新增章节涉及新的教学定位，需确保 spec、根 README 与根 AGENTS.md 三者描述一致
+
+### Tutorial Expansion Plans
+- `docs/superpowers/plans/` 用于存放多步骤教程升级任务的执行计划
+- 当一次改动同时涉及多个章节、根文档与新教程目录时，应先补充 plan 再开始实现
+- plan 中的目录结构、验证命令与最终落地文件应保持一致，避免执行过程中产生文档漂移
*** End Patch
```

- [ ] **Step 3: Verify the AGENTS update is reflected**

Run: `rg -n "Implementation plans|Tutorial Expansion Plans" AGENTS.md`
Expected: both new lines are found.

- [ ] **Step 4: Commit the planning-doc groundwork**

Run:

```bash
git add AGENTS.md docs/superpowers/specs/2026-04-18-agent-tutorial-expansion-design.md docs/superpowers/specs/2026-04-18-agent-tutorial-expansion-design.zh-CN.md docs/superpowers/plans/2026-04-18-agent-tutorial-expansion.md
git commit -m "docs: add tutorial expansion planning docs"
```

Expected: commit succeeds with the spec, Chinese spec, plan, and AGENTS metadata update.

### Task 2: Rewrite The Root Tutorial Narrative

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Write the failing doc checklist for the new root README**

Create this checklist locally and use it while editing:

```text
[ ] README defines the beginner audience
[ ] README shows a 00-06 learning map
[ ] README explains what each chapter builds
[ ] README maps chapters to Agent SDK concepts
[ ] README maps chapters to Proma-inspired product capabilities
[ ] README includes a practical study workflow for learners
[ ] README does not promise chapters that do not exist on disk
```

- [ ] **Step 2: Rewrite the root README to match the new learning path**

Update `README.md` so it includes:

```markdown
- A stronger “who this tutorial is for” section
- A “how to study this repo” section for beginners
- A chapter table covering `00` through `06`
- A “what you will build” description for each chapter
- Explicit references to Agent SDK concepts like sessions, tools, MCP, permissions, teams, memory, skills, and provider abstraction
- A section explaining how this series relates to Proma without claiming feature parity
```

Keep the tone Chinese-first, practical, and beginner-friendly.

- [ ] **Step 3: Verify the README references match the real directory structure**

Run: `rg -n "05-memory-and-skills|06-remote-and-multi-provider" README.md && ls -1`
Expected: the README mentions the new chapters and the directories will either already exist later in the branch or are clearly planned in the current edit sequence.

- [ ] **Step 4: Run a quick consistency check against AGENTS**

Run: `sed -n '1,260p' README.md && sed -n '1,260p' AGENTS.md`
Expected: the tutorial narrative, chapter list, and maintenance rules agree.

- [ ] **Step 5: Commit the root narrative rewrite**

Run:

```bash
git add README.md AGENTS.md
git commit -m "docs: rewrite root tutorial learning path"
```

Expected: commit succeeds with a clearer root learning map.

### Task 3: Rewrite Existing Chapter READMEs As Guided Learning Labs

**Files:**
- Modify: `00-playground-v2/README.md`
- Modify: `01-quick-start/README.md`
- Modify: `02-tools-and-mcp/README.md`
- Modify: `03-agent-with-permission/README.md`
- Modify: `04-agent-teams/README.md`

- [ ] **Step 1: Capture the required README section template**

Use this section template in each chapter README:

```markdown
## 这一章解决什么问题
## 这一章的可运行案例是什么
## 动手实践：你应该点什么 / 输入什么 / 观察什么
## 这一章对应的 Agent SDK 概念
## 这一章与 Proma 产品能力的映射
## 学完这一章后你应该掌握什么
```

- [ ] **Step 2: Rewrite `00-playground-v2/README.md`**

The rewrite must explicitly teach:

```markdown
- 为什么 session 比手动 messages 更适合 Agent 应用
- `createSession` / `resumeSession` / `prompt` 的关系
- 哪些命令实验最适合第一次接触 SDK 的学习者
```

- [ ] **Step 3: Rewrite `01-quick-start/README.md`**

The rewrite must explicitly teach:

```markdown
- workspace 与 session persistence
- streaming UI 与普通网页聊天的差别
- 进入 Web 版 Agent 应用后的推荐探索路线
```

- [ ] **Step 4: Rewrite `02-tools-and-mcp/README.md`**

The rewrite must explicitly teach:

```markdown
- 为什么 Agent 需要可执行工具
- MCP 在教程中的定位
- 工具活动可视化能帮助你看懂什么
```

- [ ] **Step 5: Rewrite `03-agent-with-permission/README.md`**

The rewrite must explicitly teach:

```markdown
- 权限系统为什么是 Agent 产品基础设施
- `canUseTool`、`PermissionMode`、`AskUserQuestion` 的新手解释
- 至少两个可操作的练习场景
```

- [ ] **Step 6: Rewrite `04-agent-teams/README.md`**

The rewrite must explicitly teach:

```markdown
- 多 Agent 什么时候值得使用
- orchestrator / subagent 的职责划分
- 新手如何观察一次任务拆解是否合理
```

- [ ] **Step 7: Run a chapter README consistency sweep**

Run:

```bash
for f in 00-playground-v2/README.md 01-quick-start/README.md 02-tools-and-mcp/README.md 03-agent-with-permission/README.md 04-agent-teams/README.md; do
  echo "CHECKING $f"
  rg -n "这一章解决什么问题|可运行案例|Proma" "$f"
done
```

Expected: each README includes the new beginner-guidance sections.

- [ ] **Step 8: Commit the chapter README rewrites**

Run:

```bash
git add 00-playground-v2/README.md 01-quick-start/README.md 02-tools-and-mcp/README.md 03-agent-with-permission/README.md 04-agent-teams/README.md
git commit -m "docs: rewrite chapter guides for progressive learning"
```

Expected: commit succeeds with the five chapter README rewrites.

### Task 4: Scaffold `05-memory-and-skills` As A Runnable Tutorial Project

**Files:**
- Create: `05-memory-and-skills/AGENTS.md`
- Create: `05-memory-and-skills/README.md`
- Create: `05-memory-and-skills/package.json`
- Create: `05-memory-and-skills/tsconfig.json`
- Create: `05-memory-and-skills/next.config.ts`
- Create: `05-memory-and-skills/postcss.config.mjs`
- Create: `05-memory-and-skills/eslint.config.mjs`
- Create: `05-memory-and-skills/components.json`
- Create: `05-memory-and-skills/.gitignore`
- Create: `05-memory-and-skills/.env.local.example`
- Create: `05-memory-and-skills/app/layout.tsx`
- Create: `05-memory-and-skills/app/page.tsx`
- Create: `05-memory-and-skills/app/globals.css`
- Create: `05-memory-and-skills/app/api/chat/route.ts`
- Create: `05-memory-and-skills/app/api/memory/route.ts`
- Create: `05-memory-and-skills/app/api/skills/route.ts`
- Create: `05-memory-and-skills/lib/memory-store.ts`
- Create: `05-memory-and-skills/lib/skill-presets.ts`
- Create: `05-memory-and-skills/lib/types.ts`
- Create: `05-memory-and-skills/components/chat-interface.tsx`
- Create: `05-memory-and-skills/components/memory-panel.tsx`
- Create: `05-memory-and-skills/components/skill-selector.tsx`

- [ ] **Step 1: Use an existing chapter as the structural reference**

Run: `find 04-agent-teams -maxdepth 2 -type f | sort`
Expected: you have a current tutorial-project template to mirror for config file shape and Next.js structure.

- [ ] **Step 2: Create the project metadata and config files**

Implement:

```text
- `package.json` with `dev`, `build`, `start`, `lint`
- Next.js / TypeScript / ESLint config aligned with the other chapters
- `.env.local.example` documenting the API key and any optional base URL
- `.gitignore` including local data storage
```

- [ ] **Step 3: Create the core teaching data model**

Define in `lib/types.ts`:

```ts
export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  category: "preference" | "project" | "goal";
  createdAt: string;
}

export interface SkillPreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface ChatRequestBody {
  message: string;
  selectedSkillId: string;
  memoryIds: string[];
}
```

- [ ] **Step 4: Implement local memory storage**

Implement `lib/memory-store.ts` with:

```ts
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MemoryEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const MEMORY_FILE = path.join(DATA_DIR, "memory.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.writeFile(MEMORY_FILE, "[]", "utf8");
  }
}

export async function listMemoryEntries(): Promise<MemoryEntry[]> {
  await ensureStore();
  const raw = await fs.readFile(MEMORY_FILE, "utf8");
  return JSON.parse(raw) as MemoryEntry[];
}
```

Then add `createMemoryEntry` and `deleteMemoryEntry` in the same file.

- [ ] **Step 5: Implement visible skill presets**

Implement `lib/skill-presets.ts` with at least three presets:

```ts
export const SKILL_PRESETS = [
  {
    id: "teacher",
    name: "Teacher",
    description: "Explain concepts step by step for beginners.",
    systemPrompt: "You are a patient teacher who explains agent development concepts with concrete examples."
  },
  {
    id: "builder",
    name: "Builder",
    description: "Focus on implementation details and practical trade-offs.",
    systemPrompt: "You are an implementation-focused agent coach who prefers practical examples and clear next steps."
  },
  {
    id: "reviewer",
    name: "Reviewer",
    description: "Highlight risks, limitations, and design flaws.",
    systemPrompt: "You are a careful reviewer who points out risks, trade-offs, and missing details."
  }
] as const;
```

- [ ] **Step 6: Implement the API routes**

Implement:

```text
- `GET/POST /api/memory` for listing and creating memory entries
- `GET /api/skills` for returning skill presets
- `POST /api/chat` for combining selected memory + selected skill into one Agent SDK prompt request
```

The chat route should clearly inject both:

```text
- a synthesized “memory context” block
- the selected skill preset system prompt
```

- [ ] **Step 7: Build the teaching UI**

Implement:

```text
- `MemoryPanel` to add/remove memory entries and select active memories
- `SkillSelector` to choose the current skill mode
- `ChatInterface` to send a message and display how the chosen memory/skill affect output
- `app/page.tsx` to compose the layout into a runnable demo
```

The page should visibly expose:

```text
- the stored memory list
- the active skill preset
- the response area
- some guided helper text for learners
```

- [ ] **Step 8: Write the chapter README and AGENTS file**

The new README must include:

```markdown
- 这一章解决什么问题
- 这一章的 runnable case 是什么
- 如何通过操作 memory 与 skill 理解差异
- 这一章与 Proma 中 memory/skills 产品方向的映射
```

The new `AGENTS.md` must describe:

```markdown
- this project’s purpose
- key files
- local data storage behavior
- required commands
- documentation sync expectations
```

- [ ] **Step 9: Run project verification**

Run:

```bash
cd 05-memory-and-skills && pnpm install
cd 05-memory-and-skills && pnpm lint
cd 05-memory-and-skills && pnpm build
```

Expected: install, lint, and build all pass.

- [ ] **Step 10: Commit the chapter**

Run:

```bash
git add 05-memory-and-skills
git commit -m "feat: add memory and skills tutorial chapter"
```

Expected: commit succeeds with a runnable new chapter.

### Task 5: Scaffold `06-remote-and-multi-provider` As A Runnable Tutorial Project

**Files:**
- Create: `06-remote-and-multi-provider/AGENTS.md`
- Create: `06-remote-and-multi-provider/README.md`
- Create: `06-remote-and-multi-provider/package.json`
- Create: `06-remote-and-multi-provider/tsconfig.json`
- Create: `06-remote-and-multi-provider/next.config.ts`
- Create: `06-remote-and-multi-provider/postcss.config.mjs`
- Create: `06-remote-and-multi-provider/eslint.config.mjs`
- Create: `06-remote-and-multi-provider/components.json`
- Create: `06-remote-and-multi-provider/.gitignore`
- Create: `06-remote-and-multi-provider/.env.local.example`
- Create: `06-remote-and-multi-provider/app/layout.tsx`
- Create: `06-remote-and-multi-provider/app/page.tsx`
- Create: `06-remote-and-multi-provider/app/globals.css`
- Create: `06-remote-and-multi-provider/app/api/chat/route.ts`
- Create: `06-remote-and-multi-provider/lib/providers/base.ts`
- Create: `06-remote-and-multi-provider/lib/providers/local-agent.ts`
- Create: `06-remote-and-multi-provider/lib/providers/mock-remote.ts`
- Create: `06-remote-and-multi-provider/lib/providers/index.ts`
- Create: `06-remote-and-multi-provider/lib/types.ts`
- Create: `06-remote-and-multi-provider/components/chat-console.tsx`
- Create: `06-remote-and-multi-provider/components/provider-switcher.tsx`
- Create: `06-remote-and-multi-provider/components/provider-inspector.tsx`

- [ ] **Step 1: Reuse the same tutorial-project shell**

Run: `find 05-memory-and-skills -maxdepth 2 -type f | sort`
Expected: the new chapter shell is available to mirror for consistency.

- [ ] **Step 2: Create the provider abstraction contracts**

Implement `lib/types.ts` and `lib/providers/base.ts` with:

```ts
export interface ProviderRequest {
  message: string;
}

export interface ProviderResult {
  providerId: string;
  providerName: string;
  executionMode: "local" | "remote";
  output: string;
  notes: string[];
}

export interface AgentProvider {
  id: string;
  name: string;
  executionMode: "local" | "remote";
  run(request: ProviderRequest): Promise<ProviderResult>;
}
```

- [ ] **Step 3: Implement two provider modes**

Implement:

```text
- `local-agent.ts` as the local Agent SDK-backed provider
- `mock-remote.ts` as a remote-style provider that simulates a remote boundary and returns metadata describing the execution style
```

The goal is teaching clarity, so the remote provider can be mock-backed if needed.

- [ ] **Step 4: Implement provider registry and route**

Implement:

```text
- `lib/providers/index.ts` to expose the available providers
- `POST /api/chat` to accept `message` + `providerId`, dispatch to the selected provider, and return a unified response payload
```

- [ ] **Step 5: Build the teaching UI**

Implement:

```text
- `ProviderSwitcher` to choose provider mode
- `ProviderInspector` to display provider metadata and execution notes
- `ChatConsole` to submit tasks and display unified results
- `app/page.tsx` to frame the chapter as a learning console
```

The page should visibly answer:

```text
- which provider is active
- whether execution is local or remote-style
- what abstraction stays constant across providers
```

- [ ] **Step 6: Write the chapter README and AGENTS file**

The README must explain:

```markdown
- 这一章解决什么问题
- remote agent 与 provider abstraction 的核心概念
- 学习者应如何切换 provider 并观察差异
- 这一章与 Proma 中 remote/provider 方向的映射
```

The `AGENTS.md` must explain the chapter’s structure, key files, and maintenance rules.

- [ ] **Step 7: Run project verification**

Run:

```bash
cd 06-remote-and-multi-provider && pnpm install
cd 06-remote-and-multi-provider && pnpm lint
cd 06-remote-and-multi-provider && pnpm build
```

Expected: install, lint, and build all pass.

- [ ] **Step 8: Commit the chapter**

Run:

```bash
git add 06-remote-and-multi-provider
git commit -m "feat: add remote and multi-provider tutorial chapter"
```

Expected: commit succeeds with a runnable new chapter.

### Task 6: Final Integration Pass

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `00-playground-v2/README.md`
- Modify: `01-quick-start/README.md`
- Modify: `02-tools-and-mcp/README.md`
- Modify: `03-agent-with-permission/README.md`
- Modify: `04-agent-teams/README.md`
- Modify: `05-memory-and-skills/README.md`
- Modify: `05-memory-and-skills/AGENTS.md`
- Modify: `06-remote-and-multi-provider/README.md`
- Modify: `06-remote-and-multi-provider/AGENTS.md`

- [ ] **Step 1: Run a global tutorial-structure check**

Run:

```bash
ls -1
find . -maxdepth 2 -name AGENTS.md -o -name README.md | sort
```

Expected: root plus all tutorial chapters expose the expected docs.

- [ ] **Step 2: Run the repo-wide link and naming sanity check**

Run:

```bash
rg -n "05-memory-and-skills|06-remote-and-multi-provider|Proma|Agent SDK" README.md 00-playground-v2/README.md 01-quick-start/README.md 02-tools-and-mcp/README.md 03-agent-with-permission/README.md 04-agent-teams/README.md 05-memory-and-skills/README.md 06-remote-and-multi-provider/README.md
```

Expected: chapter references are present and consistently named.

- [ ] **Step 3: Confirm the working tree only contains intended changes**

Run: `git status --short`
Expected: only tutorial-expansion related files appear.

- [ ] **Step 4: Create the integration commit**

Run:

```bash
git add README.md AGENTS.md 00-playground-v2/README.md 01-quick-start/README.md 02-tools-and-mcp/README.md 03-agent-with-permission/README.md 04-agent-teams/README.md 05-memory-and-skills 06-remote-and-multi-provider
git commit -m "feat: expand agent tutorial series"
```

Expected: commit succeeds with the full integrated tutorial expansion.

- [ ] **Step 5: Prepare the user-facing summary**

Summarize:

```text
- how the learning path changed
- what each new runnable chapter teaches
- what verification was run
- any deliberate simplifications kept for beginner friendliness
```

## Self-Review

### Spec coverage

This plan covers:

- root README and AGENTS narrative updates
- all existing chapter README rewrites
- two new runnable tutorial chapters
- chapter-level AGENTS documentation
- verification commands for the new projects

### Placeholder scan

The implementation details for files, routes, components, and verification commands are spelled out without “TBD” or “implement later” placeholders. The only deferred detail is the exact full file list of incidental supporting files inside the new chapters, which is acceptable because the core file ownership and teaching architecture are fully specified.

### Type consistency

The plan consistently uses:

- `MemoryEntry`, `SkillPreset`, `ChatRequestBody` for chapter `05`
- `ProviderRequest`, `ProviderResult`, `AgentProvider` for chapter `06`

These names should be preserved during implementation to avoid drift between tasks.
