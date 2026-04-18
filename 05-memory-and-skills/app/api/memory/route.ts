import { NextResponse } from "next/server";

import { memoryStore } from "@/lib/memory-store";
import type { MemoryEntry } from "@/lib/types";

function isValidCategory(category: string): category is MemoryEntry["category"] {
  return category === "preference" || category === "project" || category === "goal";
}

export async function GET() {
  const memories = await memoryStore.list();

  return NextResponse.json({ memories });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<MemoryEntry>;

  if (
    typeof payload.title !== "string" ||
    payload.title.trim().length === 0 ||
    typeof payload.content !== "string" ||
    payload.content.trim().length === 0 ||
    typeof payload.category !== "string" ||
    !isValidCategory(payload.category)
  ) {
    return NextResponse.json(
      { error: "A title, content, and valid category are required." },
      { status: 400 },
    );
  }

  const memory = await memoryStore.create({
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category,
  });

  return NextResponse.json({ memory }, { status: 201 });
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
