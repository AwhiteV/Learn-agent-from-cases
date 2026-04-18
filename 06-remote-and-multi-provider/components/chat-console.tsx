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
    "Show how a local and a remote-style provider would process a weekly release summary request.",
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
        throw new Error("error" in data ? data.error : "Chat request failed.");
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
        error instanceof Error ? error.message : "Chat request failed.",
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
              Chat Console
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Same task, different provider path
            </h2>
          </div>
          {activeProvider ? (
            <div className="rounded-[1.2rem] border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-stone-700">
              <span className="font-semibold text-stone-950">
                Active provider:
              </span>{" "}
              {activeProvider.name} · {activeProvider.executionMode}
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Step 1
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Pick a provider. That changes execution mode, not the page-level
              chat contract.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Step 2
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Send the same request body through <code>POST /api/chat</code>.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Step 3
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Compare output, notes, and execution mode while the abstraction
              layer stays fixed.
            </p>
          </div>
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-stone-900" htmlFor="message">
            Task message
          </label>
          <textarea
            className="mt-3 min-h-36 w-full rounded-[1.5rem] border border-[var(--border)] bg-white/80 px-4 py-4 text-base leading-7 text-stone-900 outline-none transition focus:border-stone-900"
            id="message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask the same task in each provider mode."
            value={message}
            data-learning-target="chat-input"
          />

          <div className="mt-4 rounded-[1.3rem] border border-[var(--border)] bg-stone-950 px-4 py-4 text-sm leading-7 text-stone-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              Unified request payload
            </p>
            <pre className="mt-2 overflow-x-auto text-xs leading-6">
{`POST /api/chat
${JSON.stringify(
  {
    providerId: activeProvider?.id ?? "",
    message: message.trim() || "Your task goes here",
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
              {isSending ? "Routing through provider..." : "Send through active provider"}
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
              Clear transcript
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4" data-learning-target="transcript-panel">
          {transcript.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-[var(--border)] bg-white/55 px-5 py-6 text-sm leading-7 text-stone-600">
              No transcript yet. Send one task with the local provider, switch to
              the mock remote provider, and send the exact same task again.
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
                    {entry.role === "assistant" ? "Provider response" : "Learner task"}
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
