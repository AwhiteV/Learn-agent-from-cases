/**
 * Playground 配置模块
 *
 * 定义配置接口和默认值，管理运行时应用状态。
 * 关注点分离：SessionConfig（SDK 相关）、DisplayConfig（UI 相关）、SessionState（会话运行时）。
 */

import type { SDKSession } from '@anthropic-ai/claude-agent-sdk';
import { type PermissionConfig, DEFAULT_PERMISSION_CONFIG } from './permissions.js';

// ============================================================================
// 配置接口
// ============================================================================

/** SDK 会话相关配置 */
export interface SessionConfig {
  /** 模型名称 (V2 API 必传) */
  model: string;
  /** 工作目录 */
  workingDirectory: string;
  /** 是否启用工具 */
  enableTools: boolean;
  /** 权限配置 */
  permission: PermissionConfig;
}

/** UI / 输出显示配置 */
export interface DisplayConfig {
  /** 是否显示详细日志 */
  verbose: boolean;
  /** 是否显示原始 JSON */
  showRawJson: boolean;
  /** 是否展开内容块详情 */
  expandContent: boolean;
  /** 是否流式输出文本 */
  streamText: boolean;
  /** 是否启用原始输出模式 (美化 JSON + NDJSON 文件) */
  rawOutput: boolean;
}

/** 会话运行时状态 */
export interface SessionState {
  /** 当前活跃的 V2 SDK Session */
  session: SDKSession | null;
  /** 当前会话 ID（从 SDK 首条响应中捕获） */
  sessionId: string | null;
  /** 当前会话的消息轮次计数 */
  messageCount: number;
  /** 当前会话的首条用户消息（用于历史记录显示） */
  firstMessage: string | null;
}

/** 应用状态容器 — 统一管理所有可变状态 */
export interface AppState {
  /** 会话运行时状态 */
  session: SessionState;
  /** SDK 会话配置 */
  config: SessionConfig;
  /** 显示配置 */
  display: DisplayConfig;
}

// ============================================================================
// 默认值
// ============================================================================

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  model: 'sonnet',
  workingDirectory: process.cwd(),
  enableTools: true,
  permission: { ...DEFAULT_PERMISSION_CONFIG },
};

export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  verbose: false,
  showRawJson: false,
  expandContent: false,
  streamText: true,
  rawOutput: false,
};

export const INITIAL_SESSION_STATE: SessionState = {
  session: null,
  sessionId: null,
  messageCount: 0,
  firstMessage: null,
};

// ============================================================================
// 工厂函数
// ============================================================================

/** 创建初始应用状态 */
export function createAppState(): AppState {
  return {
    session: { ...INITIAL_SESSION_STATE },
    config: {
      ...DEFAULT_SESSION_CONFIG,
      permission: { ...DEFAULT_PERMISSION_CONFIG },
    },
    display: { ...DEFAULT_DISPLAY_CONFIG },
  };
}
