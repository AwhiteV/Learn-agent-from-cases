"use client";

import { useEffect, useState } from "react";
import { Clock, MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { SessionMetadata } from "@/lib/storage";

interface SessionListProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number;
}

export function SessionList({
  currentSessionId,
  onSessionSelect,
  onNewChat,
  refreshTrigger,
}: SessionListProps) {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      void loadSessions();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (currentSessionId) {
      const timer = setTimeout(() => {
        void loadSessions();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentSessionId]);

  async function loadSessions() {
    try {
      const response = await fetch("/api/sessions");
      const payload = (await response.json()) as { sessions?: SessionMetadata[] };
      setSessions(payload.sessions ?? []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString();
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50/60" data-learning-target="session-list">
      <div className="space-y-3 p-4">
        <h2 className="text-lg font-semibold">Chat History</h2>
        <Button className="w-full" data-learning-target="new-chat-button" onClick={onNewChat} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No chat history</div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => (
              <Card
                key={session.sessionId}
                className={`cursor-pointer p-3 transition-colors hover:bg-slate-100 ${
                  currentSessionId === session.sessionId ? "bg-slate-100" : ""
                }`}
                onClick={() => onSessionSelect(session.sessionId)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.sessionId.replace("session-", "Chat ")}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
