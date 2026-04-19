"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { GitBranch, PanelRightClose, PanelRightOpen, Send } from "lucide-react";

import { LearningAssistant } from "@/components/learning-assistant";
import { ProviderInspector } from "@/components/provider-inspector";
import { ProviderSwitcher } from "@/components/provider-switcher";
import { SessionList } from "@/components/session-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ChatRequestBody, ChatResponseBody, ProviderSummary } from "@/lib/types";

interface ChatConsoleProps {
  providers: ProviderSummary[];
  defaultProviderId: string;
}

interface TranscriptItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  providerName?: string;
  executionMode?: "local" | "remote";
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

export function ChatConsole({ providers, defaultProviderId }: ChatConsoleProps) {
  const [activeProviderId, setActiveProviderId] = useState(defaultProviderId);
  const [message, setMessage] = useState(
    "请演示本地 Provider 和远程风格 Provider 会如何处理一条每周发布总结请求。",
  );
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [latestResponse, setLatestResponse] = useState<ChatResponseBody | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"switcher" | "inspector">("switcher");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.id === activeProviderId) ?? providers[0],
    [activeProviderId, providers],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  async function loadSession(id: string) {
    try {
      const response = await fetch(`/api/sessions/${id}`);
      const payload = (await response.json()) as { messages?: TranscriptItem[] };

      if (payload.messages) {
        setTranscript(payload.messages);
        setSessionId(id);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  }

  function handleNewChat() {
    setTranscript([]);
    setSessionId(null);
    setLatestResponse(null);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || !activeProvider || isSending) return;

    setErrorMessage(null);
    setIsSending(true);

    const assistantMessageId = uniqueId("assistant");

    setTranscript((currentTranscript) => [
      ...currentTranscript,
      { id: uniqueId("user"), role: "user", content: trimmedMessage },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        providerName: activeProvider.name,
        executionMode: activeProvider.executionMode,
      },
    ]);

    const requestBody: ChatRequestBody = {
      providerId: activeProvider.id,
      message: trimmedMessage,
      sessionId: sessionId ?? undefined,
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "聊天请求失败。");
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
            | { type: "result"; data: { sessionId: string; response: ChatResponseBody } }
            | { type: "error"; data: { error: string } };

          if (eventData.type === "content") {
            setTranscript((currentTranscript) =>
              currentTranscript.map((entry) =>
                entry.id === assistantMessageId ? { ...entry, content: entry.content + eventData.data } : entry,
              ),
            );
            setSessionId(eventData.sessionId);
          }

          if (eventData.type === "result") {
            setSessionId(eventData.data.sessionId);
            setLatestResponse(eventData.data.response);
            setRefreshTrigger((current) => current + 1);
          }

          if (eventData.type === "error") {
            throw new Error(eventData.data.error);
          }
        }
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "聊天请求失败。";
      setErrorMessage(messageText);
      setTranscript((currentTranscript) =>
        currentTranscript.map((entry) =>
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
          <h1 className="text-2xl font-semibold">06 · Remote & Multi-Provider</h1>
          <p className="text-sm text-slate-500">当前 Provider：{activeProvider?.name}</p>
          {sessionId ? <p className="text-sm text-slate-500">Session: {sessionId}</p> : null}
        </div>

        <ScrollArea className="flex-1 p-6" data-learning-target="transcript-panel">
          <div className="mx-auto max-w-3xl space-y-4" ref={scrollRef}>
            {transcript.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent className="px-0 text-slate-500">
                  通过当前 Provider 发送第一条消息，开始对话。
                </CardContent>
              </Card>
            ) : (
              transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-[80%] p-4 ${
                      entry.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100"
                    }`}
                  >
                    <CardContent className="px-0">
                      {entry.providerName ? (
                        <div className="mb-2 text-xs font-medium text-slate-500">
                          {entry.providerName} · {entry.executionMode}
                        </div>
                      ) : null}
                      <p className="whitespace-pre-wrap break-words text-sm leading-7">{entry.content}</p>
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
                placeholder="输入消息..."
                value={message}
              />
              <Button disabled={!activeProvider || isSending || message.trim().length === 0} type="submit">
                <Send className="h-4 w-4" />
                通过当前 Provider 发送
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
                <h2 className="text-lg font-semibold">Provider 控制台</h2>
                <div className="flex items-center gap-2 text-sm leading-6 text-slate-500">
                  <GitBranch className="h-4 w-4" />
                  切换 Provider，不改变主聊天布局；在同一套右栏里查看路由差异和稳定抽象层。
                </div>
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
              aria-label="切换到 Provider 切换器"
              className={sidebarIconButtonClass(sidebarTab === "switcher")}
              onClick={() => {
                setSidebarTab("switcher");
                setIsSidebarCollapsed(false);
              }}
              type="button"
            >
              <GitBranch className="h-4 w-4" />
            </button>
            <button
              aria-label="切换到 Provider 检查面板"
              className={sidebarIconButtonClass(sidebarTab === "inspector")}
              onClick={() => {
                setSidebarTab("inspector");
                setIsSidebarCollapsed(false);
              }}
              type="button"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 p-4">
              <button
                className={sidebarTabButtonClass(sidebarTab === "switcher")}
                onClick={() => setSidebarTab("switcher")}
                type="button"
              >
                Provider 切换器
              </button>
              <button
                className={sidebarTabButtonClass(sidebarTab === "inspector")}
                onClick={() => setSidebarTab("inspector")}
                type="button"
              >
                Provider 检查面板
              </button>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                <div className={sidebarTab === "switcher" ? "block" : "hidden"}>
                  <ProviderSwitcher
                    activeProviderId={activeProviderId}
                    onSelect={setActiveProviderId}
                    providers={providers}
                  />
                </div>
                <div className={sidebarTab === "inspector" ? "block" : "hidden"}>
                  {activeProvider ? (
                    <ProviderInspector activeProvider={activeProvider} latestResponse={latestResponse} />
                  ) : null}
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </aside>
    </div>
  );
}
