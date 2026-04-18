# Learning Assistant Implementation View Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dual-mode learning assistant to the `05-memory-and-skills` and `06-remote-and-multi-provider` chapters so the same drawer can switch between beginner guidance and an advanced implementation view.

**Architecture:** Keep the existing chapter-local learning assistant pattern, but extend each chapter's `learning-assistant-script.ts` contract so a single step can describe both the beginner explanation and an optional advanced implementation explanation. Rebuild the drawer UI in each pilot chapter to support mode switching, collapsible implementation sections, and graceful fallback when a step has no advanced content, while keeping chapter docs and tests aligned with the new behavior.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript 5, Tailwind CSS 4, Node test runner, pnpm

---

### Task 1: Extend The Chapter Script Contract For Dual-Mode Steps

**Files:**
- Modify: `05-memory-and-skills/lib/learning-assistant-script.ts`
- Modify: `06-remote-and-multi-provider/lib/learning-assistant-script.ts`
- Test: `05-memory-and-skills/tests/learning-assistant-script.test.ts`
- Test: `06-remote-and-multi-provider/tests/learning-assistant-script.test.ts`

- [ ] **Step 1: Write the failing script-contract assertions for chapter 05**

Add checks in `05-memory-and-skills/tests/learning-assistant-script.test.ts` that require each step to expose a beginner block and at least the first implementation-view block on the prompt-related steps:

```ts
interface AdvancedViewContract {
  trigger: string;
  visibleEffect: string;
  internals: string;
  files: Array<{ path: string; role: string }>;
  dataFlow: string[];
}

assert.equal(typeof learningScript.steps[0].beginner.doThis, "string");
assert.equal(learningScript.steps[0].advanced?.trigger.includes("memory"), true);
assert.equal(learningScript.steps[4].advanced?.files.length, 3);
assert.deepEqual(learningScript.steps[4].advanced?.dataFlow, [
  "memory panel",
  "chat submit handler",
  "/api/chat",
  "chat engine",
  "prompt preview",
]);
```

- [ ] **Step 2: Run the 05 contract test to verify it fails**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills
corepack pnpm test -- --test-name-pattern="learning script defines"
```

Expected: FAIL because `beginner` / `advanced` fields do not exist yet.

- [ ] **Step 3: Write the failing script-contract assertions for chapter 06**

Add matching checks in `06-remote-and-multi-provider/tests/learning-assistant-script.test.ts`:

```ts
assert.equal(typeof learningScript.steps[0].beginner.doThis, "string");
assert.equal(
  learningScript.steps[0].advanced?.trigger.includes("provider"),
  true,
);
assert.equal(learningScript.steps[2].advanced?.files[0]?.path, "lib/providers/index.ts");
assert.deepEqual(learningScript.steps[2].advanced?.dataFlow, [
  "provider switcher",
  "chat console state",
  "/api/chat",
  "provider registry",
  "provider inspector",
]);
```

- [ ] **Step 4: Run the 06 contract test to verify it fails**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider
corepack pnpm test -- --test-name-pattern="learning script defines"
```

Expected: FAIL because the old script contract only exposes flat beginner fields.

- [ ] **Step 5: Refactor the script types in chapter 05 to the dual-view shape**

Update `05-memory-and-skills/lib/learning-assistant-script.ts` to use a structure like this:

```ts
export interface LearningStepBeginnerView {
  doThis: string;
  watchHere: string;
  notice: string;
  whyItMatters: string;
  termNote?: string;
}

export interface LearningStepAdvancedFile {
  path: string;
  role: string;
}

export interface LearningStepAdvancedFunction {
  name: string;
  file: string;
  role: string;
}

export interface LearningStepAdvancedView {
  trigger: string;
  visibleEffect: string;
  internals: string;
  files: LearningStepAdvancedFile[];
  functions?: LearningStepAdvancedFunction[];
  dataFlow: string[];
  relationships?: string[];
}

export interface LearningStep {
  id: string;
  title: string;
  type: "action" | "observation" | "comparison" | "term" | "checkpoint";
  targetId?: string;
  beginner: LearningStepBeginnerView;
  advanced?: LearningStepAdvancedView;
}
```

- [ ] **Step 6: Populate chapter 05 with implementation-view content**

Write concrete `advanced` blocks for each of the five steps in `05-memory-and-skills/lib/learning-assistant-script.ts`, keeping the paths aligned to real files such as:

