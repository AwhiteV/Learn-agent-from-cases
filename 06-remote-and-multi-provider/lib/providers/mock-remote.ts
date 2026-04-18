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
    super("mock-remote", "Mock Remote Path", "remote");
  }

  async run(request: ProviderRequest) {
    const message = this.readMessage(request);
    const checklist = this.buildSharedChecklist(message);
    const delayMs = resolveDelay();

    await wait(delayMs);

    const output = [
      "Remote-style execution completed as a latency-only remote-style simulation.",
      "",
      `Task: ${message}`,
      "",
      "What this teaches:",
      "1. You can model a remote-style provider without leaving the same Next.js server process.",
      "2. Added latency changes the feel of execution, but not the app-level contract.",
      "3. The UI still receives the same ProviderResult payload as the local mode.",
      "",
      "Simulated remote-style flow:",
      "1. Build ProviderRequest data.",
      "2. Route by providerId.",
      "3. Pause to mimic a remote round trip inside the same Next.js server process.",
      "4. Return the unified result envelope.",
      "",
      "Shared abstraction reminders:",
      ...checklist.map((item) => `- ${item}`),
    ].join("\n");

    return this.createResult(output, [
      `Latency-only simulation: ${delayMs}ms delay inside the same process.`,
      "This chapter does not hand work to a real remote worker or external service.",
      "Remote-style providers can still stay swappable when they honor the same contract.",
    ]);
  }
}
