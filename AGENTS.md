# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a tutorial repository for the Codex Agent SDK, structured as a monorepo containing multiple Next.js-based tutorial projects. The naming convention (01-quick-start, 02-xxx, etc.) indicates sequential learning modules.

At the root level, keep the tutorial narrative aligned with a beginner-first progression:
- `00-playground` and `00-playground-v2` are the mental-model entry points
- `01-quick-start` to `06-remote-and-multi-provider` are the currently runnable mainline chapters
- Root `README.md` may include homepage badges and a language-navigation line, but badge labels and language state must match the real repo status (for example, do not link to untranslated docs that do not exist yet)
- If a root-level `README.en.md` exists, keep its chapter list and repo-status summary aligned with the Chinese `README.md`, even if the English page is intentionally shorter

## Package Manager

**Always use pnpm** - This project exclusively uses pnpm as the package manager.

```bash
# Install dependencies
pnpm install

# Run commands in specific workspace
cd 01-quick-start && pnpm dev
```

## Project Structure

- **Monorepo Layout**: Each numbered directory (01-quick-start, etc.) is a self-contained Next.js tutorial project
- **Individual workspaces**: Each tutorial project has its own package.json and can be run independently
- **Shared configuration**: Root-level .npmrc and .gitignore apply to all projects
- **Design docs**: Architecture/spec documents for repo-wide tutorial evolution are stored under `docs/superpowers/specs/`
- **Implementation plans**: Execution plans for multi-step tutorial upgrades are stored under `docs/superpowers/plans/`

## Development Commands

Within each tutorial project directory:

