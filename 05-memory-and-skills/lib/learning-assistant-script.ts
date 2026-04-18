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
    "跟着一次 memory 与 skill 的使用闭环，从保存上下文一路看到 prompt 组装和回答差异。",
  steps: [
    {
      id: "save-a-memory",
      title: "保存一条 memory",
      type: "action",
      targetId: "memory-panel",
      beginner: {
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
      advanced: {
        trigger: "你在 Memory Panel 里新增一条 memory，并切换它是否参与下一次请求。",
        visibleEffect: "memory 列表会立即更新，选中的 memory 会进入下一次 chat 请求的上下文。",
        internals:
          "`MemoryPanel` 负责收集和删除 memory，`ChatInterface` 用 `handleToggleMemory` 维护 selectedMemoryIds。提交时，`handleSubmit` 会把 message、selectedSkillId 和 selectedMemoryIds 组装成 `ChatRequestBody` 发送到 `/api/chat`，然后 `buildTeachingReply` 再把选中的 memory 体现在 prompt 预览里。",
        files: [
          {
            path: "components/memory-panel.tsx",
            role: "负责创建、展示、切换和删除 memory",
          },
          {
            path: "components/chat-interface.tsx",
            role: "维护 selectedMemoryIds 并提交 chat 请求",
          },
          {
            path: "app/api/chat/route.ts",
            role: "接收带 memoryIds 的请求并返回教学回复",
          },
        ],
        functions: [
          {
            name: "handleToggleMemory",
            file: "components/chat-interface.tsx",
            role: "更新当前被注入的 memory id 集合",
          },
          {
            name: "handleSubmit",
            file: "components/chat-interface.tsx",
            role: "把消息、skill 和 memoryIds 组装成一次 chat 请求",
          },
          {
            name: "buildTeachingReply",
            file: "lib/chat-engine.ts",
            role: "把选中的 memory 变成可见的 prompt 预览和响应说明",
          },
        ],
        dataFlow: [
          "memory panel",
          "selectedMemoryIds state",
          "handleSubmit",
          "/api/chat",
          "chat engine",
          "prompt preview",
        ],
      },
    },
    {
      id: "switch-the-active-skill",
      title: "切换当前 skill",
      type: "comparison",
      targetId: "skill-selector",
      beginner: {
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
      advanced: {
        trigger: "你切换 Teacher、Builder 或 Reviewer，然后保持同一个问题重新发送。",
        visibleEffect: "右侧 transcript 和 prompt preview 会显示不同的回答结构，但 chat 表单还是同一套。",
        internals:
          "`SkillSelector` 只负责选中 skill id，`ChatInterface` 用 selectedSkillId 维护当前模式。提交时，`handleSubmit` 把它写入 `ChatRequestBody`，`app/api/chat/route.ts` 再调用 `getSkillPresetById` 把 id 解析成 `SkillPreset`。`buildTeachingReply` 负责把这个已解析的 selectedSkill 和 selectedMemories 组合成回复，而 `createSkillSpecificResponse` 只根据 selectedSkill.id 选择 teacher、builder 或 reviewer 的回答模板，不负责查找 preset。",
        files: [
          {
            path: "components/skill-selector.tsx",
            role: "负责切换当前 skill preset",
          },
          {
            path: "components/chat-interface.tsx",
            role: "保存 selectedSkillId 并提交 chat 请求",
          },
          {
            path: "lib/skill-presets.ts",
            role: "定义 teacher、builder、reviewer 三个 preset",
          },
          {
            path: "lib/chat-engine.ts",
            role: "根据已解析的 skill preset 组装不同的教学回复",
          },
        ],
        functions: [
          {
            name: "getSkillPresetById",
            file: "lib/skill-presets.ts",
            role: "按 skill id 查找当前激活的 preset",
          },
          {
            name: "createSkillSpecificResponse",
            file: "lib/chat-engine.ts",
            role: "根据 selectedSkill.id 选择 teacher、builder 或 reviewer 的回答模板",
          },
          {
            name: "buildTeachingReply",
            file: "lib/chat-engine.ts",
            role: "把已解析的 selectedSkill、memory 和用户消息拼成可观察回复",
          },
        ],
        dataFlow: [
          "skill selector",
          "selectedSkillId state",
          "handleSubmit",
          "/api/chat",
          "chat engine",
          "prompt preview",
        ],
      },
    },
    {
      id: "resend-the-same-question",
      title: "重新发送同一个问题",
      type: "action",
      targetId: "chat-input",
      beginner: {
        doThis:
          "先问一次问题，然后只改 memory 或 skill，再把同一个问题重新发送一遍。",
        watchHere: "“Ask the assistant”的输入框和发送按钮。",
        notice:
          "虽然最终 prompt 是由多个来源拼出来的，但界面上给你的输入仍然很简单。",
        whyItMatters:
          "把用户问题固定住，能更容易看清到底哪些行为变化来自上下文组装。",
      },
      advanced: {
        trigger: "你不改 message，只调整 selectedMemoryIds 或 selectedSkillId，然后再次点击发送。",
        visibleEffect: "同一个问题会生成不同的 transcript 项，但请求体始终还是同一套字段。",
        internals:
          "`handleSubmit` 会先把 message.trim() 放进 `requestBody`，再把当前的 selectedSkillId 和 selectedMemoryIds 一起发到 `/api/chat`。服务端 `buildTeachingReply` 读取这些字段后，输出的 `composedPrompt` 仍然保留一致的结构，只是 memory block 和 skill prompt 的内容不同。",
        files: [
          {
            path: "components/chat-interface.tsx",
            role: "负责重新发送同一个问题并记录 transcript",
          },
          {
            path: "app/api/chat/route.ts",
            role: "接收请求并交给 chat engine",
          },
          {
            path: "lib/chat-engine.ts",
            role: "把相同的问题和不同上下文拼成不同回复",
          },
        ],
        functions: [
          {
            name: "handleSubmit",
            file: "components/chat-interface.tsx",
            role: "发送当前 message、skill 和 memory 的组合请求",
          },
          {
            name: "buildMemoryContext",
            file: "lib/chat-engine.ts",
            role: "把选中的 memory 组织成可读的上下文块",
          },
        ],
        dataFlow: [
          "message state",
          "requestBody",
          "/api/chat",
          "buildTeachingReply",
          "transcript",
        ],
      },
    },
    {
      id: "compare-the-answer",
      title: "对比回答结果",
      type: "observation",
      targetId: "transcript-panel",
      beginner: {
        doThis:
          "按顺序阅读 transcript，而不是只盯着最新那条回答。",
        watchHere: "工作台中间的对话面板。",
        notice:
          "当 skill 或 memory 输入发生变化时，同一个问题应该会产出明显不同的回答结构。",
        whyItMatters:
          "一个真正适合学习的 memory 系统，必须让输出差异是可读、可理解的，而不只是“可以配置”。",
      },
      advanced: {
        trigger: "你对比两次 transcript，确认它们来自不同的 skill 或 memory 组合。",
        visibleEffect: "用户能在对话流里直接看到不同模式的回答框架，而不是只看到最后一条结果。",
        internals:
          "`ChatInterface` 会把每次请求的 assistantMessage 追加到 transcript，并在 `latestResponse` 里保存当前的 `response` 和 `composedPrompt`。这样 UI 可以同时展示对话记录和 prompt preview，让学习者把输出差异和输入差异一一对上。",
        files: [
          {
            path: "components/chat-interface.tsx",
            role: "维护 transcript 和 latestResponse",
          },
          {
            path: "lib/chat-engine.ts",
            role: "生成不同 skill 和 memory 组合下的可观察输出",
          },
          {
            path: "app/api/chat/route.ts",
            role: "返回用于对比的 chat 响应",
          },
        ],
        functions: [
          {
            name: "buildTeachingReply",
            file: "lib/chat-engine.ts",
            role: "生成对比 transcript 所依赖的教学回复",
          },
        ],
        dataFlow: [
          "transcript panel",
          "latestResponse state",
          "assistantMessage append",
          "prompt preview",
        ],
      },
    },
    {
      id: "inspect-the-assembled-prompt",
      title: "查看组装后的 prompt",
      type: "checkpoint",
      targetId: "prompt-preview",
      beginner: {
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
      advanced: {
        trigger: "你打开 Prompt preview，核对 memory block、system prompt 和用户消息的拼接顺序。",
        visibleEffect: "右侧卡片会显示完整的 composed prompt，让你看到每个输入最终去了哪里。",
        internals:
          "`buildTeachingReply` 先调用 `buildMemoryContext` 产出 memory block，再把 `selectedSkill.systemPrompt` 和用户消息拼成 `composedPrompt`。`ChatInterface` 的 `latestResponse` 再把这个结果映射到 Prompt preview 卡片，所以你能直接对照 `memory-panel` 的选择和最终输出。",
        files: [
          {
            path: "components/chat-interface.tsx",
            role: "渲染 prompt preview 并展示最新教学回复",
          },
          {
            path: "lib/chat-engine.ts",
            role: "组装 composedPrompt 和 memoryContext",
          },
          {
            path: "app/api/chat/route.ts",
            role: "把 request body 送进 chat engine",
          },
        ],
        functions: [
          {
            name: "buildMemoryContext",
            file: "lib/chat-engine.ts",
            role: "把选中的 memory 转成可读的 block",
          },
          {
            name: "buildTeachingReply",
            file: "lib/chat-engine.ts",
            role: "拼接 system prompt、memory 和用户消息",
          },
          {
            name: "handleSubmit",
            file: "components/chat-interface.tsx",
            role: "把请求结果保存到 latestResponse 供预览使用",
          },
        ],
        dataFlow: [
          "memory panel",
          "chat submit handler",
          "/api/chat",
          "chat engine",
          "prompt preview",
        ],
      },
    },
  ],
};
