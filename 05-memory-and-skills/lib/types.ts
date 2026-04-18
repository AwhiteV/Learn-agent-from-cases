export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  category: "preference" | "project" | "goal";
  createdAt: string;
}

export interface SkillPreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface ChatRequestBody {
  message: string;
  selectedSkillId: string;
  memoryIds: string[];
}

export interface ChatResponseBody {
  response: string;
  composedPrompt: string;
  memoryContext: string;
  selectedSkill: SkillPreset;
  selectedMemories: MemoryEntry[];
}
