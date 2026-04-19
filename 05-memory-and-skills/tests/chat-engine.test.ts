import test from "node:test";
import assert from "node:assert/strict";

import { buildMemoryContext, buildTeachingReply } from "../lib/chat-engine";
import { skillPresets } from "../lib/skill-presets";
import type { MemoryEntry } from "../lib/types";

const selectedMemories: MemoryEntry[] = [
  {
    id: "memory-1",
    title: "Exam goal",
    content: "The learner is preparing for a TypeScript exam next month.",
    category: "goal",
    createdAt: "2026-04-18T08:00:00.000Z",
  },
  {
    id: "memory-2",
    title: "Current project",
    content: "They are building a small Next.js tutorial app.",
    category: "project",
    createdAt: "2026-04-18T08:05:00.000Z",
  },
];

test("memory context only includes selected memories in a readable block", () => {
  const memoryContext = buildMemoryContext(selectedMemories);

  assert.match(memoryContext, /Memory 上下文/);
  assert.match(memoryContext, /Exam goal/);
  assert.match(memoryContext, /Current project/);
});

test("teaching reply changes shape based on the selected skill preset", () => {
  const teacherReply = buildTeachingReply({
    message: "How should I learn TypeScript generics?",
    selectedSkill: skillPresets[0],
    selectedMemories,
  });
  const reviewerReply = buildTeachingReply({
    message: "How should I learn TypeScript generics?",
    selectedSkill: skillPresets[2],
    selectedMemories,
  });

  assert.notEqual(teacherReply.response, reviewerReply.response);
  assert.match(teacherReply.composedPrompt, /耐心的老师/);
  assert.match(reviewerReply.composedPrompt, /谨慎的审阅者/);
  assert.match(teacherReply.response, /教学模式回答|小练习/);
  assert.match(reviewerReply.response, /审阅模式回答|风险|假设|验证/);
});
