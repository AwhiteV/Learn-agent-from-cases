# Agent 教程扩展设计方案

**日期：** 2026-04-18

**负责人：** Codex

## 背景

当前 `Learn-agent-from-cases` 已经具备按章节递进的教程结构，但整体教学主线仍然更偏向“功能点堆叠”，而不是“适合初学者逐步建立心智模型的学习路径”。现有内容已经覆盖了不少重要能力，但对刚入门的 Agent 开发者来说，仍然缺少三座关键桥梁：

1. 官方 Claude Agent SDK 的核心心智模型，尤其是 sessions、内置工具、MCP、权限、hooks、subagents 与扩展能力。
2. Proma 所体现出的产品化演进路径，也就是从 chat 一步步发展到 agent teams、skills、memory、remote 与 provider abstraction。
3. 真正可操作、可运行的实践案例，让学习者不是只读架构说明，而是能通过上手操作来理解概念。

用户希望基于官方 Agent SDK 文档与 Proma 项目的思路，把这个仓库升级成一套面向初学者、从入门到进阶的 Agent 教程体系。升级后的教程既要对新手友好，又要逐步贴近真实产品中的 Agent 架构。同时，所有新增章节都必须是“可运行的案例”，不能只是文档或静态骨架。

## 目标

1. 将整个仓库重构为一条更清晰的 Agent 开发学习路径，服务入门开发者。
2. 保留现有 `00` 到 `04` 章的核心价值，同时增强它们的教学叙事。
3. 新增两个面向产品化能力的实践章节：
   - `05-memory-and-skills`
   - `06-remote-and-multi-provider`
4. 保证每一章，包括新增章节，都有可以通过实践加深理解的可运行案例。
5. 保持教程整体风格与当前仓库一致：基于 Next.js 的可运行项目、清晰的 README、以及同步维护的 `AGENTS.md` 文档。

## 非目标

1. 不在这一轮中按 1:1 方式完整复刻 Proma。
2. 不在这一轮中实现生产级的长期记忆系统。
3. 不在这一轮中实现完整的远程基础设施、认证体系、分布式调度或复杂的 provider 计费逻辑。
4. 不推翻现有编号体系并整体重排已有章节。

## 目标读者

本教程面向希望从第一性原理学到进阶架构的 Agent 开发初学者：

- 具备基础 JavaScript / TypeScript 能力，最好也了解一点 React 的开发者。
- 用过 LLM API，但还没有真正理解 Agent SDK 思维方式的开发者。
- 更适合通过“运行与修改真实案例”来学习的开发者。
- 后续可能希望自己构建 Agent 产品，或者参与 Proma 这类项目的开发者。

## 教学策略

升级后的教程将按三层能力递进展开：

### 第一层：Agent SDK 基础认知

学习者需要先理解，Agent SDK 与普通 chat-completions 循环最大的不同是什么：

- Session 生命周期
- 绑定 Workspace 的执行方式
- 流式输出
- 基于 `resume` 的上下文延续
- 内置工具与结构化 Agent 行为

这一层主要由以下章节承担：

- `00-playground-v2`
- `01-quick-start`

### 第二层：可行动、可控、可协作的 Agent

学习者需要理解，如何把一个“会聊天的 Agent”升级为“真正可用的 Agent 应用”：

- Tool usage
- MCP integration
- Permission control
- AskUserQuestion 流程
- 多 Agent 任务拆解与编排

这一层主要由以下章节承担：

- `02-tools-and-mcp`
- `03-agent-with-permission`
- `04-agent-teams`

### 第三层：面向产品化的 Agent 系统

学习者需要开始理解，真实 Agent 产品为什么不会停留在一个本地聊天循环里：

- 超越即时上下文的 Memory
- Skill 模块化
- Remote interaction patterns
- Provider abstraction

这一层将通过以下两个新增章节引入：

- `05-memory-and-skills`
- `06-remote-and-multi-provider`

## 仓库叙事方式调整

根目录 README 将把整个仓库重新呈现为一条从“第一次接触 Agent SDK”逐步走向“面向产品的 Agent 架构思维”的实践型学习路径。

建议的章节主线如下：

1. `00-playground-v2`
   用最快的方式理解 session、事件流与 prompting。
2. `01-quick-start`
   构建第一个真正可用的 Web Agent，并理解 session 持久化与流式 UI。
3. `02-tools-and-mcp`
   给 Agent 接上真实行动能力，并观察工具生命周期。
4. `03-agent-with-permission`
   让 Agent 在用户场景下变得可控、可审批、可安全使用。
5. `04-agent-teams`
   从单 Agent 走向协作式编排。
6. `05-memory-and-skills`
   引入持久记忆与能力模块化。
7. `06-remote-and-multi-provider`
   引入远程执行模式与多 Provider 抽象，迈向产品级 Agent 系统。

## 设计细节

### 根目录改动

根目录 `README.md` 将重写为以下内容结构：

