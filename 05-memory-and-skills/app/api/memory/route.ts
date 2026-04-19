import { NextResponse } from "next/server";

import { memoryStore } from "@/lib/memory-store";

export async function GET() {
  const memories = await memoryStore.list();

  return NextResponse.json({ memories });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const memoryId = searchParams.get("id");

  if (!memoryId) {
    return NextResponse.json(
      { error: "A memory id is required." },
      { status: 400 },
    );
  }

  const deleted = await memoryStore.delete(memoryId);

  if (!deleted) {
    return NextResponse.json({ error: "Memory not found." }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
