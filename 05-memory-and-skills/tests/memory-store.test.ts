import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";

import { createMemoryStore } from "../lib/memory-store";

test("memory store persists entries to a JSON file under .data", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "memory-store-"));
  const dataDir = path.join(tempRoot, ".data");

  try {
    const store = createMemoryStore(dataDir);
    const created = await store.create({
      title: "Prefers concrete examples",
      content: "Use examples from study planning instead of abstract metaphors.",
      category: "preference",
    });

    const reloadedStore = createMemoryStore(dataDir);
    const allEntries = await reloadedStore.list();

    assert.equal(allEntries.length, 1);
    assert.equal(allEntries[0]?.id, created.id);
    assert.match(allEntries[0]?.createdAt ?? "", /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("memory store deletes a persisted entry by id", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "memory-store-"));
  const dataDir = path.join(tempRoot, ".data");

  try {
    const store = createMemoryStore(dataDir);
    const first = await store.create({
      title: "Study goal",
      content: "Prepare for a TypeScript exam next month.",
      category: "goal",
    });
    await store.create({
      title: "Project context",
      content: "Building a small Next.js tutorial app.",
      category: "project",
    });

    const deleted = await store.delete(first.id);
    const remainingEntries = await store.list();

    assert.equal(deleted, true);
    assert.equal(remainingEntries.length, 1);
    assert.notEqual(remainingEntries[0]?.id, first.id);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("memory store avoids creating exact duplicate memories", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "memory-store-"));
  const dataDir = path.join(tempRoot, ".data");

  try {
    const store = createMemoryStore(dataDir);
    const first = await store.createIfNotExists({
      title: "偏好具体例子",
      content: "解释时多用具体例子。",
      category: "preference",
    });
    const second = await store.createIfNotExists({
      title: "偏好具体例子",
      content: "解释时多用具体例子。",
      category: "preference",
    });

    const allEntries = await store.list();

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(allEntries.length, 1);
    assert.equal(allEntries[0]?.id, first.memory.id);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
