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

import { createAppState, type AppState } from './lib/config.js';
import { createNewSession } from './lib/session-ops.js';
import { interactiveLoop } from './lib/cli.js';
import { printSeparator, printSDKMessage, printRawSDKMessage } from './utils/printer.js';
import { RawOutputWriter } from './utils/raw-output-writer.js';
import { addSession, updateSession } from './lib/session-history.js';

// ============================================================================
// 核心查询执行 — V2 send/stream 模式
// ============================================================================

/**
 * 执行查询 (V2 Session API)
 *
 * 使用 session.send() 发送消息，session.stream() 接收流式响应。
 * 会话在多轮对话间保持，不需要每次重建。
 */
async function executeQuery(state: AppState, prompt: string): Promise<void> {
  // 如果还没有会话，自动创建
  if (!state.session.session) {
    createNewSession(state);
  }

  const session = state.session.session!;

  printSeparator('SDK 消息');

  // 初始化原始输出写入器（如果启用）
  let rawWriter: RawOutputWriter | null = null;
  if (state.display.rawOutput) {
    rawWriter = new RawOutputWriter(process.cwd());
    const filePath = rawWriter.startSession();
    console.log(`📁 原始输出将写入: ${filePath}`);
  }

  // 🚀 V2: send() 发送消息，stream() 接收响应
  await session.send(prompt);

  // 记录首条消息（用于历史显示）
  if (!state.session.firstMessage) {
    state.session.firstMessage = prompt;
  }

  let messageIndex = 0;
  let textBuffer = '';

  for await (const msg of session.stream()) {
    // 捕获 session_id，并在首次获取时写入历史
    if (msg.session_id && !state.session.sessionId) {
      state.session.sessionId = msg.session_id;
      addSession(process.cwd(), {
        sessionId: msg.session_id,
        createdAt: new Date().toISOString(),
        model: state.config.model,
        firstMessage: state.session.firstMessage ?? prompt,
      });
    }

    // 原始模式
    if (state.display.rawOutput) {
      printRawSDKMessage(msg, messageIndex);
      rawWriter?.writeMessage(msg);
    } else {
      printSDKMessage(msg, messageIndex, state.display);
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

  // 更新会话历史
  state.session.messageCount++;
  if (state.session.sessionId) {
    updateSession(process.cwd(), state.session.sessionId, {
      lastActiveAt: new Date().toISOString(),
      messageCount: state.session.messageCount,
    });
  }

  // 非流式模式下显示完整回复
  if (textBuffer && !state.display.streamText) {
    printSeparator('最终回复');
    console.log(textBuffer);
  }

  // 显示会话信息
  if (state.session.sessionId) {
    console.log(`\n💬 会话 ID: ${state.session.sessionId}`);
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

  const state = createAppState();
  const executor = (prompt: string): Promise<void> => executeQuery(state, prompt);

  await interactiveLoop(executor, state);
}

main().catch((error) => {
  console.error('❌ Playground 错误:', error);
  process.exit(1);
});
