import { useEffect, useRef, useState, useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import type { MessageWithUser } from "@/repositories/messages.repository";

interface UseRealtimeChatOptions {
  currentUserId: string;
  otherUserId: string;
  queryClient: QueryClient;
}

interface UseRealtimeChatReturn {
  isOtherUserOnline: boolean;
  isOtherUserTyping: boolean;
  sendTypingIndicator: () => void;
}

const TYPING_TIMEOUT_MS = 3000;

export function useRealtimeChat({
  currentUserId,
  otherUserId,
  queryClient,
}: UseRealtimeChatOptions): UseRealtimeChatReturn {
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const sendTypingIndicator = useCallback(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase || !channelRef.current) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId },
    });
  }, [currentUserId]);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;

    // Deterministic channel name: sorted IDs
    const ids = [currentUserId, otherUserId].sort();
    const channelName = `dm:${ids[0]}:${ids[1]}`;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentUserId } },
    });
    channelRef.current = channel;

    // --- Presence: online status ---
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ online_at: string }>();
      const otherIsOnline = otherUserId in state;
      setIsOtherUserOnline(otherIsOnline);
    });

    channel.on("presence", { event: "join" }, ({ key }) => {
      if (key === otherUserId) {
        setIsOtherUserOnline(true);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      if (key === otherUserId) {
        setIsOtherUserOnline(false);
      }
    });

    // --- Postgres Changes: new messages ---
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId}))`,
      },
      (payload) => {
        const record = payload.new as {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };

        const queryKey = ["messages", currentUserId, otherUserId];

        queryClient.setQueryData<MessageWithUser[]>(queryKey, (old) => {
          if (!old) return old;

          // Avoid duplicates (mutation may already have inserted)
          if (old.some((m) => m.id === record.id)) return old;

          const newMessage: MessageWithUser = {
            id: record.id,
            senderId: record.sender_id,
            receiverId: record.receiver_id,
            content: record.content,
            isRead: record.is_read,
            createdAt: record.created_at,
            sender: {
              id: record.sender_id,
              nickname: "",
              avatarUrl: null,
            },
          };

          return [...old, newMessage];
        });
      },
    );

    // --- Broadcast: typing indicator ---
    channel.on("broadcast", { event: "typing" }, (payload) => {
      const senderId = (payload.payload as { user_id?: string })?.user_id;
      if (senderId === otherUserId) {
        setIsOtherUserTyping(true);

        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        typingTimerRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, TYPING_TIMEOUT_MS);
      }
    });

    // Subscribe then track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, queryClient]);

  return { isOtherUserOnline, isOtherUserTyping, sendTypingIndicator };
}
