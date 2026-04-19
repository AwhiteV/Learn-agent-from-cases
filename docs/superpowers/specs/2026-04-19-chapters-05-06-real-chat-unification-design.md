# Chapters 05-06 Real Chat and UI Unification Design

**Date:** 2026-04-19

**Owner:** Codex

> The Chinese version lives at `docs/superpowers/specs/2026-04-19-chapters-05-06-real-chat-unification-design.zh-CN.md`.

## Background

Chapters `01-04` already share a stable learner experience:

- real model-backed chat instead of locally fabricated demo replies
- `session`-based multi-turn continuity
- SSE streaming responses
- default reuse of the repository root `.env.local`
- a stable three-column layout: history on the left, chat in the middle, chapter-specific inspection panel on the right

By contrast, `05-memory-and-skills` and `06-remote-and-multi-provider` still behave more like teaching demos:

- `05` uses a local `chat-engine` to compose tutorial replies
- `06` returns simulated provider outputs instead of real model responses
- both chapters keep their own teaching panels, but the main chat workflow no longer matches `01-04`
- neither chapter aligns with the same session persistence flow or front-end workspace style learners already saw earlier

That breaks the tutorial’s “continuous series” feeling. Learners build one mental model in `01-04`, then must switch to a different interaction model in `05-06`.

## Goals

1. Upgrade `05` and `06` to real model-backed chat rather than simulated replies.
2. Give both chapters the same `session`-based multi-turn experience as `01-04`.
3. Align both chapters with the same three-column front-end workspace style.
4. Preserve each chapter’s teaching focus instead of flattening them into identical demos.
5. Reuse the repository root `.env.local` as the default model configuration source.
6. Make it obvious that chapter-specific teaching layers sit on top of one shared chat foundation.

## Non-Goals

1. Reworking the `01-04` architecture or visual system.
2. Turning `06` into a real remote infrastructure or distributed execution platform.
3. Adding new external multi-provider integrations in this change.
4. Removing the teaching focus of memory/skills from `05` or provider abstraction from `06`.

## Design Summary

This change follows a “shared chat foundation plus chapter-specific teaching layer” strategy:

- reuse the proven real-chat workflow from `01-04`
- unify `05` and `06` around the same three-column layout
- keep the chapter-specific differences in the right rail and request composition logic

The unified structure becomes:

- left: `session list`
- middle: real streaming chat transcript
- right:
  - `05`: memory, skill, and prompt preview surfaces
  - `06`: provider switcher and provider inspector surfaces

Learners moving from `01` through `06` should always feel like they are using the same chat product shell, with different teaching instrumentation layered on top.

## Shared Experience Principles

### 1. Adjacent chapters should keep the same operating frame

Learners already know how to:

- start a new conversation
- reopen a previous session
- watch streaming output grow
- treat a chat as a continuing task rather than a one-shot prompt

`05` and `06` should not force them to relearn the chat interaction model. The differences should live in what the chapter asks them to inspect and how the backend handles the request.

### 2. Teaching differences should come from observable context, not fake replies

`05` is about how memory and skills influence the same real conversation.
`06` is about how provider abstraction keeps one chat surface while swapping execution paths.

So both chapters should use real model output as the baseline, then expose differences through request context, metadata, and right-rail teaching panels.

### 3. Root environment configuration remains the default entry point

To keep the repository feeling like one continuous tutorial instead of six isolated apps, `05` and `06` should adopt the same root `.env.local` convention as `01-04`.

After learners configure the earlier chapters, they should not need to duplicate setup for the later ones.

## Chapter 05 Design

### Layout

`05-memory-and-skills` moves to a three-column layout:

- left: session history and new chat entry
- middle: real chat transcript, input, and streaming status
- right:
  - `MemoryPanel`
  - `SkillSelector`
  - `Prompt Preview`
  - visible notes about the active memory and skill setup

The right rail keeps the chapter’s teaching focus, but the main shell aligns with `01-04`.

### Real chat flow

`POST /api/chat` in `05` no longer calls the local `buildTeachingReply`.
Instead it should:

1. read the user message, `sessionId`, `selectedSkillId`, and `memoryIds`
2. resolve the selected skill preset
3. load the selected memory entries
4. compose skill instructions and memory blocks into request context
5. call the real Agent SDK
6. stream the result back through SSE
7. persist user and assistant messages in session storage

### Teaching expression for skill and memory

This chapter should no longer rely on deterministic template output to show skill differences. Those differences should show up in real model behavior:

- `teacher`: explanation-first and step-by-step
- `builder`: implementation-oriented and plan-oriented
- `reviewer`: risk-oriented and critique-oriented

Memory should likewise become real injected context rather than a fixed reply template input. The right-side `Prompt Preview` remains important so learners can still inspect how the request was composed.

### Session continuity

Within the same chapter, learners should be able to send multiple turns and observe:

- how a single `session` keeps prior context
- how switching skills changes the next turn’s framing on top of the same chat history
- how changing selected memory entries alters the request context

The point is not to build a production memory platform, but to treat memory as structured context that can be selectively injected.

## Chapter 06 Design

