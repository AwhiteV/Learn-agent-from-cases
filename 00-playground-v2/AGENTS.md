# AGENTS.md

This file provides guidance for working inside `00-playground-v2`.

## Project Purpose

This chapter is the learner's CLI-first mental-model playground for the Codex Agent SDK V2 Session API, focusing on session lifecycle, resume flow, streaming messages, and permission experiments.

## Key Files

- `playground.ts`: entrypoint that loads env vars, creates app state, and drives the send/stream loop
- `lib/cli.ts`: interactive command parser, menus, help text, and session-oriented user flow
- `lib/config.ts`: app state types, default config, and display toggles
- `lib/session-ops.ts`: `unstable_v2_createSession` / `unstable_v2_resumeSession` wrappers
- `lib/session-history.ts`: persistence for `.session-history.json` and history formatting
- `lib/permissions.ts`: permission modes, custom `canUseTool`, hook demos, and permission logs
- `utils/printer.ts`: SDK message formatting for terminal output
- `utils/raw-output-writer.ts`: NDJSON export for raw SDK message streams
- `.env.example`: local env template for CLI usage
- `README.md`: learner-facing chapter guide and experiment path

## Commands

- `pnpm play`: run the interactive playground
- `pnpm play:debug`: run with `DEBUG=*` for verbose SDK/runtime logging
- `pnpm play:watch`: rerun with `tsx watch` during local iteration
- `pnpm exec tsc --noEmit`: typecheck the chapter

## Documentation Sync Expectations

- Keep `README.md` and this file aligned whenever commands, key files, session flow, or permission capabilities change.
- If you add, rename, or remove CLI commands, update the README command tables and this file in the same task.
- If history persistence, raw output files, or permission behavior changes, update the learner guidance at the same time.
- 仓库面向中文学习者时，本章 README 的教学文案默认使用中文；除非明确要求双语，否则不要回退成英文。