- 更明确的目标读者说明
- 从入门到进阶的学习地图
- 逐章说明“这一章你会构建什么”
- 明确标出每一章对应的官方 Agent SDK 核心概念
- 明确标出每一章对应的、受 Proma 启发的产品能力映射
- 新手如何学习本仓库的建议方式
- 常见误区与前置知识要求

根目录 `AGENTS.md` 将同步更新，用来记录：

- 调整后的教程整体架构
- 新增 `05-memory-and-skills` 与 `06-remote-and-multi-provider` 两个章节
- 每个教程章节都必须保持“可运行”
- 为保持系列一致性而新增的工作流与文档维护要求

### 现有章节增强方案

#### `00-playground-v2`

这一章将被明确定位为理解 Agent SDK 心智模型的第一站。

README 需要增强：

- 解释 Agent SDK 的 session 与手动维护 message 数组之间的本质差异
- 强调 `unstable_v2_createSession`、`unstable_v2_resumeSession` 与 `unstable_v2_prompt` 是理解 SDK 的最短路径
- 增加学习者可以亲自尝试的实验步骤

可运行案例定位：

- 保持它作为 CLI 优先的实验场
- 把它视为整套教程里最小、最直接的 runnable case

#### `01-quick-start`

这一章将被重新定位为学习者的第一个“真正可用的 Agent 应用”。

README 需要增强：

- 更清晰地解释 workspace、session 持久化与流式 UI
- 更具体地说明“打开页面后要点什么、观察什么”
- 更明确地与普通 LLM Web Chat 实现做对比

可运行案例定位：

- 保留现有 Web 项目
- 通过 README 把它从“功能介绍”升级为“引导式学习实验”

#### `02-tools-and-mcp`

这一章将从“工具功能列表”升级为“让 Agent 真正开始行动”的实践教程。

README 需要增强：

- 解释为什么 MCP 的意义不只是“多接几个工具”
- 讲清楚工具从请求到可视化的完整生命周期
- 让学习者理解为什么把工具执行过程展示出来有助于理解 Agent 行为

可运行案例定位：

- 保留并强化当前的工具活动可视化案例
- 增加更清晰的上手练习路径

#### `03-agent-with-permission`

这一章将突出：当 Agent 已经具备行动能力后，权限控制不再是附加项，而是基础设施。

README 需要增强：

- 用初学者能理解的方式解释为什么权限控制是安全基础能力，而不是装饰性 UI
- 更清楚地说明 `canUseTool`、`PermissionMode` 与 `AskUserQuestion`
- 增加“允许 / 拒绝工具调用”的练习场景

可运行案例定位：

- 保留现有权限交互流程
- 增加更多“你现在可以这样练”的实践说明

#### `04-agent-teams`

这一章将更明确地聚焦于：什么时候多 Agent 有价值，什么时候不值得上多 Agent。

README 需要增强：

- 解释多 Agent 设计的适用边界
- 讲清楚 orchestrator 的职责与 subagent 的边界
- 增加更适合新手理解的任务拆解示例

可运行案例定位：

- 保留当前 teams demo
- 通过引导式任务让协作模型更容易学懂

### 新增第五章：Memory and Skills

#### 章节目标

让学习者理解：memory 与即时上下文不是一回事；skill 也不是单次 prompt 拼装，而是可复用的能力模块。

#### 可运行案例

新增一个可运行的教程项目 `05-memory-and-skills`，它将表现为一个“带记忆与模式切换能力的学习助手”。

学习者可以在这个案例中：

- 在 Web UI 中发起对话
- 保存结构化背景信息，例如用户偏好、项目上下文、学习目标
- 观察 memory 如何被存储与注入
- 切换或启用不同的 skill 模式
- 观察同一个问题在不同 memory / skill 组合下产生的不同行为

#### 教学范围

这一章应当帮助学习者理解：

- 短期上下文与持久记忆的区别
- 为什么 memory 会提升连续性
- 什么情况下 memory 也会造成污染或过时
- skill 在 Agent 产品设计里是什么
- 为什么复用型 skills 能帮助扩展 Agent 行为

#### 建议实现形态

- 基于 Next.js App Router
- 使用简单的本地持久化保存 memory 记录
- 提供一个可视化的 memory 面板
- 提供一个可视化的 skill / capability preset 选择器
- 提供一个聊天面板，能明显展示 memory 与 skill 对回答的影响

#### 有意简化的边界

- 不引入生产级向量数据库
- 不引入复杂 RAG / 检索架构
- 不尝试完整复刻 Proma memory engine
- skills 在第一版中可以先用结构化 preset、prompt 组合或 capability config 来表示，只要用户能实际操作并看见效果

### 新增第六章：Remote and Multi-Provider

#### 章节目标

让学习者理解：Agent 系统开始产品化后，UI 与执行目标会逐渐分离；同时，provider abstraction 为什么会成为真实产品中的必要层。

