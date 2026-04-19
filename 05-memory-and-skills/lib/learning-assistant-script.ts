export interface LearningStepBeginnerView {
  doThis: string;
  watchHere: string;
  notice: string;
  whyItMatters: string;
  termNote?: string;
}

export interface LearningStepAdvancedFile {
  path: string;
  role: string;
}

export interface LearningStepAdvancedFunction {
  name: string;
  file: string;
  role: string;
}

export interface LearningStepAdvancedView {
  trigger: string;
  visibleEffect: string;
  internals: string;
  files: LearningStepAdvancedFile[];
  functions?: LearningStepAdvancedFunction[];
  dataFlow: string[];
  relationships?: string[];
}

export interface LearningStep {
  id: string;
  title: string;
  type: "action" | "observation" | "comparison" | "term" | "checkpoint";
  targetId?: string;
  beginner: LearningStepBeginnerView;
  advanced?: LearningStepAdvancedView;
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
    "跟着一次自动记忆与 skill 切换的使用闭环，从 LLM 自主决定记忆一路看到 prompt 组装和回答差异。",
  steps: [
    {
      id: "inspect-session-history",
      title: "查看历史会话",
      type: "observation",
      targetId: "session-list",
      beginner: {
        doThis: "先看看左侧会话栏，理解这一章也会像前面章节一样保存与恢复聊天。",
        watchHere: "左侧历史会话列表。",
        notice: "这里会承载你已经发起过的对话，以及后续恢复同一个 session 的入口。",
        whyItMatters: "05 章现在也是持续对话工作台，memory 会随着聊天轮次逐步沉淀。",
      },
      advanced: {
        trigger: "你在会话栏里观察已有 session，或重新点回某个历史会话。",
        visibleEffect: "左侧会列出按更新时间排序的历史对话，重新进入后会恢复同一条任务链。",
        internals:
          "`SessionList` 负责展示历史 session，`/api/sessions` 与 `/api/sessions/[id]` 负责读取持久化记录，聊天工作台再把消息载入到当前 transcript。",
        files: [
          { path: "components/session-list.tsx", role: "渲染历史会话列表和恢复入口" },
          { path: "app/api/sessions/route.ts", role: "返回当前章节的 session 列表" },
          { path: "app/api/sessions/[id]/route.ts", role: "返回某个 session 的消息详情" },
        ],
        dataFlow: ["session storage", "/api/sessions", "session list", "load session", "transcript"],
      },
    },
    {
      id: "observe-auto-memory",
      title: "观察自动记忆",
      type: "action",
      targetId: "memory-panel",
      beginner: {
        doThis: "先发一条会暴露稳定偏好、项目背景或学习目标的消息。",
        watchHere: "右侧的记忆库面板。",
        notice: "主回复结束后，LLM 会自己判断这轮是否值得记住，并把结果展示在记忆库顶部。",
        whyItMatters: "这章的重点已经不是手动维护 memory，而是观察模型如何自己决定是否保存稳定用户信息。",
        termNote: "结构化 memory 指的是：用户信息会被保存成带分类的记录，并在后续对话里作为上下文注入。",
      },
      advanced: {
        trigger: "你发出一条带稳定用户信息的消息，等待主回复结束。",
        visibleEffect: "主回复完成后，记忆库会显示“本轮自动记忆结果”，并且新的 memory 可能直接进入列表。",
        internals:
          "`ChatInterface` 只负责发起正常 chat 请求；`app/api/chat/route.ts` 在主回复成功后，会额外调用 `extractMemoryFromConversation` 让 LLM 判断要不要记忆。如果判断需要，就通过 `memoryStore.createIfNotExists` 写入记忆库，再把结果返回给前端展示。",
        files: [
          { path: "components/memory-panel.tsx", role: "展示记忆库和本轮自动记忆结果" },
          { path: "components/chat-interface.tsx", role: "提交 chat 请求并在结果返回后刷新记忆库" },
          { path: "app/api/chat/route.ts", role: "在主回复后发起自动记忆判断并落库" },
          { path: "lib/memory-extraction.ts", role: "构造自动记忆判断 prompt，并解析 LLM 返回的 JSON 结果" },
        ],
        functions: [
          { name: "extractMemoryFromConversation", file: "lib/memory-extraction.ts", role: "调用 LLM 判断这一轮是否应该生成新 memory" },
          { name: "handleSubmit", file: "components/chat-interface.tsx", role: "提交主聊天请求，并在结果返回后刷新记忆库列表" },
          { name: "createIfNotExists", file: "lib/memory-store.ts", role: "避免把完全重复的 memory 一次次写入库里" },
        ],
        dataFlow: [
          "user message",
          "main chat response",
          "extractMemoryFromConversation",
          "memory store",
          "memory panel",
          "refresh memories",
          "next chat request",
        ],
      },
    },
    {
      id: "switch-the-active-skill",
      title: "切换当前 skill",
      type: "comparison",
      targetId: "skill-selector",
      beginner: {
        doThis: "在发送完全相同的问题之前，先对比 Teacher、Builder 和 Reviewer 三种模式。",
        watchHere: "Skill 选择器里的卡片。",
        notice: "同一时间只会有一个 preset 处于激活状态，而且每个 preset 都暴露出不同的 system prompt 姿态。",
        whyItMatters: "skill 应该在不改动其他 UI 的前提下，清楚地改变回答框架和输出结构。",
        termNote: "skill preset 就是一种可复用的 system prompt 形态，用来定义一种工作模式。",
      },
      advanced: {
        trigger: "你切换教学模式、构建模式或审阅模式，然后保持同一个问题重新发送。",
        visibleEffect: "右侧 transcript 和 prompt preview 会显示不同的回答结构，但 chat 表单还是同一套。",
        internals:
          "`SkillSelector` 只负责选中 skill id，`ChatInterface` 用 selectedSkillId 维护当前模式。提交时，`handleSubmit` 把它写入 `ChatRequestBody`，`app/api/chat/route.ts` 再调用 `getSkillPresetById` 把 id 解析成 `SkillPreset`。",
        files: [
          { path: "components/skill-selector.tsx", role: "负责切换当前 skill preset" },
          { path: "components/chat-interface.tsx", role: "保存 selectedSkillId 并提交 chat 请求" },
          { path: "lib/skill-presets.ts", role: "定义 teacher、builder、reviewer 三个 preset" },
        ],
        functions: [
          { name: "getSkillPresetById", file: "lib/skill-presets.ts", role: "按 skill id 查找当前激活的 preset" },
        ],
        dataFlow: ["skill selector", "selectedSkillId state", "handleSubmit", "/api/chat", "prompt preview"],
      },
    },
    {
      id: "resend-the-same-question",
      title: "重新发送同一个问题",
      type: "action",
      targetId: "chat-input",
      beginner: {
        doThis: "先问一次问题，然后只改 skill，再把同一个问题重新发送一遍。",
        watchHere: "“Type your message...” 的输入框和发送按钮。",
        notice: "虽然最终 prompt 是由多个来源拼出来的，但界面上给你的输入仍然很简单。",
        whyItMatters: "把用户问题固定住，能更容易看清到底哪些行为变化来自自动记忆与 skill 变化。",
      },
      advanced: {
        trigger: "你不改 message，只调整 selectedSkillId，然后再次点击发送。",
        visibleEffect: "同一个问题会生成不同的 transcript 项，但请求体始终还是同一套字段。",
        internals:
          "`handleSubmit` 会先把 message.trim() 放进 `requestBody`，再把当前的 selectedSkillId 一起发到 `/api/chat`。服务端会自动读取当前记忆库，把已保存的 memories 注入到 `buildChapter05SystemPrompt` 和 prompt preview 里。",
        files: [
          { path: "components/chat-interface.tsx", role: "负责重新发送同一个问题并记录 transcript" },
          { path: "app/api/chat/route.ts", role: "接收请求并自动加载当前记忆库" },
          { path: "lib/request-context.ts", role: "把当前 skill 和记忆库一起组装成 prompt" },
        ],
        functions: [
          { name: "handleSubmit", file: "components/chat-interface.tsx", role: "发送当前 message 和 skill 的组合请求" },
          { name: "buildChapter05SystemPrompt", file: "lib/request-context.ts", role: "把当前 skill 与记忆库拼成系统提示词" },
        ],
        dataFlow: ["message state", "requestBody", "/api/chat", "memory store", "request context", "transcript"],
      },
    },
    {
      id: "compare-the-answer",
      title: "对比回答结果",
      type: "observation",
      targetId: "transcript-panel",
      beginner: {
        doThis: "按顺序阅读 transcript，而不是只盯着最新那条回答。",
        watchHere: "工作台中间的对话面板。",
        notice: "当 skill 或自动记忆输入发生变化时，同一个问题应该会产出明显不同的回答结构。",
        whyItMatters: "一个真正适合学习的 memory 系统，必须让输出差异是可读、可理解的，而不只是“可以配置”。",
      },
      advanced: {
        trigger: "你对比两次 transcript，确认它们来自不同的 skill 或不同的记忆库状态。",
        visibleEffect: "用户能在对话流里直接看到不同模式的回答框架，而不是只看到最后一条结果。",
        internals:
          "`ChatInterface` 会把每次请求的 assistantMessage 追加到 transcript，并在 `latestResponse` 里保存当前的 `response` 和 `composedPrompt`。这样 UI 可以同时展示对话记录和 prompt preview，让学习者把输出差异和输入差异一一对上。",
        files: [
          { path: "components/chat-interface.tsx", role: "维护 transcript 和 latestResponse" },
          { path: "lib/request-context.ts", role: "生成当前 skill 与 memory 组合下的 prompt 预览" },
          { path: "app/api/chat/route.ts", role: "返回用于对比的 chat 响应和 memory decision" },
        ],
        functions: [
          { name: "buildChapter05PromptPreview", file: "lib/request-context.ts", role: "生成对比 transcript 时能看到的 prompt 预览" },
        ],
        dataFlow: ["transcript panel", "latestResponse state", "assistantMessage append", "prompt preview"],
      },
    },
    {
      id: "inspect-the-assembled-prompt",
      title: "查看组装后的 prompt",
      type: "checkpoint",
      targetId: "prompt-preview",
      beginner: {
        doThis: "每次回答后，都去看右侧调试卡片，把 prompt preview 和刚才的自动记忆结果对应起来。",
        watchHere: "右侧的 Prompt 预览卡片。",
        notice: "你可以直接看到 system prompt 和记忆库中的 memory block，而不用靠猜来理解为什么回答变了。",
        whyItMatters: "可观测性会把 memory 和 skill 从黑盒行为，变成可调试的产品输入。",
        termNote: "prompt 组装就是把系统指令、当前记忆库和用户消息拼到一起的那一步。",
      },
      advanced: {
        trigger: "你打开 Prompt 预览，核对 memory block、system prompt 和用户消息的拼接顺序。",
        visibleEffect: "右侧卡片会显示完整的 composed prompt，让你看到每个输入最终去了哪里。",
        internals:
          "`buildChapter05PromptPreview` 先读取当前记忆库生成 memory block，再把 `selectedSkill.systemPrompt` 和用户消息拼成 `composedPrompt`。`ChatInterface` 的 `latestResponse` 再把这个结果映射到 Prompt preview 卡片，所以你能直接对照记忆库与最终输出。",
        files: [
          { path: "components/chat-interface.tsx", role: "渲染 prompt preview 并展示最新教学回复" },
          { path: "lib/request-context.ts", role: "组装 composedPrompt 和 memoryContext" },
          { path: "app/api/chat/route.ts", role: "把 request body 和当前记忆库送进真实聊天与记忆提取链路" },
        ],
        functions: [
          { name: "buildChapter05PromptPreview", file: "lib/request-context.ts", role: "把当前记忆库转成可读的 block" },
          { name: "buildChapter05SystemPrompt", file: "lib/request-context.ts", role: "拼接 system prompt、memory 和用户消息" },
          { name: "handleSubmit", file: "components/chat-interface.tsx", role: "把请求结果保存到 latestResponse 供预览使用" },
        ],
        dataFlow: ["memory store", "chat submit handler", "/api/chat", "request context", "prompt preview"],
      },
    },
  ],
};
