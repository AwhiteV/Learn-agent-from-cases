# Claude Agent SDK 系列教程 - 第一章：快速入门

这一章把上一章的 session 心智模型搬进一个真正可运行的 Web Agent 应用：左侧会话列表，中间流式聊天，右侧文件浏览。重点不是“聊天 UI 漂不漂亮”，而是让你第一次把 workspace、session persistence、streaming UI 串成一个完整体验。

## 快速开始

```bash
cp ../.env.local.example ../.env.local
# 在仓库根目录的 .env.local 中填写 ANTHROPIC_API_KEY
cd 01-quick-start
pnpm install
pnpm dev
```

默认情况下，本章会自动复用仓库根目录的 `.env.local`；只有当你想为本章单独覆盖配置时，才需要在 `01-quick-start/` 目录里额外放一个 `.env.local`。

打开 [http://localhost:3000](http://localhost:3000)。

## 这一章解决什么问题

如果说 `00-playground-v2` 解决的是“怎么理解 session”，这一章解决的是“怎么把 session 做成一个用户真的能操作的 Agent 应用”。

这里有三个初学者最容易混淆的点：

- workspace 是什么，为什么 Agent 应用总要和一个工作目录绑定
- session persistence 为什么不只是“把聊天记录存下来”，而是让同一个任务可以持续推进
- streaming UI 为什么和普通网页聊天不同，它展示的不只是最终答案，还展示“答案正在生成”

这一章会把这三件事落到一个最小但完整的 Web 示例里。

## 这一章的可运行案例是什么

这是一个基于 Next.js App Router 的三栏式 Agent Web 应用：

- 左侧是会话列表，可以切换和恢复历史 session
- 中间是流式聊天区，通过 SSE 实时显示输出
- 右侧是文件浏览器，展示当前 workspace 内的文件

服务端通过 `app/api/chat/route.ts` 调用 Agent SDK，并把 session 内容持久化到 `.data/sessions/*.jsonl`；前端通过 `components/chat-interface.tsx` 读取 SSE 流，边收边渲染。

## 动手实践：你应该点什么 / 输入什么 / 观察什么

现在章节页面里也会带一个“学习助手”抽屉。你可以按抽屉里的步骤顺序操作，也可以把它当成运行时版的观察清单：先做动作，再对照“看哪里 / 会看到什么 / 这说明什么”来理解 session、streaming 和 workspace。遇到抽屉挡住目标区域时，先临时关闭它观察页面，再用右下角入口重新打开即可。

推荐按这个路线探索：

1. 第一次打开页面后，直接输入 `请介绍一下这个项目目录里可能有什么内容`。
   观察什么：中间聊天区会逐段流式增长，而不是等整段回答结束才一次性出现。

2. 等回答完成后，看左侧会话列表是否出现一条新记录。
   观察什么：这就是 session persistence 在 UI 层最直接的体现，session 不只存在于内存里。

3. 再输入第二轮问题，比如 `把你上一轮回答压缩成三条要点`。
   观察什么：当前 session 可以继续上下文，不需要你手动拼历史。

4. 点击左侧“新建会话”，然后再问 `我上一轮问了什么？`
   观察什么：新会话不会继承旧上下文。

5. 再点回刚才那条历史会话。
   观察什么：旧消息从 `.data/sessions/*.jsonl` 读回来了，说明这是“恢复工作流”，不是单纯刷新页面。

6. 看右侧文件浏览区，点开一个文件看看预览内容，并观察目录与文件是如何被呈现的。
   观察什么：workspace 在这里不是抽象概念，而是 Agent 工作时默认面对的文件系统范围；文件预览则让这个工作范围更具体可见。

进入 Web 版 Agent 应用后的推荐探索路线是：先发一轮消息感受 streaming，再看左侧 session 列表如何刷新，最后再去右侧理解 workspace 与文件系统的关系。这样最不容易把 UI、状态和持久化混在一起。

## 验证命令

```bash
cd 01-quick-start
pnpm test
pnpm lint
pnpm build
```

## 这一章对应的 Agent SDK 概念

- Workspace：Agent 工作时绑定的目录和环境。这里对应 `process.cwd()` 以及右侧文件浏览器看到的内容。
- Session persistence：后端把 session 元数据和消息保存到 `.data/sessions/*.jsonl`，前端再通过 `/api/sessions` 和 `/api/sessions/[id]` 恢复它们。
- `resume`：继续旧会话时，服务端把已有 `sessionId` 传回 SDK，让 SDK 自动恢复上下文。
- Streaming UI：前端不是等待一个完整 JSON 响应，而是持续消费 SSE 数据块，把它们拼成正在生成中的回答。

这里的 streaming UI 和普通网页聊天的差别在于：普通聊天页面通常只展示“一问一答的最终结果”，而这一章展示的是“Agent 正在运行”的过程。用户能看到答案逐步长出来，这对 Agent 产品的可理解性非常重要。

## 这一章与 Proma 产品能力的映射

- 左侧 session 列表，对应 Proma 里的历史任务入口和工作续接能力。
- 中间 SSE 流式聊天，对应 Proma 里最基础的 Agent 实时输出体验。
- 右侧文件浏览，对应 Proma 里“Agent 在某个 workspace 中工作”的产品假设。

这一章可以看作 Proma 单 Agent Web 体验的最小骨架。

## 学完这一章后你应该掌握什么

- 理解 workspace 与 session persistence 在 Agent 产品里的角色分工。
- 能解释 streaming UI 为什么比“普通网页聊天气泡”更适合 Agent 应用。
- 能按推荐路线自行探索这个 Web 示例，而不只是跑起来看一眼。
- 能把 `.data/sessions/*.jsonl`、SSE、`resume` 这三者联系起来理解整条请求链路。
