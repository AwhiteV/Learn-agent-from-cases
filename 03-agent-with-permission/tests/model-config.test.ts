import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_MODEL, getConfiguredModel } from '../lib/model-config.ts';

test('getConfiguredModel returns the configured env model when present', () => {
  assert.equal(getConfiguredModel('minimax/minimax-m2.7'), 'minimax/minimax-m2.7');
});

test('getConfiguredModel falls back to the default model for blank values', () => {
  assert.equal(getConfiguredModel('   '), DEFAULT_MODEL);
  assert.equal(getConfiguredModel(undefined), DEFAULT_MODEL);
});
