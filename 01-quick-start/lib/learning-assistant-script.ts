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
  chapterId: '01-quick-start',
  chapterTitle: '快速开始学习助手',
  summary: '跟着第一条消息、继续追问、恢复会话与工作区观察这条主线完成一次学习。',
  steps: [
    {
      id: 'send-first-message',
      title: '发送你的第一条消息',
      type: 'action',
      targetId: 'chat-input',
      doThis: '输入一个简短问题并发送。',
      watchHere: '中间的聊天面板和输入区。',
      notice: '页面会立刻开始一个新的助手回合。',
      whyItMatters:
        '这代表一个活动会话的开始，而不只是一次静态表单提交。',
      termNote:
        '流式界面会把“正在生成”的过程展示出来，而不是等到最后一次性吐出完整结果。',
    },
    {
      id: 'watch-streaming',
      title: '观察回答逐步展开',
      type: 'observation',
      targetId: 'message-list',
      doThis: '先不要切走页面。',
      watchHere: '助手消息正文区域。',
      notice: '内容会一点点增长，并带有实时光标效果。',
      whyItMatters:
        'Agent 产品会把执行中的过程暴露给用户，而不是把整个生成阶段都藏起来。',
    },
    {
      id: 'inspect-session-list',
      title: '查看新会话是否出现',
      type: 'observation',
      targetId: 'session-list',
      doThis: '在回答完成后，看一下左侧边栏。',
      watchHere: '会话列表区域。',
      notice: '这里会出现一条新的会话记录。',
      whyItMatters:
        '会话持久化在 UI 里是可见的，而不是只在内部默默保存。',
    },
    {
      id: 'continue-same-session',
      title: '在同一会话里继续追问',
      type: 'comparison',
      targetId: 'chat-input',
      doThis:
        '在同一个聊天里继续追问一句，比如让它把刚才的总结说得更短一些。',
      watchHere: '中间面板里的当前对话记录。',
      notice: '助手可以直接沿用已有上下文，而不需要你重复解释上一轮内容。',
      whyItMatters:
        '这是测试完整恢复能力之前，最直观的“同一会话连续性”表现。',
      termNote:
        '继续追问和恢复会话是相关但不同的两个概念：一个发生在当前会话里，另一个发生在离开后重新回来时。',
    },
    {
      id: 'start-new-session',
      title: '对比一个全新的会话',
      type: 'comparison',
      targetId: 'new-chat-button',
      doThis: '从左侧边栏开启一个新聊天，并问它上一轮聊了什么。',
      watchHere: '空白对话区和接下来的助手回复。',
      notice: '新聊天不会记住旧会话里的内容。',
      whyItMatters:
        '新会话会重置上下文，而不会自动继承历史。',
    },
    {
      id: 'reopen-previous-session',
      title: '重新打开之前的会话',
      type: 'observation',
      targetId: 'session-list',
      doThis:
        '创建了新聊天之后，再从左侧历史列表点回刚才的旧会话。',
      watchHere: '中间面板里恢复出来的对话记录。',
      notice: '重新打开这个已保存会话时，旧消息会回来。',
      whyItMatters:
        '恢复会话的重点是重新打开已持久化的工作，而不是手动重建上下文。',
    },
    {
      id: 'inspect-workspace',
      title: '观察工作区面板',
      type: 'checkpoint',
      targetId: 'file-explorer',
      doThis:
        '先暂时关掉抽屉，扫一眼右侧边栏里的文件，再打开一个文件预览，然后回来继续看学习助手。',
      watchHere: '文件浏览器区域。',
      notice: '这个 agent 界面和一个具体工作区是绑定在一起的。',
      whyItMatters:
        '工作区是应用边界的一部分，不是藏在内部的实现细节。',
      termNote:
        '恢复会话就是回到一个已保存的会话状态，而不是重新手动把上下文拼出来。',
    },
  ],
};
