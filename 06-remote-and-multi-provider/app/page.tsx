import { ChatConsole } from "@/components/chat-console";
import { getDefaultProviderId, getProviderSummaries } from "@/lib/providers";

export default function Home() {
  const providers = getProviderSummaries();
  const defaultProviderId = getDefaultProviderId();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,252,245,0.96),rgba(248,245,238,0.82))] p-8 shadow-[0_24px_90px_rgba(53,42,22,0.12)]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              第 06 章
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              支持 Provider 切换的远程 Agent 控制台
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              通过同一个聊天入口发送同一项任务，切换不同 Provider，再观察哪些内容会变化、哪些内容保持稳定。
              这一章会把本地调用和远程风格调用的差异直接展示出来，但不会额外引入真实的分布式基础设施。
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.75rem] bg-[var(--panel)] p-5">
              <p className="text-sm font-semibold text-stone-900">切换这里</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                在本地 Provider 和模拟远程 Provider 之间切换，不需要改请求结构，也不需要更换聊天界面。
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--panel)] p-5">
              <p className="text-sm font-semibold text-stone-900">观察这里</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                当前 Provider 和执行模式会变化，但 registry、API 请求体和结果契约都会保持不变。
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--panel)] p-5">
              <p className="text-sm font-semibold text-stone-900">理解这里</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                把模拟远程 Provider 当成远程风格体验和多 Provider 适配器的教学替身，而不是当成真实远端基础设施。
              </p>
            </div>
          </div>
        </section>

        <ChatConsole
          defaultProviderId={defaultProviderId}
          providers={providers}
        />
      </div>
    </main>
  );
}
