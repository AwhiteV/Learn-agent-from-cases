export const DEFAULT_MODEL = 'claude-sonnet-4-6';

export function getConfiguredModel(envValue: string | undefined): string {
  const trimmedValue = envValue?.trim();
  return trimmedValue ? trimmedValue : DEFAULT_MODEL;
}
