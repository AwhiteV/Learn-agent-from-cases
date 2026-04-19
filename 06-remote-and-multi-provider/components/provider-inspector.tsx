import type { ChatResponseBody, ProviderSummary } from "@/lib/types";

interface ProviderInspectorProps {
  activeProvider: ProviderSummary;
  latestResponse: ChatResponseBody | null;
}

const contractSnippet = `export interface ProviderRequest {
  message: string;
}

export interface ProviderResult {
  providerId: string;
  providerName: string;
  executionMode: "local" | "remote";
  output: string;
  notes: string[];
}

export interface AgentProvider {
  id: string;
  name: string;
  executionMode: "local" | "remote";
  run(request: ProviderRequest): Promise<ProviderResult>;
}`;

export function ProviderInspector({
  activeProvider,
  latestResponse,
}: ProviderInspectorProps) {
  const notes =
    latestResponse?.provider.id === activeProvider.id
      ? latestResponse.result.notes
      : [];

  return (
    <section
      className="rounded-xl border bg-white p-4 shadow-sm"
      data-learning-target="provider-inspector"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        Provider 检查面板
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">
        当前 Provider：{activeProvider.name}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            执行模式
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {activeProvider.executionMode === "local"
              ? "本地调用"
              : "远程风格调用"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {activeProvider.boundary}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            路由路径
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {activeProvider.routePattern}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border bg-slate-950 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          稳定抽象层
        </p>
        <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-100">
          {contractSnippet}
        </pre>
      </div>

      <div className="mt-5 rounded-lg border bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          哪些内容保持不变
        </p>
        <div className="mt-3 grid gap-3">
          {activeProvider.constantSurface.map((item) => (
            <div
              key={item}
              className="rounded-md border bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          最近一次 Provider 备注
        </p>
        <div className="mt-3 grid gap-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note}
                className="rounded-md border bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700"
              >
                {note}
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed px-3 py-3 text-sm leading-6 text-slate-500">
              先用当前 Provider 发送一条消息，这里才会显示对应的 Provider 专属备注。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
