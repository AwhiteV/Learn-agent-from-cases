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
    'Expected 03 learning-assistant-script.ts to exist'
  );

  const loadedModule = (await import(pathToFileURL(scriptPath).href)) as {
    learningScript: LearningScriptContract;
  };

  return loadedModule.learningScript;
}

test('learning script defines the permission walkthrough contract', async () => {
  const learningScript = await loadLearningScript();

  assert.equal(learningScript.chapterId, '03-agent-with-permission');
  assert.equal(
    learningScript.chapterTitle,
    '权限控制学习助手'
  );
  assert.equal(learningScript.steps.length, 5);
  assert.deepEqual(
    learningScript.steps.map((step) => ({
      title: step.title,
      type: step.type,
      targetId: step.targetId ?? null,
    })),
    [
      {
        title: '触发一次权限请求',
        type: 'action',
        targetId: 'chat-input',
      },
      {
        title: '先故意拒绝一次',
        type: 'comparison',
        targetId: 'permission-panel',
      },
      {
        title: '再来一次并允许',
        type: 'comparison',
        targetId: 'permission-panel',
      },
      {
        title: '观察行为分支',
        type: 'observation',
        targetId: 'message-list',
      },
      {
        title: '填写 AskUserQuestion 表单',
        type: 'term',
        targetId: 'ask-user-question-form',
      },
    ]
  );
});

test('learning target ids stay mounted in the permission chapter UI', async () => {
  const learningScript = await loadLearningScript();
  const chatInterface = fs.readFileSync(
    path.join(projectRoot, 'components', 'chat-interface.tsx'),
    'utf8'
  );
  const sessionList = fs.readFileSync(
    path.join(projectRoot, 'components', 'session-list.tsx'),
    'utf8'
  );
  const fileExplorer = fs.readFileSync(
    path.join(projectRoot, 'components', 'file-explorer.tsx'),
    'utf8'
  );
  const permissionSelector = fs.readFileSync(
    path.join(projectRoot, 'components', 'permission-selector.tsx'),
    'utf8'
  );

  const actualTargets = new Set(
    Array.from(
      `${chatInterface}\n${sessionList}\n${fileExplorer}\n${permissionSelector}`.matchAll(
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
      `Expected target "${targetId}" to exist in the mounted 03 UI`
    );
  }
});
