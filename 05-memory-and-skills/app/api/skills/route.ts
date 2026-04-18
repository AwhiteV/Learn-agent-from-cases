import { NextResponse } from "next/server";

import { skillPresets } from "@/lib/skill-presets";

export async function GET() {
  return NextResponse.json({ skills: skillPresets });
}
