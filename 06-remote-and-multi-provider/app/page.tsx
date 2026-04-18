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
              Chapter 06
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Remote agent console with provider switching
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              Send the same task through one chat surface, switch providers, and
              inspect what changes versus what stays constant. This chapter makes
              local invocation and remote-style invocation visible without adding
              real distributed infrastructure.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.75rem] bg-[var(--panel)] p-5">
              <p className="text-sm font-semibold text-stone-900">Switch this</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Flip between a local provider and a mock remote provider without
                changing the request shape or the chat UI.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--panel)] p-5">
              <p className="text-sm font-semibold text-stone-900">Observe this</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                The active provider and execution mode change, but the registry,
                API payload, and result contract stay the same.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--panel)] p-5">
              <p className="text-sm font-semibold text-stone-900">Map this</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Treat the mock remote provider as a same-process stand-in for
                remote-style UX and multi-provider adapters.
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
