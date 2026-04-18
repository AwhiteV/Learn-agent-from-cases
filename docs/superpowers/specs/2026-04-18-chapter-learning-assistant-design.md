# Chapter Learning Assistant Design

**Date:** 2026-04-18

**Owner:** Codex

> A synchronized Chinese translation is available at `docs/superpowers/specs/2026-04-18-chapter-learning-assistant-design.zh-CN.md`.

## Background

The repository already presents each chapter as a runnable tutorial case, but the actual learning guidance still lives mostly in chapter READMEs. That means a beginner often understands the case only after switching back and forth between two contexts:

1. The running UI where the chapter behavior happens.
2. The README where the recommended exploration order and concept explanations live.

This split creates friction for the exact learners the repository is trying to serve. A beginner can run a chapter and still not know:

- What to click first
- Which part of the UI matters most
- What behavior they are supposed to notice
- Which Agent SDK concept the observed behavior represents

The requested improvement is an in-product learning layer that appears while a chapter is running, guiding the learner through a small number of recommended interactions and short concept explanations without replacing the chapter UI itself.

## Goals

1. Add chapter-level interactive learning guidance to runnable chapters.
2. Keep the core chapter UI intact; the learning layer should assist, not dominate.
3. Provide a shared interaction shell across chapters so the repository feels like one series.
4. Allow each chapter to express slightly different teaching patterns based on its concept focus.
5. Help beginners connect visible UI behavior to the right concepts, terms, and files.
6. Add an advanced “implementation view” for learners who have already run the case and now want to understand code structure, function responsibilities, and data flow.

## Non-Goals

1. Building a full LMS-style course platform inside each chapter.
2. Replacing chapter READMEs as the source of broader explanation and setup instructions.
3. Forcing identical interaction flows on chapters whose learning patterns differ.
4. Adding long, blocking tours that overwhelm repeat users.

## Design Summary

The repository should add a **chapter learning assistant** with this model:

- A **right-side drawer** is the primary learning surface.
- The same drawer includes a **mode switcher**.
- **Local floating hints** are used only for key moments that benefit from stronger “click here / look here” guidance.
- All chapters share one assistant shell, but each chapter can provide its own learning script and optional custom step types.

This is intentionally a **light teaching layer** rather than a tutorial takeover.

More specifically, the drawer should support two complementary views:

- A default **guided action view** for beginners that emphasizes what to do next, where to look, and why it matters.
- An optional **implementation view** for advancing learners that explains files, functions, internal coordination, and data flow behind the same step.

## Core Experience Principles

### 1. Guidance should live inside the running case

The learner should not need to leave the page to know what to try next. The running chapter page should provide:

- The next suggested interaction
- The UI area worth watching
- The expected signal or behavior
- A short explanation of why it matters

### 2. The chapter remains the primary surface

The assistant must not permanently consume major layout space or visually overpower the runnable case. It should be easy to open, close, restart, and ignore.

### 3. Repetition should feel familiar, not stale

Every chapter should feel like part of the same series, but not like the exact same walkthrough with nouns swapped. The shell stays stable; the teaching script can vary.

### 4. Short explanations beat dense lessons

Each step should explain only one meaningful thing. The target is not full conceptual completeness; it is clarity at the moment of interaction.

## Proposed Interaction Model

### Shared Shell

Each runnable chapter gets a consistent learning assistant shell with:

- A persistent entry point such as `Learning Assistant`
- A right-side drawer as the main container
- A mode switcher such as `Guided Actions / Implementation View`
- Chapter title and progress state
- Step navigation
- Close and restart actions
- Optional completion state
- Lightweight concept chips or term notes

The switching rules should remain simple and stable:

- The drawer opens in the guided action view by default.
- Learners opt into the implementation view manually.
- Switching modes does not change the current step; it only changes how that step is explained.
- If a chapter or step does not yet provide implementation-view content, the drawer should fall back gracefully instead of showing empty structure.

### Optional Floating Hints

Floating hints are only shown when a step benefits from local context. Examples:

- Highlight the chat input for the very first message
- Point at the tool activity panel when tool execution begins
- Point at the permission panel when an approval request appears
- Point at the provider switcher before a side-by-side comparison

The drawer remains the source of structure; floating hints are transient reinforcements.

## Information Architecture

Each learning step should be small and predictable. A good default structure is:

1. **Do this**
   The concrete action to take.
2. **Watch here**
   The UI region to pay attention to.
3. **You should notice**
   The expected behavior or signal.
4. **Why it matters**
   The short concept connection.

Optional supporting blocks can be added per step:

- `Term note`
- `Compare this with the previous run`
- `Open the implementation file`
- `Mark as done`

### Implementation View Information Architecture

The implementation view should not be a static code glossary. It should explain the current step as a causal chain:

