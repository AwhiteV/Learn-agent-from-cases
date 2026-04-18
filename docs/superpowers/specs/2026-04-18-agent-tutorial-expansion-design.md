# Agent Tutorial Expansion Design

**Date:** 2026-04-18

**Owner:** Codex

> A synchronized Chinese translation is available at `docs/superpowers/specs/2026-04-18-agent-tutorial-expansion-design.zh-CN.md`.

## Background

`claude-agent-sdk-master` currently provides a useful chapter-by-chapter tutorial path, but the overall teaching arc is still weighted toward feature accumulation instead of beginner learning progression. The current structure explains important capabilities, yet it does not fully bridge three things that new agent developers need:

1. The official Claude Agent SDK mental model, especially sessions, built-in tools, MCP, permissions, hooks, subagents, and extensibility.
2. The product-oriented evolution visible in Proma, where chat grows into agent teams, skills, memory, remote usage, and provider abstraction.
3. Hands-on runnable cases that let a beginner learn by operating a concrete application rather than only reading architectural prose.

The user wants this repository enriched into a beginner-to-advanced tutorial series inspired by both the official Agent SDK documentation and the Proma project. The upgraded tutorial must remain friendly to beginners while moving toward realistic agent product patterns. Every newly added chapter must include a runnable case, not just documentation or static scaffolding.

## Goals

1. Reframe the repository as a progressive learning path for agent development beginners.
2. Preserve the existing strengths of chapters `00` through `04` while improving their teaching narrative.
3. Add two new practical chapters that extend the learning path toward productization:
   - `05-memory-and-skills`
   - `06-remote-and-multi-provider`
4. Ensure every chapter, including newly added ones, contains a runnable case that strengthens understanding through practice.
5. Keep the tutorial aligned with the current repository style: Next.js-based runnable projects, clear READMEs, and synchronized `AGENTS.md` documentation.

## Non-Goals

1. Rebuilding Proma feature-for-feature.
2. Implementing a production-grade long-term memory system in this iteration.
3. Implementing full remote infrastructure, authentication, distributed orchestration, or complex provider billing flows.
4. Rewriting the existing chapters into an entirely different numbering scheme.

## Audience

This tutorial is for developers who are new to agent development and want a path from first principles to advanced architecture:

- Developers who know basic JavaScript or TypeScript and some React.
- Developers who have used LLM APIs but have not yet internalized the Agent SDK mental model.
- Developers who learn best by running and modifying real examples.
- Developers who may later want to build or contribute to systems like Proma.

## Teaching Strategy

The upgraded tutorial will teach in three layers:

### Layer 1: Agent SDK Foundations

The learner should understand what makes the Agent SDK different from a plain chat-completions loop:

- Session lifecycle
- Workspace-bound execution
- Streaming output
- Resume-based context continuity
- Built-in tools and structured agent behavior

This layer is primarily served by:

- `00-playground-v2`
- `01-quick-start`

### Layer 2: Controlled, Actionable, Collaborative Agents

The learner should understand how to move from a basic chatting agent to a usable agent application:

- Tool usage
- MCP integration
- Permission control
- AskUserQuestion flows
- Multi-agent decomposition and orchestration

This layer is primarily served by:

- `02-tools-and-mcp`
- `03-agent-with-permission`
- `04-agent-teams`

### Layer 3: Product-Oriented Agent Systems

The learner should understand how real agent products extend beyond a single local chat loop:

- Memory beyond immediate context
- Skill modularization
- Remote interaction patterns
- Provider abstraction

This layer is introduced through:

- `05-memory-and-skills`
- `06-remote-and-multi-provider`

## Proposed Repository Narrative

The root README will present the repository as a practical progression from “first contact with Agent SDK” to “product-oriented agent architecture.”

Recommended chapter narrative:

1. `00-playground-v2`
   The fastest possible way to understand sessions, events, and prompting.
2. `01-quick-start`
   Build the first usable web agent and understand session persistence plus streaming UI.
3. `02-tools-and-mcp`
   Give the agent real actions and observe the tool lifecycle.
4. `03-agent-with-permission`
   Make the agent controllable and safe for real user-facing workflows.
5. `04-agent-teams`
   Move from a single agent to orchestrated collaboration.
6. `05-memory-and-skills`
   Introduce persistent memory and modular capability packaging.
7. `06-remote-and-multi-provider`
   Introduce remote execution patterns and provider abstraction for product-grade systems.

## Design Details

### Root-Level Changes

The root `README.md` will be rewritten to include:

