# Claude Agent SDK 系列教程 - 00 Playground V2

这一章不是“做一个完整产品”，而是先把 Agent SDK 最重要的心智模型摸透：会话、恢复、流式输出，以及为什么 Agent 应用更适合围绕 session 来设计。

和 `00-playground` 相比，这一版不再围绕 `query()` 的单次调用，而是切到 V2 Session API。你不需要每轮都自己维护一整份 `messages` 历史，而是改成“先拿到一个 session，再持续往这个 session 里发 prompt”。后面 `01-04` 章节里的 Web 体验，底层思路都能从这里找到原型。

## 快速开始

```bash
# 1. 进入目录并安装依赖
cd 00-playground-v2
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 在 .env.local 中填写 ANTHROPIC_API_KEY

# 3. 启动 Playground
pnpm play
```

如果你想看更底层的运行日志，可以用：

```bash
pnpm play:debug
```

如果你在改这个 Playground 本身，想边改边跑：

```bash
pnpm play:watch
```

## 这一章解决什么问题

很多初学者第一次接触 LLM SDK 时，会习惯手动维护 `messages` 数组：上一轮用户说了什么、模型回了什么、下一轮又要把整段历史重新拼回去。这个方式能工作，但一旦你想做多轮对话、恢复历史、接工具、切权限，应用代码就会很快被“上下文管理”淹没。

这一章要解决的正是这个问题：为什么 Agent 应用更适合围绕 session 来写，而不是围绕手动 messages 来写。这里的 Playground 用的是 V2 Session API，直接让你感受“先创建或恢复会话，再向同一个会话持续发送 prompt”的开发方式。

## 这一章的可运行案例是什么

这是一个可交互的 CLI Playground，真实调用了 `unstable_v2_createSession`、`unstable_v2_resumeSession`、`session.send()`、`session.stream()` 这套 V2 Session API。

你可以在同一个终端里：

- 新建会话并连续多轮提问
- 记录并查看会话历史
- 用 `/resume <sessionId>` 或 `/history <序号>` 恢复旧会话
- 动态切换模型、工具、权限、流式输出、原始输出等开关
- 把原始 SDK 消息写成 NDJSON 文件，方便排查和学习

这不是“假示例”，而是最贴近 SDK 原语的实验台。

## 项目结构

```text
00-playground-v2/
├── playground.ts            # 入口：加载环境变量，驱动 send/stream 主循环
├── lib/
│   ├── cli.ts               # CLI 命令解析、交互循环、帮助与配置菜单
│   ├── config.ts            # AppState、默认配置、显示开关
│   ├── permissions.ts       # 权限模式、canUseTool、Hook、权限日志演示
│   ├── session-history.ts   # 会话历史持久化到 .session-history.json
│   └── session-ops.ts       # create / resume / close session 封装
├── utils/
│   ├── printer.ts           # 终端消息打印与格式化
│   └── raw-output-writer.ts # 原始 SDK 消息写入 output/*.ndjson
├── .env.example             # 环境变量模板
└── README.md
```

这一章的设计重点是把关注点拆开：

- `playground.ts` 只负责跑主流程
- `session-ops.ts` 只负责 session 生命周期
- `cli.ts` 只负责命令行交互
- `permissions.ts` 只负责权限相关实验能力

所以它很适合当作你以后做 CLI Agent 原型时的最小参考结构。

## 动手实践：你应该输入什么 / 观察什么

第一次学习最推荐按这个顺序实验：

1. 直接运行 `pnpm play`，输入一句简单问题，比如 `请用三句话介绍你自己`。
   观察什么：CLI 会先把消息发给当前 session，再从 `session.stream()` 连续打印 SDK 返回的消息。

2. 紧接着再输入 `我上一轮让你做了什么？`
   观察什么：即使你没有手动拼接历史消息，同一个 session 也能继续上下文。

3. 输入 `/session` 和 `/history`。
   观察什么：当前会话 ID、历史记录、首条消息摘要已经被保存。

4. 输入 `/new` 开一个新会话，再问一次 `我上一轮让你做了什么？`
   观察什么：上下文被重置，说明“记忆”属于 session，而不是终端窗口本身。

5. 输入 `/resume <刚才旧会话的 sessionId>`，或者直接用 `/history 1` 恢复最近一条历史。
   观察什么：旧上下文重新回来了，这就是 `resumeSession` 的价值。

6. 输入 `/stream`、`/raw`、`/verbose`、`/json` 各切换一次，再发一个问题。
   观察什么：同一套会话逻辑下，你可以从“用户友好的打印”切换到“更接近 SDK 原始消息”的观察方式。

7. 输入 `/perm` 或 `/perm-mode`，把权限模式切到 `plan`、`default`、`bypassPermissions` 试一次，再问一个明显会触发工具的请求。
   观察什么：session 心智模型和权限模型并不冲突，它们是叠加关系。session 负责“在哪个上下文里继续工作”，permission 负责“这个上下文里允许做什么”。

如果你是第一次接触 SDK，最适合的实验命令是：`/session`、`/history`、`/new`、`/resume <id>`、`/stream`、`/raw`、`/perm-mode`。它们分别帮助你理解会话状态、会话恢复、流式消息结构和权限控制。

## 交互式命令

### 基础命令

