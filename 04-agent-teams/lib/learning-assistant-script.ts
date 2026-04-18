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
  chapterId: '04-agent-teams',
  chapterTitle: 'Agent 团队学习助手',
  summary:
    '跟着一次被拆解的运行，从任务分派一路看到队友活动、任务追踪、恢复执行和最终综合。',
  steps: [
    {
      id: 'submit-a-decomposable-request',
      title: '提交一个适合拆解的请求',
      type: 'action',
      targetId: 'chat-input',
      doThis:
        '提出一个天然可以拆成调研、对比和最终综合的多部分任务。',
      watchHere: '主输入框区域。',
      notice: '这一章会启动一个面向团队协作的运行，而不是一个简单的单 agent 回答。',
      whyItMatters:
        '只有当请求真的适合拆解时，多 agent 系统才有帮助。',
      termNote:
        'Orchestrator 会在任何 worker 开始之前先决定这项工作是否要拆开。',
    },
    {
      id: 'watch-teammate-activity',
      title: '观察队友活动',
      type: 'observation',
      targetId: 'agent-team-view',
      doThis: '在运行还没结束时，盯住实时树状视图看。',
      watchHere: '显示在助手回复上方的活动树。',
      notice: 'Task 启动和子工具运行会以结构化团队轨迹出现，而不是一张平铺列表。',
      whyItMatters:
        '只有当你能看见哪些工作留在主 agent 手里、哪些被分给队友时，任务分派这件事才真正可理解。',
    },
    {
      id: 'inspect-the-task-list',
      title: '检查任务列表',
      type: 'observation',
      targetId: 'agent-task-list',
      doThis: '观察任务面板里工作如何从 pending 进入 in progress，再到 completed。',
      watchHere: '输入区上方的任务列表。',
      notice: 'UI 会告诉你任务归谁负责、执行顺序是什么，以及团队有没有真的把计划闭环。',
      whyItMatters:
        '一个好的多 agent 产品需要任务级可观测性，而不只是最后堆出一串消息。',
    },
    {
      id: 'check-for-resume-and-aggregation',
      title: '检查恢复与聚合',
      type: 'checkpoint',
      targetId: 'message-list',
      doThis:
        '观察主 agent 是否会在队友完成工作后恢复执行，并开始聚合它们带回来的结果。',
      watchHere: '运行从等待阶段转向最终组织回答时的对话记录。',
      notice: '主 agent 应该在队友活动结束后继续往下，而不是停留在“已经分派任务”这一步。',
      whyItMatters:
        '只有当主 agent 能把 worker 的结果重新收拢进一个连续回合里时，团队工作流才真正有价值。',
      termNote:
        '这里的“恢复”是指主 agent 在 worker 完成后继续往下走，而不是在交接时就结束。',
    },
    {
      id: 'judge-the-final-synthesis',
      title: '判断最终综合结果',
      type: 'observation',
      targetId: 'message-list',
      doThis:
        '在 worker 全部完成后，阅读最终的助手回复，判断它是否真的综合了前面各个队友的工作。',
      watchHere: '消息列表里的对话记录。',
      notice: '主 agent 应该恢复执行，并把队友输出整理成一个可直接使用的答案。',
      whyItMatters:
        '最终用户体验取决于 orchestrator 是否真正消费了 worker 的结果，而不是只把它们派出去。',
    },
  ],
};
