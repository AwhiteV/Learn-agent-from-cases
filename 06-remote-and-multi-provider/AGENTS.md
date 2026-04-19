# AGENTS.md

This file provides guidance for working inside `06-remote-and-multi-provider`.

## Project Purpose

This chapter is a runnable tutorial-scale Next.js app for teaching provider
abstraction through one visible learning surface.

The target experience is a 中文化的 "remote agent console with provider switching."
Keep it beginner-friendly, observable, and runnable on a local machine. Do not
turn this chapter into a production remote orchestration system.

## Key Files

- `app/page.tsx`: chapter entry page
- `app/layout.tsx`: root layout and metadata
- `app/api/chat/route.ts`: unified streamed `POST /api/chat` dispatch entry
- `app/api/sessions/route.ts`: session list API
- `app/api/sessions/[id]/route.ts`: session detail API
- `components/chat-console.tsx`: session rail + chat workbench shell; keep the `01`-style three-column layout, widen the right rail, support collapsing it, and use top tabs to switch between the provider switcher and provider inspector
- `components/session-list.tsx`: left session history rail and new-chat entry
- `components/provider-switcher.tsx`: provider selection UI
- `components/provider-inspector.tsx`: active provider, execution mode, and contract inspector
- `lib/types.ts`: shared ProviderRequest / ProviderResult / AgentProvider contracts
- `lib/providers/base.ts`: provider base class and shared helper logic
- `lib/providers/local-agent.ts`: local provider implementation
- `lib/providers/mock-remote.ts`: remote-style provider implementation
- `lib/providers/index.ts`: provider registry and serialized summaries
- `lib/model-config.ts`: resolves the configured model from `ANTHROPIC_MODEL`
- `lib/storage/index.ts`: chapter-local session persistence helpers
- `tests/providers.test.ts`: provider registry and execution contract tests
- `tests/chat-route.test.ts`: chat route dispatch tests
- `tests/model-config.test.ts`: env-driven model selection coverage
- `tests/session-api.test.ts`: session list API coverage
- `tests/ui-copy.test.ts`: learner-facing Chinese UI copy coverage

- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
- `tests/learning-assistant-script.test.ts`: script contract, mounted target coverage, and dual-mode implementation-view helper coverage

## Teaching Constraints

- Always preserve the core teaching goal: the same UI and API payload should
  work across at least one local provider and one remote-style provider.
- Keep remote behavior simulated unless a future task explicitly asks for real
  infrastructure.
- Be explicit when describing `mock-remote`: it is a same-process latency
  simulation for teaching remote-style flows, not a real remote worker handoff.
- Make execution differences visible through provider metadata, notes, and UI
  labeling.
- Keep the stable abstraction visible in the page. Learners should be able to
  see which parts stay constant across providers.

## Required Commands

Use `pnpm` semantics for this chapter. If `pnpm` is not on PATH, use
`corepack pnpm`.

```bash
cd 06-remote-and-multi-provider
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm build
corepack pnpm test
```

## Configuration Notes

- This chapter now defaults to the repository-root `.env.local`; it no longer
  maintains a chapter-local `.env.local.example`.
- `MOCK_REMOTE_DELAY_MS` still controls the same-process remote-style delay.
- Real chat requires `ANTHROPIC_API_KEY`, and `ANTHROPIC_MODEL` can override
  the default model.
- Real chat is intentionally pinned to `@anthropic-ai/claude-agent-sdk@0.2.42`
  for compatibility with the repo's common proxy-model setups such as
  `minimax/minimax-m2.7`; re-verify the real request path before any SDK
  upgrade.
- If provider ids, execution modes, payload contracts, or env loading behavior
  change, update the UI, README, root docs, and this file in the same task.
- 主工作区应保持接近 `01-04` 的简洁聊天布局；provider switcher 和 provider inspector 需要放在更宽的右侧栏中，支持收起，并通过顶部 tab 切换查看，不要随意改动整体排版骨架。

## Documentation Sync Expectations

- Any code change in this chapter must keep
  `06-remote-and-multi-provider/AGENTS.md` and
  `06-remote-and-multi-provider/README.md` in sync.
- Keep the learning assistant script, `README.md`, and `AGENTS.md` in sync.
- 学习助手现在是双模式抽屉：默认 `操作引导`，可切换到 `实现视角`；后者要帮助学习者回看 provider switcher、chat route、provider registry、provider inspector 之间的协作链。
- 如果你修改 provider 切换、`POST /api/chat` 请求体、provider registry、provider summary、inspector 展示或 transcript 写入逻辑，必须同步检查 `实现视角` 中的行为链、文件列表、函数职责和数据流说明是否仍然准确。
- If provider targets, execution labels, or learning steps change, update the script, tests, and docs in the same task.
- 仓库面向中文学习者时，学习助手文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 仓库面向中文学习者时，`app/page.tsx`、Provider 切换与检查面板、聊天控制台、API 错误提示、Provider 输出说明等用户可见文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 本章默认复用仓库根目录的 `.env.local`，不再维护章节内 `.env.local.example`；如果修改读取方式或覆盖约定，需要同步更新根 README、根 AGENTS、README 和本文件。
- `README.md` 应保持和前面章节一致的教学结构，至少包括“这一章解决什么问题”“动手实践”“这一章对应的 Agent SDK 概念”“与 Proma 的映射”“你学完这一章后应该掌握什么”等核心段落。
- When you add files, update the key files section.
- When you change commands, teaching goals, provider behavior, or environment
  variables, update both docs in the same change.
- Keep descriptions aligned with the actual runnable behavior. Do not describe
  real distributed infrastructure unless it exists in this chapter.
