"use client";

import { useState } from "react";

import type { MemoryEntry } from "@/lib/types";

interface MemoryPanelProps {
  memories: MemoryEntry[];
  selectedMemoryIds: string[];
  isSaving: boolean;
  deletingMemoryId: string | null;
  onToggleMemory: (memoryId: string) => void;
  onCreateMemory: (input: {
    title: string;
    content: string;
    category: MemoryEntry["category"];
  }) => Promise<void>;
  onDeleteMemory: (memoryId: string) => Promise<void>;
}

const categoryLabels: Record<MemoryEntry["category"], string> = {
  preference: "偏好",
  project: "项目",
  goal: "目标",
};

export function MemoryPanel({
  memories,
  selectedMemoryIds,
  isSaving,
  deletingMemoryId,
  onToggleMemory,
  onCreateMemory,
  onDeleteMemory,
}: MemoryPanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<MemoryEntry["category"]>("preference");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    await onCreateMemory({
      title: title.trim(),
      content: content.trim(),
      category,
    });

    setTitle("");
    setContent("");
    setCategory("preference");
  }

  return (
    <section
      className="rounded-[2rem] border border-stone-300/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(63,43,27,0.08)] backdrop-blur"
      data-learning-target="memory-panel"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          记忆面板
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          保存学习者上下文
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          保存偏好、项目背景或学习目标，再决定哪些 memory 要被注入到下一次回答里。
        </p>
      </div>

      <form className="space-y-3 rounded-[1.5rem] bg-stone-100/80 p-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="memory-title">
            标题
          </label>
          <input
            id="memory-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            placeholder="例如：偏好具体例子"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="memory-category">
            分类
          </label>
          <select
            id="memory-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as MemoryEntry["category"])}
            className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-amber-500"
          >
            <option value="preference">偏好</option>
            <option value="project">项目</option>
            <option value="goal">目标</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700" htmlFor="memory-content">
            内容
          </label>
          <textarea
            id="memory-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            placeholder="例如：请多用我的 Next.js 教程应用举例，并保持解释简短。"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isSaving ? "保存中..." : "添加记忆"}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            已保存的记忆
          </h3>
          <span className="text-xs text-stone-500">
            已选中 {selectedMemoryIds.length} 条
          </span>
        </div>

        {memories.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">
            还没有记忆。先在上面添加一条，再勾选它把它注入到下一次回答里。
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((memory) => {
              const isSelected = selectedMemoryIds.includes(memory.id);

              return (
                <div
                  key={memory.id}
                  className={`block cursor-pointer rounded-[1.5rem] border p-4 transition ${
                    isSelected
                      ? "border-amber-500 bg-amber-50 shadow-[0_10px_30px_rgba(245,158,11,0.12)]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleMemory(memory.id)}
                      className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-stone-900">{memory.title}</p>
                        <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                          {categoryLabels[memory.category]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {memory.content}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        添加于 {new Date(memory.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteMemory(memory.id)}
                      disabled={deletingMemoryId === memory.id}
                      className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingMemoryId === memory.id ? "删除中" : "删除"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
