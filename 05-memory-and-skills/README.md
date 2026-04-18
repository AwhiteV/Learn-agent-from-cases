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

## 如何通过操作 memory 与 skill 理解差异

推荐你按下面的顺序做：

1. 先添加两条 memory，比如一个 `preference` 和一个 `project`。
2. 只选择其中一条，发送问题，例如：`How should I learn TypeScript generics?`
3. 保持问题不变，只切换 skill preset。
4. 再保持 skill 不变，改成选择不同的 memory 组合。
5. 对照右侧的 `Prompt preview` 和 `Injected memory block`。

你应该观察到：

- skill 改变时，回答的结构会明显变化。
  - `teacher` 更像讲解
  - `builder` 更像执行计划
  - `reviewer` 更像风险检查
- memory 改变时，回答会更贴近被注入的背景。
  - 偏好 memory 影响语气或表达方式
  - 项目 memory 影响例子和落地场景
  - goal memory 影响建议的方向

这就是这一章最重要的教学目标：让学习者看到“为什么同一个问题会因为 memory 和 skill 的不同而产生不同回答”。

## 这一章与 Proma 中 memory/skills 产品方向的映射

- 左侧 `Memory Panel`，映射到 Proma 中对用户背景、任务上下文、长期偏好的结构化记忆能力。
- 顶部 `Skill Selector`，映射到 Proma 中不同能力模式、专家角色或工作流预设。
- `Prompt preview`，映射到 Proma 里把 memory 与 skill 编排进 Agent 上下文的可解释层。
- 本地 `.data/memory.json` 存储，映射到产品早期验证阶段常见的“先把行为做对，再扩展存储层”的思路。

如果把前几章看作 Agent 基础设施，这一章就是把“理解用户”和“切换工作方式”这两件事拉进产品视角。

## 关键文件

- `app/page.tsx`：页面入口，挂载教学工作台
- `components/chat-interface.tsx`：组合 Memory Panel、Skill Selector 和响应调试视图
- `components/memory-panel.tsx`：管理 memory 列表、添加表单、注入开关和删除操作
- `components/skill-selector.tsx`：切换 skill preset
- `app/api/memory/route.ts`：读取、写入和删除 memory
- `app/api/skills/route.ts`：返回 skill presets
- `app/api/chat/route.ts`：把 memory block 与 skill system prompt 组合后生成示例回答
- `lib/memory-store.ts`：`.data` 下的本地 JSON 持久化
- `lib/skill-presets.ts`：Teacher / Builder / Reviewer 三个模式定义
- `lib/chat-engine.ts`：教学用响应生成逻辑

## 学完这一章后你应该知道什么

完成这一章后，学习者应该能清楚区分下面几件事：

- memory 不是“无限长对话历史”，而是被结构化保存并按需注入的背景信息
- skill 不是神秘能力开关，而是一组会稳定影响回答风格和工作方式的预设 prompt
- 同一个问题之所以会出现不同回答，往往不是模型随机，而是输入上下文真的变了
- 在产品层面，memory 和 skill 都需要可观察、可切换、可调试，否则用户很难理解 Agent 为什么这样回答

这会为下一步学习做准备：

- 如果你继续往后看更复杂的 Agent 产品设计，就会更容易理解为什么后续能力会围绕“上下文编排”“角色分工”“状态管理”展开
- 当 memory 和 skill 的差异已经清楚后，你再看更复杂的多 Agent、远程执行或能力模块化方案时，就不会把所有变化都误以为只是 prompt 技巧
