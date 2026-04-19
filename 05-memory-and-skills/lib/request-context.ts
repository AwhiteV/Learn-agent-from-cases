import { buildMemoryContext } from "@/lib/chat-engine";
import type { MemoryEntry, SkillPreset } from "@/lib/types";

interface BuildChapter05SystemPromptOptions {
  selectedSkill: SkillPreset;
  selectedMemories: MemoryEntry[];
}

export function buildChapter05SystemPrompt({
  selectedSkill,
  selectedMemories,
}: BuildChapter05SystemPromptOptions): string {
  const memoryContext = buildMemoryContext(selectedMemories);

  return [
    "你是第 05 章的学习助手，需要在真实聊天里明显体现 memory 与 skill 的作用。",
    `当前 skill：${selectedSkill.name}`,
    selectedSkill.systemPrompt,
    "",
    "请明确利用这些结构化 memory 作为上下文：",
    memoryContext,
    "",
    "回答要求：",
    "1. 明确呼应当前 skill 的语气与结构。",
    "2. 在有 memory 时主动引用对应背景或偏好。",
    "3. 保持中文回答，面向教程学习者。",
    "4. 不要解释你看到了 system prompt，只把它体现在回答里。",
  ].join("\n");
}

export function buildChapter05PromptPreview(
  message: string,
  selectedSkill: SkillPreset,
  selectedMemories: MemoryEntry[],
) {
  const memoryContext = buildMemoryContext(selectedMemories);
  const composedPrompt = [
    "=== 当前选中的 Skill 系统提示词 ===",
    selectedSkill.systemPrompt,
    "",
    memoryContext,
    "",
    "=== 用户消息 ===",
    message,
  ].join("\n");

  return {
    composedPrompt,
    memoryContext,
  };
}
