/**
 * 会话历史管理模块
 *
 * 持久化存储会话记录，支持浏览和恢复历史会话。
 * 数据存储在项目根目录的 .session-history.json 文件中。
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// 类型定义
// ============================================================================

/** 单条会话记录 */
export interface SessionRecord {
  sessionId: string;
  createdAt: string;       // ISO timestamp
  lastActiveAt: string;    // ISO timestamp
  model: string;
  messageCount: number;
  firstMessage: string;    // 首条用户消息预览 (截断至 80 字符)
}

/** 历史文件结构 */
interface SessionHistoryFile {
  version: 1;
  sessions: SessionRecord[];
}

// ============================================================================
// 常量
// ============================================================================

const HISTORY_FILENAME = '.session-history.json';
const MAX_HISTORY_SIZE = 50;
const FIRST_MESSAGE_MAX_LENGTH = 80;

// ============================================================================
// 核心函数
// ============================================================================

/** 获取历史文件完整路径 */
function getHistoryPath(basePath: string): string {
  return resolve(basePath, HISTORY_FILENAME);
}

/** 加载历史记录 */
export function loadHistory(basePath: string): SessionRecord[] {
  const filePath = getHistoryPath(basePath);
  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const data: SessionHistoryFile = JSON.parse(raw);
    return data.sessions ?? [];
  } catch {
    // 文件损坏时返回空数组
    return [];
  }
}

/** 保存历史记录 */
function saveHistory(basePath: string, sessions: SessionRecord[]): void {
  const filePath = getHistoryPath(basePath);
  const data: SessionHistoryFile = {
    version: 1,
    sessions,
  };
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/** 截断消息预览 */
function truncateMessage(message: string): string {
  const oneLine = message.replace(/\n/g, ' ').trim();
  if (oneLine.length <= FIRST_MESSAGE_MAX_LENGTH) {
    return oneLine;
  }
  return oneLine.slice(0, FIRST_MESSAGE_MAX_LENGTH - 3) + '...';
}

/** 新增会话记录 */
export function addSession(
  basePath: string,
  record: Omit<SessionRecord, 'lastActiveAt' | 'messageCount'>
): void {
  const sessions = loadHistory(basePath);

  // 检查是否已存在同 ID 的记录
  const existingIndex = sessions.findIndex((s) => s.sessionId === record.sessionId);
  const now = new Date().toISOString();

  const newRecord: SessionRecord = {
    ...record,
    firstMessage: truncateMessage(record.firstMessage),
    lastActiveAt: now,
    messageCount: 1,
  };

  if (existingIndex >= 0) {
    sessions[existingIndex] = newRecord;
  } else {
    sessions.unshift(newRecord);
  }

  // 限制数量
  if (sessions.length > MAX_HISTORY_SIZE) {
    sessions.splice(MAX_HISTORY_SIZE);
  }

  saveHistory(basePath, sessions);
}

/** 更新会话活跃状态 */
export function updateSession(
  basePath: string,
  sessionId: string,
  updates: Partial<Pick<SessionRecord, 'lastActiveAt' | 'messageCount'>>
): void {
  const sessions = loadHistory(basePath);
  const record = sessions.find((s) => s.sessionId === sessionId);
  if (!record) return;

  if (updates.lastActiveAt) {
    record.lastActiveAt = updates.lastActiveAt;
  }
  if (updates.messageCount !== undefined) {
    record.messageCount = updates.messageCount;
  }

  saveHistory(basePath, sessions);
}

/** 按 lastActiveAt 倒序列出历史 */
export function listHistory(basePath: string, limit?: number): SessionRecord[] {
  const sessions = loadHistory(basePath);

  // 按最后活跃时间倒序
  sessions.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());

  if (limit && limit > 0) {
    return sessions.slice(0, limit);
  }
  return sessions;
}

/** 根据序号获取会话记录 (1-based) */
export function getSessionByIndex(basePath: string, index: number): SessionRecord | undefined {
  const sorted = listHistory(basePath);
  return sorted[index - 1];
}

/** 删除单条记录 */
export function removeSession(basePath: string, sessionId: string): boolean {
  const sessions = loadHistory(basePath);
  const index = sessions.findIndex((s) => s.sessionId === sessionId);
  if (index < 0) return false;

  sessions.splice(index, 1);
  saveHistory(basePath, sessions);
  return true;
}

/** 清空所有历史 */
export function clearHistory(basePath: string): void {
  saveHistory(basePath, []);
}

// ============================================================================
// 显示格式化
// ============================================================================

/** 格式化历史记录为终端表格 */
export function formatHistoryTable(records: SessionRecord[]): string {
  if (records.length === 0) {
    return '(暂无会话历史)';
  }

  const lines: string[] = [];
  lines.push('  #   时间              模型       消息  首条消息');
  lines.push('  ' + '─'.repeat(70));

  records.forEach((r, i) => {
    const num = String(i + 1).padStart(2);
    const date = formatShortDate(r.lastActiveAt);
    const model = r.model.padEnd(10);
    const count = String(r.messageCount).padStart(4);
    lines.push(`  ${num}  ${date}  ${model} ${count}  ${r.firstMessage}`);
  });

  return lines.join('\n');
}

/** 格式化短日期 MM/DD HH:mm */
function formatShortDate(isoString: string): string {
  const d = new Date(isoString);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}
