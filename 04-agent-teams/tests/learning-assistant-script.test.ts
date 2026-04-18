import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

interface LearningStepContract {
  id: string;
  type: 'action' | 'observation' | 'comparison' | 'term' | 'checkpoint';
  targetId?: string;
}

interface LearningScriptContract {
  chapterId: string;
  chapterTitle: string;
  summary: string;
  steps: LearningStepContract[];
}

const projectRoot = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(projectRoot, 'lib', 'learning-assistant-script.ts');

async function loadLearningScript(): Promise<LearningScriptContract> {
  assert.equal(
    fs.existsSync(scriptPath),
    true,
    'Expected 04 learning-assistant-script.ts to exist'
  );

  const loadedModule = (await import(pathToFileURL(scriptPath).href)) as {
    learningScript: LearningScriptContract;
  };

  return loadedModule.learningScript;
}

test('learning script defines the agent-teams walkthrough contract', async () => {
  const learningScript = await loadLearningScript();

  assert.equal(learningScript.chapterId, '04-agent-teams');
  assert.equal(learningScript.chapterTitle, 'Agent 团队学习助手');
  assert.equal(learningScript.steps.length, 5);
  assert.deepEqual(
    learningScript.steps.map((step) => ({
      title: step.title,
      type: step.type,
      targetId: step.targetId ?? null,
    })),
    [
      {
        title: '提交一个适合拆解的请求',
        type: 'action',
        targetId: 'chat-input',
      },
      {
        title: '观察队友活动',
        type: 'observation',
        targetId: 'agent-team-view',
      },
      {
        title: '检查任务列表',
        type: 'observation',
        targetId: 'agent-task-list',
      },
      {
        title: '检查恢复与聚合',
        type: 'checkpoint',
        targetId: 'message-list',
      },
      {
        title: '判断最终综合结果',
        type: 'observation',
        targetId: 'message-list',
      },
    ]
  );
});

test('learning target ids stay mounted in the agent-teams UI', async () => {
  const learningScript = await loadLearningScript();
  const chatInterface = fs.readFileSync(
    path.join(projectRoot, 'components', 'chat-interface.tsx'),
    'utf8'
  );
  const sessionList = fs.readFileSync(
    path.join(projectRoot, 'components', 'session-list.tsx'),
    'utf8'
  );
  const agentTaskList = fs.readFileSync(
    path.join(projectRoot, 'components', 'agent-task-list.tsx'),
    'utf8'
  );
  const agentTeamSplit = fs.readFileSync(
    path.join(projectRoot, 'components', 'agent-team-split.tsx'),
    'utf8'
  );

  const actualTargets = new Set(
    Array.from(
      `${chatInterface}\n${sessionList}\n${agentTaskList}\n${agentTeamSplit}`.matchAll(
        /data-learning-target="([^"]+)"/g
      ),
      (match) => match[1]
    )
  );

  for (const targetId of learningScript.steps
    .map((step) => step.targetId)
    .filter((value): value is string => Boolean(value))) {
    assert.equal(
      actualTargets.has(targetId),
      true,
      `Expected target "${targetId}" to exist in the mounted 04 UI`
    );
  }
});
