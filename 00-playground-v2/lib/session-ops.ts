/**
 * 会话生命周期操作模块
 *
 * 从 playground.ts 提取的 session 创建/恢复/关闭逻辑。
 * 独立模块以避免 playground.ts ↔ cli.ts 循环依赖。
 */

import {
  unstable_v2_createSession,
  unstable_v2_resumeSession,
  type SDKSessionOptions,
  type PermissionMode,
} from '@anthropic-ai/claude-agent-sdk';
import type { AppState, SessionConfig } from './config.js';
import {
  createCustomCanUseTool,
  buildHooksConfig,
  type PermissionLogEntry,
} from './permissions.js';

// ============================================================================
// Session Options 构建
// ============================================================================

/** 根据 SessionConfig 构建 V2 SDK session options */
export function buildSessionOptions(config: SessionConfig): SDKSessionOptions {
  const envConfig: Record<string, string | undefined> = {
    ...process.env,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  };
  if (process.env.ANTHROPIC_BASE_URL) {
    envConfig.ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL;
  }

  const onPermissionLog = (entry: PermissionLogEntry): void => {
    if (config.permission.verbosePermissionLog) {
      const icon = entry.decision === 'allow' ? '✅' : '❌';
      console.log(`\n${icon} [权限] ${entry.toolName} - ${entry.decision}`);
      if (entry.reason) {
        console.log(`   原因: ${entry.reason}`);
      }
    }
  };

  const canUseTool = config.permission.enableCustomCanUseTool
    ? createCustomCanUseTool(config.permission, onPermissionLog)
    : undefined;

  const hooks = buildHooksConfig(config.permission, onPermissionLog);

  const permissionMode: PermissionMode = config.permission.mode;

  const allowedTools = config.enableTools
    ? config.permission.autoAllowedTools
    : undefined;
  const disallowedTools = config.permission.deniedTools.length > 0
    ? config.permission.deniedTools
    : undefined;

  return {
    model: config.model,
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
export function createNewSession(state: AppState): void {
  if (state.session.session) {
    state.session.session.close();
  }

  const options = buildSessionOptions(state.config);
  state.session.session = unstable_v2_createSession(options);
  state.session.sessionId = null;
  state.session.messageCount = 0;
  state.session.firstMessage = null;

  console.log('🆕 新会话已创建');

  if (state.config.permission.verbosePermissionLog) {
    console.log(`\n🔐 权限模式: ${state.config.permission.mode}`);
  }
}

/** 恢复已有会话 */
export function resumeSession(state: AppState, sessionId: string): void {
  if (state.session.session) {
    state.session.session.close();
  }

  const options = buildSessionOptions(state.config);
  state.session.session = unstable_v2_resumeSession(sessionId, options);
  state.session.sessionId = sessionId;

  console.log(`🔄 已恢复会话: ${sessionId}`);
}

/** 关闭当前会话 */
export function closeSession(state: AppState): void {
  if (state.session.session) {
    state.session.session.close();
    state.session.session = null;
    console.log('👋 会话已关闭');
  }
}
