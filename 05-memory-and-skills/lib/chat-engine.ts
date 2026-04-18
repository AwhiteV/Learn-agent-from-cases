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
      `回答时请遵守这些偏好：${preferences
        .map((memory) => memory.content)
        .join(" ")}`,
    );
  }

  if (projects.length > 0) {
    influences.push(
      `举例时请尽量锚定这个项目背景：${projects
        .map((memory) => memory.content)
        .join(" ")}`,
    );
  }

  if (goals.length > 0) {
    influences.push(
      `请让回答持续对齐这些目标：${goals
        .map((memory) => memory.content)
        .join(" ")}`,
    );
  }

  if (influences.length === 0) {
    return "当前没有选中任何 memory，因此助手会在没有额外学习者上下文的情况下直接回答。";
  }

  return influences.join(" ");
}

function createTeacherAnswer(message: string, selectedMemories: MemoryEntry[]) {
  const { preferences, projects, goals } = groupMemoriesByCategory(selectedMemories);
  const exampleAnchor = projects[0]?.content ?? "当前主题";
  const learningGoal = goals[0]?.content ?? "先把概念理解清楚";
  const preferenceHint =
    preferences[0]?.content ?? "解释尽量具体、易于跟上";

  return [
    "教学模式回答：",
    `1. 先用直白的话解释“${message}”背后的核心概念。`,
    `2. 再把它和 ${exampleAnchor} 连接起来。`,
    `3. 解释时主动遵守这个学习偏好：${preferenceHint}。`,
    `4. 最后给出一个能朝着“${learningGoal}”推进的小练习。`,
  ].join("\n");
}

function createBuilderAnswer(message: string, selectedMemories: MemoryEntry[]) {
  const { projects, goals } = groupMemoriesByCategory(selectedMemories);
  const projectAnchor = projects[0]?.content ?? "一个小型演示项目";
  const targetGoal = goals[0]?.content ?? "一个真正可用的结果";

  return [
    "构建模式回答：",
    `1. 先把“${message}”改写成一个适合 ${projectAnchor} 的可实现任务。`,
    "2. 先定义最小可交付切片，再讨论怎么往外扩。",
    "3. 按顺序列出接下来的实现步骤。",
    `4. 让最终输出持续朝着“${targetGoal}”对齐。`,
  ].join("\n");
}

function createReviewerAnswer(message: string, selectedMemories: MemoryEntry[]) {
  const { preferences, projects, goals } = groupMemoriesByCategory(selectedMemories);
  const projectAnchor = projects[0]?.content ?? "当前这项工作";
  const preferenceHint = preferences[0]?.content ?? "把取舍和风险说清楚";
  const goalAnchor = goals[0]?.content ?? "学习者当前声明的目标";

  return [
    "审阅模式回答：",
    `1. 先检查“${message}”背后成立了哪些假设。`,
    `2. 找出 ${projectAnchor} 里当前的风险点，以及缺失了哪些验证步骤。`,
    `3. 审阅时遵守这个偏好：${preferenceHint}。`,
    `4. 建议下一步该验证什么，才能继续朝着“${goalAnchor}”推进。`,
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
      return `通用回答：${message}`;
  }
}

export function buildMemoryContext(selectedMemories: MemoryEntry[]) {
  if (selectedMemories.length === 0) {
    return [
      "=== Memory 上下文 ===",
      "当前没有选中任何 memory。",
    ].join("\n");
  }

  return [
    "=== Memory 上下文 ===",
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
    "=== 当前选中的 Skill 系统提示词 ===",
    selectedSkill.systemPrompt,
    "",
    memoryContext,
    "",
    "=== 用户消息 ===",
    message,
  ].join("\n");

  const response = [
    `当前 Skill：${selectedSkill.name}`,
    "",
    skillSpecificResponse,
    "",
    "为什么这次回答会变化：",
    `- Skill 影响：${selectedSkill.description}`,
    `- Memory 影响：${memoryInfluence}`,
    "",
    "Prompt 组装预览：",
    composedPrompt,
  ].join("\n");

  return {
    response,
    composedPrompt,
    memoryContext,
  };
}
