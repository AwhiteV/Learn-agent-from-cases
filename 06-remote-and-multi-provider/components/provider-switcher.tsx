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
      className="rounded-xl border bg-white p-4 shadow-sm"
      data-learning-target="provider-switcher"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Provider 切换器
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            选择执行路径
          </h2>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
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
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-white"
              }`}
              onClick={() => onSelect(provider.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{provider.name}</p>
                  <p
                    className={`mt-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      isActive ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {provider.executionMode === "local" ? "本地" : "远程风格"}执行
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-white/12 text-white"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {isActive ? "当前使用中" : "选择"}
                </span>
              </div>
              <p
                className={`mt-3 text-sm leading-6 ${
                  isActive ? "text-slate-200" : "text-slate-600"
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
