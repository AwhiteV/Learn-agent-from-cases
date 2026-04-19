import fs from "node:fs/promises";
import path from "node:path";

import { ConfigStorage } from "@/lib/storage/config";
import { SessionStorage } from "@/lib/storage/session";

export interface SessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface SessionConfig {
  model?: string;
}

export interface SessionState {
  sessionId: string;
  isActive: boolean;
  currentTurn: number;
  totalCostUsd: number;
  createdAt: number;
  updatedAt: number;
}

export interface SessionMetadata {
  type: "metadata";
  sessionId: string;
  config: SessionConfig;
  state: SessionState;
  createdAt: number;
  updatedAt: number;
}

export interface SessionMessageRecord {
  type: "message";
  message: SessionMessage;
  appendedAt: number;
}

export type SessionRecord = SessionMetadata | SessionMessageRecord;

export interface StoredConfig {
  defaultModel?: string;
  recentSessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoragePaths {
  dataDir: string;
  configPath: string;
  sessionsDir: string;
}

export class FileSystemStorage {
  private readonly configStorage: ConfigStorage;
  private readonly sessionStorage: SessionStorage;

  constructor(private readonly paths: StoragePaths) {
    this.configStorage = new ConfigStorage(paths);
    this.sessionStorage = new SessionStorage(paths);
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.paths.dataDir, { recursive: true });
    await fs.mkdir(this.paths.sessionsDir, { recursive: true });
  }

  async readConfig() {
    return this.configStorage.read();
  }

  async writeConfig(config: StoredConfig) {
    return this.configStorage.write(config);
  }

  async createSession(metadata: SessionMetadata) {
    return this.sessionStorage.create(metadata);
  }

  async appendMessage(sessionId: string, message: SessionMessage) {
    return this.sessionStorage.append(sessionId, message);
  }

  async readSession(sessionId: string) {
    return this.sessionStorage.read(sessionId);
  }

  async updateSessionMetadata(sessionId: string, partial: Partial<SessionMetadata>) {
    return this.sessionStorage.updateMetadata(sessionId, partial);
  }

  async listSessions() {
    return this.sessionStorage.list();
  }

  async deleteSession(sessionId: string) {
    return this.sessionStorage.delete(sessionId);
  }
}

export function getDefaultPaths(projectRoot: string): StoragePaths {
  const dataDir = path.join(projectRoot, ".data");

  return {
    dataDir,
    configPath: path.join(dataDir, "config.json"),
    sessionsDir: path.join(dataDir, "sessions"),
  };
}

let storageInstance: FileSystemStorage | null = null;

export function getStorage(projectRoot: string = process.cwd()): FileSystemStorage {
  if (!storageInstance) {
    storageInstance = new FileSystemStorage(getDefaultPaths(projectRoot));
  }

  return storageInstance;
}
