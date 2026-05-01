import type { SupabaseClient } from "@supabase/supabase-js";

export type MessageWithUser = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
  };
};

type Conversation = {
  otherUser: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    school: string | null;
    company: string | null;
    direction: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    isRead: boolean;
    createdAt: string;
  } | null;
  unreadCount: number;
};

/**
 * 获取两个用户之间的对话消息
 */
export async function getMessagesBetweenUsers(
  supabase: SupabaseClient,
  userId1: string,
  userId2: string,
  limit = 50,
): Promise<MessageWithUser[]> {
  const result = await supabase
    .from("messages")
    .select(
      `id,sender_id,receiver_id,content,is_read,created_at,
      sender:users!messages_sender_id_fkey(id,nickname,avatar_url)`,
    )
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`,
    )
    .order("created_at", { ascending: true })
    .limit(limit);

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((record: unknown) => {
    const r = record as {
      id: string;
      sender_id: string;
      receiver_id: string;
      content: string;
      is_read: boolean;
      created_at: string;
      sender: {
        id: string;
        nickname: string;
        avatar_url: string | null;
      } | null;
    };

    return {
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      content: r.content,
      isRead: r.is_read,
      createdAt: r.created_at,
      sender: {
        id: r.sender?.id ?? r.sender_id,
        nickname: r.sender?.nickname ?? "未知用户",
        avatarUrl: r.sender?.avatar_url ?? null,
      },
    };
  });
}

/**
 * 发送消息
 */
export async function sendMessage(
  supabase: SupabaseClient,
  senderId: string,
  receiverId: string,
  content: string,
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!content.trim()) {
    return { success: false, error: "消息内容不能为空" };
  }

  if (content.trim().length > 2000) {
    return { success: false, error: "消息内容超过2000字符限制" };
  }

  const result = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
    })
    .select("id")
    .single();

  if (result.error) {
    return { success: false, error: "发送消息失败" };
  }

  return { success: true, messageId: result.data.id };
}

/**
 * 标记消息为已读
 */
export async function markMessagesAsRead(
  supabase: SupabaseClient,
  userId: string,
  senderId: string,
): Promise<void> {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", senderId)
    .eq("is_read", false);
}

/**
 * 获取用户的对话列表
 */
export async function getConversations(
  supabase: SupabaseClient,
  userId: string,
): Promise<Conversation[]> {
  // 获取用户所有已接受的连接
  const { data: connections } = await supabase
    .from("connections")
    .select(
      `from_user_id,to_user_id,
      from_user:users!connections_from_user_id_fkey(id,nickname,avatar_url,school,company,direction),
      to_user:users!connections_to_user_id_fkey(id,nickname,avatar_url,school,company,direction)`,
    )
    .eq("status", "accepted")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

  if (!connections || connections.length === 0) {
    return [];
  }

  const conversations: Conversation[] = [];

  for (const conn of connections as unknown as Array<{
    from_user_id: string;
    to_user_id: string;
    from_user: {
      id: string;
      nickname: string;
      avatar_url: string | null;
      school: string | null;
      company: string | null;
      direction: string | null;
    } | null;
    to_user: {
      id: string;
      nickname: string;
      avatar_url: string | null;
      school: string | null;
      company: string | null;
      direction: string | null;
    } | null;
  }>) {
    const otherUser =
      conn.from_user_id === userId ? conn.to_user : conn.from_user;
    const otherUserId =
      conn.from_user_id === userId ? conn.to_user_id : conn.from_user_id;

    if (!otherUser) continue;

    // 获取最后一条消息
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("id,content,sender_id,is_read,created_at")
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`,
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 获取未读消息数
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("sender_id", otherUserId)
      .eq("is_read", false);

    conversations.push({
      otherUser: {
        id: otherUser.id,
        nickname: otherUser.nickname,
        avatarUrl: otherUser.avatar_url ?? null,
        school: otherUser.school ?? null,
        company: otherUser.company ?? null,
        direction: otherUser.direction ?? null,
      },
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            senderId: lastMsg.sender_id,
            isRead: lastMsg.is_read,
            createdAt: lastMsg.created_at,
          }
        : null,
      unreadCount: count ?? 0,
    });
  }

  // 按最后消息时间排序
  return conversations.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt ?? "";
    const timeB = b.lastMessage?.createdAt ?? "";
    return timeB.localeCompare(timeA);
  });
}

/**
 * 获取用户的未读消息总数
 */
export async function getUnreadMessageCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}
