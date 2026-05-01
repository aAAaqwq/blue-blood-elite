import { useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRealtimeChat } from "@/lib/hooks/use-realtime-chat";
import { getMessagesBetweenUsers, markMessagesAsRead } from "@/repositories/messages.repository";
import { getConnectionBetweenUsers } from "@/repositories/connections.repository";

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function ChatPage() {
  const { userId: otherUserId } = useParams();
  const { userId: currentUserId } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const { isOtherUserOnline, isOtherUserTyping, sendTypingIndicator } = useRealtimeChat({
    currentUserId: currentUserId ?? "",
    otherUserId: otherUserId ?? "",
    queryClient,
  });

  const { data: connection } = useQuery({
    queryKey: ["connection", currentUserId, otherUserId],
    queryFn: () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return null;
      return getConnectionBetweenUsers(supabase, currentUserId!, otherUserId!);
    },
    enabled: !!currentUserId && !!otherUserId,
  });

  const { data: otherUser } = useQuery({
    queryKey: ["chat-user", otherUserId],
    queryFn: async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return null;
      const { data } = await supabase.from("users").select("id,nickname,avatar_url,school,company,direction").eq("id", otherUserId!).single();
      return data;
    },
    enabled: !!otherUserId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", currentUserId, otherUserId],
    queryFn: () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return [];
      return getMessagesBetweenUsers(supabase, currentUserId!, otherUserId!);
    },
    enabled: !!currentUserId && !!otherUserId && connection?.status === "accepted",
  });

  // Mark messages as read
  useEffect(() => {
    if (currentUserId && otherUserId && messages.length > 0) {
      const supabase = getBrowserSupabaseClient();
      if (supabase) markMessagesAsRead(supabase, currentUserId, otherUserId);
    }
  }, [currentUserId, otherUserId, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) throw new Error("Supabase 客户端未初始化");
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: messageText.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessageText("");
      setSendError(null);
      queryClient.invalidateQueries({ queryKey: ["messages", currentUserId, otherUserId] });
    },
    onError: (err: Error) => setSendError(err.message),
  });

  if (!connection || connection.status !== "accepted") {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-body text-[var(--label-secondary)]">无法访问此对话</p>
          <Link to="/me/messages" className="mt-4 text-[15px] text-[var(--blue)]">返回消息列表</Link>
        </div>
      </AppShell>
    );
  }

  if (!otherUser) return null;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-120px)] flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--separator)]">
          <Link to="/me/messages" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--label-secondary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[15px] font-semibold text-white">{otherUser.nickname[0]}</div>
              {isOtherUserOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-semibold">{otherUser.nickname}</span>
                {isOtherUserOnline && (
                  <span className="text-[12px] text-green-500">在线</span>
                )}
              </div>
              {isOtherUserTyping ? (
                <div className="text-[13px] text-[var(--blue)]">正在输入...</div>
              ) : (
                <div className="text-[13px] text-[var(--label-secondary)]">{otherUser.direction} · {otherUser.school || otherUser.company}</div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[28px]">{"\uD83D\uDC4B"}</div>
              <p className="text-body text-[var(--label-secondary)] mb-1">开始与 {otherUser.nickname} 的对话</p>
              <p className="text-footnote text-[var(--label-tertiary)]">你们已经成功建立连接</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? "bg-[var(--blue)] text-white rounded-br-md" : "bg-[var(--bg-secondary)] text-[var(--label-primary)] rounded-bl-md"}`}>
                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                    <div className={`mt-1 text-[11px] ${isMe ? "text-white/70" : "text-[var(--label-tertiary)]"}`}>{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--separator)] pt-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                sendTypingIndicator();
              }}
              placeholder="输入消息..."
              maxLength={2000}
              disabled={sendMessage.isPending}
              className="ios-input flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                  e.preventDefault();
                  sendMessage.mutate();
                }
              }}
            />
            <button
              onClick={() => { if (messageText.trim()) sendMessage.mutate(); }}
              disabled={sendMessage.isPending || !messageText.trim()}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--blue)] text-white disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
          {sendMessage.isError && (
            <p className="mt-2 text-footnote text-[var(--red)]">{sendError ?? "发送失败，请重试"}</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
