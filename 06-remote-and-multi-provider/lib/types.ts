export interface ProviderRequest {
  message: string;
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
  run(request: ProviderRequest): Promise<ProviderResult>;
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
