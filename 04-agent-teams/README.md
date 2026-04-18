# Claude Agent SDK 系列教程 - 第四章：Agent Teams

这一章讲的不是“把更多 Agent 堆进去”，而是“什么时候多 Agent 值得，什么时候不值得”。你会看到一个已经接好权限系统、工具活动可视化和 team 状态展示的多 Agent 实验场，用来观察任务拆解是否合理。

## 快速开始

```bash
cp ../.env.local.example ../.env.local
# 只需要在仓库根目录初始化一次共享配置
# 在仓库根目录的 .env.local 中填写 ANTHROPIC_API_KEY
cd 04-agent-teams
pnpm install
pnpm dev
```

`01-04` 章节默认都会复用仓库根目录的 `.env.local`，所以学习新章节时通常不需要重复配置。若你确实想只覆盖本章配置，仍然可以手动在 `04-agent-teams/` 目录里额外放一个 `.env.local`。

打开 [http://localhost:3000](http://localhost:3000)。

页面右下角新增了“学习助手”抽屉入口，会引导你按顺序观察任务拆解、team 活动视图、任务列表、resume 汇总过程和最终综合回答。

## 这一章解决什么问题

单 Agent 很适合短路径任务，但当任务开始同时涉及检索、分析、文件处理、结果汇总，单个上下文就会越来越拥挤。这个时候，多 Agent 的价值才开始出现。

所以这一章解决的是：

- 多 Agent 什么时候值得使用，什么时候只是徒增复杂度
- orchestrator 和 subagent 应该怎么分工，才不会互相打架
- 作为产品使用者或开发者，如何判断一次任务拆解到底合不合理

这章的重点不是“理论上能并行”，而是“你能否看懂一次真实的协作过程”。

## 这一章的可运行案例是什么

这是一个可运行的 Agent Teams Web 应用，基于第三章继续扩展，真实包含：

- `PromaAgent` 对 team 相关事件的处理，如 `task_started`、`task_progress`、`task_notification`
- 前端的实时 teammate 状态展示与工具树视图
- `app/api/agent-teams/route.ts` 对 `~/.claude/teams` 和 `~/.claude/tasks` 中团队状态的读取
- team lead 在 worker 完成后继续 resume，会汇总 inbox 或任务摘要生成最终回答

也就是说，这一章不是只画一个架构图，而是让你实际看到 orchestrator 拆任务、worker 回结果、主 Agent 再做汇总的过程。

## 动手实践：你应该点什么 / 输入什么 / 观察什么

建议用一个明显需要拆分的请求来实验，比如：

`请先梳理这个项目的主要学习章节，再总结每章适合什么类型的学习者，最后给出一个两小时内可执行的学习顺序。`

你可以按下面的观察顺序来：

1. 先看主聊天区是否只是在直接吐答案，还是先进入等待 teammate 的状态。
   观察什么：如果任务真的被拆了，你会看到等待、进度、恢复汇总等阶段，而不是单条直出。

2. 看 teammate 列表或树状视图。
   观察什么：每个 subagent 是否有清晰职责，是否在做不同类型的子任务，而不是重复劳动。

3. 看 `task_started` 到 `task_notification` 的变化。
   观察什么：任务是否能闭环完成，还是出现长时间无产出的 worker。

4. 看最终汇总回答是否真的整合了前面的 worker 结果。
   观察什么：好的 orchestrator 不只是“开很多分身”，而是能把子任务结果重新组织成用户可用的最终输出。

新手判断一次任务拆解是否合理，可以抓三个信号：

- 子任务边界是否清楚
- worker 之间是否明显重复
- 最终汇总是否真正消费了子任务结果

## 这一章对应的 Agent SDK 概念

- 多 Agent 值得使用的典型场景：任务可拆分、子任务之间相对独立、最终需要统一汇总。
- orchestrator：负责理解用户目标、决定要不要拆、怎么拆、什么时候汇总。
- subagent：负责执行某一块明确子任务，而不是重新接管整个任务。
- auto-resume / 汇总恢复：当 worker 完成后，主会话继续运行，把 inbox 或摘要重新注入 team lead 的上下文中完成最后一跳。

一句话理解职责划分：

- orchestrator 负责“分”
- subagent 负责“做”
- team lead 的最终回复负责“收”

## 这一章与 Proma 产品能力的映射

- teammate 实时面板和树状视图，对应 Proma 里的多 Agent 过程可视化。
- task/inbox 读取接口，对应 Proma 里团队运行状态的外显数据层。
- 主会话等待、resume、汇总，对应 Proma 里 orchestrator 协调 worker 的核心工作流。

这一章可以看作 Proma 从“单 Agent 可观测”升级到“多 Agent 可协作、可解释”的关键一步。

## 学完这一章后你应该掌握什么

- 知道多 Agent 不是默认更高级，而是只在任务真的可拆时才值得用。
- 能解释 orchestrator / subagent 的职责划分。
- 能通过 teammate 状态、任务事件和最终汇总，判断一次任务拆解是否合理。
- 能把这一章和前面三章串起来，理解多 Agent 是建立在 session、工具、权限这些基础设施之上的。
