import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { getConversations } from "@/repositories/messages.repository";

export default function MessagesPage() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return [];
      return getConversations(supabase, userId!);
    },
    enabled: !!userId,
  });

  // Realtime: invalidate conversations when a new message arrives
  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase || !userId) return;

    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return (
    <AppShell>
      <div className="flex items-center gap-3 pb-6 pt-2">
        <Link to="/me" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--label-secondary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <h1 className="text-title-1">消息</h1>
      </div>

      {conversations.length > 0 ? (
        <div className="ios-group">
          {conversations.map((conv, index) => (
            <Link
              key={conv.otherUser.id}
              to={`/me/messages/${conv.otherUser.id}`}
              className={`ios-list-item ${index !== conversations.length - 1 ? "border-b border-[var(--separator)]" : ""}`}
            >
              <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[17px] font-semibold text-white">{conv.otherUser.nickname[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[17px] font-semibold truncate">{conv.otherUser.nickname}</span>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--red)] px-1.5 text-[11px] font-semibold text-white">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="text-[15px] text-[var(--label-secondary)] truncate">
                  {conv.lastMessage ? <>{conv.lastMessage.senderId === conv.otherUser.id ? "" : "我: "}{conv.lastMessage.content}</> : "点击开始聊天"}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--label-quaternary)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[28px]">{"\uD83D\uDCAC"}</div>
          <p className="text-body text-[var(--label-secondary)] mb-2">暂无消息</p>
          <p className="text-footnote text-[var(--label-tertiary)] mb-4">与已连接的用户开始对话</p>
          <Link to="/me/connections" className="rounded-full bg-[var(--blue)] px-6 py-3 text-[17px] font-semibold text-white">查看连接</Link>
        </div>
      )}
    </AppShell>
  );
}
