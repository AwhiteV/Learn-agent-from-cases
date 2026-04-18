import type {
  AgentProvider,
  ProviderRequest,
  ProviderResult,
} from "@/lib/types";

export abstract class BaseProvider implements AgentProvider {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly executionMode: "local" | "remote",
  ) {}

  abstract run(request: ProviderRequest): Promise<ProviderResult>;

  protected readMessage(request: ProviderRequest) {
    return request.message.replace(/\s+/g, " ").trim();
  }

  protected createResult(output: string, notes: string[]): ProviderResult {
    return {
      providerId: this.id,
      providerName: this.name,
      executionMode: this.executionMode,
      output,
      notes,
    };
  }

  protected buildSharedChecklist(message: string) {
    return [
      `收到的任务："${message}"`,
      "registry 会根据 providerId 选择对应的 provider，而不是把行为写死。",
      "无论运行的是哪个 provider，UI 都会渲染同一套 ProviderResult 字段。",
    ];
  }
}
