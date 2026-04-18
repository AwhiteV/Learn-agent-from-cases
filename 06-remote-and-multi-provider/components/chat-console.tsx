"use client";

import { useState, type FormEvent } from "react";

import { ProviderInspector } from "@/components/provider-inspector";
import { LearningAssistant } from "@/components/learning-assistant";
import { ProviderSwitcher } from "@/components/provider-switcher";
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

export function ChatConsole({
  providers,
  defaultProviderId,
}: ChatConsoleProps) {
  const [activeProviderId, setActiveProviderId] = useState(defaultProviderId);
  const [message, setMessage] = useState(
    "请演示本地 Provider 和远程风格 Provider 会如何处理一条每周发布总结请求。",
  );
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [latestResponse, setLatestResponse] = useState<ChatResponseBody | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const activeProvider =
    providers.find((provider) => provider.id === activeProviderId) ?? providers[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !activeProvider || isSending) {
      return;
    }

    setErrorMessage(null);
    setIsSending(true);

    const userEntry: TranscriptItem = {
      id: uniqueId("user"),
      role: "user",
      content: trimmedMessage,
    };

    setTranscript((currentTranscript) => [...currentTranscript, userEntry]);

    const requestBody: ChatRequestBody = {
      providerId: activeProvider.id,
      message: trimmedMessage,
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as ChatResponseBody | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "聊天请求失败。");
      }

      const assistantEntry: TranscriptItem = {
        id: uniqueId("assistant"),
        role: "assistant",
        content: data.result.output,
        providerName: data.result.providerName,
        executionMode: data.result.executionMode,
      };

      setLatestResponse(data);
      setTranscript((currentTranscript) => [...currentTranscript, assistantEntry]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "聊天请求失败。",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
      <div className="space-y-6">
        <ProviderSwitcher
          activeProviderId={activeProviderId}
          onSelect={setActiveProviderId}
          providers={providers}
        />
        {activeProvider ? (
          <ProviderInspector
            activeProvider={activeProvider}
            latestResponse={latestResponse}
          />
        ) : null}
      </div>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-[0_18px_50px_rgba(40,31,18,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              聊天控制台
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              同一项任务，不同的 Provider 路径
            </h2>
          </div>
          {activeProvider ? (
            <div className="rounded-[1.2rem] border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-stone-700">
              <span className="font-semibold text-stone-950">
                当前 Provider：
              </span>{" "}
              {activeProvider.name} · {activeProvider.executionMode === "local" ? "local" : "remote"}
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              第 1 步
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              先选择一个 Provider。变化的是执行模式，不是页面层的聊天契约。
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              第 2 步
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              通过 <code>POST /api/chat</code> 发送同一份请求体。
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              第 3 步
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              对比输出、备注和执行模式，同时观察抽象层如何保持稳定。
            </p>
          </div>
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-stone-900" htmlFor="message">
            任务消息
          </label>
          <textarea
            className="mt-3 min-h-36 w-full rounded-[1.5rem] border border-[var(--border)] bg-white/80 px-4 py-4 text-base leading-7 text-stone-900 outline-none transition focus:border-stone-900"
            id="message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="用不同 Provider 发送同一项任务。"
            value={message}
            data-learning-target="chat-input"
          />

          <div className="mt-4 rounded-[1.3rem] border border-[var(--border)] bg-stone-950 px-4 py-4 text-sm leading-7 text-stone-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              统一请求载荷
            </p>
            <pre className="mt-2 overflow-x-auto text-xs leading-6">
{`POST /api/chat
${JSON.stringify(
  {
    providerId: activeProvider?.id ?? "",
    message: message.trim() || "在这里输入你的任务",
  },
  null,
  2,
)}`}
            </pre>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-[1.3rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              disabled={!activeProvider || isSending || message.trim().length === 0}
              type="submit"
            >
              {isSending ? "正在通过 Provider 路由..." : "通过当前 Provider 发送"}
            </button>
            <button
              className="rounded-full border border-[var(--border)] bg-white/80 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
              onClick={() => {
                setTranscript([]);
                setLatestResponse(null);
                setErrorMessage(null);
              }}
              type="button"
            >
              清空记录
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4" data-learning-target="transcript-panel">
          {transcript.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-[var(--border)] bg-white/55 px-5 py-6 text-sm leading-7 text-stone-600">
              还没有聊天记录。先用本地 Provider 发送一次任务，再切换到模拟远程 Provider，把同一条任务原样再发一次。
            </div>
          ) : (
            transcript.map((entry) => (
              <article
                key={entry.id}
                className={`rounded-[1.6rem] border px-5 py-5 shadow-[0_10px_24px_rgba(40,31,18,0.05)] ${
                  entry.role === "assistant"
                    ? "border-[var(--border)] bg-white/85"
                    : "border-stone-900 bg-stone-900 text-stone-50"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                      entry.role === "assistant"
                        ? "text-stone-500"
                        : "text-stone-300"
                    }`}
                  >
                    {entry.role === "assistant" ? "Provider 响应" : "学习者任务"}
                  </p>
                  {entry.providerName ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                      {entry.providerName} · {entry.executionMode}
                    </span>
                  ) : null}
                </div>
                <pre
                  className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                    entry.role === "assistant"
                      ? "text-stone-700"
                      : "text-stone-100"
                  }`}
                >
                  {entry.content}
                </pre>
              </article>
            ))
          )}
        </div>
      </section>
      <LearningAssistant />
    </div>
  );
}
