"use client";

import { useEffect, useMemo, useState } from "react";

import { MemoryPanel } from "@/components/memory-panel";
import { LearningAssistant } from "@/components/learning-assistant";
import { SkillSelector } from "@/components/skill-selector";
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

export function ChatInterface() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [skills, setSkills] = useState<SkillPreset[]>([]);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState("teacher");
  const [message, setMessage] = useState("");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestResponse, setLatestResponse] = useState<ChatResponseBody | null>(null);

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
          error instanceof Error ? error.message : "Unable to load the tutorial data.",
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

  const activeMemories = useMemo(
    () => memories.filter((memory) => selectedMemoryIds.includes(memory.id)),
    [memories, selectedMemoryIds],
  );

  function handleToggleMemory(memoryId: string) {
    setSelectedMemoryIds((currentIds) =>
      currentIds.includes(memoryId)
        ? currentIds.filter((currentId) => currentId !== memoryId)
        : [...currentIds, memoryId],
    );
  }

  async function refreshMemories(nextSelectedId?: string) {
    const response = await fetch("/api/memory");
    const data = (await response.json()) as { memories: MemoryEntry[] };

    setMemories(data.memories);

    if (nextSelectedId) {
      setSelectedMemoryIds((currentIds) =>
        currentIds.includes(nextSelectedId) ? currentIds : [nextSelectedId, ...currentIds],
      );
    }
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
      setSelectedMemoryIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== memoryId),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete memory.");
    } finally {
      setDeletingMemoryId(null);
    }
  }

  async function handleCreateMemory(input: {
    title: string;
    content: string;
    category: MemoryEntry["category"];
  }) {
    setErrorMessage(null);
    setIsSavingMemory(true);

    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save memory.");
      }

      const data = (await response.json()) as { memory: MemoryEntry };
      await refreshMemories(data.memory.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save memory.");
    } finally {
      setIsSavingMemory(false);
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
    const userMessage: TranscriptMessage = {
      id: uniqueId("user"),
      role: "user",
      content: trimmedMessage,
    };

    setTranscript((currentMessages) => [...currentMessages, userMessage]);
    setMessage("");

    const requestBody: ChatRequestBody = {
      message: trimmedMessage,
      selectedSkillId: activeSkill.id,
      memoryIds: selectedMemoryIds,
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

      const assistantMessage: TranscriptMessage = {
        id: uniqueId("assistant"),
        role: "assistant",
        content: data.response,
      };

      setLatestResponse(data);
      setTranscript((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Chat request failed.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.5rem] border border-stone-300/70 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_38%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.22),transparent_36%),linear-gradient(135deg,rgba(255,251,235,0.97),rgba(255,255,255,0.92))] p-8 shadow-[0_24px_90px_rgba(63,43,27,0.14)]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              可运行案例
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              带记忆与模式切换的学习助手
            </h1>
            <p className="mt-4 text-base leading-8 text-stone-700 sm:text-lg">
              先保存几条学习者记忆，再保持一个 skill 处于激活状态，把同一个问题重复问两次以上。
              页面会把 prompt 组装过程可视化，方便你直接观察 memory 注入和 skill preset
              是怎样改变助手行为的。
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white/70 p-5">
              <p className="text-sm font-semibold text-stone-900">先试这个</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                先保存一条偏好 memory 和一条项目 memory，然后提问：
                &quot;我该怎么学习 TypeScript 泛型？&quot;
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white/70 p-5">
              <p className="text-sm font-semibold text-stone-900">重点观察</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                教学模式会偏讲解，构建模式会偏计划，审阅模式会偏检查。
                同一个问题在不同模式下应该呈现出明显不同的回答结构。
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white/70 p-5">
              <p className="text-sm font-semibold text-stone-900">再看这里</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                每次回答后都看一下 prompt 预览，确认到底是哪些 memory block
                和 system prompt 被拼到了一起。
              </p>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_1.92fr]">
          <MemoryPanel
            memories={memories}
            selectedMemoryIds={selectedMemoryIds}
            isSaving={isSavingMemory}
            deletingMemoryId={deletingMemoryId}
            onToggleMemory={handleToggleMemory}
            onCreateMemory={handleCreateMemory}
            onDeleteMemory={handleDeleteMemory}
          />

          <div className="space-y-6">
            <SkillSelector
              skills={skills}
              selectedSkillId={selectedSkillId}
              onSelectSkill={setSelectedSkillId}
            />

            <section className="rounded-[2rem] border border-stone-300/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(63,43,27,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    当前配置
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                    对比助手当前看到的输入
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    每次调整当前 skill 或 memory 选择后都重新发问一次。
                    最新回答会连同调试视图一起保留下来，方便学习者逐项对照。
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-stone-100 px-4 py-3 text-sm text-stone-600">
                  <p>
                    <span className="font-semibold text-stone-900">当前 Skill：</span>{" "}
                    {activeSkill?.name ?? "加载中..."}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-stone-900">已注入的记忆：</span>{" "}
                    {activeMemories.length > 0
                      ? activeMemories.map((memory) => memory.title).join(", ")
                      : "无"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <div className="space-y-4" data-learning-target="transcript-panel">
                    {isLoading ? (
                      <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
                        正在加载本章教学数据...
                      </div>
                    ) : transcript.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm leading-7 text-stone-500">
                        还没有对话。先提一个问题，再切换 skill preset 或选中的 memory，
                        然后把同一个问题再问一次。
                      </div>
                    ) : (
                      transcript.map((entry) => (
                        <article
                          key={entry.id}
                          className={`rounded-[1.5rem] p-5 ${
                            entry.role === "user"
                              ? "ml-auto max-w-2xl bg-stone-900 text-stone-50"
                              : "border border-stone-200 bg-stone-50 text-stone-900"
                          }`}
                        >
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                            {entry.role === "user" ? "学习者提问" : "助手回答"}
                          </p>
                          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7">
                            {entry.content}
                          </pre>
                        </article>
                      ))
                    )}
                  </div>

                  <form className="mt-5" onSubmit={handleSubmit}>
                    <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="chat-message">
                      向助手提问
                    </label>
                    <textarea
                      id="chat-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      className="min-h-32 w-full rounded-[1.5rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-teal-600"
                      placeholder="试试：我该怎么在我的 Next.js 教程项目里学习 TypeScript 泛型？"
                      data-learning-target="chat-input"
                    />
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs leading-6 text-stone-500">
                        提示：改动 skill 或 memory 勾选项后，把同一个问题再问一次，更容易看出差异。
                      </p>
                      <button
                        type="submit"
                        disabled={isSending || !message.trim() || !activeSkill}
                        className="rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-teal-50 transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-teal-300"
                      >
                        {isSending ? "思考中..." : "发送问题"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div
                    className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
                    data-learning-target="prompt-preview"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      学习清单
                    </p>
                    <ol className="mt-3 space-y-3 text-sm leading-6 text-stone-700">
                      <li>1. 先保存至少两条不同分类的 memory。</li>
                      <li>2. 勾选其中一到两条，把它们注入到下一次回答。</li>
                      <li>3. 切换 skill preset，并把同一个问题重新发送一次。</li>
                      <li>4. 对比回答结构以及 prompt 预览里的变化。</li>
                    </ol>
                  </div>

                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Prompt 预览
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap break-words rounded-[1.25rem] bg-stone-900 p-4 text-xs leading-6 text-stone-100">
                      {latestResponse?.composedPrompt ??
                        "发送一条消息后，这里会显示组装完成的 prompt。"}
                    </pre>
                  </div>

                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      注入的 Memory 区块
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap break-words rounded-[1.25rem] bg-white p-4 text-xs leading-6 text-stone-700">
                      {latestResponse?.memoryContext ??
                        "先选择 memory 并发送消息，这里就会显示注入的记忆区块。"}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <LearningAssistant />
    </div>
  );
}