| 命令 | 说明 |
|------|------|
| `/config` | 打开配置菜单，修改模型、工具、显示选项、工作目录 |
| `/show` | 显示当前配置 |
| `/tools` | 切换工具启用状态 |
| `/verbose` | 切换详细模式 |
| `/expand` | 切换展开内容块详情 |
| `/json` | 切换原始 JSON 显示 |
| `/stream` | 切换流式文本输出 |
| `/raw` | 切换原始输出模式，并把消息写入 NDJSON 文件 |
| `/model` | 切换模型名称 |
| `/help` | 显示帮助 |
| `/quit` | 退出程序 |

### 会话命令

| 命令 | 说明 |
|------|------|
| `/new` | 创建新会话，重置当前多轮上下文 |
| `/resume <sessionId>` | 按 session ID 恢复旧会话 |
| `/history` | 查看会话历史 |
| `/history <n>` | 恢复第 `n` 条历史会话 |
| `/history clear` | 清空会话历史 |
| `/session` | 显示当前会话 ID |
| `/close` | 关闭当前会话 |

### 权限命令

| 命令 | 说明 |
|------|------|
| `/perm` | 打开权限配置菜单 |
| `/perm-show` | 显示当前权限配置 |
| `/perm-mode` | 快速切换权限模式 |
| `/perm-log` | 查看权限日志 |

直接输入普通文本就会发送给当前 session。第一次发送消息时，如果当前还没有活跃 session，程序会自动帮你创建一个。

## 输出说明

这个 Playground 有三层不同的观察方式：

1. 普通模式：看起来更像“适合人读的 CLI 输出”
2. 详细模式：会展开更多内容块和调试信息
3. 原始输出模式：把 SDK 消息以 NDJSON 形式写入文件，方便回放和排查

开启 `/raw` 后，下次查询会把每条 SDK 消息追加写入 `output/*.ndjson`。如果你正在理解 SDK 事件结构，这个模式非常有用，因为它比“只看终端打印”更接近真实数据面。

会话历史则会被持久化到当前目录下的 `.session-history.json`。这里记录的是：

- `sessionId`
- 创建时间与最近活跃时间
- 当前使用的模型
- 消息轮次
- 首条用户消息摘要

所以这个 Playground 不只是“终端里暂时聊两句”，而是已经具备最小的会话记录与恢复能力。

## 权限模式实验怎么做

这一章虽然主讲 session，但它也顺手带了一个很适合学习的权限实验台。你可以通过 `/perm` 菜单观察：

- `default`：标准模式，危险操作需要确认
- `acceptEdits`：自动接受文件编辑
- `bypassPermissions`：绕过权限检查
- `plan`：只规划，不执行工具
- `dontAsk`：不询问，未预批准则直接拒绝

另外还有两层更接近产品实现的能力可以切换：

- 自定义 `canUseTool`
- `PreToolUse Hook`

如果你打开详细权限日志，再问一个需要工具的请求，就能看到 Playground 是怎样记录 allow / deny / ask 决策的。这对理解后面第 03 章的前端权限审批特别有帮助。

## 这一章对应的 Agent SDK 概念

- `unstable_v2_createSession(options)`：创建一个新的会话容器。你可以把它理解成“拿到一个可持续对话的 Agent 运行上下文”。
- `unstable_v2_resumeSession(sessionId, options)`：按 session ID 恢复旧会话。它不是把文本历史重新贴进去，而是恢复 SDK 持有的会话状态。
- `prompt`：这一章里的 prompt 就是你每一轮发给当前 session 的输入内容。它是“这一轮说什么”，不是“整个对话是什么”。
- `session.send(prompt)`：把这一轮输入送进当前会话。
- `session.stream()`：消费这一轮运行产生的流式消息。
- `PermissionMode`：决定当前 session 里的工具执行策略。
- `canUseTool` / `PreToolUse Hook`：决定工具调用前如何被拦截、记录和放行。

它们的关系可以简单记成：

`createSession / resumeSession` 决定“你在跟哪个会话说话”，`prompt` 决定“你这轮说什么”，`send + stream` 决定“这轮怎么发出去、怎么把结果收回来”。

## 这一章与 Proma 产品能力的映射

- 在 Proma 里，session 是产品层“任务连续性”的底座；这一章对应的是最底层的会话心智模型。
- CLI 中的历史记录、恢复旧会话，映射到 Proma 里的“继续上一次工作”体验。
- 流式打印和原始消息观察，映射到 Proma 里对 Agent 运行过程的可见性需求。
- 权限模式和日志实验，则映射到后续 Agent 产品里的审批与安全基础设施。

换句话说，这一章先不讲复杂 UI，而是先把 Proma 背后的 Agent 运行方式拆给你看。

## 学完这一章后你应该掌握什么

- 知道为什么 session 比手动 messages 更适合 Agent 应用。
- 知道 `createSession`、`resumeSession`、`prompt`、`send`、`stream` 各自负责什么。
- 能用 CLI 亲手验证“同一会话延续上下文，新会话重置上下文，恢复会话找回上下文”。
- 能理解模型开关、输出模式、权限模式并不会替代 session，而是叠加在 session 之上的运行配置。
- 能读懂这类 Agent Playground 的最小实现，并把它当作后续 Web 教程的心智起点。