### Layout

`06-remote-and-multi-provider` also moves to the same three-column shape:

- left: session history and new chat entry
- middle: real chat transcript, input, and streaming status
- right:
  - `ProviderSwitcher`
  - `ProviderInspector`
  - visible provider metadata, execution mode, and result notes

### Real provider routing

`POST /api/chat` remains the unified entry point, but it should no longer return tutorial-only simulated text.

The updated flow becomes:

1. the front end always sends the same request contract
2. the server chooses a provider implementation from `providerId`
3. each provider decides how execution is routed and which metadata is attached
4. the actual reply still comes from the real model
5. the response streams back through the same SSE contract
6. session persistence and resume behavior stay consistent

### Boundary between local and remote-style providers

This chapter still does not introduce real remote infrastructure, so `remote-style` remains a teaching abstraction rather than a production remote worker system.

But it should not just emit fake copy. A better model is:

- `local` provider: use the SDK locally to get real model output
- `remote-style` provider: still run in-process, but express a remote-style boundary through provider wrapping, extra metadata, latency simulation, or routing notes

That way the learner sees a real difference in execution path and abstraction boundary, not a split between “real” and “fake”.

### Teaching expression for provider abstraction

This chapter needs to show two things clearly:

1. the UI and request contract stay stable
2. the provider layer can swap execution paths and metadata

That makes the right-side inspector the main teaching surface while the center chat experience stays familiar.

## Shared Infrastructure Design

### Environment variables

Both chapters should load the repository root `.env.local` by default.

The main configuration values include:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- any existing debug or teaching-oriented settings

Per-chapter `.env.local` files may remain optional overrides, but should no longer be the documented default entry point.

### Model configuration

Both chapters should adopt the same model configuration helper pattern used earlier:

- a default model constant
- trim/fallback handling for `ANTHROPIC_MODEL`
- matching regression tests

### Session storage

Both chapters should add or reuse the same session capabilities as `01-04`:

- `GET /api/sessions`
- `GET /api/sessions/[id]`
- optional delete support
- `.data/sessions/*.jsonl` or an equivalent structured persistence format

This ensures learners can reopen and continue work in `05-06`, not just keep a temporary in-page transcript.

### Streaming contract

Both chapters should use the same SSE model as earlier chapters:

- `content` for incremental text
- `result` for completion and session metadata
- `error` for failures

If `06` needs extra provider-specific metadata, it should extend the baseline contract rather than replacing it.

## Front-End Unification Strategy

### Parts aligned with 01-04

Both `05` and `06` should align on:

- the left session rail
- the central scrollable message area
- the location of the input and send controls
- the `Session: xxx` header treatment
- empty, error, and streaming states
- the same new-chat and resume-session interaction flow

### Parts that remain chapter-specific

The right rails do not need to be identical.

They should preserve:

- `05` memory / skill / prompt preview teaching panels
- `06` provider switcher / inspector teaching panels

The goal is “one product series with chapter-specific instrumentation”, not “one screen with swapped labels”.

## Documentation and Test Synchronization

This change must keep at least these docs aligned:

- root `AGENTS.md`
- `05-memory-and-skills/AGENTS.md`
- `06-remote-and-multi-provider/AGENTS.md`
- root `README.md` if chapter summaries or env guidance change
- `05-memory-and-skills/README.md`
- `06-remote-and-multi-provider/README.md`

If learning-assistant targets, steps, or implementation-view explanations change, the change must also update:

- `05-memory-and-skills/lib/learning-assistant-script.ts`
- `06-remote-and-multi-provider/lib/learning-assistant-script.ts`
- the corresponding tests

Recommended test coverage includes:

- env-driven model configuration
- session storage and session API behavior
- provider / skill / memory request composition
- learning-assistant target regressions
- key Chinese UI copy assertions

## Risks and Trade-Offs

### 1. Real model output is less deterministic than tutorial templates

This is an intentional trade-off. The teaching goal shifts from “fixed sample answer” to “how request context changes real model behavior”.

To offset that, the UI should keep strong visible context surfaces such as:

- `05` Prompt Preview
- `06` provider metadata and execution mode notes

### 2. Reusing the existing 01-04 chat foundation requires some migration work

That cost is worth paying because it buys:

- a more consistent learner experience
- less duplicated environment setup
- more reliable session and SSE behavior

### 3. The word “remote” in chapter 06 can be overread as real remote execution

So the copy must continue to say clearly:

- this is a remote-style or remote-like teaching abstraction
- it is not production distributed infrastructure
- the main lesson is provider abstraction, not deployment architecture

## Acceptance Criteria

After implementation:

1. Both chapters run from model configuration in the repository root `.env.local`.
2. Both chapters support new sessions, restored sessions, and multi-turn conversations.
3. Both chapters show real streamed model output instead of locally fabricated reply strings.
4. Both chapters adopt the same three-column workspace style as `01-04`.
5. `05` still clearly teaches memory, skills, and prompt preview.
6. `06` still clearly teaches provider switching, inspection, and execution mode.
7. The related README files, AGENTS files, learning-assistant scripts, and tests stay in sync.
