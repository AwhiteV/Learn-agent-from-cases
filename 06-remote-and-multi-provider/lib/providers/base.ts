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
      `Task received: "${message}"`,
      "The registry selected a provider from providerId instead of hardcoding behavior.",
      "The UI will render the same ProviderResult fields no matter which provider runs.",
    ];
  }
}
