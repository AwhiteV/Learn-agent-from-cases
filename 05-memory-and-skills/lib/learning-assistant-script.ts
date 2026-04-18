export interface LearningStep {
  id: string;
  title: string;
  type: "action" | "observation" | "comparison" | "term" | "checkpoint";
  targetId?: string;
  doThis: string;
  watchHere: string;
  notice: string;
  whyItMatters: string;
  termNote?: string;
}

export interface LearningScript {
  chapterId: string;
  chapterTitle: string;
  summary: string;
  steps: LearningStep[];
}

export const learningScript: LearningScript = {
  chapterId: "05-memory-and-skills",
  chapterTitle: "Memory 与 Skills 学习助手",
  summary:
    "跟着一次 memory 与 skill 的使用闭环，从保存上下文一路看到 prompt 组装和回答差异。",
  steps: [
    {
      id: "save-a-memory",
      title: "保存一条 memory",
      type: "action",
      targetId: "memory-panel",
      doThis:
        "添加一条学习者偏好或项目背景，并让它保持选中，供下一次请求注入。",
      watchHere: "左侧的 Memory Panel。",
      notice:
        "新条目会出现在已保存列表里，并且可以被切换到下一次请求中。",
      whyItMatters:
        "这一章里的 memory 是显式的上下文选择，而不是藏起来的“长期记忆魔法”。",
      termNote:
        "结构化 memory 指的是：背景信息会被保存成有名字的记录，并在需要时明确注入。",
    },
    {
      id: "switch-the-active-skill",
      title: "切换当前 skill",
      type: "comparison",
      targetId: "skill-selector",
      doThis:
        "在发送完全相同的问题之前，先对比 Teacher、Builder 和 Reviewer 三种模式。",
      watchHere: "Skill Selector 里的卡片。",
      notice:
        "同一时间只会有一个 preset 处于激活状态，而且每个 preset 都暴露出不同的 system prompt 姿态。",
      whyItMatters:
        "skill 应该在不改动其他 UI 的前提下，清楚地改变回答框架和输出结构。",
      termNote:
        "skill preset 就是一种可复用的 system prompt 形态，用来定义一种工作模式。",
    },
    {
      id: "resend-the-same-question",
      title: "重新发送同一个问题",
      type: "action",
      targetId: "chat-input",
      doThis:
        "先问一次问题，然后只改 memory 或 skill，再把同一个问题重新发送一遍。",
      watchHere: "“Ask the assistant”的输入框和发送按钮。",
      notice:
        "虽然最终 prompt 是由多个来源拼出来的，但界面上给你的输入仍然很简单。",
      whyItMatters:
        "把用户问题固定住，能更容易看清到底哪些行为变化来自上下文组装。",
    },
    {
      id: "compare-the-answer",
      title: "对比回答结果",
      type: "observation",
      targetId: "transcript-panel",
      doThis:
        "按顺序阅读 transcript，而不是只盯着最新那条回答。",
      watchHere: "工作台中间的对话面板。",
      notice:
        "当 skill 或 memory 输入发生变化时，同一个问题应该会产出明显不同的回答结构。",
      whyItMatters:
        "一个真正适合学习的 memory 系统，必须让输出差异是可读、可理解的，而不只是“可以配置”。",
    },
    {
      id: "inspect-the-assembled-prompt",
      title: "查看组装后的 prompt",
      type: "checkpoint",
      targetId: "prompt-preview",
      doThis:
        "每次回答后，都去看右侧调试卡片，把 prompt preview 和你刚才的 memory 选择对应起来。",
      watchHere: "右侧的 Prompt preview 卡片。",
      notice:
        "你可以直接看到 system prompt 和被注入的 memory block，而不用靠猜来理解为什么回答变了。",
      whyItMatters:
        "可观测性会把 memory 和 skill 从黑盒行为，变成可调试的产品输入。",
      termNote:
        "prompt 组装就是把系统指令、选中的 memory 和用户消息拼到一起的那一步。",
    },
  ],
};
