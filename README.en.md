# Learn-agent-from-cases

[![GitHub stars](https://img.shields.io/github/stars/AwhiteV/Learn-agent-from-cases?style=flat-square&logo=github)](https://github.com/AwhiteV/Learn-agent-from-cases/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AwhiteV/Learn-agent-from-cases?style=flat-square&logo=github)](https://github.com/AwhiteV/Learn-agent-from-cases/network/members)
[![License](https://img.shields.io/github/license/AwhiteV/Learn-agent-from-cases?style=flat-square)](https://github.com/AwhiteV/Learn-agent-from-cases/blob/main/LICENSE)
[![Tutorial Version](https://img.shields.io/badge/version-tutorial--2.0-22c55e?style=flat-square)](https://github.com/AwhiteV/Learn-agent-from-cases)
[![Claude Code Friendly](https://img.shields.io/badge/Claude%20Code-Friendly-7c3aed?style=flat-square)](https://claude.ai/code)
[![Agent SDK Tutorial](https://img.shields.io/badge/Agent%20SDK-Tutorial-2563eb?style=flat-square)](https://platform.claude.com/docs/en/agent-sdk/typescript)

🌐 **Language / 语言**: **English** | [中文](./README.md)

A Chinese-first tutorial repository for learning Agent SDK development from first contact to product-oriented agent architecture.

This repository is not a feature-by-feature clone of Proma, and it is not a translation of the official documentation. It is a hands-on learning path: you start with sessions, tools, MCP, and permissions, then gradually move toward teams, memory, skills, and provider abstraction.

## Who This Is For

This repository is a good fit if you:

- know basic JavaScript or TypeScript, and ideally some React
- have used LLM APIs but have not yet built a solid Agent SDK mental model
- prefer learning by running real examples and changing behavior yourself
- want to grow from a single chat agent to a more product-like agent application
- may later contribute to projects like Proma or build your own agent product

## Learning Map

The chapters below form a progressive path from fundamentals to product-oriented architecture:

| Chapter | Status | What You Build | Core Concepts | Product Capability |
| --- | --- | --- | --- | --- |
| [`00-playground`](./00-playground) | Available | A minimal CLI playground for prompts, tool toggles, and output modes | prompting, tool observation, minimal loop | behavior-first sandbox |
| [`00-playground-v2`](./00-playground-v2) | Available | A CLI lab for the newer Session API | `unstable_v2_createSession`, `unstable_v2_resumeSession`, `unstable_v2_prompt`, session lifecycle | mental-model training ground |
| [`01-quick-start`](./01-quick-start) | Available | Your first usable web agent with persistence and streaming UI | sessions, workspace, streaming UI, persistence | usable single-agent workspace |
| [`02-tools-and-mcp`](./02-tools-and-mcp) | Available | An agent app that can act with tools and visualize tool activity | tools, MCP, tool lifecycle, event visualization | action + observability |
| [`03-agent-with-permission`](./03-agent-with-permission) | Available | An agent app with approval and interception flows | permissions, `canUseTool`, `PermissionMode`, `AskUserQuestion` | safety and user control |
| [`04-agent-teams`](./04-agent-teams) | Available | A multi-agent orchestration example | teams, subagents, decomposition, resume flow | orchestrated collaboration |
| [`05-memory-and-skills`](./05-memory-and-skills) | Available | A learning assistant with memory panels and skill presets | memory, skills, context injection, modular behavior | continuity and personalization |
| [`06-remote-and-multi-provider`](./06-remote-and-multi-provider) | Available | A console for provider switching and remote-style execution | provider abstraction, remote-style execution, environment separation | product-facing integration layer |

## Suggested Study Order

If you want the most practical path:

1. Start with [`00-playground-v2`](./00-playground-v2) to understand sessions.
2. Move to [`01-quick-start`](./01-quick-start) for the first web-based agent.
3. Continue with [`02-tools-and-mcp`](./02-tools-and-mcp) to make the agent act.
4. Study [`03-agent-with-permission`](./03-agent-with-permission) to understand safety and approval.
5. Study [`04-agent-teams`](./04-agent-teams) to understand orchestration.
6. Use [`05-memory-and-skills`](./05-memory-and-skills) to learn how memory and mode switching shape behavior.
7. Finish with [`06-remote-and-multi-provider`](./06-remote-and-multi-provider) to understand provider abstraction and remote-style execution.

## Quick Start

If you want a web chapter first:

```bash
cd 01-quick-start
pnpm install
cp .env.local.example .env.local
pnpm dev
```

If you want a CLI lab first:

```bash
cd 00-playground-v2
pnpm install
cp .env.example .env.local
pnpm play
```

## Relationship To Proma

This tutorial series is inspired by the product direction of [Proma](https://github.com/ErlichLiu/proma-oss.git), especially the idea that agent products gradually need:

- tools and MCP integration
- permissions and human approval
- team orchestration
- memory and skills
- provider abstraction

But this repository is intentionally tutorial-scale. Its goal is to help learners understand why products like Proma are shaped this way, not to replace Proma itself.

## Important Note

- The repository is still Chinese-first.
- Some chapter-level READMEs and deeper docs may remain primarily in Chinese for now.
- This English README is a concise entry point rather than a full mirror of the Chinese homepage.

## Resources

- [Claude Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Proma](https://github.com/ErlichLiu/proma-oss.git)
- [MiniMax API Docs](https://platform.minimaxi.com/docs/guides/text-generation)
