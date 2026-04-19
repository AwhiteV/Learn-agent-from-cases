import { getStorage } from "@/lib/storage";

export async function GET() {
  const storage = getStorage(process.cwd());
  await storage.initialize();
  const sessions = await storage.listSessions();

  return new Response(JSON.stringify({ sessions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
