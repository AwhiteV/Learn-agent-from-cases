# AGENTS.md

This file provides guidance for working inside `03-agent-with-permission`.

## Project Purpose

This chapter teaches permission-gated agent behavior, approval decisions, and structured user input through `AskUserQuestion`.

## Key Files

- `app/page.tsx`: chapter entry page
- `app/api/chat/route.ts`: main chat API entry point
- `app/api/chat/route.ts`: main chat API entry point; default workspace includes the chapter directory plus the repo root
- `app/api/chat/permission/route.ts`: permission decision and question handling API
- `components/chat-interface.tsx`: main learning surface
- `components/chat-interface.tsx`: main learning surface; page header should identify this chapter as "Agent With Permission"
- `components/permission-selector.tsx`: approval and question UI
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
- `lib/model-config.ts`: resolves the configured model from `ANTHROPIC_MODEL`
- `lib/permission-result.ts`: shared permission decision to SDK result mapping
- `lib/permission-updates.ts`: maps SDK permission suggestions to the chapter's "Allow" and "Always Allow" UX
- `tests/learning-assistant-script.test.ts`: script contract and mounted target coverage
- `tests/permission-route.test.ts`: permission decision result contract coverage
- `tests/permission-updates.test.ts`: regression coverage for blocked-path approval suggestions
- `tests/model-config.test.ts`: regression coverage for `ANTHROPIC_MODEL` resolution
- `lib/permission-store.ts`: server-side in-memory pending permission store and resolver map
- `packages/shared/src/agent/proma-agent.ts`: shared agent runtime used by the chapter
- `packages/shared/src/agent/options.ts`: builds SDK options including `cwd` and `additionalDirectories`
- `tests/agent-options.test.ts`: regression coverage for workspace directory forwarding

## Commands

- `corepack pnpm test`: verify the learning-assistant script contract and target hooks
- `corepack pnpm build`: verify the chapter still builds after UI or script changes

## Documentation Sync Expectations

- Keep `README.md`, `AGENTS.md`, and the learning assistant script in sync.
- If you add or rename learning steps, target ids, or highlighted regions, update the script, README, and tests in the same task.
- If approval actions, copy, or question handling change, update the guide steps at the same time.
- 仓库面向中文学习者时，学习助手文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 本章默认复用仓库根目录的 `.env.local`，不再维护章节内 `.env.local.example`；如果修改环境变量读取方式或覆盖约定，需要同步更新根 README、本章 README 和本文件。
