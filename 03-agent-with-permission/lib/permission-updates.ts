import type { PermissionUpdate } from '@anthropic-ai/claude-agent-sdk';

function isDirectoryAccessSuggestion(update: PermissionUpdate): boolean {
  return update.type === 'addDirectories';
}

export function getAllowPermissionUpdates(
  toolName: string,
  decisionReason: string | undefined,
  suggestions: PermissionUpdate[] | undefined,
): PermissionUpdate[] | undefined {
  if (!suggestions?.length) {
    return undefined;
  }

  // When Claude reports a path is outside allowed working directories,
  // a plain "allow once" still needs the suggested directory grant so the
  // in-flight task can continue reading the requested file path.
  if (decisionReason?.includes('outside allowed working directories')) {
    const directoryUpdates = suggestions.filter(isDirectoryAccessSuggestion);
    return directoryUpdates.length > 0 ? directoryUpdates : undefined;
  }

  // Mutation-capable tools often need the SDK's suggested permission update
  // for the approved action to continue in the current session.
  if (toolName === 'Edit' || toolName === 'Write' || toolName === 'Bash') {
    return suggestions;
  }

  return undefined;
}