```ts
advanced: {
  trigger: "你在 Memory Panel 里新增并勾选了一条 memory。",
  visibleEffect: "新 memory 进入列表，并且后续请求会把它作为已选上下文带入。",
  internals:
    "前端先通过 memory API 持久化记录，再把选中的 memory id 保存在聊天工作台状态里。真正发送消息时，submit handler 会把这些 id 连同当前 skill 一起发给 /api/chat。",
  files: [
    { path: "components/memory-panel.tsx", role: "负责创建、勾选和删除 memory 的界面" },
    { path: "components/chat-interface.tsx", role: "保存 selectedMemoryIds 并组装 chat 请求" },
    { path: "app/api/chat/route.ts", role: "读取 skill 和 selected memories 后返回可观察结果" },
  ],
  functions: [
    {
      name: "handleToggleMemory",
      file: "components/chat-interface.tsx",
      role: "维护当前被注入的 memory id 集合",
    },
    {
      name: "handleSubmit",
      file: "components/chat-interface.tsx",
      role: "把消息、skill、memoryIds 组装成一次 chat 请求",
    },
  ],
  dataFlow: [
    "memory panel",
    "selectedMemoryIds state",
    "handleSubmit",
    "/api/chat",
    "chat engine",
    "prompt preview",
  ],
}
```

- [ ] **Step 7: Populate chapter 06 with implementation-view content**

Add matching `advanced` blocks in `06-remote-and-multi-provider/lib/learning-assistant-script.ts` using real provider files:

```ts
advanced: {
  trigger: "你切换了当前 provider，然后重新发送同一条请求。",
  visibleEffect: "provider inspector、execution mode 和 transcript 输出都会随 provider 变化而更新。",
  internals:
    "前端把 providerId 保存在聊天控制台状态里，submit 时一起发到 /api/chat。路由层再交给 provider registry 查找对应 adapter，并返回统一的 ProviderResult 给界面。",
  files: [
    { path: "components/provider-switcher.tsx", role: "选择当前 provider" },
    { path: "components/chat-console.tsx", role: "保存 providerId 并发起请求" },
    { path: "lib/providers/index.ts", role: "根据 providerId 返回具体 provider 实现" },
    { path: "app/api/chat/route.ts", role: "统一 dispatch 到 provider abstraction" },
  ],
  dataFlow: [
    "provider switcher",
    "selectedProviderId state",
    "chat submit",
    "/api/chat",
    "provider registry",
    "provider inspector / transcript",
  ],
}
```

- [ ] **Step 8: Run both script tests to verify the new contract passes**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills
corepack pnpm test -- --test-name-pattern="learning script defines"
cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider
corepack pnpm test -- --test-name-pattern="learning script defines"
```

Expected: PASS in both chapters with the new `beginner` and `advanced` shape.

- [ ] **Step 9: Commit the dual-view script contract**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 05-memory-and-skills/lib/learning-assistant-script.ts 06-remote-and-multi-provider/lib/learning-assistant-script.ts 05-memory-and-skills/tests/learning-assistant-script.test.ts 06-remote-and-multi-provider/tests/learning-assistant-script.test.ts
git commit -m "feat: add dual-view learning assistant script contract"
```

Expected: commit succeeds with the new script shape and tests.

### Task 2: Rebuild The Drawer UI For Implementation View In Chapter 05

**Files:**
- Modify: `05-memory-and-skills/components/learning-assistant.tsx`
- Test: `05-memory-and-skills/tests/learning-assistant-script.test.ts`

- [ ] **Step 1: Write a UI smoke test for implementation-view labels in chapter 05**

Extend `05-memory-and-skills/tests/learning-assistant-script.test.ts` with static assertions against `components/learning-assistant.tsx`:

```ts
const drawerSource = fs.readFileSync(
  path.join(projectRoot, "components", "learning-assistant.tsx"),
  "utf8",
);

assert.equal(drawerSource.includes("实现视角"), true);
assert.equal(drawerSource.includes("操作引导"), true);
assert.equal(drawerSource.includes("行为链"), true);
assert.equal(drawerSource.includes("看代码"), true);
assert.equal(drawerSource.includes("数据流"), true);
```

- [ ] **Step 2: Run the chapter 05 learning-assistant tests to verify they fail**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills
corepack pnpm test -- tests/learning-assistant-script.test.ts
```

Expected: FAIL because the drawer source does not yet contain mode-switch or implementation-view labels.

- [ ] **Step 3: Replace the chapter 05 drawer with a dual-mode UI**

Update `05-memory-and-skills/components/learning-assistant.tsx` to introduce view state and collapsible advanced sections:

```tsx
type AssistantMode = "beginner" | "advanced";

const [mode, setMode] = useState<AssistantMode>("beginner");
const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
  code: false,
  flow: false,
});

const currentBeginner = step.beginner;
const currentAdvanced = step.advanced;
```

Render the header switch and graceful fallback:

```tsx
<div className="mt-4 inline-flex rounded-full border border-stone-200 bg-stone-100 p-1">
  <button
    className={mode === "beginner" ? "bg-white text-stone-950" : "text-stone-500"}
    onClick={() => setMode("beginner")}
    type="button"
  >
    操作引导
  </button>
  <button
    className={mode === "advanced" ? "bg-white text-stone-950" : "text-stone-500"}
    onClick={() => setMode("advanced")}
    type="button"
  >
    实现视角
  </button>