`what the learner just did -> what changed in the UI -> what happened internally -> which files/functions matter -> how they coordinate -> how data flows`

Recommended default structure:

1. **Behavior chain**
   A short path from user action to visible outcome.
2. **What happened**
   A concise explanation of the internal cause-and-effect for this step.
3. **Read the code**
   A short list of key files and functions with one-line role descriptions.
4. **Data flow**
   A compact path showing how input, state, SDK calls, and output move through the system.

To keep the drawer readable, `Behavior chain` and `What happened` should be expanded by default, while `Read the code` and `Data flow` should be collapsible.

## Shared Step Types

The shared shell should support a small set of reusable step patterns:

- **Action step**
  The learner performs a concrete operation.
- **Observation step**
  The learner watches a region for behavior changes.
- **Comparison step**
  The learner repeats the same request under different conditions.
- **Term step**
  The learner gets a compact explanation of a concept or term.
- **Code mapping step**
  The learner is shown where to inspect the implementation.
- **Checkpoint step**
  The learner gets a short recap of what this chapter added.

Chapters do not need every type, but the shared shell should make these patterns easy to express.

### Dual-View Step Model

The repository should keep one chapter script per chapter and extend each step to support two views rather than introducing a separate implementation-view script system. A single step should therefore contain:

- one beginner-oriented guided action block
- one optional implementation-view block

This keeps the learning path stable across both modes and makes progressive rollout practical:

- the same user action stays mapped to the same step in both modes
- existing chapters can add implementation-view content incrementally
- the chapter README, page UI, and learning assistant can stay aligned around one shared sequence

Recommended implementation-view fields include:

- `trigger`: what the learner just did
- `visibleEffect`: what changed in the visible UI
- `internals`: what happened internally
- `files`: which files matter most
- `functions`: which functions deserve attention
- `dataFlow`: the path data takes through the system
- `relationships`: how the listed modules or functions cooperate

## Chapter-Level Customization Model

The recommended implementation is:

- One shared learning assistant UI shell
- One chapter-specific learning script per chapter
- Optional chapter-specific behavior flags or view integrations

This keeps the series cohesive while allowing chapters to differ in teaching rhythm.

Recommended split of responsibilities:

- Shared shell owns:
  - Open/close state
  - Drawer layout
  - Step rendering
  - Progress tracking
  - Generic highlight/hint rendering
- Chapter script owns:
  - Step list
  - Step type
  - Highlight target
  - Term notes
  - Optional code references
  - Optional implementation-view content
  - Chapter completion summary

## Implementation View Maintenance Constraints

To avoid turning the implementation view into an oversized second documentation system, the repository should follow these constraints:

- Each advanced step explains one user action, not multiple parallel branches.
- Files and functions should be limited to the minimum set needed to understand the current behavior.
- A good default limit is `2-4` files and `3-6` functions per step.
- The drawer should not duplicate long README background sections; it supports runtime understanding, while the README remains the chapter narrative.
- The first version should be hand-authored rather than auto-generated so the explanations stay accurate and pedagogically deliberate.

## Recommended Rollout

The repository should not try to fill in implementation-view content for all runnable chapters at once. A staged rollout is safer:

1. Start with `05-memory-and-skills`
   - best suited for explaining memory selection, skill presets, and prompt assembly
2. Extend to `06-remote-and-multi-provider`
   - best suited for explaining provider switching, stable abstractions, and backend differences
3. Once the structure is validated, expand to `02`, `03`, and `04`
   - covering tool event flow, permission branching, and multi-agent orchestration
4. Re-evaluate `01-quick-start` last
   - it may only need a lighter code map instead of a full implementation view

## Chapter Content Recommendations

### `01-quick-start`

Teaching focus:

- Streaming output
- Session persistence
- New session vs resumed session
- Workspace awareness

Recommended steps:

1. Send the first message.
2. Watch the streaming response grow.
3. Look for the new session entry.
4. Start a new session and confirm context resets.
5. Return to the old session and observe resume behavior.
6. Inspect the workspace file area.

### `02-tools-and-mcp`

Teaching focus:

- The agent is acting, not just answering
- Tool lifecycle visibility
- Why MCP matters as a structured tool boundary

Recommended steps:

1. Ask a file-reading or repo-inspection question.
2. Watch the tool activity panel.
3. Observe start, running, and result states.
4. Compare tool activity with the final answer.
5. Optionally map the behavior to the event abstraction code.

### `03-agent-with-permission`

Teaching focus:

- Permissions change behavior, not just wording
- Allow vs deny comparison
- Structured human input through `AskUserQuestion`

Recommended steps:

1. Trigger a permission-requiring request.
2. Deny once.
3. Repeat and allow once.
4. Compare the two execution paths.
5. Trigger and answer an `AskUserQuestion` scenario.

