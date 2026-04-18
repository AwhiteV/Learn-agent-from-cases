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
      className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-[0_18px_50px_rgba(40,31,18,0.08)]"
      data-learning-target="provider-inspector"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
        Provider Inspector
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-950">
        Active provider: {activeProvider.name}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Execution mode
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-950">
            {activeProvider.executionMode === "local"
              ? "Local invocation"
              : "Remote-style invocation"}
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {activeProvider.boundary}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Route pattern
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            {activeProvider.routePattern}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-stone-950 p-4 text-stone-50">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Stable abstraction
        </p>
        <pre className="mt-3 overflow-x-auto text-xs leading-6 text-stone-100">
          {contractSnippet}
        </pre>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          What stays constant
        </p>
        <div className="mt-3 grid gap-3">
          {activeProvider.constantSurface.map((item) => (
            <div
              key={item}
              className="rounded-[1.1rem] border border-[var(--border)] bg-white/80 px-3 py-3 text-sm leading-6 text-stone-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Latest provider notes
        </p>
        <div className="mt-3 grid gap-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note}
                className="rounded-[1.1rem] border border-[var(--border)] bg-white/80 px-3 py-3 text-sm leading-6 text-stone-700"
              >
                {note}
              </div>
            ))
          ) : (
            <div className="rounded-[1.1rem] border border-dashed border-[var(--border)] px-3 py-3 text-sm leading-6 text-stone-500">
              Send a message with the active provider to capture provider-specific
              notes here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
