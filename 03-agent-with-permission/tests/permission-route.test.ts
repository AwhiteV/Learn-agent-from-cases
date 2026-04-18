import assert from 'node:assert/strict';
import test from 'node:test';

import type { PermissionUpdate } from '@anthropic-ai/claude-agent-sdk';

import { createPermissionResult } from '../lib/permission-result.ts';

test('createPermissionResult returns an allow result with typed permission updates', () => {
  const updates: PermissionUpdate[] = [
    {
      destination: 'session',
      path: ['permissions', 'edit'],
      value: true,
    },
  ];

  const result = createPermissionResult({
    requestId: 'req-1',
    behavior: 'allow',
    updatedInput: { answer: 'ok' },
    updatedPermissions: updates,
  });

  assert.deepEqual(result, {
    behavior: 'allow',
    updatedInput: { answer: 'ok' },
    updatedPermissions: updates,
  });
});

test('createPermissionResult falls back to an empty updatedInput object for allow', () => {
  const result = createPermissionResult({
    behavior: 'allow',
  });

  assert.deepEqual(result, {
    behavior: 'allow',
    updatedInput: {},
  });
});

test('createPermissionResult falls back to a default deny message', () => {
  const result = createPermissionResult({
    requestId: 'req-2',
    behavior: 'deny',
  });

  assert.deepEqual(result, {
    behavior: 'deny',
    message: 'User denied permission',
  });
});
