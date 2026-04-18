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
      beginner: {
        doThis:
          "先用本地 provider 试一次，然后切到 remote-style 选项，再把同样的任务重发一遍。",
        watchHere: "Provider 切换器面板。",
        notice:
          "选中的 provider 会改变 execution mode 和说明文案，但页面不会因此换成另一套工作流。",
        whyItMatters:
          "provider abstraction 的目标，就是让执行路径可以变化，而不用为每个后端都重做一套 UI。",
      },
      advanced: {
        trigger: "你在 Provider 切换器里切换 provider，然后不改 message 再发送一次。",
        visibleEffect: "当前 Provider、execution mode 和 provider notes 会一起变化，但同一套 chat UI 仍然复用。",
        internals:
          "`ProviderSwitcher` 只负责切换 `activeProviderId`，`ChatConsole` 用这个 state 选出当前 `activeProvider`。`handleSubmit` 会把 `providerId` 和 message 一起封装进 `ChatRequestBody` 发给 `/api/chat`，`route.ts` 再通过 `getProviderById` 找到对应 provider。",
        files: [
          {
            path: "components/provider-switcher.tsx",
            role: "负责切换 activeProviderId",
          },
          {
            path: "components/chat-console.tsx",
            role: "保存 activeProviderId 并提交请求",
          },
          {
            path: "app/api/chat/route.ts",
            role: "根据 providerId 路由到正确的 provider",
          },
          {
            path: "lib/providers/index.ts",
            role: "暴露 provider registry 和 summary 数据",
          },
        ],
        functions: [
          {
            name: "handleSubmit",
            file: "components/chat-console.tsx",
            role: "把 activeProviderId 和 message 发送到 /api/chat",
          },
          {
            name: "getProviderById",
            file: "lib/providers/index.ts",
            role: "按 providerId 找到具体 provider 实例",
          },
        ],
        dataFlow: [
          "provider switcher",
          "activeProviderId state",
          "handleSubmit",
          "/api/chat",
          "provider registry",
          "provider inspector",
        ],
      },
    },
    {
      id: "send-the-same-request",
      title: "发送同一条请求",
      type: "action",
      targetId: "chat-input",
      beginner: {
        doThis:
          "从一个 provider 切到另一个 provider 时，尽量保持任务内容完全一致。",
        watchHere: "任务输入框和发送按钮。",
        notice:
          "虽然实际运行的是不同实现，但请求体仍然保持简单稳定。",
        whyItMatters:
          "稳定的请求契约，能让 provider 之间的差异更容易被对比和理解。",
      },
      advanced: {
        trigger: "你不改 message，只替换 activeProviderId，然后重新提交同一条请求。",
        visibleEffect: "控制台会显示同一任务在不同 provider 下的响应结果，但提交表单和 transcript 结构不变。",
        internals:
          "`ChatConsole` 的 `handleSubmit` 只会把当前的 `providerId` 和 message 组装成 `ChatRequestBody`。`app/api/chat/route.ts` 的 `POST` 再用 `getProviderById` 解析这个 id，然后把统一的 `ProviderResult` 返回给 UI。`getProviderSummaries` 只负责给切换面板和 inspector 提供摘要，不参与这条请求流。",
        files: [
          {
            path: "components/chat-console.tsx",
            role: "负责重新提交同一条 message",
          },
          {
            path: "app/api/chat/route.ts",
            role: "统一接收 providerId + message",
          },
          {
            path: "lib/providers/index.ts",
            role: "注册并查找可用 provider",
          },
        ],
        functions: [
          {
            name: "handleSubmit",
            file: "components/chat-console.tsx",
            role: "把当前 providerId 和 message 发到 /api/chat",
          },
          {
            name: "POST",
            file: "app/api/chat/route.ts",
            role: "读取 providerId 并把请求分发到对应 provider",
          },
          {
            name: "getProviderById",
            file: "lib/providers/index.ts",
            role: "把 providerId 映射到具体 provider 实例",
          },
        ],
        dataFlow: [
          "message state",
          "requestBody",
          "/api/chat",
          "provider registry",
          "transcript",
        ],
      },
    },
    {
      id: "inspect-the-stable-abstraction",
      title: "查看稳定抽象层",
      type: "term",
      targetId: "provider-inspector",
      beginner: {
        doThis:
          "在看 provider 专属说明之前，先读一遍 contract 代码片段。",
        watchHere: "Provider 检查面板。",
        notice:
          "不管当前激活的是哪个 provider，`AgentProvider` 接口和 `ProviderResult` 结构都是一样的。",
        whyItMatters:
          "正是这个抽象层，阻止了路由和后端差异泄漏到产品的其他部分。",
        termNote:
          "稳定抽象的意思是：上层调用方只依赖一份统一契约，而底层实现可以各不相同。",
      },
      advanced: {
        trigger: "你检查 Inspector 里的 contract snippet，并把它和 provider 实现文件对照。",
        visibleEffect: "Inspector 会把 execution mode、routePattern 和 constant surface 摆在同一个视图里。",
        internals:
          "`ProviderInspector` 使用 `ProviderSummary` 渲染当前 provider 的边界说明，而 `lib/types.ts` 里的 `ProviderRequest`、`ProviderResult` 和 `AgentProvider` 定义了统一接口。`BaseProvider` 再把共享的 `createResult` 与 `buildSharedChecklist` 抽出来，保证 local 和 remote-style provider 都返回同一种结构。",
        files: [
          {
            path: "lib/providers/index.ts",
            role: "把 provider registry 和 summary 汇总给 UI",
          },
          {
            path: "lib/types.ts",
            role: "定义 AgentProvider、ProviderRequest 和 ProviderResult",
          },
          {
            path: "lib/providers/base.ts",
            role: "实现 provider 共享的基础行为",
          },
          {
            path: "components/provider-inspector.tsx",
            role: "展示稳定抽象、边界和 provider notes",
          },
        ],
        functions: [
          {
            name: "createResult",
            file: "lib/providers/base.ts",
            role: "把 provider 输出包装成统一的 ProviderResult",
          },
          {
            name: "buildSharedChecklist",
            file: "lib/providers/base.ts",
            role: "生成所有 provider 共享的学习提示",
          },
        ],
        dataFlow: [
          "provider switcher",
          "chat console state",
          "/api/chat",
          "provider registry",
          "provider inspector",
        ],
      },
    },
    {
      id: "compare-transcript-output",
      title: "对比 transcript 输出",
      type: "comparison",
      targetId: "transcript-panel",
      beginner: {
        doThis:
          "把完全一样的任务分别发给两个 provider 后，再去阅读 transcript。",
        watchHere: "聊天控制台里的 transcript 列表。",
        notice:
          "不同 provider 的输出措辞和标签可以不同，但 UI 仍然用同一个 transcript 组件来渲染它们。",
        whyItMatters:
          "这就是 provider abstraction 在产品侧带来的回报：一套学习界面可以承载多个后端。",
      },
      advanced: {
        trigger: "你先用 local provider，再切到 mock-remote provider，然后对比 transcript 项。",
        visibleEffect: "transcript 会显示 providerName 和 executionMode 的变化，但聊天卡片仍然复用同一套渲染逻辑。",
        internals:
          "`ChatConsole` 在 `handleSubmit` 里把 `data.result.output`、`data.result.providerName` 和 `data.result.executionMode` 写进 `TranscriptItem`，所以 transcript 可以直接反映 provider 差异。`ProviderInspector` 则会根据 `latestResponse` 决定是否显示最新 notes。",
        files: [
          {
            path: "components/chat-console.tsx",
            role: "维护 transcript 并写入 provider metadata",
          },
          {
            path: "components/provider-inspector.tsx",
            role: "显示最新 provider notes 和执行模式",
          },
          {
            path: "app/api/chat/route.ts",
            role: "返回包含 provider metadata 的统一响应",
          },
        ],
        functions: [
          {
            name: "handleSubmit",
            file: "components/chat-console.tsx",
            role: "把 provider 响应追加到 transcript",
          },
        ],
        dataFlow: [
          "transcript panel",
          "latestResponse state",
          "provider metadata",
          "provider inspector",
        ],
      },
    },
    {
      id: "check-provider-specific-notes",
      title: "检查 provider 专属说明",
      type: "checkpoint",
      targetId: "provider-inspector",
      beginner: {
        doThis:
          "每次响应后，都去对比 inspector 里的 execution mode、notes 和边界说明。",
        watchHere: "Provider 检查面板的下半部分。",
        notice:
          "provider notes 会解释执行方式发生了什么变化，但不会改动外层请求和响应契约。",
        whyItMatters:
          "好的多 provider 体验，会把后端差异显示成明确元数据，而不是藏成用户看不见的隐式行为。",
      },
      advanced: {
        trigger: "你把 Inspector 里的 notes 和 providerDetails、provider run 结果对齐起来看。",
        visibleEffect: "每个 provider 都有自己的一组 notes，但 summary、boundary 和 routePattern 仍然来自同一个 registry。",
        internals:
          "`getProviderSummaries` 会把 `providerDetails` 与 `providers` 合并成 UI 可读的 `ProviderSummary`，`getProviderById` 则在 `/api/chat` 里选中具体 provider。`LocalAgentProvider` 和 `MockRemoteProvider` 都通过 `BaseProvider.createResult` 返回统一形状，所以 Inspector 能稳定显示 latestResponse 的 notes。",
        files: [
          {
            path: "lib/providers/index.ts",
            role: "把 provider registry 和详情汇总给 UI",
          },
          {
            path: "lib/providers/local-agent.ts",
            role: "实现本地 provider 的教学输出",
          },
          {
            path: "lib/providers/mock-remote.ts",
            role: "实现 remote-style provider 的延迟输出",
          },
          {
            path: "components/provider-inspector.tsx",
            role: "展示最新 provider notes 和固定 contract",
          },
        ],
        functions: [
          {
            name: "getProviderSummaries",
            file: "lib/providers/index.ts",
            role: "为 Inspector 提供 provider summary 数据",
          },
          {
            name: "getProviderById",
            file: "lib/providers/index.ts",
            role: "在路由层定位当前 provider",
          },
          {
            name: "createResult",
            file: "lib/providers/base.ts",
            role: "确保每个 provider 返回统一结果结构",
          },
        ],
        dataFlow: [
          "provider registry",
          "provider summary",
          "latestResponse",
          "provider notes",
          "provider inspector",
        ],
      },
    },
  ],
};
