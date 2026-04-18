# AGENTS.md

This file provides guidance for working inside `02-tools-and-mcp`.

## Project Purpose

This chapter teaches how an agent becomes actionable through tools, MCP-style integration, and visible tool lifecycle events.

## Key Files

- `app/page.tsx`: chapter entry page
- `app/api/chat/route.ts`: chat API entry point that drives tool execution
- `components/chat-interface.tsx`: main learning surface
- `components/tool-activity-list.tsx`: visible tool lifecycle panel
- `components/learning-assistant.tsx`: in-page drawer and floating hint shell
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content
- `lib/model-config.ts`: chapter-local default model and env override helper
- `tests/learning-assistant-script.test.ts`: script contract and mounted target coverage
- `tests/model-config.test.ts`: env-driven model selection contract coverage
- `lib/tool-activity.ts`: tool activity data shaping and summaries
- `packages/shared/src/agent/proma-agent.ts`: shared agent runtime used by the chapter
- `packages/shared/src/agent/agent-event.ts`: normalized agent event definitions

## Commands

- `corepack pnpm test`: run every `tests/*.test.ts` check for the learning-assistant contract and mounted target hooks
- `corepack pnpm build`: verify the chapter still builds after UI or script changes

## Documentation Sync Expectations

- Keep `README.md`, `AGENTS.md`, and the learning assistant script in sync.
- If you add or rename learning steps, target ids, or highlighted regions, update the script, README, and tests in the same task.
- If tool activity regions or labels change, update the learning targets and docs in the same task.
- 仓库面向中文学习者时，学习助手文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 如果调整默认模型或环境变量名，需同步更新仓库根目录 `.env.local.example`、`README.md`、`AGENTS.md` 和相关测试。
- 本章默认复用仓库根目录的 `.env.local`，不再维护章节内 `.env.local.example`，章节内 `.env.local` 仅用于覆盖；如果修改读取优先级，需要同步更新根 README、本章 README 和本文件。
