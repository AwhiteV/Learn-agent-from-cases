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
  chapterId: '03-agent-with-permission',
  chapterTitle: '权限控制学习助手',
  summary:
    '跟着一次受审批控制的运行，依次体验拒绝、允许、行为分支，以及结构化用户输入。',
  steps: [
    {
      id: 'trigger-a-permission-request',
      title: '触发一次权限请求',
      type: 'action',
      targetId: 'chat-input',
      doThis:
        '发送一个需要查看文件或工作区的请求，让 agent 在运行工具前必须先来征求你的同意。',
      watchHere: '主输入框区域。',
      notice: '这一轮会先开始，然后暂停下来等待你的明确批准，而不是一路直接执行到底。',
      whyItMatters:
        '这一章的核心是在正确的时机打断工具执行，而不是事后再补救。',
    },
    {
      id: 'deny-once-on-purpose',
      title: '先故意拒绝一次',
      type: 'comparison',
      targetId: 'permission-panel',
      doThis:
        '当审批卡片出现时，先选择 Deny once，这样你能先看到被拒绝后的那条分支，再去重复同一个请求。',
      watchHere: '输入区上方的权限面板。',
      notice: '因为你阻止了工具调用，agent 被迫走向另一条不同的处理路径。',
      whyItMatters:
        '只有当“拒绝”会以可见方式改变行为时，权限系统才真的有意义。',
    },
    {
      id: 'repeat-and-allow',
      title: '再来一次并允许',
      type: 'comparison',
      targetId: 'permission-panel',
      doThis:
        '重复同一个请求，并选择允许，这样你就能把“批准分支”和“拒绝分支”放在一起比较。',
      watchHere: '再次出现时的权限面板。',
      notice: '同一条用户请求，现在因为这道门打开了，所以可以继续进入工具执行。',
      whyItMatters:
        '这说明审批面板属于执行图的一部分，而不只是一个确认弹窗。',
    },
    {
      id: 'watch-the-behavior-branch',
      title: '观察行为分支',
      type: 'observation',
      targetId: 'message-list',
      doThis:
        '对比阅读“拒绝后”和“允许后”的对话记录，看看 agent 在两条分支里分别怎么响应。',
      watchHere: '中间面板里的消息列表。',
      notice: '对话会明显分叉，因为一条路径被挡住了，另一条则继续往前。',
      whyItMatters:
        '用户可见的分支差异，正是“权限真的影响了实时执行”的证据，而不只是文案变化。',
    },
    {
      id: 'answer-an-ask-user-question-form',
      title: '填写 AskUserQuestion 表单',
      type: 'term',
      targetId: 'ask-user-question-form',
      doThis:
        '触发一个需要澄清的问题，然后不要再发一条普通消息，而是直接填写结构化表单。',
      watchHere: '出现时的 AskUserQuestion 表单。',
      notice: 'agent 可以在审批工作流里收集结构化的人类输入。',
      whyItMatters:
        'AskUserQuestion 会把人的输入变成运行过程中的正式步骤，从而让这种由审批驱动的流程也能被恢复和继续。',
      termNote:
        'AskUserQuestion 是一种“工具形态”的结构化人类输入请求，而不只是又一条助手消息。',
    },
  ],
};
