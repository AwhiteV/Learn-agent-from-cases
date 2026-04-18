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
    'Expected 02 learning-assistant-script.ts to exist'
  );

  const loadedModule = (await import(pathToFileURL(scriptPath).href)) as {
    learningScript: LearningScriptContract;
  };

  return loadedModule.learningScript;
}

test('learning script defines the tools-and-mcp walkthrough contract', async () => {
  const learningScript = await loadLearningScript();

  assert.equal(learningScript.chapterId, '02-tools-and-mcp');
  assert.equal(learningScript.chapterTitle, '工具与 MCP 学习助手');
  assert.equal(learningScript.steps.length, 5);
  assert.deepEqual(
    learningScript.steps.map((step) => ({
      title: step.title,
      type: step.type,
      targetId: step.targetId ?? null,
    })),
    [
      {
        title: '发起一次真实仓库检查',
        type: 'action',
        targetId: 'chat-input',
      },
      {
        title: '观察工具活动面板',
        type: 'observation',
        targetId: 'tool-activity-list',
      },
      {
        title: '把工具事件和最终回答对上',
        type: 'comparison',
        targetId: 'message-list',
      },
      {
        title: '对比可见动作和普通聊天',
        type: 'comparison',
        targetId: 'session-list',
      },
      {
        title: '记住 MCP 改变了什么',
        type: 'term',
        targetId: null,
      },
    ]
  );
});

test('learning target ids stay mounted in the tools-and-mcp UI', async () => {
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

  const actualTargets = new Set(
    Array.from(
      `${chatInterface}\n${sessionList}\n${fileExplorer}`.matchAll(
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
      `Expected target "${targetId}" to exist in the mounted 02 UI`
    );
  }
});