```bash
pnpm dev      # Start Next.js development server on http://localhost:3000
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## TypeScript Configuration

- **Strict mode enabled**: All projects use strict TypeScript settings
- **Path aliases**: `@/*` maps to the project root (e.g., `@/app/components`)
- **Never use 'any' type**: Always create proper interfaces/types
- **Target**: ES2017 with modern ESNext modules

## Code Style Requirements

1. **Type Safety**: Create interfaces instead of using `any` type
2. **Communication**: Always explain design decisions before making significant changes
3. **Next.js App Router**: Projects use Next.js 16+ with App Router (not Pages Router)
4. **React Server Components**: Default to Server Components; use 'use client' only when needed

## Documentation Requirements

**CRITICAL - MUST FOLLOW**: 所有文件变化都必须同步更新到 AGENTS.md 文档中:

1. **根目录文件变化** → 必须更新根目录的 `AGENTS.md`
   - 添加/删除配置文件(.gitignore, .npmrc, tsconfig.json 等)
   - 添加/修改根目录环境变量示例文件（如 `.env.local.example`）
   - 添加/修改根目录许可证文件（如 `LICENSE`）
   - 修改项目结构(添加新的教程目录等)
   - 更新依赖或工具链

2. **教程项目内文件变化** → 必须更新对应项目的 `AGENTS.md`
   - 例如: `01-quick-start/` 内的变化 → 更新 `01-quick-start/AGENTS.md`
   - 包括: 新增组件、修改配置、添加工具函数、更新依赖等
   - 如果项目还没有 AGENTS.md,考虑创建一个

3. **更新内容要求**:
   - 说明新文件的用途和位置
   - 记录重要的配置变化
   - 更新相关的开发命令或工作流程
   - 保持文档与代码同步

**违反此规则会导致未来的 Codex 实例无法正确理解项目状态**

## Technology Stack

### 00-playground-v2
- Codex Agent SDK V2 Unstable Session API (`unstable_v2_createSession`, `unstable_v2_resumeSession`, `unstable_v2_prompt`)
- TypeScript 5 + tsx 运行时
- 交互式 CLI 多轮对话测试环境
- 支持会话持久化与恢复
- 详见 `00-playground-v2/AGENTS.md`

### 01-quick-start
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- ESLint with Next.js config

### 02-tools-and-mcp
- Next.js 16.1.6 (App Router) + Monorepo (pnpm workspace)
- PromaAgent 事件驱动架构
- 工具活动可视化系统
- Shadcn UI + framer-motion
- 详见 `02-tools-and-mcp/AGENTS.md`

### 03-agent-with-permission
- 基于 02-tools-and-mcp 架构，新增 Agent 权限控制功能
- Next.js 16.1.6 (App Router) + Monorepo (pnpm workspace)
- 详见 `03-agent-with-permission/AGENTS.md`

### 04-agent-teams
- 基于 03-agent-with-permission 架构，新增 Agent Teams 多 Agent 协作功能
- Next.js 16.1.6 (App Router) + Monorepo (pnpm workspace)
- Orchestrator-Subagent 模式，支持多 Agent 并行协作
- 详见 `04-agent-teams/AGENTS.md`

### Planned Future Chapters
- `05-memory-and-skills`：当前已落地为可运行章节，用于讲解 memory、skills 与能力模块化
- `06-remote-and-multi-provider`：当前已落地为可运行章节，用于讲解 remote execution 与 provider abstraction

### Tutorial Expansion Specs
- `docs/superpowers/specs/` 用于存放教程体系升级、章节规划、实现设计等文档
- 当根目录教程路线、章节结构或新增教程目录发生变化时，需要同步更新这里的设计文档或新增对应 spec
- 如果新增章节涉及新的教学定位，需确保 spec、根 README 与根 AGENTS.md 三者描述一致
- 如果同一份教程扩展 spec 同时存在英文版和中文版，两个版本必须保持同步更新；修改任一版本时，都要检查另一版本是否需要同步，避免维护责任不清或内容漂移
- 当前仓库已新增章节内学习引导设计 spec：`2026-04-18-chapter-learning-assistant-design.md` 与 `2026-04-18-chapter-learning-assistant-design.zh-CN.md`，后续如果实现页面内浮层/抽屉式学习助手，相关章节 README、实现代码与对应 `AGENTS.md` 必须一起维护

### Tutorial Expansion Plans
- `docs/superpowers/plans/` 用于存放多步骤教程升级任务的执行计划
- 当一次改动同时涉及多个章节、根文档与新教程目录时，应先补充 plan 再开始实现
- plan 中的目录结构、验证命令与最终落地文件应保持一致，避免执行过程中产生文档漂移
- 当前仓库已新增章节学习助手 implementation plan：`2026-04-18-chapter-learning-assistant.md`，后续若调整章节内浮层/抽屉式学习助手的落地范围、验证命令或目标文件，需要同步更新该 plan
- 当前仓库已新增章节学习助手手动测试文档：`2026-04-18-chapter-learning-assistant-manual-test-plan.md`，后续若调整章节学习助手的交互、观察点或验收标准，需要同步更新这份手动测试计划
- 当前仓库已新增 03 章节权限排查总结：`2026-04-18-chapter-03-permission-debug-summary.md`，后续如果再调整 03 章节的权限审批链路、模型配置、工作区范围或 SDK 兼容策略，需要同步更新这份排障文档，避免重复踩坑

### Key Files
- `app/layout.tsx`: Root layout with Geist font configuration
- `app/page.tsx`: Homepage
- `app/globals.css`: Global Tailwind styles
- `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript configuration with strict mode
- `.env.local.example`: 仓库级共享环境变量模板，默认供 `01` 到 `04` 章节复用

## Common Patterns

### Adding New Tutorial Projects

When adding a new tutorial (e.g., 02-xxx):
1. Create new directory with sequential numbering
2. Initialize as Next.js project with TypeScript
3. Add its own README.md and optionally AGENTS.md
4. Ensure it follows the same configuration patterns (TypeScript strict, pnpm, Tailwind)

### Working with Environment Variables

All .env* files are gitignored. Each tutorial project should:
- Use .env.local for local development secrets
- Document required environment variables in its README.md

### Path Aliases

Use the `@/*` alias for imports:
```typescript
// Good
import { Component } from '@/app/components/Component'

// Avoid
import { Component } from '../../../components/Component'
```
