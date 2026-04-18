import type { MemoryEntry, SkillPreset } from "@/lib/types";

interface BuildTeachingReplyOptions {
  message: string;
  selectedSkill: SkillPreset;
  selectedMemories: MemoryEntry[];
}

function groupMemoriesByCategory(selectedMemories: MemoryEntry[]) {
  return {
    preferences: selectedMemories.filter((memory) => memory.category === "preference"),
    projects: selectedMemories.filter((memory) => memory.category === "project"),
    goals: selectedMemories.filter((memory) => memory.category === "goal"),
  };
}

function summarizeMemoryInfluence(selectedMemories: MemoryEntry[]) {
  const { preferences, projects, goals } = groupMemoriesByCategory(selectedMemories);

  const influences: string[] = [];

  if (preferences.length > 0) {
    influences.push(
      `Use these preferences while responding: ${preferences
        .map((memory) => memory.content)
        .join(" ")}`,
    );
  }

  if (projects.length > 0) {
    influences.push(
      `Anchor examples to this project context: ${projects
        .map((memory) => memory.content)
        .join(" ")}`,
    );
  }

  if (goals.length > 0) {
    influences.push(
      `Keep the answer aligned with these goals: ${goals
        .map((memory) => memory.content)
        .join(" ")}`,
    );
  }

  if (influences.length === 0) {
    return "No memories were selected, so the assistant responds without extra learner context.";
  }

  return influences.join(" ");
}

function createTeacherAnswer(message: string, selectedMemories: MemoryEntry[]) {
  const { preferences, projects, goals } = groupMemoriesByCategory(selectedMemories);
  const exampleAnchor = projects[0]?.content ?? "the current topic";
  const learningGoal = goals[0]?.content ?? "understanding the concept clearly";
  const preferenceHint =
    preferences[0]?.content ?? "keep the explanation concrete and easy to follow";

  return [
    "Teacher response:",
    `1. Start with the core idea behind "${message}" in plain language.`,
    `2. Connect it to ${exampleAnchor}.`,
    `3. Use this learner preference while explaining: ${preferenceHint}.`,
    `4. End with one small practice task that moves toward ${learningGoal}.`,
  ].join("\n");
}

function createBuilderAnswer(message: string, selectedMemories: MemoryEntry[]) {
  const { projects, goals } = groupMemoriesByCategory(selectedMemories);
  const projectAnchor = projects[0]?.content ?? "a small demo project";
  const targetGoal = goals[0]?.content ?? "a useful working outcome";

  return [
    "Builder response:",
    `1. Reframe "${message}" as a buildable task for ${projectAnchor}.`,
    "2. Define the smallest shippable slice before expanding scope.",
    "3. List the next implementation steps in order.",
    `4. Keep the output aimed at ${targetGoal}.`,
  ].join("\n");
}

function createReviewerAnswer(message: string, selectedMemories: MemoryEntry[]) {
  const { preferences, projects, goals } = groupMemoriesByCategory(selectedMemories);
  const projectAnchor = projects[0]?.content ?? "the current work";
  const preferenceHint = preferences[0]?.content ?? "highlight trade-offs clearly";
  const goalAnchor = goals[0]?.content ?? "the learner's stated goal";

  return [
    "Reviewer response:",
    `1. Check the assumptions behind "${message}".`,
    `2. Identify risks and missing verification steps for ${projectAnchor}.`,
    `3. Respect this review preference: ${preferenceHint}.`,
    `4. Recommend what to verify next so progress still supports ${goalAnchor}.`,
  ].join("\n");
}

function createSkillSpecificResponse(
  message: string,
  selectedSkill: SkillPreset,
  selectedMemories: MemoryEntry[],
) {
  switch (selectedSkill.id) {
    case "teacher":
      return createTeacherAnswer(message, selectedMemories);
    case "builder":
      return createBuilderAnswer(message, selectedMemories);
    case "reviewer":
      return createReviewerAnswer(message, selectedMemories);
    default:
      return `General response for: ${message}`;
  }
}

export function buildMemoryContext(selectedMemories: MemoryEntry[]) {
  if (selectedMemories.length === 0) {
    return [
      "=== Memory Context ===",
      "No memory entries selected.",
    ].join("\n");
  }

  return [
    "=== Memory Context ===",
    ...selectedMemories.map(
      (memory) =>
        `- [${memory.category}] ${memory.title}: ${memory.content}`,
    ),
  ].join("\n");
}

export function buildTeachingReply({
  message,
  selectedSkill,
  selectedMemories,
}: BuildTeachingReplyOptions) {
  const memoryContext = buildMemoryContext(selectedMemories);
  const memoryInfluence = summarizeMemoryInfluence(selectedMemories);
  const skillSpecificResponse = createSkillSpecificResponse(
    message,
    selectedSkill,
    selectedMemories,
  );

  const composedPrompt = [
    "=== Selected Skill System Prompt ===",
    selectedSkill.systemPrompt,
    "",
    memoryContext,
    "",
    "=== User Message ===",
    message,
  ].join("\n");

  const response = [
    `Active skill: ${selectedSkill.name}`,
    "",
    skillSpecificResponse,
    "",
    "Why this answer changed:",
    `- Skill influence: ${selectedSkill.description}`,
    `- Memory influence: ${memoryInfluence}`,
    "",
    "Prompt assembly preview:",
    composedPrompt,
  ].join("\n");

  return {
    response,
    composedPrompt,
    memoryContext,
  };
}
