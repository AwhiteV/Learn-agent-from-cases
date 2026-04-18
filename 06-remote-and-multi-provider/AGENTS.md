# AGENTS.md

This file provides guidance for working inside `06-remote-and-multi-provider`.

## Project Purpose

This chapter is a runnable tutorial-scale Next.js app for teaching provider
abstraction through one visible learning surface.

The target experience is a "remote agent console with provider switching."
Keep it beginner-friendly, observable, and runnable on a local machine. Do not
turn this chapter into a production remote orchestration system.

## Key Files

- `app/page.tsx`: chapter entry page and teaching summary
- `app/layout.tsx`: root layout and metadata
- `app/api/chat/route.ts`: unified `POST /api/chat` dispatch entry
- `components/chat-console.tsx`: main teaching workbench and transcript
- `components/provider-switcher.tsx`: provider selection UI
- `components/provider-inspector.tsx`: active provider, execution mode, and contract inspector
- `lib/types.ts`: shared ProviderRequest / ProviderResult / AgentProvider contracts
- `lib/providers/base.ts`: provider base class and shared helper logic
- `lib/providers/local-agent.ts`: local provider implementation
- `lib/providers/mock-remote.ts`: remote-style provider implementation
- `lib/providers/index.ts`: provider registry and serialized summaries
- `tests/providers.test.ts`: provider registry and execution contract tests

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

- `.env.local.example` exposes `MOCK_REMOTE_DELAY_MS` so the mock remote
  provider can simulate round-trip latency inside the same process.
- No external API key is required for the default tutorial flow.
- If provider ids, execution modes, or payload contracts change, update the UI,
  README, and this file in the same task.

## Documentation Sync Expectations

- Any code change in this chapter must keep
  `06-remote-and-multi-provider/AGENTS.md` and
  `06-remote-and-multi-provider/README.md` in sync.
- When you add files, update the key files section.
- When you change commands, teaching goals, provider behavior, or environment
  variables, update both docs in the same change.
- Keep descriptions aligned with the actual runnable behavior. Do not describe
  real distributed infrastructure unless it exists in this chapter.
