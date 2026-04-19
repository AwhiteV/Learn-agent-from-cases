"use client";

import type { MemoryEntry } from "@/lib/types";

interface MemoryPanelProps {
  memories: MemoryEntry[];
  deletingMemoryId: string | null;
  lastMemoryDecision:
    | {
        status: "saved" | "duplicate" | "skipped";
        reason: string;
        memory?: MemoryEntry;
      }
    | null;
  onDeleteMemory: (memoryId: string) => Promise<void>;
}

const categoryLabels: Record<MemoryEntry["category"], string> = {
  preference: "偏好",
  project: "项目",
  goal: "目标",
};

export function MemoryPanel({
  memories,
  deletingMemoryId,
  lastMemoryDecision,
  onDeleteMemory,
}: MemoryPanelProps) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm" data-learning-target="memory-panel">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          记忆库
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">查看已保存记忆</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          用户只负责正常聊天。每轮结束后，LLM 会自己判断是否要把稳定信息保存进记忆库。
        </p>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">本轮自动记忆结果</p>
        {lastMemoryDecision ? (
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              {lastMemoryDecision.status === "saved"
                ? "已自动保存新的 memory。"
                : lastMemoryDecision.status === "duplicate"
                  ? "识别到了重复 memory，没有重复写入。"
                  : "本轮没有生成新的 memory。"}
            </p>
            <p className="text-slate-500">{lastMemoryDecision.reason}</p>
            {lastMemoryDecision.memory ? (
              <div className="rounded-md border bg-white p-3">
                <p className="font-medium text-slate-900">{lastMemoryDecision.memory.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {categoryLabels[lastMemoryDecision.memory.category]}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {lastMemoryDecision.memory.content}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">发送第一条消息后，这里会显示 LLM 的记忆判断结果。</p>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            已保存的记忆
          </h3>
          <span className="text-xs text-slate-500">{memories.length} 条</span>
        </div>

        {memories.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-slate-500">
            还没有记忆。先发起一轮聊天，让 LLM 自己判断要不要保存。
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((memory) => (
              <div key={memory.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{memory.title}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {categoryLabels[memory.category]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{memory.content}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      保存于 {new Date(memory.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={deletingMemoryId === memory.id}
                    onClick={() => onDeleteMemory(memory.id)}
                    type="button"
                  >
                    {deletingMemoryId === memory.id ? "删除中" : "删除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
