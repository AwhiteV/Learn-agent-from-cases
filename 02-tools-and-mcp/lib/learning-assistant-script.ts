export interface LearningStep {
  id: string;
  title: string;
  type: 'action' | 'observation' | 'comparison' | 'term' | 'checkpoint';
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
  chapterId: '02-tools-and-mcp',
  chapterTitle: '工具与 MCP 学习助手',
  summary:
    '跟着一次带工具的回合，从仓库检查一路看到工具事件、回答溯源，以及 MCP 在其中扮演的角色。',
  steps: [
    {
      id: 'ask-for-real-repo-inspection',
      title: '发起一次真实仓库检查',
      type: 'action',
      targetId: 'chat-input',
      doThis:
        '让 agent 真正检查当前仓库，比如列出根目录文件，或者查看某个配置文件。',
      watchHere: '中间的输入区域。',
      notice: '这个请求会把 agent 推向真实环境访问，而不是只给一个纯文字回答。',
      whyItMatters:
        '这一章的重点是“通过工具采取动作”，所以第一条提示词就应该真的需要访问仓库。',
      termNote:
        '工具调用意味着模型可以暂时离开纯文本生成，调用外部能力，再带着结果继续往下做。',
    },
    {
      id: 'watch-tool-activity-panel',
      title: '观察工具活动面板',
      type: 'observation',
      targetId: 'tool-activity-list',
      doThis: '在回合还在运行时，盯住这个活动卡片看。',
      watchHere: '显示在助手回复上方的工具活动列表。',
      notice: '在最终回答稳定下来之前，你可以先看到工具开始、更新、结束。',
      whyItMatters:
        'Agent 产品需要把执行状态可视化，这样用户才能理解一次运行过程中发生了什么。',
    },
    {
      id: 'match-tool-events-to-the-final-answer',
      title: '把工具事件和最终回答对上',
      type: 'comparison',
      targetId: 'message-list',
      doThis:
        '这一轮完成后，把最终回答和你刚才看到的工具事件对照起来。',
      watchHere: '中间消息列表里的对话记录。',
      notice: '回答内容应该能对应上活动面板里展示过的文件或工具结果。',
      whyItMatters:
        '只有当你能把执行证据和用户最终看到的结果连接起来时，事件层才真的有价值。',
    },
    {
      id: 'compare-visible-actions-with-plain-chat',
      title: '对比可见动作和普通聊天',
      type: 'comparison',
      targetId: 'session-list',
      doThis:
        '利用左侧历史边栏，把这次带工具的运行和一个更简单的纯聊天回合，或一个新会话进行对比。',
      watchHere: '左侧的会话列表。',
      notice: '在同一套 UI 里，你可以对比“带可见工具轨迹”的运行和“更普通的聊天流程”。',
      whyItMatters:
        '工具可见性是叠加在同一套会话模型之上的产品选择，不是另一套完全独立的应用。',
    },
    {
      id: 'remember-what-mcp-changes',
      title: '记住 MCP 改变了什么',
      type: 'term',
      doThis:
        '在这一轮结束后，停下来复述一下到底改变了什么：agent 能连到外部能力，并且把这些动作暴露在 UI 里。',
      watchHere: '整个已经完成的带工具回合。',
      notice: 'MCP 改变的是工具如何接入，而不是“我们是否需要观察 agent 做了什么”这件事本身。',
      whyItMatters:
        '这一章不只是让你看到工具调用，更重要的是理解那个让外部能力可组合的标准化连接层。',
      termNote:
        'MCP 是外部工具的标准化连接层，不是对应用 UI 或 agent 本身的替代。',
    },
  ],
};
