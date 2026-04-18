# Claude Agent SDK 系列教程 - 第六章：Remote 与 Multi-Provider

这一章把一个常见但容易抽象过头的问题拆开来讲：同一个 Agent 入口，为什么既可以连本地 provider，也可以连 remote-style provider，而且前端还不需要跟着重写一遍。

这里不会引入真实分布式 worker、队列系统或生产级远程基础设施。相反，我们只保留最适合教学的最小模型，让学习者先看懂 provider abstraction 是怎么把“调用方式变化”隔离在统一接口后面的。`mock-remote` 也只是同进程里的 latency-only simulation，不是真正把任务交给远端执行。

## 快速开始

```bash
cd 06-remote-and-multi-provider
corepack pnpm install
cp .env.local.example .env.local
corepack pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 这一章解决什么问题

当教程进入 remote execution、provider abstraction、multi-provider routing 这些话题后，初学者通常会一起混淆下面几件事：

- provider 切换是不是意味着 UI 和 API 都要重写
- remote agent 是不是一定要先搭一整套远程基础设施
- local invocation 和 remote invocation 到底哪里不同，哪里又应该保持一样

这一章用一个可运行的“remote agent console with provider switching”来回答这些问题：

- 前端始终通过同一个 `POST /api/chat` 接口发请求
- 服务端始终通过同一个 provider registry 查找 provider
- 每个 provider 都实现同一个 `AgentProvider` 合约
- 返回给 UI 的结果始终是同一个 `ProviderResult` 结构

学习者看到的重点不是“系统有多复杂”，而是“什么在变，什么不该变”。

为了降低第一次体验这章时的理解门槛，页面右下角也提供了一个“学习助手”浮层入口，会引导你先切 provider、再发送同一请求、再去观察 stable abstraction 和 transcript 差异。

## remote agent 与 provider abstraction 的核心概念

### 1. Provider abstraction

这一章把 provider 抽象成统一接口：

```ts
export interface AgentProvider {
  id: string;
  name: string;
  executionMode: "local" | "remote";
  run(request: ProviderRequest): Promise<ProviderResult>;
}
```

这意味着上层代码只关心：

- 选中哪个 `providerId`
- 传入什么 `message`
- 收到什么 `ProviderResult`

它不需要知道背后是“本地直接调用”，还是“切换到一个 remote-style 的模拟路径”。

### 2. Local agent

`local-agent.ts` 代表最直接的教程场景：

- API route 在同一个 Next.js 运行时里直接调用 provider
- 没有网络序列化边界
- 最适合理解最小执行链路

### 3. Remote-style provider

`mock-remote.ts` 代表一个教学化的 remote-style 模型：

- 它主要模拟的是远程调用时常见的延迟感和 provider 切换体验
- 它仍然运行在同一个 Next.js server process 内
- 但不引入真实 worker、消息队列或远程部署复杂度
- 它的价值是帮助学习者理解 remote pattern，而不是搭建生产环境

## 动手实践：你应该点什么 / 输入什么 / 观察什么

推荐按这个顺序操作：

1. 保持默认消息不变，先用 `Local Agent` 发送一次。
   观察什么：右侧的 transcript、`Active provider`、`Execution mode` 和 provider notes 会一起更新，你能先看到“本地 provider 是如何被统一接口消费的”。

2. 切换到 `Mock Remote Path`，发送完全相同的消息。
   观察什么：返回结构仍然是统一的 `ProviderResult`，但 `executionMode` 会变成 `remote`，provider notes 也会明确告诉你这只是 same-process 的 latency-only simulation。

3. 对照 `Provider Inspector` 中的 `Stable abstraction` 代码块和 `What stays constant` 卡片。
   观察什么：虽然 provider 在变，但请求体仍然是 `{ providerId, message }`，返回结构仍然是 `ProviderResult`，页面渲染逻辑也没有跟着换一套。

4. 再发一个不同类型的问题，比如 `Summarize how this provider setup would scale from a local tutorial to a hosted product.`
   观察什么：同一个 UI 仍然通过同一个 `/api/chat` 路由工作，但 provider notes 会帮助你区分“这次变化来自 provider 实现差异”，而不是来自前端分支逻辑。

建议重点观察：

- 活跃 provider 会变化
- `executionMode` 会从 `local` 变成 `remote`
- provider notes 会解释边界差异
- 但请求体仍然是 `{ providerId, message }`
- 返回结果仍然是 `ProviderResult`
- 页面渲染逻辑仍然是一套统一界面

这就是 provider abstraction 最重要的教学结果：调用路径可以替换，产品层的交互面不必跟着碎裂。

## 这一章对应的 Agent SDK 概念

- Provider abstraction / stable contract：这一章把不同执行后端都约束在统一的 `AgentProvider` 接口之下，让上层 UI 和 API 只消费稳定 contract，而不关心底层细节。
- Unified dispatch boundary：前端始终通过同一个 `POST /api/chat` 入口发消息，服务端再根据 `providerId` 做统一分发，这对应的是产品里常见的“稳定接入层”思路。
- Execution mode separation：`local` 和 `remote` 在这里不是两套完全不同的前端，而是通过 `ProviderResult.executionMode` 和 provider notes 显式暴露差异。
- Remote-style simulation：这一章故意用 same-process 的 latency-only simulation 代替真实远程基础设施，帮助学习者先理解“边界和 contract”比“把系统做复杂”更重要。

为什么这一章很重要？因为一旦 Agent 产品开始支持多种 provider 或多种执行环境，最容易失控的地方不是模型本身，而是接口边界。没有统一 contract，前端、API 和工作流会因为 provider 增加而迅速碎裂；有了稳定抽象，底层实现可以替换，上层体验却还能保持一致。

## 这一章与 Proma 中 remote/provider 方向的映射

- `lib/providers/base.ts`：映射到 Proma 中定义 provider contract 与统一执行入口的抽象层。
- `lib/providers/local-agent.ts`：映射到本地运行、单进程调用、快速验证阶段的 provider 实现。
- `lib/providers/mock-remote.ts`：映射到未来 remote execution、第三方 provider adapter，或真正远端执行前的教学过渡层思路。
- `app/api/chat/route.ts`：映射到产品里根据 provider 配置统一分发请求的入口层。
- `components/provider-switcher.tsx` 与 `components/provider-inspector.tsx`：映射到产品侧可观察、可切换、可解释的 provider 体验。

如果前几章更偏向“Agent 在本地如何工作”，这一章就是把视角推进到“当 Agent 背后开始出现不同执行后端时，前台应该如何保持稳定”。

## 关键文件

- `app/page.tsx`：章节入口，解释 runnable case 和学习路径
- `components/chat-console.tsx`：主工作台，组合 provider 切换、请求发送和 transcript
- `components/learning-assistant.tsx`：页面内抽屉式学习助手
- `components/provider-switcher.tsx`：切换不同 provider 配置
- `components/provider-inspector.tsx`：显示当前 provider、执行模式、稳定抽象和 provider notes
- `app/api/chat/route.ts`：统一接收 `message + providerId` 并分发到选中的 provider
- `lib/types.ts`：ProviderRequest / ProviderResult / AgentProvider 等共享类型
- `lib/providers/base.ts`：provider 基类和共享教学文案拼装逻辑
- `lib/providers/local-agent.ts`：本地 provider 实现
- `lib/providers/mock-remote.ts`：remote-style provider 实现
- `lib/providers/index.ts`：provider registry 与 summary 数据
- `lib/learning-assistant-script.ts`：章节学习助手的步骤脚本
- `tests/providers.test.ts`：锁定 provider registry 和执行模式契约的基础测试

## 你学完这一章后应该掌握什么

完成这一章后，学习者应该能明确区分：

- provider abstraction 是“稳定接口”，不是“隐藏一切差异”
- remote agent 的核心不是先上复杂基础设施，而是先设计清楚边界和 contract
- local 与 remote-style provider 的差异，在这一章里主要通过执行标签和延迟感来观察，而不是真实跨进程通信
- 只要 contract 稳定，UI、API 和上层工作流就可以保持统一

这也为后续更复杂的多 provider 和远程执行方案打基础：先把接口和观察面做对，再逐步替换底层实现。