</div>

{mode === "advanced" && currentAdvanced ? (
  <div className="space-y-4">
    <section>
      <h3>行为链</h3>
      <p>{currentAdvanced.dataFlow.join(" -> ")}</p>
    </section>
    <section>
      <h3>发生了什么</h3>
      <p>{currentAdvanced.internals}</p>
    </section>
  </div>
) : null}
```

- [ ] **Step 4: Add collapsible `看代码` and `数据流` sections in chapter 05**

Render the advanced sections as explicit toggles:

```tsx
<button onClick={() => toggleSection("code")} type="button">
  看代码
</button>
{expandedSections.code ? (
  <ul>
    {currentAdvanced.files.map((file) => (
      <li key={file.path}>
        <strong>{file.path}</strong>：{file.role}
      </li>
    ))}
  </ul>
) : null}

<button onClick={() => toggleSection("flow")} type="button">
  数据流
</button>
{expandedSections.flow ? (
  <ol>
    {currentAdvanced.dataFlow.map((node) => (
      <li key={node}>{node}</li>
    ))}
  </ol>
) : null}
```

- [ ] **Step 5: Reset view-specific local state when the learner moves between steps**

Add an effect in `05-memory-and-skills/components/learning-assistant.tsx`:

```tsx
useEffect(() => {
  setExpandedSections({ code: false, flow: false });
}, [stepIndex]);
```

Expected behavior: moving to the next step keeps the chosen mode but collapses expanded implementation panels so the drawer stays readable.

- [ ] **Step 6: Run the chapter 05 assistant tests to verify the labels and targets pass**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills
corepack pnpm test -- tests/learning-assistant-script.test.ts
```

Expected: PASS with mode labels, implementation sections, and target coverage still intact.

- [ ] **Step 7: Commit the chapter 05 drawer rebuild**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 05-memory-and-skills/components/learning-assistant.tsx 05-memory-and-skills/tests/learning-assistant-script.test.ts
git commit -m "feat: add implementation view to chapter 05 assistant"
```

Expected: commit succeeds with the dual-mode drawer in chapter 05.

### Task 3: Sync Chapter 05 Docs With The New Advanced View

**Files:**
- Modify: `05-memory-and-skills/README.md`
- Modify: `05-memory-and-skills/AGENTS.md`

- [ ] **Step 1: Add README copy that explains the new dual-mode assistant**

Update `05-memory-and-skills/README.md` so the learning-assistant section explicitly explains:

```md
页面右下角的“学习助手”抽屉现在有两种模式：

- `操作引导`：第一次跑 case 时，按步骤告诉你先做什么、看哪里
- `实现视角`：当你已经跑通一次后，用同一条步骤链解释 prompt 组装、关键文件、函数职责和数据流
```

- [ ] **Step 2: Update chapter 05 AGENTS guidance**

Add maintenance notes to `05-memory-and-skills/AGENTS.md`:

```md
- 学习助手现为双模式抽屉：默认 `操作引导`，可切换到 `实现视角`。
- 如果你修改 memory 选择、skill 切换、prompt preview 或请求组装链路，必须同步检查实现视角中的文件、函数和数据流说明是否仍然准确。
```

- [ ] **Step 3: Verify the chapter 05 docs mention the advanced view**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master
rg -n "实现视角|操作引导|prompt 组装|数据流" 05-memory-and-skills/README.md 05-memory-and-skills/AGENTS.md
```

Expected: both files mention the dual-mode assistant and implementation-view maintenance contract.

- [ ] **Step 4: Commit the chapter 05 doc sync**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 05-memory-and-skills/README.md 05-memory-and-skills/AGENTS.md
git commit -m "docs: explain chapter 05 implementation-view assistant"
```

Expected: commit succeeds with updated chapter 05 docs.

### Task 4: Port The Dual-Mode Drawer And Documentation To Chapter 06

**Files:**
- Modify: `06-remote-and-multi-provider/components/learning-assistant.tsx`
- Modify: `06-remote-and-multi-provider/README.md`
- Modify: `06-remote-and-multi-provider/AGENTS.md`
- Test: `06-remote-and-multi-provider/tests/learning-assistant-script.test.ts`

- [ ] **Step 1: Write chapter 06 UI smoke assertions for the advanced drawer**

Extend `06-remote-and-multi-provider/tests/learning-assistant-script.test.ts`:

```ts
const drawerSource = fs.readFileSync(
  path.join(projectRoot, "components", "learning-assistant.tsx"),
  "utf8",
);

