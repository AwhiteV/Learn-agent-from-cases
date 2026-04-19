import assert from "node:assert/strict";
import test from "node:test";

import { buildChapter05SystemPrompt } from "../lib/request-context";
import type { MemoryEntry } from "../lib/types";
import { getSkillPresetById } from "../lib/skill-presets";

const selectedSkill = getSkillPresetById("teacher");

test("buildChapter05SystemPrompt includes the selected skill prompt and chosen memories", () => {
  assert.ok(selectedSkill);

  const memories: MemoryEntry[] = [
    {
      id: "memory-1",
      title: "偏好具体例子",
      content: "请用教程应用里的例子解释。",
      category: "preference",
      createdAt: new Date().toISOString(),
    },
  ];

  const prompt = buildChapter05SystemPrompt({
    selectedSkill,
    selectedMemories: memories,
  });

  assert.match(prompt, /教学模式/);
  assert.match(prompt, /请用教程应用里的例子解释/);
  assert.match(prompt, /结构化 memory/);
});
