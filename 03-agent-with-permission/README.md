# Claude Agent SDK 系列教程 - 第三章：Agent 权限控制

从这一章开始，教程进入“Agent 产品基础设施”阶段。前一章已经让 Agent 能调用工具了，但一旦工具真的能读文件、执行命令、修改环境，权限系统就不再是锦上添花，而是底层必需品。

## 快速开始

```bash
cp ../.env.local.example ../.env.local
# 只需要在仓库根目录初始化一次共享配置
# 在仓库根目录的 .env.local 中填写 ANTHROPIC_API_KEY
cd 03-agent-with-permission
pnpm install
pnpm dev
```

`01-04` 章节默认都会复用仓库根目录的 `.env.local`，所以学习新章节时通常不需要重复配置。若你确实想只覆盖本章配置，仍然可以手动在 `03-agent-with-permission/` 目录里额外放一个 `.env.local`。

打开 [http://localhost:3000](http://localhost:3000)。

页面右下角新增了“学习助手”抽屉入口，会围绕权限请求、先拒绝再放行的行为分支，以及 AskUserQuestion 表单，带你按顺序观察这一章的关键交互。

## 这一章解决什么问题

当 Agent 开始具备行动能力后，产品就必须回答一个基础问题：哪些动作可以直接执行，哪些动作需要用户确认，确认结果又怎么回到 Agent 运行流里。

所以这一章要解决的不是“多一个弹窗”这么简单，而是 Agent 产品里最核心的一层基础设施：

- 在工具执行前拦一下
- 把权限请求展示给用户
- 把用户决定可靠地传回正在运行的 Agent

如果没有这层能力，Agent 应用很难真正上线。

## 这一章的可运行案例是什么

这是第二章应用的增强版，新增了完整的交互式权限系统：

- Agent 发起工具调用时，可以触发前端审批
- 用户可以 Allow、Deny，或者在支持建议规则时选择 Always Allow
- 对于“路径超出允许工作目录”的请求，普通 Allow 也会带上本次继续执行所需的目录授权，避免同一步任务里反复弹窗
- 对于 `Edit` / `Write` 这类文件修改请求，普通 Allow 也会带上 SDK 给出的当前编辑授权建议，避免出现“点了 Allow 仍然被判 denied”
- 对于带 `suggestions` 的 `Bash` 请求，普通 Allow 同样会带上当前会话建议权限，避免命令级审批通过后仍无法继续执行
- 本章默认把“当前章节目录 + 仓库根目录”一起作为 SDK 工作区范围，因此像根目录 `README.md` 这类教学文件可以直接被读取
- 本章会复用仓库根目录 `.env.local` 里的 `ANTHROPIC_MODEL`；如果你配置了 `minimax/minimax-m2.7`，实际调用和会话元数据都会使用这个模型
- `AskUserQuestion` 这类“Agent 反过来向用户提问”的特殊工具，也会被渲染成专门表单

后端通过 `canUseTool` + SSE + Promise 把“正在运行的工具调用”与“前端的用户决策”连接起来；前端通过 `components/permission-selector.tsx` 展示通用审批 UI 和 `AskUserQuestion` 表单。

## 动手实践：你应该点什么 / 输入什么 / 观察什么

推荐至少做下面两个练习场景。

练习场景 1：普通工具审批

1. 输入 `请检查当前目录有哪些文件，并告诉我最值得先看的三个。`
2. 观察权限面板弹出。
3. 先点一次 `Deny`，再重新发送相同请求并点 `Allow`。

观察什么：同一个用户请求，在不同权限决策下会走出完全不同的执行路径。你会真正感受到“权限系统影响的是 Agent 行为，而不只是界面文案”。

练习场景 2：AskUserQuestion 表单

1. 输入一个容易让 Agent 反问你的请求，比如 `帮我规划一个 demo，但先把方案风格问清楚再继续。`
2. 当界面出现问答表单时，选择选项或填写自定义答案并提交。

观察什么：这不是普通聊天输入框，而是 Agent 通过 `AskUserQuestion` 发起的结构化提问；答案会通过 `updatedInput` 回到 SDK，再继续后续步骤。

如果你还想多做一个练习，可以切换不同权限模式后重复上面的两个场景，比较产品体验差异。

## 这一章对应的 Agent SDK 概念

- `canUseTool`：你可以把它理解为“工具执行前的闸门函数”。每次 Agent 想用工具时，应用都有机会决定放行、拒绝或修改输入。
- `PermissionMode`：这是权限策略的大方向开关。对新手最直观的理解是，“默认要不要经过审批流程”。
- `AskUserQuestion`：它虽然长得像聊天，但在这章里应当把它理解成一种特殊工具调用。Agent 不是随便问一句，而是在请求结构化的人类输入。
- `updatedInput`：如果用户回答了问题，或你想在放行前改写输入，新的输入会通过它回到 SDK。

给新手的最短解释可以是：

- `canUseTool` 决定“拦不拦”
- `PermissionMode` 决定“默认怎么拦”
- `AskUserQuestion` 决定“什么时候需要人来补信息”

## 这一章与 Proma 产品能力的映射

- 权限审批面板，对应 Proma 中最基础的安全交互层。
- `AskUserQuestion` 表单，对应 Proma 里的结构化人机协作能力。
- `canUseTool` + Promise store，对应 Proma 里把“运行中的 Agent”与“前端用户操作”连接起来的基础设施。

这一章不是简单加一个安全功能，而是在搭 Proma 里“可信 Agent”所必需的产品底座。

## 学完这一章后你应该掌握什么

- 理解为什么权限系统是 Agent 产品的基础设施，而不是附加功能。
- 能用新手能听懂的话解释 `canUseTool`、`PermissionMode`、`AskUserQuestion`。
- 能亲手完成至少两个权限练习场景，并知道每一步该观察什么。
- 能理解用户决策是如何通过 SSE 和后端 Promise 重新接回 Agent 运行流的。

练习场景 3：追加 hello world

1. 输入 `请在 README.md 文件末尾追加一行 "hello world"。`
2. 观察权限面板弹出，查看工具调用内容。
3. 点击 `Allow` 放行。

观察什么：文件写入类操作同样受权限系统管控；放行后 Agent 会执行写入并反馈结果，你可以在仓库根目录 README.md 末尾确认 "hello world" 已成功追加。