- A clearer audience definition.
- A progressive learning map from beginner to advanced.
- A chapter-by-chapter “what you will build” guide.
- Explicit mapping from tutorial chapters to official Agent SDK concepts.
- Explicit mapping from tutorial chapters to product patterns inspired by Proma.
- A “how to study this repo” section for beginners.
- Common mistakes and prerequisites.

The root `AGENTS.md` will be updated to document:

- The revised learning architecture.
- The addition of chapters `05-memory-and-skills` and `06-remote-and-multi-provider`.
- Expectations that each tutorial chapter must remain runnable.
- Any updated workflow guidance needed to maintain consistency across the expanded series.

### Existing Chapter Enhancements

#### `00-playground-v2`

This chapter will be positioned as the first stop for understanding the Agent SDK mental model.

README enhancements:

- Explain the difference between Agent SDK sessions and manual message array management.
- Highlight `unstable_v2_createSession`, `unstable_v2_resumeSession`, and `unstable_v2_prompt` as the shortest path to understanding the SDK.
- Provide guided experiments a learner can try.

Runnable case stance:

- Keep it as a CLI-first experimental lab.
- Treat it as the smallest runnable case in the whole series.

#### `01-quick-start`

This chapter will be reframed as the learner’s first usable agent app.

README enhancements:

- Stronger explanation of workspace, session persistence, and streaming UI.
- Clearer “what to click and what to observe” walkthroughs.
- More explicit comparison with ordinary LLM chat implementations.

Runnable case stance:

- Keep the current web project.
- Use the README to turn it into a guided learning lab rather than just a feature description.

#### `02-tools-and-mcp`

This chapter will move from a tool-centric feature listing to a practical explanation of how an agent becomes actionable.

README enhancements:

- Clarify why MCP matters instead of hardcoding everything into prompts.
- Explain the tool lifecycle from request to activity visualization.
- Show how visible tool execution improves learner understanding.

Runnable case stance:

- Keep and strengthen the current tool activity case.
- Make the hands-on exercise flow more explicit.

#### `03-agent-with-permission`

This chapter will emphasize that permissions are foundational once an agent can act on the user’s behalf.

README enhancements:

- Explain why permission control is a core safety primitive, not a decorative UI layer.
- Clarify `canUseTool`, `PermissionMode`, and `AskUserQuestion` in beginner language.
- Add guided scenarios for approving and denying tool use.

Runnable case stance:

- Keep the existing permission flow.
- Increase the amount of “practice this scenario” guidance.

#### `04-agent-teams`

This chapter will focus more clearly on when and why multiple agents help.

README enhancements:

- Explain when multi-agent design is useful and when it is unnecessary.
- Clarify orchestrator responsibilities and subagent boundaries.
- Add beginner-friendly task decomposition examples.

Runnable case stance:

- Keep the current teams demo.
- Make the collaboration model more teachable through guided tasks.

### New Chapter 05: Memory and Skills

#### Chapter Goal

Teach the learner that memory is not the same thing as immediate context and that skills are reusable capability modules rather than one-off prompt fragments.

#### Runnable Case

Build a runnable tutorial project named `05-memory-and-skills` that acts as a “learning assistant with memory and mode switching.”

The case should allow the learner to:

- Start conversations in a web UI.
- Save structured background information such as user preferences, project context, or study goals.
- Inspect how memory is stored and injected.
- Switch or enable different skill modes for the assistant.
- Observe how the same question produces different behavior depending on memory and selected skills.

#### Conceptual Scope

This chapter should teach:

- Short-term context vs persistent memory
- Why memory improves continuity
- When memory becomes harmful or stale
- What a skill is in agent product design
- Why reusable skills help scale agent behavior

#### Suggested Implementation Shape

- Next.js App Router project
- Simple local persistence for memory records
- A visible panel for memory entries
- A visible selector for available skills or capability presets
- A chat panel that shows the effect of memory and skill choice

#### Deliberate Simplifications

- No production vector database
- No heavy retrieval architecture
- No full Proma memory engine
- Skills can initially be represented as structured presets, prompts, or capability configs so long as the user can operate them and observe the effect

### New Chapter 06: Remote and Multi-Provider

#### Chapter Goal

Teach the learner how agent systems begin to separate local UI concerns from execution targets and why provider abstraction becomes important in real products.

#### Runnable Case

Build a runnable tutorial project named `06-remote-and-multi-provider` that acts as a “remote agent console with provider switching.”

The case should allow the learner to:

