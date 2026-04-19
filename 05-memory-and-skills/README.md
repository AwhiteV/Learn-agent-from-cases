# Claude Agent SDK 系列教程 - 第五章：Memory 与 Skills

这一章把 Agent 的“记住谁在用它”和“切换成哪种工作模式”拆成两个初学者可以直接观察的概念。重点不是手动维护一个复杂的长期记忆系统，而是让学习者看到：用户只是在正常聊天，但 LLM 会自己决定是否把稳定信息沉淀成 memory，并在后续对话里继续利用它。

## 快速开始

```bash
cd 05-memory-and-skills
corepack pnpm install
# 如果仓库根目录还没有 .env.local，先在根目录复制一次
# cp ../.env.local.example ../.env.local
corepack pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

`05` 章现在默认复用仓库根目录的 `.env.local`，并和 `01-04` 一样使用真实大模型聊天、SSE 流式输出与 session 持续对话。
当前真实聊天依赖固定在 `@anthropic-ai/claude-agent-sdk@0.2.42`，以兼容仓库里常见的代理模型配置（例如 `minimax/minimax-m2.7`）。

## 这一章解决什么问题

前几章已经讲了 session、tools、permissions、teams，但初学者通常还是会混淆两个问题：

- Agent 到底“记住”的是什么
- Agent 的“能力模式”到底是 prompt、工具还是产品配置

这一章专门把问题缩小成一个教学场景：

- memory 代表结构化背景信息，比如用户偏好、项目背景、学习目标
- skill 代表一个可切换的工作模式，比如教学模式、构建模式、审阅模式

这样学习者可以先看清楚“上下文注入”和“模式切换”分别影响什么，再把这些概念映射回更复杂的产品形态。

## 这一章的 runnable case 是什么

这是一个可运行的 Next.js 学习助手页面，核心交互包括：

- 在网页里发起真实大模型对话
- 在左侧历史会话栏里恢复已有 session
- 让 LLM 在聊天后自己判断是否要把稳定信息保存到本地 `.data/memory.json`
- 打开记忆库查看已经保存的 memory
- 切换 `teacher`、`builder`、`reviewer` 三种 skill preset
- 直接查看系统 prompt 和 memory block 是如何拼到一起的
- 在持续对话里观察同一个问题如何因为 skill / 自动记忆变化而产生不同回答
- 使用右侧更宽的侧栏，通过顶部 tab 在 `记忆库` 和 `Skill 选择器` 之间切换，并可一键收起侧栏

它不是一个“背后藏着很多魔法”的黑盒，而是一个可观察的教学工作台。

页面右下角现在还提供了一个“学习助手”抽屉入口，而且有两种模式：

- `操作引导`：默认模式，适合第一次跑 case 的学习者，按章节步骤提示你先存 memory、再切 skill、再观察 transcript 和 prompt preview。
- `实现视角`：适合已经跑通过一次 case 的学习者，用同一套步骤链回头看 prompt 组装、关键文件、函数职责和数据流。

这两个模式讲的是同一件事，只是一个帮你先把流程跑通，另一个帮你把背后的实现看明白。

## 动手实践：你应该点什么 / 输入什么 / 观察什么

推荐你按下面的顺序做：

1. 先发送一条会暴露稳定信息的消息，比如：
   - `之后给我解释时多举具体例子`
   - `我正在做一个 Next.js 教程项目`
   - `我想系统学习 TypeScript`
   观察什么：主回复结束后，右侧记忆库会显示“本轮自动记忆结果”，说明 memory 不是手动写进去的，而是 LLM 自己判断后落库。

2. 在左侧 `历史会话` 里确认当前还是一个空白 session，然后发出第一条消息。
   观察什么：发送完成后，左侧会出现可恢复的 session，说明这一章已经和前面章节一样进入“持续对话工作台”模式。

3. 再发送一个真正的问题，例如：`How should I learn TypeScript generics?`
   观察什么：右侧的 `Prompt 预览` 和 `Memory 上下文` 会清楚显示这次请求到底自动注入了哪些已保存记忆，而不是把“记忆”藏在黑盒里。

4. 保持问题不变，只切换 skill preset。
   观察什么：同一个问题会因为 `teacher`、`builder`、`reviewer` 的不同而出现明显不同的回答结构。
   - `teacher` 更像讲解
   - `builder` 更像执行计划
   - `reviewer` 更像风险检查

5. 再继续聊天，看看后续轮次里会不会新增更多记忆。
   观察什么：只有当用户暴露了“稳定偏好 / 项目背景 / 学习目标”时，LLM 才应该保存新的 memory；一次性问题本身不应该被记住。

6. 删除一条已经保存的 memory，再重新发送同一个问题。
   观察什么：这次请求里的 `Memory 上下文` 会变短，回答也会少掉对应背景影响，说明 memory 真的是“可存、可删、可控的上下文注入层”。

这就是这一章最重要的教学目标：让学习者看到“为什么同一个问题会因为 memory 和 skill 的不同而产生不同回答”。

## 这一章对应的 Agent SDK 概念

- Context injection：这一章虽然没有引入复杂记忆系统，但它很直观地展示了“回答变化”往往来自输入上下文变化，而不只是模型随机性。
- Structured memory：这里的 memory 不是无限堆积的聊天历史，而是被结构化保存、由 LLM 判断是否写入、并在后续请求里自动注入的背景信息。
- Skill preset / system prompt shaping：`teacher`、`builder`、`reviewer` 本质上是稳定影响回答风格和工作方式的系统提示预设。
- Prompt observability：`Prompt 预览` 和 `注入的 Memory 区块` 让学习者能直接看到“系统 prompt + 用户问题 + 选中的 memory”是如何共同组成一次请求的。

为什么这一章很重要？因为当 Agent 开始具备 memory 和不同工作模式后，用户最容易困惑的问题就变成“它为什么这么回答”。如果这些上下文和模式不可见，memory 和 skill 就会变成难以调试的黑盒；把它们做成可观察、可切换、可删除的输入层，才更接近可用的 Agent 产品。

## 这一章与 Proma 中 memory/skills 产品方向的映射

- 右侧 `记忆库`，映射到 Proma 中对结构化 memory、skill 预设与 prompt 可解释层的集中控制入口。
- 本地 `.data/memory.json` 存储，映射到产品早期验证阶段常见的“先把行为做对，再扩展存储层”的思路。

如果把前几章看作 Agent 基础设施，这一章就是把“理解用户”和“切换工作方式”这两件事拉进产品视角。

## 关键文件

- `app/page.tsx`：页面入口，挂载教学工作台
- `components/chat-interface.tsx`：主工作台，保持和前面章节一致的三栏聊天骨架；右侧栏更宽，支持收起，并通过 tab 切换记忆库与 skill 选择器
- `components/learning-assistant.tsx`：页面内抽屉式学习助手
- `components/memory-panel.tsx`：查看记忆库、本轮自动记忆结果，以及删除已保存记忆
- `components/skill-selector.tsx`：切换 skill preset
- `app/api/memory/route.ts`：读取和删除 memory
- `app/api/skills/route.ts`：返回 skill presets
- `app/api/chat/route.ts`：先完成真实聊天，再让 LLM 判断要不要把本轮内容写成 memory
- `app/api/sessions/route.ts`：返回历史 session 列表
- `app/api/sessions/[id]/route.ts`：读取单个 session 的消息详情
- `lib/memory-store.ts`：`.data` 下的本地 JSON 持久化
- `lib/model-config.ts`：从根目录 `.env.local` 解析默认模型
- `lib/memory-extraction.ts`：构造自动记忆判断 prompt，并解析 LLM 的 JSON 决策
- `lib/request-context.ts`：构造真实聊天使用的 system prompt 与 prompt preview
- `lib/storage/index.ts`：session 持久化与读取入口
- `lib/skill-presets.ts`：教学模式 / 构建模式 / 审阅模式三个模式定义
- `components/session-list.tsx`：左侧历史会话列表
- 右侧侧栏默认常驻但支持收起；展开后可通过 tab 在记忆库和 skill 选择器之间切换，`Prompt Preview` 固定保留在下方，方便对照当前注入上下文
- `lib/learning-assistant-script.ts`：章节学习助手的步骤脚本

## 学完这一章后你应该知道什么

完成这一章后，学习者应该能清楚区分下面几件事：

- memory 不是“无限长对话历史”，而是被结构化保存并自动注入的背景信息
- skill 不是神秘能力开关，而是一组会稳定影响回答风格和工作方式的预设 prompt
- 同一个问题之所以会出现不同回答，往往不是模型随机，而是输入上下文真的变了
- 在产品层面，memory 和 skill 都需要可观察、可调试，否则用户很难理解 Agent 为什么这样回答

这会为下一步学习做准备：

- 如果你继续往后看更复杂的 Agent 产品设计，就会更容易理解为什么后续能力会围绕“上下文编排”“角色分工”“状态管理”展开
- 当 memory 和 skill 的差异已经清楚后，你再看更复杂的多 Agent、远程执行或能力模块化方案时，就不会把所有变化都误以为只是 prompt 技巧
