# 03 章节权限排查总结

## 背景

在 `03-agent-with-permission` 章节中，用户在页面内多次点击 `Allow` 后，`Read`、`Edit`、`Bash` 相关操作仍然失败，表现为：

- 读取仓库根目录 `README.md` 时不断重复权限请求
- 编辑根目录 `README.md` 时即使点了 `Allow` 也继续提示被拒绝
- Agent 改用 `Bash` 追加文本后，同样会在批准后失败

由于页面标题一度仍显示为 `Claude Agent SDK - Quick Start`，还曾造成“当前实际运行的是 01 还是 03 章节”的混淆。

## 复现方式

最稳定的复现场景是：

```text
读取仓库根目录 README 并追加 hello world
```

在 `default` 模式下，依次会触发：

1. `Read`
2. `Edit` 或 `Bash`
3. 权限弹窗
4. 点击 `Allow`

旧实现中，这一步之后仍可能失败。

## 排查过程

### 1. 先确认实际运行的是哪个章节

通过 `lsof` 和进程工作目录确认，`http://localhost:3000` 实际运行的是：

```text
/Users/timo/projects/claude-agent-sdk-master/03-agent-with-permission
```

也就是说，虽然页面标题写着 `Quick Start`，真正要修的是 03 章节。

### 2. 对照参考仓库

将参考仓库克隆到本地后，对比其 `02` 和 `03` 章节实现，确认：

- 参考仓库 `02` 使用的是 `bypassPermissions`
- 参考仓库 `03` 的权限链路和当前仓库早期版本基本一致
- 参考仓库本身没有额外的“隐藏实现”来解决当前问题

因此不能简单通过“照搬参考仓库”解决，需要基于当前仓库的实际运行时行为做兼容修复。

### 3. 增加最小调试日志

在以下位置临时加入日志：

- `components/chat-interface.tsx`
- `app/api/chat/route.ts`
- `app/api/chat/permission/route.ts`

目标是确认三件事：

1. 前端收到的 `permission_request` 是否包含 `suggestions`
2. 点击 `Allow` 后，前端发回的 `updatedPermissions` 是什么
3. `/api/chat/permission` 是否真的把请求 resolve 回原始 `/api/chat`

### 4. 发现 `Allow` 没有带回 SDK 的建议权限

通过前端日志确认：

- `Bash` 权限请求确实带有 `suggestions: Array(1)`
- 但点击普通 `Allow` 时，前端提交的是：

```json
{
  "behavior": "allow",
  "updatedPermissions": undefined
}
```

这意味着对于 `Bash` 这类写文件相关动作，虽然用户点了 `Allow`，但 SDK 没拿到继续执行所需的建议权限。

### 5. 发现根目录文件还受工作区范围限制

`03` 章节最初只把当前章节目录作为 `cwd` 传给 SDK，没有把仓库根目录加入 `additionalDirectories`。

因此像：

```text
/Users/timo/projects/claude-agent-sdk-master/README.md
```

这种教学上需要访问的根目录文件，会被 SDK 视为工作区外路径。

### 6. 发现模型配置链路在 03 章节里缺失

`03` 章节虽然定义了 `model?: string` 能力，但没有真正把 `.env.local` 中的 `ANTHROPIC_MODEL` 传给 SDK，导致运行时可能回退到默认 Anthropic 模型，而不是用户配置的 `minimax/minimax-m2.7`。

### 7. 找到最终根因：PermissionResult 的 `allow` 结构不兼容当前 SDK 运行时校验

最关键的一步来自读取 `.data/sessions/*.jsonl` 里的工具失败结果。

真实错误是：

```text
Tool permission request failed: ZodError
Invalid input: expected record, received undefined
path: ["updatedInput"]
```

这说明当前安装的 SDK 运行时 schema 对 `allow` 分支的要求比类型定义更严格：

- `updatedInput` 不能显式为 `undefined`
- 对当前版本而言，最稳妥的兼容方式是返回 `updatedInput: {}`

也就是说，问题不在“用户没有点对按钮”，而在“服务端回给 SDK 的 `PermissionResult` 结构不符合运行时校验”。

## 最终修复

### 1. 扩大 03 章节默认工作区范围

让 03 章节默认把“当前章节目录 + 仓库根目录”一起作为 SDK 工作区范围：

- `app/api/chat/route.ts`
- `packages/shared/src/agent/options.ts`
- `packages/shared/src/agent/proma-agent.ts`

### 2. 接通 03 章节的模型配置

引入 `lib/model-config.ts`，并让 03 章节真正读取：

```env
ANTHROPIC_MODEL=minimax/minimax-m2.7
```

保证实际调用模型和保存到 session metadata 里的模型一致。

### 3. 让普通 `Allow` 自动携带 SDK 建议权限

对以下场景，普通 `Allow` 会自动带回 `suggestions` 或需要的子集：

- 路径超出工作区时的 `Read`
- `Edit`
- `Write`
- `Bash`

核心文件：

- `lib/permission-updates.ts`
- `components/permission-selector.tsx`

### 4. 修正 `PermissionResult` 结构

将 `createPermissionResult()` 的 `allow` 分支改为：

- 默认返回 `updatedInput: {}`
- 只有在确实存在时才附带 `updatedPermissions`

核心文件：

- `lib/permission-result.ts`

## 最终结果

修复后，`03` 章节中的以下流程可以正常工作：

```text
读取仓库根目录 README 并追加 hello world
```

用户在弹窗中点击 `Allow` 后，Agent 可以继续完成：

1. 读取根目录 `README.md`
2. 请求 `Edit` 或 `Bash`
3. 成功通过权限审批
4. 真正完成写入

## 新增/更新的测试

本次排障补充了多组回归测试：

- `tests/agent-options.test.ts`
- `tests/model-config.test.ts`
- `tests/permission-route.test.ts`
- `tests/permission-updates.test.ts`

重点覆盖：

- `additionalDirectories` 是否真正传给 SDK
- `ANTHROPIC_MODEL` 是否被 03 章节读取
- `Allow` 时 `PermissionResult` 是否兼容当前 SDK 运行时
- `Read` / `Edit` / `Write` / `Bash` 的 `Allow` 是否会携带正确的建议权限

## 收尾调整

排障完成后同步做了两项清理：

1. 删除临时调试日志
2. 将 03 页面标题从 `Claude Agent SDK - Quick Start` 改为：

```text
Claude Agent SDK - Agent With Permission
```

## 经验总结

这次问题最容易误判的地方有三个：

1. **UI 点了 Allow，不代表 SDK 一定接受了这次授权**
   - 必须看运行时真正收到的 `PermissionResult`

2. **TypeScript 类型通过，不代表 SDK 运行时 schema 一定接受**
   - 本次问题最终就是类型定义与运行时校验存在差异

3. **章节标题、运行目录、真实服务不一致时，很容易在错误目录里排查**
   - 先确认当前端口实际跑的是哪个 chapter，能节省很多时间

后续如果再遇到类似“点了 Allow 还是失败”的问题，建议优先按以下顺序排查：

1. 确认当前运行的是哪个章节
2. 确认 `permission_request` 是否带有 `suggestions`
3. 确认 `Allow` 是否真的把需要的建议权限回传给 SDK
4. 直接读 `.data/sessions/*.jsonl` 里的 tool failure 文本，不要只看 UI 提示
5. 优先相信 SDK 运行时真实报错，而不是仅凭类型定义推断
