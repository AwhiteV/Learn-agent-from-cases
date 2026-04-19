export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  category: "preference" | "project" | "goal";
  createdAt: string;
}

export interface SuggestedMemoryInput {
  title: string;
  content: string;
  category: MemoryEntry["category"];
}

export interface MemoryDecision {
  shouldRemember: boolean;
  reason: string;
  memory?: SuggestedMemoryInput;
}

export interface SkillPreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface ChatRequestBody {
  message: string;
  sessionId?: string;
  selectedSkillId: string;
}

export interface PromptPreviewPayload {
  composedPrompt: string;
  memoryContext: string;
  selectedSkill: SkillPreset;
  selectedMemories: MemoryEntry[];
}

export interface ChatResponseBody extends PromptPreviewPayload {
  response: string;
  memoryDecision?: {
    status: "saved" | "duplicate" | "skipped";
    reason: string;
    memory?: MemoryEntry;
  };
}
