import { LocalAgentProvider } from "@/lib/providers/local-agent";
import { MockRemoteProvider } from "@/lib/providers/mock-remote";
import type { AgentProvider, ProviderSummary } from "@/lib/types";

const providers: AgentProvider[] = [
  new LocalAgentProvider(),
  new MockRemoteProvider(),
];

const constantSurface = [
  "POST /api/chat always accepts { message, providerId }.",
  "The registry resolves a provider that implements AgentProvider.run(request).",
  "Every provider returns ProviderResult with providerId, providerName, executionMode, output, and notes.",
  "The page keeps one chat UI even when execution mode changes.",
];

const providerDetails: Record<
  string,
  Omit<ProviderSummary, "id" | "name" | "executionMode">
> = {
  "local-agent": {
    summary: "Runs inside the same Next.js runtime for the clearest beginner path.",
    boundary: "No remote boundary. The API route invokes provider logic directly.",
    routePattern: "Browser -> /api/chat -> provider registry -> local provider.run()",
    constantSurface,
  },
  "mock-remote": {
    summary: "Simulates remote-style timing and provider labeling inside the same server process.",
    boundary:
      "No real remote handoff happens here. The route adds a same-process delay to teach remote-style UX and contracts.",
    routePattern:
      "Browser -> /api/chat -> provider registry -> same-process delayed provider.run()",
    constantSurface,
  },
};

export function getProviderSummaries(): ProviderSummary[] {
  return providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    executionMode: provider.executionMode,
    ...providerDetails[provider.id],
  }));
}

export function getProviderById(providerId: string) {
  return providers.find((provider) => provider.id === providerId) ?? null;
}

export function getDefaultProviderId() {
  return providers[0]?.id ?? "";
}
