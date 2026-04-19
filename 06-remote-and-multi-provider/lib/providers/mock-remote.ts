import { BaseProvider } from "@/lib/providers/base";
import type { ProviderRequest } from "@/lib/types";

function resolveDelay() {
  const rawValue = Number(process.env.MOCK_REMOTE_DELAY_MS ?? "900");

  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return 900;
  }

  return rawValue;
}

export class MockRemoteProvider extends BaseProvider {
  constructor() {
    super("mock-remote", "模拟远程路径", "remote");
  }

  buildSystemPrompt(request: ProviderRequest) {
    const message = this.readMessage(request);
    const checklist = this.buildSharedChecklist(message);

    return [
      "你当前运行在“模拟远程路径” provider 中。",
      "你正在模拟第 06 章中的远程风格 provider 路径。",
      "这不是实际远程 worker，而是同一个 Next.js 服务进程里的远程风格教学抽象。",
      "请在回答里保持中文，并点出远程风格边界如何改变体验，但不要假装真的部署到了远端。",
      "你仍然要先完成用户任务，再自然体现 provider 视角差异。",
      "",
      "共享抽象层提醒：",
      ...checklist.map((item) => `- ${item}`),
    ].join("\n");
  }

  buildNotes(request: ProviderRequest) {
    const message = this.readMessage(request);
    const delayMs = resolveDelay();

    return [
      `仅延迟模拟：在同一个 Next.js 服务进程里额外等待 ${delayMs}ms。`,
      `当前远程风格 provider 正在处理任务：${message}`,
      "这里不会把任务真正交给远程 worker；重点是保持同一份契约下的可替换执行边界。",
    ];
  }
}
