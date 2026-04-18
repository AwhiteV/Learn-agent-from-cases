import { BaseProvider } from "@/lib/providers/base";
import type { ProviderRequest } from "@/lib/types";

function resolveDelay() {
  const rawValue = Number(process.env.MOCK_REMOTE_DELAY_MS ?? "900");

  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return 900;
  }

  return rawValue;
}

function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export class MockRemoteProvider extends BaseProvider {
  constructor() {
    super("mock-remote", "模拟远程路径", "remote");
  }

  async run(request: ProviderRequest) {
    const message = this.readMessage(request);
    const checklist = this.buildSharedChecklist(message);
    const delayMs = resolveDelay();

    await wait(delayMs);

    const output = [
      "远程风格执行已完成，这里使用的是仅延迟的远程风格模拟。",
      "",
      `任务：${message}`,
      "",
      "这一段在说明什么：",
      "1. 即使不离开同一个 Next.js 服务进程，也能模拟远程风格 Provider。",
      "2. 额外延迟会改变执行体验，但不会改变应用层契约。",
      "3. UI 收到的仍然是和本地模式相同的 ProviderResult 载荷。",
      "",
      "模拟的远程风格流程：",
      "1. 构造 ProviderRequest 数据。",
      "2. 根据 providerId 路由。",
      "3. 在同一个 Next.js 服务进程里暂停一段时间，用来模拟远程往返。",
      "4. 返回统一的结果包。",
      "",
      "共享抽象层提醒：",
      ...checklist.map((item) => `- ${item}`),
    ].join("\n");

    return this.createResult(output, [
      `仅延迟模拟：在同一个进程里额外等待 ${delayMs}ms。`,
      "这一章不会把任务真正交给远程 worker 或外部服务。",
      "只要遵守同一份契约，远程风格 Provider 依然可以保持可替换。",
    ]);
  }
}
