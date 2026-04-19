import { BaseProvider } from "@/lib/providers/base";
import type { ProviderRequest } from "@/lib/types";

export class LocalAgentProvider extends BaseProvider {
  constructor() {
    super("local-agent", "本地 Agent", "local");
  }

  buildSystemPrompt(request: ProviderRequest) {
    const message = this.readMessage(request);
    const checklist = this.buildSharedChecklist(message);

    return [
      "你当前运行在“本地 Agent” provider 中。",
      "你正在模拟第 06 章中的本地 provider 路径。",
      "这是同一个 Next.js 进程内的本地执行，不需要跨远程边界。",
      "请在回答里保持中文，并清楚说明本地执行为什么更直接。",
      "你仍然要完成用户任务，而不是只解释概念。",
      "",
      "共享抽象层提醒：",
      ...checklist.map((item) => `- ${item}`),
    ].join("\n");
  }

  buildNotes(request: ProviderRequest) {
    const message = this.readMessage(request);

    return [
      "直接从 API route 调用，整个过程都在同一个 Next.js 进程内完成。",
      `当前本地 provider 正在处理任务：${message}`,
      "适合讲解最短执行链路，以及为什么 UI 不需要为本地路径单独分叉。",
    ];
  }
}
