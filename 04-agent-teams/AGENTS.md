# AGENTS.md

This file provides guidance for working inside `04-agent-teams`.

## Project Purpose

This chapter teaches orchestrator/subagent collaboration, task decomposition, and team-state observability.

## Key Files

- `app/page.tsx`: chapter entry page
- `app/api/chat/route.ts`: main chat API entry point
- `app/api/agent-teams/route.ts`: team, task, and inbox state observability API
- `app/api/agent-output/route.ts`: teammate output file loading API for the split view
- `components/chat-interface.tsx`: main learning surface
- `components/agent-team-view.tsx`: teammate state panel
- `components/agent-task-list.tsx`: task lifecycle display
- `components/agent-team-split.tsx`: team collaboration layout and split view
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
- `tests/learning-assistant-script.test.ts`: script contract and mounted target coverage
- `tests/tool-activity.test.ts`: regression coverage for historical agent-team hierarchy rendering
- `lib/agent-team-store.ts`: in-memory client-side team and event state store
- `lib/tool-activity.ts`: tool activity state and tree reconstruction for live and historical views
- `packages/shared/src/agent/proma-agent.ts`: shared agent runtime used by the chapter

## Commands

- `corepack pnpm test`: verify the learning-assistant contract, mounted targets, and historical activity tree reconstruction
- `corepack pnpm build`: verify the chapter still builds after UI or script changes

## Documentation Sync Expectations

- Keep `README.md`, `AGENTS.md`, and the learning assistant script in sync.
- If you add or rename learning steps, target ids, or highlighted regions, update the script, README, and tests in the same task.
- If teammate or task UI changes, update the learning targets and chapter docs in the same task.
- 仓库面向中文学习者时，学习助手文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 本章默认复用仓库根目录的 `.env.local`；如果修改环境变量读取方式，需要同步更新根 README、本章 README 和本文件。
