import path from "node:path";

import { query } from "@anthropic-ai/claude-agent-sdk";
import { NextResponse } from "next/server";

import { extractMemoryFromConversation } from "@/lib/memory-extraction";
import { memoryStore } from "@/lib/memory-store";
import { getConfiguredModel } from "@/lib/model-config";
import { buildChapter05PromptPreview, buildChapter05SystemPrompt } from "@/lib/request-context";
import { getSkillPresetById } from "@/lib/skill-presets";
import { getStorage } from "@/lib/storage";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

let rootEnvLoaded = false;

function ensureRootEnvLoaded() {
  if (rootEnvLoaded) {
    return;
  }

  process.loadEnvFile(path.resolve(process.cwd(), "../.env.local"));
  rootEnvLoaded = true;
}

export async function POST(request: Request) {
  ensureRootEnvLoaded();

  const payload = (await request.json()) as Partial<ChatRequestBody>;

  if (
    typeof payload.message !== "string" ||
    payload.message.trim().length === 0 ||
    typeof payload.selectedSkillId !== "string"
  ) {
    return NextResponse.json(
      { error: "message and selectedSkillId are required." },
      { status: 400 },
    );
  }

  const selectedSkill = getSkillPresetById(payload.selectedSkillId);

  if (!selectedSkill) {
    return NextResponse.json({ error: "Unknown skill preset." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  const memories = await memoryStore.list();
  const selectedMemories = memories;
  const trimmedMessage = payload.message.trim();
  const model = getConfiguredModel(process.env.ANTHROPIC_MODEL);
  const promptPreview = buildChapter05PromptPreview(
    trimmedMessage,
    selectedSkill,
    selectedMemories,
  );
  const systemPrompt = buildChapter05SystemPrompt({
    selectedSkill,
    selectedMemories,
  });
  const storage = getStorage(process.cwd());
  await storage.initialize();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let finalSessionId = payload.sessionId;
      let assistantContent = "";
      let sdkSessionId: string | null = null;

      try {
        const result = query({
          prompt: trimmedMessage,
          options: {
            model,
            systemPrompt,
            includePartialMessages: true,
            permissionMode: "bypassPermissions",
            allowDangerouslySkipPermissions: true,
            ...(finalSessionId ? { resume: finalSessionId } : {}),
          },
        });

        for await (const sdkMessage of result) {
          if (
            !sdkSessionId &&
            "session_id" in sdkMessage &&
            typeof sdkMessage.session_id === "string"
          ) {
            sdkSessionId = sdkMessage.session_id;
            finalSessionId = sdkSessionId;

            if (payload.sessionId) {
              await storage.appendMessage(sdkSessionId, {
                id: `msg-${Date.now()}-user`,
                role: "user",
                content: trimmedMessage,
                timestamp: Date.now(),
              });
            } else {
              await storage.createSession({
                type: "metadata",
                sessionId: sdkSessionId,
                config: { model },
                state: {
                  sessionId: sdkSessionId,
                  isActive: true,
                  currentTurn: 0,
                  totalCostUsd: 0,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });

              await storage.appendMessage(sdkSessionId, {
                id: `msg-${Date.now()}-user`,
                role: "user",
                content: trimmedMessage,
                timestamp: Date.now(),
              });
            }
          }

          if (sdkMessage.type === "stream_event") {
            const event = sdkMessage.event;

            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              assistantContent += event.delta.text;

              if (finalSessionId) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "content",
                      data: event.delta.text,
                      sessionId: finalSessionId,
                    })}\n\n`,
                  ),
                );
              }
            }
          }

          if (sdkMessage.type === "result" && sdkMessage.subtype === "success") {
            if (!finalSessionId) {
              throw new Error("Session ID not found in SDK messages");
            }

            await storage.appendMessage(finalSessionId, {
              id: `msg-${Date.now()}-assistant`,
              role: "assistant",
              content: assistantContent || sdkMessage.result,
              timestamp: Date.now(),
            });

            await storage.updateSessionMetadata(finalSessionId, {
              state: {
                sessionId: finalSessionId,
                isActive: false,
                currentTurn: sdkMessage.num_turns,
                totalCostUsd: sdkMessage.total_cost_usd,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            });

            const responseBody: ChatResponseBody = {
              response: assistantContent || sdkMessage.result,
              ...promptPreview,
              selectedSkill,
              selectedMemories,
            };

            try {
              const memoryDecision = await extractMemoryFromConversation({
                model,
                userMessage: trimmedMessage,
                assistantResponse: assistantContent || sdkMessage.result,
                existingMemories: memories,
              });

              if (memoryDecision.shouldRemember && memoryDecision.memory) {
                const persisted = await memoryStore.createIfNotExists(memoryDecision.memory);
                responseBody.memoryDecision = {
                  status: persisted.created ? "saved" : "duplicate",
                  reason: memoryDecision.reason,
                  memory: persisted.memory,
                };
              } else {
                responseBody.memoryDecision = {
                  status: "skipped",
                  reason: memoryDecision.reason,
                };
              }
            } catch {
              responseBody.memoryDecision = {
                status: "skipped",
                reason: "本轮记忆提取失败，因此没有保存新的 memory。",
              };
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  data: {
                    sessionId: finalSessionId,
                    totalCostUsd: sdkMessage.total_cost_usd,
                    durationMs: sdkMessage.duration_ms,
                    numTurns: sdkMessage.num_turns,
                    response: responseBody,
                  },
                })}\n\n`,
              ),
            );
          }
        }

        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              data: { error: message },
            })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
