import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { learningScript } from '../lib/learning-assistant-script.ts';

test('learning script defines the quick-start walkthrough contract', () => {
  assert.equal(learningScript.chapterId, '01-quick-start');
  assert.equal(learningScript.chapterTitle, '快速开始学习助手');
  assert.equal(
    learningScript.summary,
    '跟着第一条消息、继续追问、恢复会话与工作区观察这条主线完成一次学习。'
  );
  assert.equal(learningScript.steps.length, 7);

  assert.deepEqual(
    learningScript.steps.map((step) => ({
      id: step.id,
      type: step.type,
      targetId: step.targetId ?? null,
    })),
    [
      {
        id: 'send-first-message',
        type: 'action',
        targetId: 'chat-input',
      },
      {
        id: 'watch-streaming',
        type: 'observation',
        targetId: 'message-list',
      },
      {
        id: 'inspect-session-list',
        type: 'observation',
        targetId: 'session-list',
      },
      {
        id: 'continue-same-session',
        type: 'comparison',
        targetId: 'chat-input',
      },
      {
        id: 'start-new-session',
        type: 'comparison',
        targetId: 'new-chat-button',
      },
      {
        id: 'reopen-previous-session',
        type: 'observation',
        targetId: 'session-list',
      },
      {
        id: 'inspect-workspace',
        type: 'checkpoint',
        targetId: 'file-explorer',
      },
    ]
  );
});

test('learning target ids stay mounted in the quick-start UI', () => {
  const projectRoot = path.resolve(import.meta.dirname, '..');
  const chatInterface = fs.readFileSync(
    path.join(projectRoot, 'components', 'chat-interface.tsx'),
    'utf8'
  );
  const sessionList = fs.readFileSync(
    path.join(projectRoot, 'components', 'session-list.tsx'),
    'utf8'
  );

  const actualTargets = new Set(
    Array.from(
      `${chatInterface}\n${sessionList}`.matchAll(
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
      `Expected target "${targetId}" to exist in the mounted quick-start UI`
    );
  }
});
