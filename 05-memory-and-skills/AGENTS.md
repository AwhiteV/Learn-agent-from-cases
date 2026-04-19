# AGENTS.md

This file provides guidance for working inside `05-memory-and-skills`.

## Project Purpose

This chapter is a runnable tutorial-scale Next.js app for teaching two ideas:

- how structured memory can be stored and injected into an assistant request
- how skill presets change the assistant behavior for the same user question

The target experience is a “learning assistant with memory and mode switching.”
Keep the implementation local, observable, and beginner-friendly. Do not turn
this chapter into a production memory platform.

## Key Files

- `app/page.tsx`: chapter entry page
- `app/layout.tsx`: root layout and metadata
- `app/api/chat/route.ts`: runs real streamed chat, injects current memory library + selected skill, extracts memory decisions, and persists sessions
- `app/api/memory/route.ts`: `GET/DELETE` memory library API
- `app/api/skills/route.ts`: skill preset API
- `app/api/sessions/route.ts`: session list API
- `app/api/sessions/[id]/route.ts`: session detail API
- `components/chat-interface.tsx`: session rail + chat workbench shell; keep the `01`-style three-column layout, widen the right rail, support collapsing it, and use top tabs to switch between memory library and skill selector while keeping prompt preview visible
- `components/session-list.tsx`: left session history rail and new-chat entry
- `components/memory-panel.tsx`: memory library viewer, last automatic memory decision, and deletion
- `components/skill-selector.tsx`: active skill preset selector
- `lib/memory-store.ts`: local JSON persistence for memory data
- `lib/memory-extraction.ts`: builds the automatic memory-decision prompt and parses the model JSON response
- `lib/model-config.ts`: resolves the configured model from `ANTHROPIC_MODEL`
- `lib/request-context.ts`: builds the real-chat system prompt and prompt preview payload
- `lib/storage/index.ts`: chapter-local session persistence helpers
- `lib/skill-presets.ts`: `teacher`, `builder`, `reviewer` preset definitions
- `lib/chat-engine.ts`: tutorial response composer that makes skill and memory effects visible
- `lib/types.ts`: shared interfaces used by API routes and components
- `tests/chat-route.test.ts`: chat route validation coverage
- `tests/chat-engine.test.ts`: chat engine behavior tests
- `tests/memory-store.test.ts`: memory store persistence tests
- `tests/model-config.test.ts`: env-driven model selection contract coverage
- `tests/session-api.test.ts`: session list API coverage

- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
- `tests/learning-assistant-script.test.ts`: script contract and mounted target coverage

## Local Data Storage

- Memory is stored locally under `.data/memory.json`.
- The storage layer is intentionally simple JSON persistence so learners can see
  where the data lives and how it is read back.
- `.data/` is gitignored and should remain local-only.
- If you change the storage shape or path, update this file and the README in
  the same task.
- This chapter now teaches automatic memory creation: users do not manually add
  memory entries in the UI; the model decides whether a turn contains stable
  user information worth saving.

## Required Commands

Use `pnpm` semantics for this chapter. If `pnpm` is not on PATH, use
`corepack pnpm`.

```bash
cd 05-memory-and-skills
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm build
corepack pnpm test
```

## Documentation Sync Expectations

- Any code change in this chapter must keep `05-memory-and-skills/AGENTS.md`
  and `05-memory-and-skills/README.md` in sync.
- Keep the learning assistant script, `README.md`, and `AGENTS.md` in sync.
- 学习助手现在是双模式抽屉：默认 `操作引导`，可切换到 `实现视角`；后者适合已经跑通过 case 的学习者，用来回看关键实现链路。
- 如果你修改自动记忆判断、skill 切换、`Prompt preview`、请求组装链路或 chat 响应拼装逻辑，必须同步检查 `实现视角` 里的文件、函数职责和数据流说明是否仍然准确。
- 主工作区应保持接近 `01-04` 的简洁聊天布局；当前实现直接复用 `01` 风格的三栏壳子，右侧栏需要保持更宽的阅读宽度，并提供收起按钮与 `记忆库 / Skill 选择器` tab 切换，不要随意改动整体排版骨架。
- If memory targets, skill targets, or learning steps change, update the script, tests, and docs in the same task.
- 仓库面向中文学习者时，学习助手文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 面向学习者的主界面文案也默认使用中文；不要只把学习助手抽屉翻成中文，而让主工作台、记忆面板、skill 面板和教学回复继续停留在英文。
- 本章默认复用仓库根目录的 `.env.local`，不再维护章节内 `.env.local.example`；如果修改读取方式或覆盖约定，需要同步更新根 README、根 AGENTS、README 和本文件。
- 真实聊天当前固定使用 `@anthropic-ai/claude-agent-sdk@0.2.42`，这是为了保持与仓库根目录常见的代理模型配置（例如 `minimax/minimax-m2.7`）兼容；如果升级 SDK，必须先重新验证真实聊天链路。
- `README.md` 应保持和前面章节一致的教学结构，至少包括“这一章解决什么问题”“这一章的 runnable case 是什么”“动手实践”“这一章对应的 Agent SDK 概念”“与 Proma 的映射”“学完这一章后你应该知道什么”等核心段落。
- When you add files, update the key files section.
- When you change commands, storage behavior, or the teaching goal, update both
  docs in the same change.
- Keep descriptions aligned with the actual runnable behavior. Do not describe
  unreleased external systems or production-only capabilities here.
