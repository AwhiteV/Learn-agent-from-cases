# Claude Agent SDK 系列教程 - 00 Playground V2

这一章不是“做一个完整产品”，而是先把 Agent SDK 最重要的心智模型摸透：会话、恢复、流式输出，以及为什么 Agent 应用更适合围绕 session 来设计。

## 快速开始

```bash
cd 00-playground-v2
pnpm install
cp .env.example .env.local
# 在 .env.local 中填写 ANTHROPIC_API_KEY
pnpm play
```

## 这一章解决什么问题

很多初学者第一次接触 LLM SDK 时，会习惯手动维护 `messages` 数组：上一轮用户说了什么、模型回了什么、下一轮又要把整段历史重新拼回去。这个方式能工作，但一旦你想做多轮对话、恢复历史、接工具、切权限，应用代码就会很快被“上下文管理”淹没。

这一章要解决的正是这个问题：为什么 Agent 应用更适合围绕 session 来写，而不是围绕手动 messages 来写。这里的 Playground 用的是 V2 Session API，直接让你感受“先创建或恢复会话，再向同一个会话持续发送 prompt”的开发方式。

## 这一章的可运行案例是什么

这是一个可交互的 CLI Playground，真实调用了 `unstable_v2_createSession`、`unstable_v2_resumeSession`、`session.send()`、`session.stream()` 这套 V2 Session API。

你可以在同一个终端里：

- 新建会话并连续多轮提问
- 记录并查看会话历史
- 用 `/resume <sessionId>` 恢复旧会话
- 打开或关闭工具、权限、原始输出、流式文本等开关

这不是“假示例”，而是最贴近 SDK 原语的实验台。

## 动手实践：你应该点什么 / 输入什么 / 观察什么

第一次学习最推荐按这个顺序实验：

1. 直接运行 `pnpm play`，输入一句简单问题，比如 `请用三句话介绍你自己`。
   观察什么：CLI 会先把消息发给当前 session，再从 `session.stream()` 连续打印 SDK 返回的消息。

2. 紧接着再输入 `我上一轮让你做了什么？`
   观察什么：即使你没有手动拼接历史消息，同一个 session 也能继续上下文。

3. 输入 `/session` 和 `/history`。
   观察什么：当前会话 ID、历史记录、首条消息摘要已经被保存。

4. 输入 `/new` 开一个新会话，再问一次 `我上一轮让你做了什么？`
   观察什么：上下文被重置，说明“记忆”属于 session，而不是终端窗口本身。

5. 输入 `/resume <刚才旧会话的 sessionId>`，然后再问同一个问题。
   观察什么：旧上下文重新回来了，这就是 `resumeSession` 的价值。

6. 输入 `/stream`、`/raw`、`/verbose` 各切换一次，再发一个问题。
   观察什么：同一套会话逻辑下，你可以从“用户友好的打印”切换到“更接近 SDK 原始消息”的观察方式。

如果你是第一次接触 SDK，最适合的实验命令是：`/session`、`/history`、`/new`、`/resume <id>`、`/stream`、`/raw`。它们分别帮助你理解会话状态、会话恢复和流式消息结构。

## 这一章对应的 Agent SDK 概念

- `unstable_v2_createSession(options)`：创建一个新的会话容器。你可以把它理解成“拿到一个可持续对话的 Agent 运行上下文”。
- `unstable_v2_resumeSession(sessionId, options)`：按 session ID 恢复旧会话。它不是把文本历史重新贴进去，而是恢复 SDK 持有的会话状态。
- `prompt`：这一章里的 prompt 就是你每一轮发给当前 session 的输入内容。它是“这一轮说什么”，不是“整个对话是什么”。
- `session.send(prompt)`：把这一轮输入送进当前会话。
- `session.stream()`：消费这一轮运行产生的流式消息。

它们的关系可以简单记成：

`createSession / resumeSession` 决定“你在跟哪个会话说话”，`prompt` 决定“你这轮说什么”，`send + stream` 决定“这轮怎么发出去、怎么把结果收回来”。

## 这一章与 Proma 产品能力的映射

- 在 Proma 里，session 是产品层“任务连续性”的底座；这一章对应的是最底层的会话心智模型。
- CLI 中的历史记录、恢复旧会话，映射到 Proma 里的“继续上一次工作”体验。
- 流式打印和原始消息观察，映射到 Proma 里对 Agent 运行过程的可见性需求。

换句话说，这一章先不讲复杂 UI，而是先把 Proma 背后的 Agent 运行方式拆给你看。

## 学完这一章后你应该掌握什么

- 知道为什么 session 比手动 messages 更适合 Agent 应用。
- 知道 `createSession`、`resumeSession`、`prompt`、`send`、`stream` 各自负责什么。
- 能用 CLI 亲手验证“同一会话延续上下文，新会话重置上下文，恢复会话找回上下文”。
- 能读懂这类 Agent Playground 的最小实现，并把它当作后续 Web 教程的心智起点。
