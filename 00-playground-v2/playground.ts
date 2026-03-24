/**
 * Claude Agent SDK Playground (V2 Unstable API)
 *
 * 基于 V2 Session API 的交互式测试环境。
 * 使用 session.send() / session.stream() 模式替代 query() 异步迭代器，
 * 天然支持多轮对话和会话恢复。
 *
 * 使用方法:
 *   1. 复制 .env.example 为 .env.local 并填写 API Key
 *   2. 运行: pnpm play
 *   3. 按提示输入或直接回车使用默认值
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量 (.env.local 优先，然后 .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import {
  unstable_v2_createSession,
  unstable_v2_resumeSession,
  type SDKSession,
  type SDKSessionOptions,
  type PermissionMode,
} from '@anthropic-ai/claude-agent-sdk';
import { type PlaygroundConfig } from './lib/config.js';
import { interactiveLoop, type SessionActions } from './lib/cli.js';
import { printSeparator, printSDKMessage, printRawSDKMessage } from './utils/printer.js';
import { RawOutputWriter } from './utils/raw-output-writer.js';
import {
  createCustomCanUseTool,
  buildHooksConfig,
  type PermissionLogEntry,
} from './lib/permissions.js';

// ============================================================================
// 会话管理
// ============================================================================

/** 会话管理器 — 维护当前活跃的 session */
interface SessionManager {
  session: SDKSession | null;
  sessionId: string | null;
}

/** 全局会话状态 */
const sessionManager: SessionManager = {
  session: null,
  sessionId: null,
};

// ============================================================================
// Session 构建
// ============================================================================

/** 根据配置构建 V2 session options */
function buildSessionOptions(cfg: PlaygroundConfig): SDKSessionOptions {
  // 环境变量
  const envConfig: Record<string, string | undefined> = {
    ...process.env,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  };
  if (process.env.ANTHROPIC_BASE_URL) {
    envConfig.ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL;
  }

  // 权限回调
  const onPermissionLog = (entry: PermissionLogEntry): void => {
    if (cfg.permission.verbosePermissionLog) {
      const icon = entry.decision === 'allow' ? '✅' : '❌';
      console.log(`\n${icon} [权限] ${entry.toolName} - ${entry.decision}`);
      if (entry.reason) {
        console.log(`   原因: ${entry.reason}`);
      }
    }
  };

  const canUseTool = cfg.permission.enableCustomCanUseTool
    ? createCustomCanUseTool(cfg.permission, onPermissionLog)
    : undefined;

  const hooks = buildHooksConfig(cfg.permission, onPermissionLog);

  const permissionMode: PermissionMode = cfg.permission.mode;

  // 构建允许/禁止工具列表
  const allowedTools = cfg.enableTools
    ? cfg.permission.autoAllowedTools
    : undefined;
  const disallowedTools = cfg.permission.deniedTools.length > 0
    ? cfg.permission.deniedTools
    : undefined;

  return {
    model: cfg.model,
    env: envConfig,
    permissionMode,
    allowedTools,
    disallowedTools,
    ...(canUseTool && { canUseTool }),
    ...(hooks && { hooks }),
  };
}

// ============================================================================
// 会话生命周期
// ============================================================================

/** 创建新会话 */
function createNewSession(cfg: PlaygroundConfig): void {
  // 关闭旧会话
  if (sessionManager.session) {
    sessionManager.session.close();
  }

  const options = buildSessionOptions(cfg);
  sessionManager.session = unstable_v2_createSession(options);
  sessionManager.sessionId = null;

  console.log('🆕 新会话已创建');

  if (cfg.permission.verbosePermissionLog) {
    console.log(`\n🔐 权限模式: ${cfg.permission.mode}`);
  }
}

/** 恢复已有会话 */
function resumeSession(sessionId: string, cfg: PlaygroundConfig): void {
  if (sessionManager.session) {
    sessionManager.session.close();
  }

  const options = buildSessionOptions(cfg);
  sessionManager.session = unstable_v2_resumeSession(sessionId, options);
  sessionManager.sessionId = sessionId;

  console.log(`🔄 已恢复会话: ${sessionId}`);
}

/** 关闭当前会话 */
function closeSession(): void {
  if (sessionManager.session) {
    sessionManager.session.close();
    sessionManager.session = null;
    console.log('👋 会话已关闭');
  }
}

// ============================================================================
// 核心查询执行 — V2 send/stream 模式
// ============================================================================

/**
 * 执行查询 (V2 Session API)
 *
 * 使用 session.send() 发送消息，session.stream() 接收流式响应。
 * 会话在多轮对话间保持，不需要每次重建。
 */
async function executeQuery(cfg: PlaygroundConfig): Promise<void> {
  // 如果还没有会话，自动创建
  if (!sessionManager.session) {
    createNewSession(cfg);
  }

  const session = sessionManager.session!;

  printSeparator('SDK 消息');

  // 初始化原始输出写入器（如果启用）
  let rawWriter: RawOutputWriter | null = null;
  if (cfg.rawOutput) {
    rawWriter = new RawOutputWriter(process.cwd());
    const filePath = rawWriter.startSession();
    console.log(`📁 原始输出将写入: ${filePath}`);
  }

  // ========================================
  // 🚀 V2: send() 发送消息，stream() 接收响应
  // ========================================
  await session.send(cfg.prompt);

  let messageIndex = 0;
  let textBuffer = '';

  for await (const msg of session.stream()) {
    // 捕获 session_id
    if (msg.session_id && !sessionManager.sessionId) {
      sessionManager.sessionId = msg.session_id;
    }

    // 原始模式
    if (cfg.rawOutput) {
      printRawSDKMessage(msg, messageIndex);
      rawWriter?.writeMessage(msg);
    } else {
      printSDKMessage(msg, messageIndex, cfg);
    }

    messageIndex++;

    // 收集最终文本
    if (msg.type === 'assistant' && msg.message?.content) {
      for (const block of msg.message.content) {
        if (block.type === 'text' && block.text) {
          textBuffer = block.text;
        }
      }
    }
  }

  // 结束原始输出会话
  if (rawWriter) {
    rawWriter.endSession();
    console.log(`\n📁 原始输出已保存`);
  }

  // 非流式模式下显示完整回复
  if (textBuffer && !cfg.streamText) {
    printSeparator('最终回复');
    console.log(textBuffer);
  }

  // 显示会话信息
  if (sessionManager.sessionId) {
    console.log(`\n💬 会话 ID: ${sessionManager.sessionId}`);
  }

  printSeparator('完成');
}

// ============================================================================
// 入口
// ============================================================================

async function main(): Promise<void> {
  // 检查 API Key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ 错误: 未设置 ANTHROPIC_API_KEY 环境变量');
    console.error('   请在 .env.local 中设置');
    process.exit(1);
  }

  // 构建会话操作回调
  const sessionActions: SessionActions = {
    createNewSession: (cfg) => createNewSession(cfg as PlaygroundConfig),
    resumeSession: (id, cfg) => resumeSession(id, cfg as PlaygroundConfig),
    closeSession,
    getSessionId: () => sessionManager.sessionId,
  };

  await interactiveLoop(executeQuery, sessionActions);
}

main().catch((error) => {
  console.error('❌ Playground 错误:', error);
  process.exit(1);
});
