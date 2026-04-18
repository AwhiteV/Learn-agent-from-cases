import { NextResponse } from "next/server";

import { getProviderById, getProviderSummaries } from "@/lib/providers";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

export async function POST(request: Request) {
  let payload: Partial<ChatRequestBody>;

  try {
    payload = (await request.json()) as Partial<ChatRequestBody>;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof payload.message !== "string" ||
    payload.message.trim().length === 0 ||
    typeof payload.providerId !== "string"
  ) {
    return NextResponse.json(
      { error: "message and providerId are required." },
      { status: 400 },
    );
  }

  const provider = getProviderById(payload.providerId);

  if (!provider) {
    return NextResponse.json({ error: "Unknown providerId." }, { status: 400 });
  }

  const result = await provider.run({ message: payload.message.trim() });
  const providerSummary = getProviderSummaries().find(
    (summary) => summary.id === provider.id,
  );

  if (!providerSummary) {
    return NextResponse.json(
      { error: "Provider summary configuration is missing." },
      { status: 500 },
    );
  }

  const responseBody: ChatResponseBody = {
    provider: providerSummary,
    result,
  };

  return NextResponse.json(responseBody);
}
