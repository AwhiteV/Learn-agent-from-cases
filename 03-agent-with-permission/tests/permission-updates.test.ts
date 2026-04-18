import assert from 'node:assert/strict';
import test from 'node:test';

import type { PermissionUpdate } from '@anthropic-ai/claude-agent-sdk';

import { getAllowPermissionUpdates } from '../lib/permission-updates.ts';

test('getAllowPermissionUpdates keeps directory suggestions for blocked path approvals', () => {
  const suggestions: PermissionUpdate[] = [
    {
      type: 'addDirectories',
      directories: ['/Users/timo/projects/claude-agent-sdk-master'],
      destination: 'session',
    },
    {
      type: 'addRules',
      rules: [{ toolName: 'Read' }],
      behavior: 'allow',
      destination: 'session',
    },
  ];

  assert.deepEqual(
    getAllowPermissionUpdates('Read', 'Path is outside allowed working directories', suggestions),
    [
      {
        type: 'addDirectories',
        directories: ['/Users/timo/projects/claude-agent-sdk-master'],
        destination: 'session',
      },
    ],
  );
});

test('getAllowPermissionUpdates ignores unrelated suggestions for normal allow', () => {
  const suggestions: PermissionUpdate[] = [
    {
      type: 'addRules',
      rules: [{ toolName: 'Read' }],
      behavior: 'allow',
      destination: 'session',
    },
  ];

  assert.equal(getAllowPermissionUpdates('Read', 'Tool needs approval', suggestions), undefined);
});

test('getAllowPermissionUpdates keeps edit suggestions so file writes can proceed', () => {
  const suggestions: PermissionUpdate[] = [
    {
      type: 'setMode',
      mode: 'acceptEdits',
      destination: 'session',
    },
  ];

  assert.deepEqual(
    getAllowPermissionUpdates('Edit', 'Claude wants to edit a file', suggestions),
    suggestions,
  );
});

test('getAllowPermissionUpdates keeps bash suggestions so approved commands can proceed', () => {
  const suggestions: PermissionUpdate[] = [
    {
      type: 'addRules',
      rules: [{ toolName: 'Bash', ruleContent: 'printf *' }],
      behavior: 'allow',
      destination: 'session',
    },
  ];

  assert.deepEqual(
    getAllowPermissionUpdates('Bash', 'Claude wants to run a shell command', suggestions),
    suggestions,
  );
});
