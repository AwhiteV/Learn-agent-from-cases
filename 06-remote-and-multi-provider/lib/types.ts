export interface ProviderRequest {
  message: string;
  sessionId?: string;
}

export interface ProviderResult {
  providerId: string;
  providerName: string;
  executionMode: "local" | "remote";
  output: string;
  notes: string[];
}

export interface AgentProvider {
  id: string;
  name: string;
  executionMode: "local" | "remote";
  buildSystemPrompt(request: ProviderRequest): string;
  buildNotes(request: ProviderRequest): string[];
}

export interface ProviderSummary {
  id: string;
  name: string;
  executionMode: "local" | "remote";
  summary: string;
  boundary: string;
  routePattern: string;
  constantSurface: string[];
}

export interface ChatRequestBody extends ProviderRequest {
  providerId: string;
}

export interface ChatResponseBody {
  provider: ProviderSummary;
  result: ProviderResult;
}
