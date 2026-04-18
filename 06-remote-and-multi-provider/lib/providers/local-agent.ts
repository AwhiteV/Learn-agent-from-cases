import { BaseProvider } from "@/lib/providers/base";
import type { ProviderRequest } from "@/lib/types";

export class LocalAgentProvider extends BaseProvider {
  constructor() {
    super("local-agent", "本地 Agent", "local");
  }

  async run(request: ProviderRequest) {
    const message = this.readMessage(request);
    const checklist = this.buildSharedChecklist(message);

    const output = [
      "本地执行已在当前进程内完成。",
      "",
      `任务：${message}`,
      "",
      "这一段在说明什么：",
      "1. API route 可以在同一个 Next.js 运行时里直接调用 provider。",
      "2. provider 逻辑开始前，不需要经过额外的网络序列化边界。",
      "3. 返回结果依然会通过同一套 ProviderResult 结构交回界面。",
      "",
      "共享抽象层提醒：",
      ...checklist.map((item) => `- ${item}`),
    ].join("\n");

    return this.createResult(output, [
      "直接从 API route 调用，整个过程都在同一个服务进程内完成。",
      "适合讲解最简单的教学路径，或者单运行时的演示案例。",
      "对于本地执行，UI 不需要额外分出一条特殊渲染分支。",
    ]);
  }
}
