import { NextResponse } from "next/server";

import { buildTeachingReply } from "@/lib/chat-engine";
import { memoryStore } from "@/lib/memory-store";
import { getSkillPresetById } from "@/lib/skill-presets";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<ChatRequestBody>;

  if (
    typeof payload.message !== "string" ||
    payload.message.trim().length === 0 ||
    typeof payload.selectedSkillId !== "string" ||
    !Array.isArray(payload.memoryIds)
  ) {
    return NextResponse.json(
      { error: "message, selectedSkillId, and memoryIds are required." },
      { status: 400 },
    );
  }

  const selectedSkill = getSkillPresetById(payload.selectedSkillId);

  if (!selectedSkill) {
    return NextResponse.json({ error: "Unknown skill preset." }, { status: 400 });
  }

  const memories = await memoryStore.list();
  const selectedMemorySet = new Set(payload.memoryIds);
  const selectedMemories = memories.filter((memory) => selectedMemorySet.has(memory.id));
  const reply = buildTeachingReply({
    message: payload.message.trim(),
    selectedSkill,
    selectedMemories,
  });

  const responseBody: ChatResponseBody = {
    response: reply.response,
    composedPrompt: reply.composedPrompt,
    memoryContext: reply.memoryContext,
    selectedSkill,
    selectedMemories,
  };

  return NextResponse.json(responseBody);
}
