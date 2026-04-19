import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { MemoryEntry, SuggestedMemoryInput } from "@/lib/types";

type MemoryInput = SuggestedMemoryInput;

function createStoragePath(dataDirectory: string) {
  return path.join(dataDirectory, "memory.json");
}

export function createMemoryStore(dataDirectory = path.join(process.cwd(), ".data")) {
  const storagePath = createStoragePath(dataDirectory);

  async function ensureDataDirectory() {
    await mkdir(dataDirectory, { recursive: true });
  }

  async function readEntries(): Promise<MemoryEntry[]> {
    try {
      const raw = await readFile(storagePath, "utf8");
      const parsed = JSON.parse(raw) as MemoryEntry[];

      return parsed.sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }

  async function writeEntries(entries: MemoryEntry[]) {
    await ensureDataDirectory();
    await writeFile(storagePath, JSON.stringify(entries, null, 2), "utf8");
  }

  return {
    async list() {
      return readEntries();
    },
    async create(input: MemoryInput) {
      const existingEntries = await readEntries();
      const createdEntry: MemoryEntry = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };

      await writeEntries([createdEntry, ...existingEntries]);

      return createdEntry;
    },
    async createIfNotExists(input: MemoryInput) {
      const existingEntries = await readEntries();
      const existingMatch = existingEntries.find(
        (entry) =>
          entry.category === input.category &&
          entry.title.trim() === input.title.trim() &&
          entry.content.trim() === input.content.trim(),
      );

      if (existingMatch) {
        return {
          created: false,
          memory: existingMatch,
        };
      }

      const createdEntry: MemoryEntry = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };

      await writeEntries([createdEntry, ...existingEntries]);

      return {
        created: true,
        memory: createdEntry,
      };
    },
    async delete(memoryId: string) {
      const existingEntries = await readEntries();
      const nextEntries = existingEntries.filter((entry) => entry.id !== memoryId);

      if (nextEntries.length === existingEntries.length) {
        return false;
      }

      await writeEntries(nextEntries);

      return true;
    },
  };
}

export const memoryStore = createMemoryStore();
