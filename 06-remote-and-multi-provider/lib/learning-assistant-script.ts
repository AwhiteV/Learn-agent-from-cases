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
  chapterId: "06-remote-and-multi-provider",
  chapterTitle: "远程与多 Provider 学习助手",
  summary:
    "跟着一次 provider 切换的运行，分清哪些是稳定契约，哪些是 provider 自己的差异。",
  steps: [
    {
      id: "choose-a-provider",
      title: "选择一个 provider",
      type: "action",
      targetId: "provider-switcher",
      doThis:
        "先用本地 provider 试一次，然后切到 remote-style 选项，再把同样的任务重发一遍。",
      watchHere: "Provider Switcher 面板。",
      notice:
        "选中的 provider 会改变 execution mode 和说明文案，但页面不会因此换成另一套工作流。",
      whyItMatters:
        "provider abstraction 的目标，就是让执行路径可以变化，而不用为每个后端都重做一套 UI。",
    },
    {
      id: "send-the-same-request",
      title: "发送同一条请求",
      type: "action",
      targetId: "chat-input",
      doThis:
        "从一个 provider 切到另一个 provider 时，尽量保持任务内容完全一致。",
      watchHere: "任务输入框和发送按钮。",
      notice:
        "虽然实际运行的是不同实现，但请求体仍然保持简单稳定。",
      whyItMatters:
        "稳定的请求契约，能让 provider 之间的差异更容易被对比和理解。",
    },
    {
      id: "inspect-the-stable-abstraction",
      title: "查看稳定抽象层",
      type: "term",
      targetId: "provider-inspector",
      doThis:
        "在看 provider 专属说明之前，先读一遍 contract 代码片段。",
      watchHere: "Provider Inspector 面板。",
      notice:
        "不管当前激活的是哪个 provider，`AgentProvider` 接口和 `ProviderResult` 结构都是一样的。",
      whyItMatters:
        "正是这个抽象层，阻止了路由和后端差异泄漏到产品的其他部分。",
      termNote:
        "稳定抽象的意思是：上层调用方只依赖一份统一契约，而底层实现可以各不相同。",
    },
    {
      id: "compare-transcript-output",
      title: "对比 transcript 输出",
      type: "comparison",
      targetId: "transcript-panel",
      doThis:
        "把完全一样的任务分别发给两个 provider 后，再去阅读 transcript。",
      watchHere: "聊天控制台里的 transcript 列表。",
      notice:
        "不同 provider 的输出措辞和标签可以不同，但 UI 仍然用同一个 transcript 组件来渲染它们。",
      whyItMatters:
        "这就是 provider abstraction 在产品侧带来的回报：一套学习界面可以承载多个后端。",
    },
    {
      id: "check-provider-specific-notes",
      title: "检查 provider 专属说明",
      type: "checkpoint",
      targetId: "provider-inspector",
      doThis:
        "每次响应后，都去对比 inspector 里的 execution mode、notes 和边界说明。",
      watchHere: "Provider Inspector 面板的下半部分。",
      notice:
        "provider notes 会解释执行方式发生了什么变化，但不会改动外层请求和响应契约。",
      whyItMatters:
        "好的多 provider 体验，会把后端差异显示成明确元数据，而不是藏成用户看不见的隐式行为。",
    },
  ],
};
