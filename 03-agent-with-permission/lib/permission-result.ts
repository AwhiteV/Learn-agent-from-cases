import type { PermissionResult, PermissionUpdate } from '@anthropic-ai/claude-agent-sdk';

export interface PermissionDecisionInput {
  behavior: 'allow' | 'deny';
  message?: string;
  updatedInput?: Record<string, unknown>;
  updatedPermissions?: PermissionUpdate[];
}

export function createPermissionResult({
  behavior,
  message,
  updatedInput,
  updatedPermissions,
}: PermissionDecisionInput): PermissionResult {
  if (behavior === 'allow') {
    return {
      behavior: 'allow',
      updatedInput: updatedInput ?? {},
      ...(updatedPermissions ? { updatedPermissions } : {}),
    };
  }

  return { behavior: 'deny', message: message || 'User denied permission' };
}
