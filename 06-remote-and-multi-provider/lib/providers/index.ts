import { LocalAgentProvider } from "@/lib/providers/local-agent";
import { MockRemoteProvider } from "@/lib/providers/mock-remote";
import type { AgentProvider, ProviderSummary } from "@/lib/types";

const providers: AgentProvider[] = [
  new LocalAgentProvider(),
  new MockRemoteProvider(),
];

const constantSurface = [
  "POST /api/chat 始终接收 { message, providerId }。",
  "registry 会解析出实现了 AgentProvider.run(request) 的 provider。",
  "每个 provider 返回的都是包含 providerId、providerName、executionMode、output 和 notes 的 ProviderResult。",
  "即使执行模式变化，页面也始终复用同一套聊天 UI。",
];

const providerDetails: Record<
  string,
  Omit<ProviderSummary, "id" | "name" | "executionMode">
> = {
  "local-agent": {
    summary: "运行在同一个 Next.js 运行时内，最适合初学者先看清最短执行链路。",
    boundary: "没有远程边界，API route 会直接调用 provider 逻辑。",
    routePattern: "浏览器 -> /api/chat -> provider registry -> 本地 provider.run()",
    constantSurface,
  },
  "mock-remote": {
    summary: "在同一个服务进程里模拟远程风格延迟和 Provider 标识。",
    boundary:
      "这里不会发生真正的远程交接，route 只是通过同进程延迟来讲解远程风格体验与契约。",
    routePattern:
      "浏览器 -> /api/chat -> provider registry -> 同进程延迟版 provider.run()",
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
