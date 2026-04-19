"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Database, PanelRightClose, PanelRightOpen, Send, Sparkles } from "lucide-react";

import { LearningAssistant } from "@/components/learning-assistant";
import { MemoryPanel } from "@/components/memory-panel";
import { SessionList } from "@/components/session-list";
import { SkillSelector } from "@/components/skill-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
  ChatRequestBody,
  ChatResponseBody,
  MemoryEntry,
  SkillPreset,
} from "@/lib/types";

interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function sidebarIconButtonClass(isActive: boolean) {
  return `flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
    isActive ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
  }`;
}

function sidebarTabButtonClass(isActive: boolean) {
  return `rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
    isActive ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
  }`;
}

export function ChatInterface() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [skills, setSkills] = useState<SkillPreset[]>([]);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState("teacher");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestResponse, setLatestResponse] = useState<ChatResponseBody | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"memory" | "skills">("memory");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [memoryResponse, skillResponse] = await Promise.all([
          fetch("/api/memory"),
          fetch("/api/skills"),
        ]);

        if (!memoryResponse.ok || !skillResponse.ok) {
          throw new Error("Failed to load tutorial data.");
        }

        const memoryData = (await memoryResponse.json()) as { memories: MemoryEntry[] };
        const skillData = (await skillResponse.json()) as { skills: SkillPreset[] };

        setMemories(memoryData.memories);
        setSkills(skillData.skills);

        if (skillData.skills.length > 0) {
          setSelectedSkillId(skillData.skills[0].id);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load tutorial data.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  const activeSkill = useMemo(
    () => skills.find((skill) => skill.id === selectedSkillId) ?? null,
    [selectedSkillId, skills],
  );

  async function loadSession(id: string) {
    try {
      const response = await fetch(`/api/sessions/${id}`);
      const payload = (await response.json()) as { messages?: TranscriptMessage[] };

      if (payload.messages) {
        setMessages(payload.messages);
        setSessionId(id);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setSessionId(null);
    setLatestResponse(null);
    setErrorMessage(null);
  }

  async function refreshMemories() {
    const response = await fetch("/api/memory");
    const data = (await response.json()) as { memories: MemoryEntry[] };

    setMemories(data.memories);
  }

  async function handleDeleteMemory(memoryId: string) {
    setErrorMessage(null);
    setDeletingMemoryId(memoryId);

    try {
      const response = await fetch(`/api/memory?id=${encodeURIComponent(memoryId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete memory.");
      }

      await refreshMemories();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete memory.");
    } finally {
      setDeletingMemoryId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || !activeSkill || isSending) {
      return;
    }

    setErrorMessage(null);
    setIsSending(true);

    const trimmedMessage = message.trim();
    const assistantMessageId = uniqueId("assistant");

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: uniqueId("user"), role: "user", content: trimmedMessage },
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);
    setMessage("");

    const requestBody: ChatRequestBody = {
      message: trimmedMessage,
      sessionId: sessionId ?? undefined,
      selectedSkillId: activeSkill.id,
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Chat request failed.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available.");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          if (!chunk.startsWith("data: ")) continue;

          const eventData = JSON.parse(chunk.slice(6)) as
            | { type: "content"; data: string; sessionId: string }
            | {
                type: "result";
                data: { sessionId: string; response: ChatResponseBody };
              }
            | { type: "error"; data: { error: string } };

          if (eventData.type === "content") {
            setMessages((currentMessages) =>
              currentMessages.map((entry) =>
                entry.id === assistantMessageId
                  ? { ...entry, content: entry.content + eventData.data }
                  : entry,
              ),
            );
            setSessionId(eventData.sessionId);
          }

          if (eventData.type === "result") {
            setSessionId(eventData.data.sessionId);
            setLatestResponse(eventData.data.response);
            setRefreshTrigger((current) => current + 1);
            await refreshMemories();
          }

          if (eventData.type === "error") {
            throw new Error(eventData.data.error);
          }
        }
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Chat request failed.";
      setErrorMessage(messageText);
      setMessages((currentMessages) =>
        currentMessages.map((entry) =>
          entry.id === assistantMessageId ? { ...entry, content: `Error: ${messageText}` } : entry,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <LearningAssistant />
      <SessionList
        currentSessionId={sessionId}
        onNewChat={handleNewChat}
        onSessionSelect={loadSession}
        refreshTrigger={refreshTrigger}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b bg-white px-6 py-4">
          <h1 className="text-2xl font-semibold">Claude Agent SDK - Memory & Skills</h1>
          {sessionId ? (
            <p className="text-sm text-slate-500">Session: {sessionId}</p>
          ) : null}
        </div>

        <ScrollArea className="flex-1 p-6" data-learning-target="transcript-panel">
          <div className="mx-auto max-w-3xl space-y-4" ref={scrollRef}>
            {isLoading ? (
              <Card className="p-8 text-center">
                <CardContent className="px-0 text-sm text-slate-500">Loading...</CardContent>
              </Card>
            ) : messages.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent className="px-0 text-slate-500">
                  Send a message to start chatting with Claude.
                </CardContent>
              </Card>
            ) : (
              messages.map((messageEntry) => (
                <div
                  key={messageEntry.id}
                  className={`flex ${messageEntry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-[80%] p-4 ${
                      messageEntry.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100"
                    }`}
                  >
                    <CardContent className="px-0">
                      <p className="whitespace-pre-wrap break-words text-sm leading-7">
                        {messageEntry.content || (isSending && messageEntry.role === "assistant" ? "..." : "")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t bg-white p-6">
          <form className="mx-auto max-w-3xl" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Input
                data-learning-target="chat-input"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type your message..."
                value={message}
              />
              <Button disabled={!message.trim() || !activeSkill || isSending} type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
          </form>
        </div>
      </div>

      <aside
        className={`${isSidebarCollapsed ? "w-16" : "w-[30rem]"} flex h-full shrink-0 flex-col border-l bg-slate-50/60 transition-[width] duration-200`}
        data-learning-target="file-explorer"
      >
        <div className="flex items-start justify-between gap-3 p-4">
          {isSidebarCollapsed ? (
            <div className="flex w-full justify-center">
              <Button
                aria-label="展开右侧边栏"
                onClick={() => setIsSidebarCollapsed(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Workspace Panel
                </p>
                <h2 className="text-lg font-semibold">记忆与 Skills</h2>
                <p className="text-sm leading-6 text-slate-500">
                  在这里切换查看记忆库或 Skill 选择器，并检查本次请求的 Prompt 拼装结果。
                </p>
              </div>
              <Button
                aria-label="收起右侧边栏"
                onClick={() => setIsSidebarCollapsed(true)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <Separator />
        {isSidebarCollapsed ? (
          <div className="flex flex-1 flex-col items-center gap-3 px-2 py-4">
            <button
              aria-label="切换到记忆库"
              className={sidebarIconButtonClass(sidebarTab === "memory")}
              onClick={() => {
                setSidebarTab("memory");
                setIsSidebarCollapsed(false);
              }}
              type="button"
            >
              <Database className="h-4 w-4" />
            </button>
            <button
              aria-label="切换到 Skill 选择器"
              className={sidebarIconButtonClass(sidebarTab === "skills")}
              onClick={() => {
                setSidebarTab("skills");
                setIsSidebarCollapsed(false);
              }}
              type="button"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 p-4">
              <button
                className={sidebarTabButtonClass(sidebarTab === "memory")}
                onClick={() => setSidebarTab("memory")}
                type="button"
              >
                记忆库
              </button>
              <button
                className={sidebarTabButtonClass(sidebarTab === "skills")}
                onClick={() => setSidebarTab("skills")}
                type="button"
              >
                Skill 选择器
              </button>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                <div className={sidebarTab === "memory" ? "block" : "hidden"}>
                  <MemoryPanel
                    deletingMemoryId={deletingMemoryId}
                    lastMemoryDecision={latestResponse?.memoryDecision ?? null}
                    memories={memories}
                    onDeleteMemory={handleDeleteMemory}
                  />
                </div>
                <div className={sidebarTab === "skills" ? "block" : "hidden"}>
                  <SkillSelector
                    onSelectSkill={setSelectedSkillId}
                    selectedSkillId={selectedSkillId}
                    skills={skills}
                  />
                </div>
                <Card data-learning-target="prompt-preview">
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-semibold">Prompt 预览</p>
                    </div>
                    <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-100">
                      {latestResponse?.composedPrompt ?? "发送一条消息后，这里会显示实际拼装后的 prompt。"}
                    </pre>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Database className="h-4 w-4" />
                      当前记忆库共 {memories.length} 条
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </>
        )}
      </aside>
    </div>
  );
}