#### 可运行案例

新增一个可运行的教程项目 `06-remote-and-multi-provider`，它将表现为一个“支持 provider 切换的远程 Agent 控制台”。

学习者可以在这个案例中：

- 在至少两种 provider 配置或模拟 provider 模式之间切换
- 用统一界面发送同一个任务
- 观察应用如何通过统一抽象层路由执行
- 理解本地调用与 remote-style 调用模式之间的差别

#### 教学范围

这一章应当帮助学习者理解：

- 为什么需要 provider abstraction
- 为什么 UI 不应该深度耦合 provider 细节
- “remote agent” 在实践架构里到底意味着什么
- local workspace execution 与 remote execution 之间的权衡
- 一个最小 provider adapter interface 应该长什么样

#### 建议实现形态

- 基于 Next.js App Router
- 提供一层 provider abstraction，并至少实现两种 provider 模式
- 提供一个前端通过 API 调用的“远程风格”边界
- 提供 provider / execution mode 切换控件
- 显示结果对比或 provider metadata，帮助学习者看见差异

#### 有意简化的边界

- 不需要完整的多租户后端架构
- 不需要真实的分布式 worker 系统
- 不需要第一版就接很多 provider
- 如果更有助于教学清晰度，其中一个 provider 可以是轻量适配器或 mock 模式

## 每章 README 的统一要求

每个章节 README 都应当以适合初学者的方式，明确包含以下内容：

1. 这一章解决什么问题
2. 这一章对应的 runnable case 是什么
3. 学习者应该在实践中点什么、输什么、观察什么
4. 这一章教会了哪些 Agent SDK 概念
5. 这一章对应了哪些受 Proma 启发的真实产品能力
6. 学完这一章后，进入下一章前应该掌握什么

## 文件与目录规划

### 修改

- `README.md`
- `AGENTS.md`
- `00-playground-v2/README.md`
- `01-quick-start/README.md`
- `02-tools-and-mcp/README.md`
- `03-agent-with-permission/README.md`
- `04-agent-teams/README.md`

### 新增

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

`05` 与 `06` 两章的具体文件清单会在实现计划中进一步细化，但它们都必须是可运行教程项目，而不是仅有文档的占位目录。

## 用户体验原则

1. 初学者在理解所有实现细节之前，应该先知道每一章“是用来解决什么问题的”。
2. 每一个新概念都要配一个可见、可运行、可操作的案例。
3. UI 与 README 的内容要鼓励实验，而不是鼓励被动阅读。
4. 现有章节需要继续保持与当前仓库风格一致，不能让新章节看起来像两套互不相关的产品。
5. `05` 与 `06` 应该自然承接 `04`，而不是像横插进来的独立主题。

## 风险与缓解

### 风险 1：范围膨胀

新增两章并重写现有章节 README，工作量容易失控。

缓解策略：

- 把实现重点集中在根 README、各章节 README，以及两个新增可运行章节上
- 除非对教学目标有帮助，否则尽量避免大改现有项目代码

### 风险 2：过度照搬 Proma

如果把 Proma 的产品复杂度直接搬进教程，会显著提高初学者门槛。

缓解策略：

- 把 Proma 作为方向性参考，而不是直接模板
- 使用“教程尺度”的抽象，只保留有教学价值的复杂度

### 风险 3：新增章节过于理论化

如果 `05` 与 `06` 只是概念展示，就会破坏“通过实践理解”的承诺。

缓解策略：

- 明确要求两个新增章节都必须提供 runnable case
- UI 需要让学习者看见“概念如何影响行为”，而不是只看结果文本

### 风险 4：文档与代码漂移

仓库本身已经明确要求文档同步。

缓解策略：

- 更新根目录 `AGENTS.md`
- 为新增教程目录创建章节级 `AGENTS.md`
- 确保 README 中的命令与实际可运行结构一致

## 测试与验证策略

在宣布本次教程扩展完成前，需要完成以下验证：

1. 校验根 README 与真实仓库结构一致。
2. 校验每个更新后的章节 README 与对应章节里的 runnable case 一致。
3. 确认 `05` 与 `06` 两章可以成功安装并启动。
4. 对新增项目至少执行 lint 和 / 或 build 验证，确保它们不是坏掉的空骨架。
5. 确认所有相关 `AGENTS.md` 都已经同步反映新增结构与职责。

## 成功标准

如果满足以下条件，就说明本设计是成功的：

1. 初学者从根 README 就能看懂整条学习路径。
2. `00` 到 `06` 各章节形成了一条清晰的能力递进，而不是松散的功能列表。
3. `05` 与 `06` 两章都是真正可运行、可演示的案例。
4. 整套教程明显受真实 Agent 产品架构启发，但不会让初学者一开始就被复杂度压垮。
5. 这个仓库能够更好地连接“第一次接触 Agent SDK”与“开始具备产品化 Agent 思维”之间的鸿沟。
