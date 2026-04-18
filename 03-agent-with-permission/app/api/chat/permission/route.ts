import { NextRequest } from 'next/server';
import type { PermissionUpdate } from '@anthropic-ai/claude-agent-sdk';
import { createPermissionResult } from '@/lib/permission-result';
import { resolvePending } from '@/lib/permission-store';

interface PermissionDecision {
  requestId: string;
  behavior: 'allow' | 'deny';
  message?: string;
  updatedInput?: Record<string, unknown>;
  updatedPermissions?: PermissionUpdate[];
}

export async function POST(req: NextRequest) {
  const body: PermissionDecision = await req.json();
  const { requestId, behavior, message, updatedInput, updatedPermissions } = body;

  if (!requestId || !behavior) {
    return new Response(
      JSON.stringify({ error: 'requestId and behavior are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = createPermissionResult({
    behavior,
    message,
    updatedInput,
    updatedPermissions,
  });

  const resolved = resolvePending(requestId, result);

  return new Response(
    JSON.stringify({ ok: resolved }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