### `04-agent-teams`

Teaching focus:

- When task decomposition helps
- Orchestrator vs subagent roles
- Resume and aggregation flow

Recommended steps:

1. Submit a multi-part request that benefits from decomposition.
2. Watch for teammate/task activity instead of immediate direct output.
3. Inspect teammate or task tree state.
4. Observe task lifecycle events.
5. Judge whether the final answer actually consumed subagent output.

### `05-memory-and-skills`

Teaching focus:

- Memory is not the same as chat history
- Skill mode is not the same as random style variation
- Context injection is observable

The implementation view is especially valuable here because it can explain:

- how memory selection contributes to prompt assembly
- how skill presets change the system prompt shape
- why the same user question produces different outputs when injected context changes

Recommended steps:

1. Create two memory items.
2. Inject only one and ask a question.
3. Keep the question fixed and switch skill mode.
4. Keep the skill fixed and switch memory combinations.
5. Remove a memory item and repeat.

### `06-remote-and-multi-provider`

Teaching focus:

- What changes across providers
- What should stay stable
- Why provider abstraction protects the UI layer

The implementation view is especially valuable here because it can explain:

- which transcript and UI behaviors should remain stable after a provider switch
- how request configuration maps onto different provider adapters
- how provider notes and execution mode relate to the backend boundary

Recommended steps:

1. Send a message with the default provider.
2. Switch provider and repeat the exact same message.
3. Inspect the provider panel.
4. Compare execution mode and provider notes.
5. Confirm that request and response contracts stay stable.

## UI and Behavior Guidelines

### Default Presence

- The assistant should be visible enough to discover quickly.
- It should not auto-expand into a blocking onboarding unless the chapter explicitly needs that for first-run teaching.
- A repeat visitor should be able to dismiss it easily.

### Tone

- Use concise, beginner-friendly language.
- Favor “try this” and “notice this” over dense prose.
- Explain terms in one sentence where possible.

### Length

- Most chapters should aim for 4 to 6 steps.
- Avoid more than one core concept per step.
- Use only 1 to 2 floating hints in a normal walkthrough unless a chapter strongly benefits from more.

### Accessibility

- The drawer should remain usable on desktop and mobile.
- Highlights and hints must not be the only way information is conveyed.
- The full step content must remain readable from the drawer itself.

## Content Source Strategy

The learning assistant should not become an isolated copywriting island. Its content should stay aligned with:

- The chapter README learning goals
- The actual visible UI of the chapter
- The real Agent SDK concept emphasized by that chapter

When chapter behavior changes, the corresponding learning script must be updated along with the README and relevant `AGENTS.md`.

## Suggested File Organization

Exact file names can vary by chapter, but the architecture should support:

- A shared learning assistant component/module
- A chapter learning script or config object
- A small target registration mechanism for optional highlights

Example shape:

- shared assistant UI in a common component area
- per-chapter script data stored near the chapter app code or in a chapter-local learning module

The important design constraint is not the exact directory; it is keeping shared UI logic separate from chapter teaching content.

## Implementation Boundaries

This design intentionally stays within a lightweight scope:

- No analytics pipeline is required in the first version.
- No user account progress sync is required.
- No heavy state machine framework is required unless a chapter truly needs it.
- No chapter should be forced into the same hint frequency or step composition.

## Validation Criteria

The design should be considered successful if a beginner can launch a chapter and quickly answer:

1. What should I do first?
2. What part of the UI should I pay attention to?
3. What behavior just happened?
4. Which concept does that behavior illustrate?
5. What did this chapter add compared with the previous one?

## Risks and Mitigations

### Risk: The assistant becomes too noisy

Mitigation:

- Keep the drawer as the primary structure.
- Use floating hints sparingly.
- Make dismiss and restart obvious.

### Risk: All chapters start feeling mechanically identical

Mitigation:

- Keep the shell stable, not the exact choreography.
- Let chapters choose different step mixes and emphasis.

### Risk: The guidance drifts away from the real UI

Mitigation:

- Co-locate chapter learning scripts near chapter code.
- Update scripts together with README and chapter `AGENTS.md`.
- Treat learning guidance as part of the runnable case, not separate marketing copy.

## Open Questions for Implementation Planning

1. Which chapters should receive the first implementation wave: `01` through `06`, or a smaller pilot set?
2. Should completion state be persisted locally per chapter, or only live in memory for the session?
3. Should code mapping links be included from the first version, or added after the basic walkthrough proves useful?

## Recommendation

Implement the feature as a **shared drawer-first teaching shell with chapter-specific learning scripts and optional local floating hints**.

This gives the repository:

- A consistent tutorial identity
- Enough flexibility for chapter-specific teaching patterns
- A low-risk path to incremental rollout
- A better bridge between runnable cases and conceptual understanding
