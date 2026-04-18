import { BaseProvider } from "@/lib/providers/base";
import type { ProviderRequest } from "@/lib/types";

export class LocalAgentProvider extends BaseProvider {
  constructor() {
    super("local-agent", "Local Agent", "local");
  }

  async run(request: ProviderRequest) {
    const message = this.readMessage(request);
    const checklist = this.buildSharedChecklist(message);

    const output = [
      "Local execution completed in-process.",
      "",
      `Task: ${message}`,
      "",
      "What this teaches:",
      "1. The API route can call a provider directly inside the same Next.js runtime.",
      "2. No network serialization is required before provider logic starts.",
      "3. The response still comes back through the same ProviderResult shape.",
      "",
      "Shared abstraction reminders:",
      ...checklist.map((item) => `- ${item}`),
    ].join("\n");

    return this.createResult(output, [
      "Called directly from the API route inside the same server process.",
      "Useful when you want the simplest teaching path or a single-runtime demo.",
      "The UI does not need a special rendering branch for local execution.",
    ]);
  }
}
