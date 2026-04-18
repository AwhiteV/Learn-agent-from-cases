import type { ProviderSummary } from "@/lib/types";

interface ProviderSwitcherProps {
  providers: ProviderSummary[];
  activeProviderId: string;
  onSelect: (providerId: string) => void;
}

export function ProviderSwitcher({
  providers,
  activeProviderId,
  onSelect,
}: ProviderSwitcherProps) {
  return (
    <section
      className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-[0_18px_50px_rgba(40,31,18,0.08)]"
      data-learning-target="provider-switcher"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Provider 切换器
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">
            选择执行路径
          </h2>
        </div>
        <div className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-stone-50">
          同一套界面
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {providers.map((provider) => {
          const isActive = provider.id === activeProviderId;

          return (
            <button
              key={provider.id}
              className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                isActive
                  ? "border-stone-900 bg-stone-900 text-stone-50 shadow-[0_10px_30px_rgba(28,25,23,0.2)]"
                  : "border-[var(--border)] bg-white/70 text-stone-900 hover:border-stone-400 hover:bg-white"
              }`}
              onClick={() => onSelect(provider.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{provider.name}</p>
                  <p
                    className={`mt-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      isActive ? "text-stone-300" : "text-stone-500"
                    }`}
                  >
                    {provider.executionMode === "local" ? "本地" : "远程风格"}执行
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-white/12 text-stone-50"
                      : "bg-stone-900 text-stone-50"
                  }`}
                >
                  {isActive ? "当前使用中" : "选择"}
                </span>
              </div>
              <p
                className={`mt-3 text-sm leading-6 ${
                  isActive ? "text-stone-200" : "text-stone-600"
                }`}
              >
                {provider.summary}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
