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
- `app/api/chat/route.ts`: combines selected skill prompt and memory context into the chat response
- `app/api/memory/route.ts`: `GET/POST/DELETE` memory API
- `app/api/skills/route.ts`: skill preset API
- `components/chat-interface.tsx`: main teaching workbench that combines all panels
- `components/memory-panel.tsx`: memory creation form, memory list, injection toggles, and deletion
- `components/skill-selector.tsx`: active skill preset selector
- `lib/memory-store.ts`: local JSON persistence for memory data
- `lib/skill-presets.ts`: `teacher`, `builder`, `reviewer` preset definitions
- `lib/chat-engine.ts`: tutorial response composer that makes skill and memory effects visible
- `lib/types.ts`: shared interfaces used by API routes and components

## Local Data Storage

- Memory is stored locally under `.data/memory.json`.
- The storage layer is intentionally simple JSON persistence so learners can see
  where the data lives and how it is read back.
- `.data/` is gitignored and should remain local-only.
- If you change the storage shape or path, update this file and the README in
  the same task.

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
- When you add files, update the key files section.
- When you change commands, storage behavior, or the teaching goal, update both
  docs in the same change.
- Keep descriptions aligned with the actual runnable behavior. Do not describe
  unreleased external systems or production-only capabilities here.
