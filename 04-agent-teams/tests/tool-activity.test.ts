import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const projectRoot = path.resolve(import.meta.dirname, '..');
const toolActivityPath = path.join(projectRoot, 'lib', 'tool-activity.ts');

test('buildActivityTree preserves parent-child relationships for historical tool messages', async () => {
  const { buildActivityTree } = await loadToolActivityModule();
  const activities: ToolActivity[] = [
    {
      id: 'main-readme',
      type: 'tool',
      status: 'completed',
      toolName: 'Read',
      timestamp: 1,
    },
    {
      id: 'task-worker',
      type: 'tool',
      status: 'completed',
      toolName: 'Task',
      toolUseId: 'task-worker',
      timestamp: 2,
    },
    {
      id: 'worker-grep',
      type: 'tool',
      status: 'completed',
      toolName: 'Grep',
      parentId: 'task-worker',
      timestamp: 3,
    },
  ];

  const tree = buildActivityTree(activities);

  assert.equal(tree.length, 2);
  assert.equal(tree[0]?.activity.id, 'main-readme');
  assert.equal(tree[0]?.children.length, 0);
  assert.equal(tree[1]?.activity.id, 'task-worker');
  assert.equal(tree[1]?.children.length, 1);
  assert.equal(tree[1]?.children[0]?.activity.id, 'worker-grep');
});

interface ToolActivityModule {
  buildActivityTree: (activities: ToolActivity[]) => Array<{
    activity: ToolActivity;
    children: Array<{ activity: ToolActivity; children: unknown[] }>;
  }>;
}

interface ToolActivity {
  id: string;
  type: 'tool';
  status: 'completed';
  toolName: string;
  toolUseId?: string;
  parentId?: string;
  timestamp: number;
}

async function loadToolActivityModule(): Promise<ToolActivityModule> {
  return import(pathToFileURL(toolActivityPath).href) as Promise<ToolActivityModule>;
}