- Switch between at least two provider configurations or simulated provider modes.
- Send the same task through a unified interface.
- Observe how the app routes execution through a common abstraction layer.
- Understand the difference between local invocation and remote-style invocation patterns.

#### Conceptual Scope

This chapter should teach:

- Why provider abstraction exists
- Why UI code should not care too much about provider-specific details
- What “remote agent” means in practical architecture terms
- Trade-offs between local workspace execution and remote execution
- The shape of a minimal provider adapter interface

#### Suggested Implementation Shape

- Next.js App Router project
- Provider abstraction layer with at least two implementations
- A small remote-style API boundary that the frontend calls
- UI controls for choosing provider or execution mode
- Response comparison or provider metadata display

#### Deliberate Simplifications

- No need for full multi-tenant backend architecture
- No need for real distributed workers
- No need to support many providers in the first pass
- One provider may be a lightweight adapter or mock mode if that best supports teaching clarity

## Documentation Requirements Per Chapter

Each chapter README should include these sections in an explicit beginner-friendly form:

1. What problem this chapter solves
2. What runnable case the learner will use
3. What to click, type, or observe in practice
4. Which Agent SDK concepts this teaches
5. How this maps to a real product capability inspired by Proma
6. What the learner should know before moving to the next chapter

## File and Directory Plan

### Modify

- `README.md`
- `AGENTS.md`
- `00-playground-v2/README.md`
- `01-quick-start/README.md`
- `02-tools-and-mcp/README.md`
- `03-agent-with-permission/README.md`
- `04-agent-teams/README.md`

### Create

- `05-memory-and-skills/`
- `05-memory-and-skills/README.md`
- `05-memory-and-skills/AGENTS.md`
- `05-memory-and-skills/package.json`
- `05-memory-and-skills/app/...`
- `06-remote-and-multi-provider/`
- `06-remote-and-multi-provider/README.md`
- `06-remote-and-multi-provider/AGENTS.md`
- `06-remote-and-multi-provider/package.json`
- `06-remote-and-multi-provider/app/...`

The exact file list for chapters `05` and `06` will be defined in the implementation plan, but each chapter must be a runnable tutorial project rather than a documentation-only placeholder.

## User Experience Principles

1. Beginners must be able to understand what each chapter is for before they understand every implementation detail.
2. Every new concept should be paired with a visible, runnable case.
3. UI and README content should encourage experimentation, not passive reading.
4. Existing chapters should remain consistent with the current repo style and not feel like unrelated products.
5. The new chapters should feel like natural steps after chapter `04`, not side essays.

## Risks and Mitigations

### Risk 1: Scope Explosion

Adding two new chapters plus revising all existing READMEs can become too large if every chapter is deeply reworked.

Mitigation:

- Focus implementation effort on the root README, chapter READMEs, and the two new runnable chapters.
- Keep existing code changes modest unless needed to support the revised teaching goal.

### Risk 2: Over-Modeling Proma

If the tutorial copies too much product complexity from Proma, it may become too hard for beginners.

Mitigation:

- Treat Proma as directional inspiration, not a direct implementation template.
- Choose tutorial-scale abstractions that preserve the lesson without requiring full product complexity.

### Risk 3: New Chapters Feel Theoretical

If chapters `05` and `06` are too abstract, they will break the hands-on learning promise.

Mitigation:

- Require both chapters to ship with runnable cases.
- Ensure the UI exposes the concept being taught, not just the final answer.

### Risk 4: Documentation and Code Drift

The repo already requires synchronized documentation.

Mitigation:

- Update root `AGENTS.md`.
- Add chapter-level `AGENTS.md` files for the new tutorial directories.
- Ensure README command examples match actual runnable structure.

## Testing and Validation Strategy

Before declaring the expansion complete:

1. Validate the root README against the actual repository structure.
2. Validate each updated chapter README against the actual runnable case in that chapter.
3. Confirm chapters `05` and `06` can install and start successfully.
4. Run lint and or build checks for newly added projects, at minimum enough to verify they are not broken scaffolds.
5. Confirm `AGENTS.md` files reflect all newly added tutorial structure and responsibilities.

## Success Criteria

This design is successful if:

1. A beginner can understand the full learning path from the root README.
2. Chapters `00` through `06` form a coherent progression instead of a loose feature list.
3. New chapters `05` and `06` are runnable and demonstrative.
4. The tutorial feels clearly inspired by real agent product architecture without overwhelming beginners.
5. The repository becomes a better bridge from first SDK experiments to product-oriented agent thinking.
