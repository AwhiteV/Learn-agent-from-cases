# Claude Agent SDK 系列教程 - 第五章：Memory 与 Skills

这一章把 Agent 的“记住谁在用它”和“切换成哪种工作模式”拆成两个初学者可以直接操作的概念。重点不是做一个复杂的长期记忆系统，而是把 memory 注入和 skill preset 的差异放到同一个界面里，让学习者亲手观察。

## 快速开始

```bash
cd 05-memory-and-skills
corepack pnpm install
cp .env.local.example .env.local
corepack pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 这一章解决什么问题

前几章已经讲了 session、tools、permissions、teams，但初学者通常还是会混淆两个问题：

- Agent 到底“记住”的是什么
- Agent 的“能力模式”到底是 prompt、工具还是产品配置

这一章专门把问题缩小成一个教学场景：

- memory 代表结构化背景信息，比如用户偏好、项目背景、学习目标
- skill 代表一个可切换的工作模式，比如 Teacher、Builder、Reviewer

这样学习者可以先看清楚“上下文注入”和“模式切换”分别影响什么，再把这些概念映射回更复杂的产品形态。

## 这一章的 runnable case 是什么

这是一个可运行的 Next.js 学习助手页面，核心交互包括：

- 在网页里发起对话
- 新增并保存 memory 条目到本地 `.data/memory.json`
- 勾选哪些 memory 会被注入到下一次回答
- 切换 `teacher`、`builder`、`reviewer` 三种 skill preset
- 直接查看系统 prompt 和 memory block 是如何拼到一起的

它不是一个“背后藏着很多魔法”的黑盒，而是一个可观察的教学工作台。

页面右下角现在还提供了一个“学习助手”浮层入口，会按章节步骤提示你先存 memory、再切 skill、再观察 transcript 和 prompt preview，方便第一次跑 case 的学习者不迷路。

## 动手实践：你应该点什么 / 输入什么 / 观察什么

推荐你按下面的顺序做：

1. 先添加两条 memory，比如一个 `preference` 和一个 `project`。
   观察什么：左侧 memory 列表会立即显示新条目，并且这些条目会被持久化到本地 `.data/memory.json`，说明它们不是一次性 UI 状态。

2. 只选择其中一条，发送问题，例如：`How should I learn TypeScript generics?`
   观察什么：右侧的 `Prompt preview` 和 `Injected memory block` 会清楚显示这次请求到底注入了哪条 memory，而不是把“记忆”藏在黑盒里。

3. 保持问题不变，只切换 skill preset。
   观察什么：同一个问题会因为 `teacher`、`builder`、`reviewer` 的不同而出现明显不同的回答结构。
   - `teacher` 更像讲解
   - `builder` 更像执行计划
   - `reviewer` 更像风险检查

4. 再保持 skill 不变，改成选择不同的 memory 组合。
   观察什么：回答会更贴近被注入的背景。
   - 偏好 memory 影响语气或表达方式
   - 项目 memory 影响例子和落地场景
   - goal memory 影响建议的方向

5. 删除一条已经保存的 memory，再重新发送同一个问题。
   观察什么：这次请求里的 `Injected memory block` 会变短，回答也会少掉对应背景影响，说明 memory 真的是“可存、可删、可控的上下文注入层”。

这就是这一章最重要的教学目标：让学习者看到“为什么同一个问题会因为 memory 和 skill 的不同而产生不同回答”。

## 这一章对应的 Agent SDK 概念

- Context injection：这一章虽然没有引入复杂记忆系统，但它很直观地展示了“回答变化”往往来自输入上下文变化，而不只是模型随机性。
- Structured memory：这里的 memory 不是无限堆积的聊天历史，而是被结构化保存、按需选择、显式注入的背景信息。
- Skill preset / system prompt shaping：`teacher`、`builder`、`reviewer` 本质上是稳定影响回答风格和工作方式的系统提示预设。
- Prompt observability：`Prompt preview` 和 `Injected memory block` 让学习者能直接看到“系统 prompt + 用户问题 + 选中的 memory”是如何共同组成一次请求的。

为什么这一章很重要？因为当 Agent 开始具备 memory 和不同工作模式后，用户最容易困惑的问题就变成“它为什么这么回答”。如果这些上下文和模式不可见，memory 和 skill 就会变成难以调试的黑盒；把它们做成可观察、可切换、可删除的输入层，才更接近可用的 Agent 产品。

## 这一章与 Proma 中 memory/skills 产品方向的映射

- 左侧 `Memory Panel`，映射到 Proma 中对用户背景、任务上下文、长期偏好的结构化记忆能力。
- 顶部 `Skill Selector`，映射到 Proma 中不同能力模式、专家角色或工作流预设。
- `Prompt preview`，映射到 Proma 里把 memory 与 skill 编排进 Agent 上下文的可解释层。
- 本地 `.data/memory.json` 存储，映射到产品早期验证阶段常见的“先把行为做对，再扩展存储层”的思路。

如果把前几章看作 Agent 基础设施，这一章就是把“理解用户”和“切换工作方式”这两件事拉进产品视角。

## 关键文件

- `app/page.tsx`：页面入口，挂载教学工作台
- `components/chat-interface.tsx`：组合 Memory Panel、Skill Selector 和响应调试视图
- `components/learning-assistant.tsx`：页面内抽屉式学习助手
- `components/memory-panel.tsx`：管理 memory 列表、添加表单、注入开关和删除操作
- `components/skill-selector.tsx`：切换 skill preset
- `app/api/memory/route.ts`：读取、写入和删除 memory
- `app/api/skills/route.ts`：返回 skill presets
- `app/api/chat/route.ts`：把 memory block 与 skill system prompt 组合后生成示例回答
- `lib/memory-store.ts`：`.data` 下的本地 JSON 持久化
- `lib/skill-presets.ts`：Teacher / Builder / Reviewer 三个模式定义
- `lib/chat-engine.ts`：教学用响应生成逻辑
- `lib/learning-assistant-script.ts`：章节学习助手的步骤脚本

## 学完这一章后你应该知道什么

完成这一章后，学习者应该能清楚区分下面几件事：

- memory 不是“无限长对话历史”，而是被结构化保存并按需注入的背景信息
- skill 不是神秘能力开关，而是一组会稳定影响回答风格和工作方式的预设 prompt
- 同一个问题之所以会出现不同回答，往往不是模型随机，而是输入上下文真的变了
- 在产品层面，memory 和 skill 都需要可观察、可切换、可调试，否则用户很难理解 Agent 为什么这样回答

这会为下一步学习做准备：

- 如果你继续往后看更复杂的 Agent 产品设计，就会更容易理解为什么后续能力会围绕“上下文编排”“角色分工”“状态管理”展开
- 当 memory 和 skill 的差异已经清楚后，你再看更复杂的多 Agent、远程执行或能力模块化方案时，就不会把所有变化都误以为只是 prompt 技巧
