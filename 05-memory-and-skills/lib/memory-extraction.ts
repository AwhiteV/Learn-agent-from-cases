import { query } from "@anthropic-ai/claude-agent-sdk";

import type { MemoryDecision, MemoryEntry, SuggestedMemoryInput } from "@/lib/types";

const VALID_CATEGORIES = new Set<MemoryEntry["category"]>(["preference", "project", "goal"]);

function sanitizeMemory(memory: SuggestedMemoryInput | undefined) {
  if (!memory) {
    return undefined;
  }

  const title = memory.title?.trim();
  const content = memory.content?.trim();
  const category = memory.category;

  if (!title || !content || !VALID_CATEGORIES.has(category)) {
    return undefined;
  }

  return {
    title,
    content,
    category,
  };
}

export function parseMemoryDecision(rawText: string): MemoryDecision {
  try {
    const fencedMatch = rawText.match(/```json\s*([\s\S]*?)```/i);
    const jsonCandidate = fencedMatch?.[1] ?? rawText;
    const parsed = JSON.parse(jsonCandidate) as Partial<MemoryDecision>;
    const memory = sanitizeMemory(parsed.memory);

    if (parsed.shouldRemember && memory) {
      return {
        shouldRemember: true,
        reason: typeof parsed.reason === "string" ? parsed.reason : "The model found a stable user fact worth saving.",
        memory,
      };
    }

    return {
      shouldRemember: false,
      reason: typeof parsed.reason === "string" ? parsed.reason : "No durable memory should be stored for this turn.",
    };
  } catch {
    return {
      shouldRemember: false,
      reason: "Failed to parse memory decision JSON, so this turn was not stored.",
    };
  }
}

export function buildMemoryDecisionPrompt(input: {
  userMessage: string;
  assistantResponse: string;
  existingMemories: MemoryEntry[];
}) {
  const existingMemoryBlock =
    input.existingMemories.length > 0
      ? input.existingMemories
          .map((memory) => `- [${memory.category}] ${memory.title}: ${memory.content}`)
          .join("\n")
      : "当前还没有任何已保存的 memory。";

  return [
    "你是一个 memory 决策器。你的任务不是回答用户问题，而是判断这一轮对话里是否出现了值得长期记住的、稳定的用户信息。",
    "",
    "只在这些情况记忆：",
    "1. 用户透露了稳定偏好，例如表达方式、输出偏好、工具偏好。",
    "2. 用户透露了持续项目背景，例如正在做什么项目、当前工作上下文。",
    "3. 用户透露了持续目标，例如学习目标、长期任务方向。",
    "",
    "不要记忆：",
    "1. 一次性问题本身。",
    "2. 助手自己的回答内容。",
    "3. 短期且不稳定的信息。",
    "4. 已经和现有 memory 完全重复的信息。",
    "",
    "你必须只输出 JSON，不要输出额外解释。格式：",
    '{"shouldRemember":boolean,"reason":"string","memory":{"title":"string","content":"string","category":"preference|project|goal"}}',
    "",
    "如果不应该记忆，则输出：",
    '{"shouldRemember":false,"reason":"string"}',
    "",
    "=== 当前已保存的 memory ===",
    existingMemoryBlock,
    "",
    "=== 用户消息 ===",
    input.userMessage,
    "",
    "=== 助手回复 ===",
    input.assistantResponse,
  ].join("\n");
}

export async function extractMemoryFromConversation(input: {
  model: string;
  userMessage: string;
  assistantResponse: string;
  existingMemories: MemoryEntry[];
}) {
  const result = query({
    prompt: buildMemoryDecisionPrompt(input),
    options: {
      model: input.model,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  let finalText = "";

  for await (const sdkMessage of result) {
    if (sdkMessage.type === "stream_event") {
      const event = sdkMessage.event;

      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        finalText += event.delta.text;
      }
    }

    if (sdkMessage.type === "result" && sdkMessage.subtype === "success" && !finalText) {
      finalText = sdkMessage.result;
    }
  }

  return parseMemoryDecision(finalText);
}
