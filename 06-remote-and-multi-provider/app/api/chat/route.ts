import { NextResponse } from "next/server";

import { getProviderById, getProviderSummaries } from "@/lib/providers";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

export async function POST(request: Request) {
  let payload: Partial<ChatRequestBody>;

  try {
    payload = (await request.json()) as Partial<ChatRequestBody>;
  } catch {
    return NextResponse.json(
      { error: "请求体必须是合法的 JSON。" },
      { status: 400 },
    );
  }

  if (
    typeof payload.message !== "string" ||
    payload.message.trim().length === 0 ||
    typeof payload.providerId !== "string"
  ) {
    return NextResponse.json(
      { error: "message 和 providerId 都是必填项。" },
      { status: 400 },
    );
  }

  const provider = getProviderById(payload.providerId);

  if (!provider) {
    return NextResponse.json({ error: "未知的 providerId。" }, { status: 400 });
  }

  const result = await provider.run({ message: payload.message.trim() });
  const providerSummary = getProviderSummaries().find(
    (summary) => summary.id === provider.id,
  );

  if (!providerSummary) {
    return NextResponse.json(
      { error: "缺少 Provider 摘要配置。" },
      { status: 500 },
    );
  }

  const responseBody: ChatResponseBody = {
    provider: providerSummary,
    result,
  };

  return NextResponse.json(responseBody);
}
