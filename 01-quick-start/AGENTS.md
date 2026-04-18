# AGENTS.md

This file provides guidance for working inside `01-quick-start`.

## Project Purpose

This chapter is the learner's first runnable web agent for understanding streaming output, session persistence, resume behavior, and workspace awareness.

## Key Files

- `app/page.tsx`: chapter entry page
- `app/api/chat/route.ts`: chat API entry point for streaming responses
- `app/api/sessions/route.ts`: session list and creation API
- `app/api/sessions/[id]/route.ts`: session detail, resume, and delete API
- `components/chat-interface.tsx`: three-column learning surface
- `components/session-list.tsx`: session history and new chat actions
- `components/file-explorer.tsx`: workspace browser
- `components/learning-assistant.tsx`: in-page drawer and floating reopen button
- `lib/learning-assistant-script.ts`: chapter-specific walkthrough content and target contract
- `lib/storage/session.ts`: session persistence helpers used by the app layer
- `packages/core/src/session.ts`: shared session model and session utilities
- `packages/core/src/storage.ts`: low-level storage abstractions for session data
- `tests/learning-assistant-script.test.ts`: automated contract test for the chapter walkthrough script

## Learning Assistant Targets

- `chat-input`: main prompt field in `components/chat-interface.tsx`
- `message-list`: scrollable transcript region in `components/chat-interface.tsx`
- `session-list`: left session rail wrapper mounted by `components/chat-interface.tsx`
- `new-chat-button`: session reset action in `components/session-list.tsx`
- `file-explorer`: right workspace rail wrapper mounted by `components/chat-interface.tsx`

## Verification Commands

- `pnpm test`: run the learning assistant script contract test
- `pnpm lint`: run ESLint for the chapter
- `pnpm build`: verify the chapter builds cleanly

## Documentation Sync Expectations

- Any UI change in this chapter must keep `README.md` and `AGENTS.md` aligned.
- If you add or rename learning steps, targets, or highlighted regions, update both this file and the README.
- Keep the learning assistant aligned with the actual visible UI. Do not describe targets that are not on the page.
- 仓库面向中文学习者时，学习助手的标题、摘要和步骤文案默认使用中文；除非明确要求双语，否则不要回退成英文。
- 本章默认复用仓库根目录的 `.env.local`；如果修改环境变量读取方式，需要同步更新根 README、本章 README 和本文件。
