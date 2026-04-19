import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";

import type {
  SessionMessage,
  SessionMessageRecord,
  SessionMetadata,
  SessionRecord,
  StoragePaths,
} from "@/lib/storage";

export class SessionStorage {
  constructor(private readonly paths: StoragePaths) {}

  async create(metadata: SessionMetadata): Promise<void> {
    const filePath = this.getSessionPath(metadata.sessionId);
    await fs.writeFile(filePath, `${JSON.stringify(metadata)}\n`, "utf8");
  }

  async append(sessionId: string, message: SessionMessage): Promise<void> {
    const record: SessionMessageRecord = {
      type: "message",
      message,
      appendedAt: Date.now(),
    };

    await fs.appendFile(this.getSessionPath(sessionId), `${JSON.stringify(record)}\n`, "utf8");
  }

  async read(sessionId: string): Promise<{
    metadata: SessionMetadata;
    messages: SessionMessage[];
  } | null> {
    try {
      const lineReader = createInterface({
        input: createReadStream(this.getSessionPath(sessionId)),
        crlfDelay: Infinity,
      });

      let metadata: SessionMetadata | null = null;
      const messages: SessionMessage[] = [];

      for await (const line of lineReader) {
        if (!line.trim()) {
          continue;
        }

        const record = JSON.parse(line) as SessionRecord;

        if (record.type === "metadata") {
          metadata = record;
          continue;
        }

        messages.push(record.message);
      }

      if (!metadata) {
        return null;
      }

      return { metadata, messages };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }

  async updateMetadata(sessionId: string, partial: Partial<SessionMetadata>): Promise<void> {
    const current = await this.read(sessionId);

    if (!current) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedMetadata: SessionMetadata = {
      ...current.metadata,
      ...partial,
      updatedAt: Date.now(),
    };

    const filePath = this.getSessionPath(sessionId);
    await fs.writeFile(filePath, `${JSON.stringify(updatedMetadata)}\n`, "utf8");

    for (const message of current.messages) {
      const record: SessionMessageRecord = {
        type: "message",
        message,
        appendedAt: Date.now(),
      };
      await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
    }
  }

  async list(): Promise<SessionMetadata[]> {
    try {
      const files = await fs.readdir(this.paths.sessionsDir);
      const sessions = await Promise.all(
        files
          .filter((file) => file.endsWith(".jsonl"))
          .map(async (file) => this.read(file.replace(/\.jsonl$/, ""))),
      );

      return sessions
        .filter((value): value is { metadata: SessionMetadata; messages: SessionMessage[] } =>
          Boolean(value),
        )
        .map((session) => session.metadata)
        .sort((left, right) => right.updatedAt - left.updatedAt);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }

  async delete(sessionId: string): Promise<void> {
    await fs.unlink(this.getSessionPath(sessionId));
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.paths.sessionsDir, `${sessionId}.jsonl`);
  }
}
