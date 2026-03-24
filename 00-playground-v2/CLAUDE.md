# 00-playground-v2

Claude Agent SDK V2 Unstable API 交互式测试环境。

## API 版本

使用 **V2 Session API** (unstable)，核心 API：

- `unstable_v2_createSession(options)` — 创建会话
- `unstable_v2_resumeSession(sessionId, options)` — 恢复会话
- `session.send(message)` — 发送消息
- `session.stream()` — 流式接收响应
- `session.close()` — 关闭会话

## 项目结构

```
00-playground-v2/
├── playground.ts          # 入口 — 会话生命周期管理 + send/stream 执行
├── lib/
│   ├── config.ts          # PlaygroundConfig 接口和默认值 (含 model 字段)
│   ├── cli.ts             # 交互式 CLI、命令处理、SessionActions 接口
│   └── permissions.ts     # 权限模式、canUseTool 回调、PreToolUse Hook
├── utils/
│   ├── printer.ts         # SDK 消息格式化输出
│   └── raw-output-writer.ts  # NDJSON 文件写入
├── package.json
└── tsconfig.json
```

## 运行命令

```bash
pnpm play          # 启动交互式 playground
pnpm play:debug    # 带 DEBUG 日志
pnpm play:watch    # 文件变更自动重启
```

## CLI 命令

### 会话管理 (V2)
- `/new` — 创建新会话 (重置多轮上下文)
- `/resume <id>` — 恢复已有会话
- `/session` — 显示当前会话信息
- `/close` — 关闭当前会话

### 配置
- `/config` — 修改配置
- `/show` — 显示当前配置
- `/model [name]` — 切换模型
- `/tools` — 切换工具启用
- `/verbose` — 切换详细模式
- `/stream` — 切换流式输出
- `/raw` — 切换原始输出模式

### 权限
- `/perm` — 权限配置菜单
- `/perm-mode` — 切换权限模式
- `/perm-log` — 查看权限日志

## 依赖

- `@anthropic-ai/claude-agent-sdk` ^0.2.79
- `dotenv` — 环境变量加载
- `tsx` — TypeScript 直接运行

## 环境变量

- `ANTHROPIC_API_KEY` (必需) — API Key
- `ANTHROPIC_BASE_URL` (可选) — 自定义 API 地址
