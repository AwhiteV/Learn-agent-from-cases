import assert from 'node:assert/strict';
import test from 'node:test';

import { getDefaultOptions } from '../packages/shared/src/agent/options.ts';

test('getDefaultOptions forwards additionalDirectories to the SDK options', () => {
  const options = getDefaultOptions({
    workingDirectory: '/Users/timo/projects/claude-agent-sdk-master/03-agent-with-permission',
    additionalDirectories: ['/Users/timo/projects/claude-agent-sdk-master'],
  });

  assert.deepEqual(options.additionalDirectories, [
    '/Users/timo/projects/claude-agent-sdk-master',
  ]);
});