assert.equal(drawerSource.includes("实现视角"), true);
assert.equal(drawerSource.includes("行为链"), true);
assert.equal(drawerSource.includes("看代码"), true);
assert.equal(drawerSource.includes("数据流"), true);
```

- [ ] **Step 2: Run the chapter 06 learning-assistant tests to verify they fail**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider
corepack pnpm test -- tests/learning-assistant-script.test.ts
```

Expected: FAIL because the drawer UI has not yet been upgraded.

- [ ] **Step 3: Port the dual-mode drawer from chapter 05 into chapter 06**

Apply the same interaction model in `06-remote-and-multi-provider/components/learning-assistant.tsx`, adapted to the chapter-local script:

```tsx
const currentBeginner = step.beginner;
const currentAdvanced = step.advanced;

{mode === "beginner" ? (
  <div>
    <p><strong>去做什么：</strong>{currentBeginner.doThis}</p>
    <p><strong>看哪里：</strong>{currentBeginner.watchHere}</p>
  </div>
) : currentAdvanced ? (
  <div>
    <section>
      <h3>行为链</h3>
      <p>{[currentAdvanced.trigger, currentAdvanced.visibleEffect].join(" -> ")}</p>
    </section>
    <section>
      <h3>发生了什么</h3>
      <p>{currentAdvanced.internals}</p>
    </section>
  </div>
) : (
  <p>这一小节暂时还没有实现视角说明。</p>
)}
```

- [ ] **Step 4: Update chapter 06 docs for provider-focused implementation view**

Add aligned notes to `06-remote-and-multi-provider/README.md` and `06-remote-and-multi-provider/AGENTS.md`:

```md
- `操作引导` 会告诉你先切 provider、再发送同一条请求、再去观察稳定抽象层。
- `实现视角` 会把同一步骤展开成 provider switcher、chat route、provider registry 与 inspector 之间的协作链。
```

- [ ] **Step 5: Verify chapter 06 tests and docs pass together**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider
corepack pnpm test -- tests/learning-assistant-script.test.ts
cd /Users/timo/projects/claude-agent-sdk-master
rg -n "实现视角|provider registry|稳定抽象层|数据流" 06-remote-and-multi-provider/README.md 06-remote-and-multi-provider/AGENTS.md
```

Expected: tests PASS and both docs mention the implementation view accurately.

- [ ] **Step 6: Commit the chapter 06 rollout**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add 06-remote-and-multi-provider/components/learning-assistant.tsx 06-remote-and-multi-provider/README.md 06-remote-and-multi-provider/AGENTS.md 06-remote-and-multi-provider/tests/learning-assistant-script.test.ts
git commit -m "feat: add implementation view to chapter 06 assistant"
```

Expected: commit succeeds with the dual-mode drawer and docs in chapter 06.

### Task 5: Add Cross-Chapter Verification And Manual-Test Coverage

**Files:**
- Modify: `docs/superpowers/plans/2026-04-18-chapter-learning-assistant-manual-test-plan.md`
- Modify: `README.md`

- [ ] **Step 1: Update the manual test plan for the dual-mode drawer**

Add explicit checks to `docs/superpowers/plans/2026-04-18-chapter-learning-assistant-manual-test-plan.md`:

```md
### Dual-Mode Drawer Checks For 05 And 06

1. Open the drawer and confirm `操作引导` is selected by default.
2. Switch to `实现视角` and confirm the current step number does not change.
3. Confirm `行为链` and `发生了什么` are visible immediately.
4. Expand `看代码` and `数据流` and confirm the content references real files on the page's chapter.
5. Move to the next step and confirm the expanded implementation sections collapse again.
```

- [ ] **Step 2: Update the root README chapter UX summary**

Adjust `README.md` to mention that the learning assistant now has an advanced implementation mode in the pilot chapters:

```md
目前 `05` 与 `06` 章节的学习助手额外提供 `实现视角`，适合在你已经跑通过案例之后，再回头理解对应的关键文件、函数职责与数据流。
```

- [ ] **Step 3: Run repo-level verification for both pilot chapters**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master/05-memory-and-skills
corepack pnpm test
corepack pnpm lint
cd /Users/timo/projects/claude-agent-sdk-master/06-remote-and-multi-provider
corepack pnpm test
corepack pnpm lint
```

Expected: PASS in both chapters, with no lint regressions from the new drawer state or script types.

- [ ] **Step 4: Commit the shared verification/docs updates**

Run:

```bash
cd /Users/timo/projects/claude-agent-sdk-master
git add docs/superpowers/plans/2026-04-18-chapter-learning-assistant-manual-test-plan.md README.md
git commit -m "docs: add implementation-view verification guidance"
```

Expected: commit succeeds with shared documentation updates for the pilot rollout.
