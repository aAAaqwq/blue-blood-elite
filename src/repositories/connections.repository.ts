import type { SupabaseClient } from "@supabase/supabase-js";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export type ConnectionWithUser = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    school: string | null;
    company: string | null;
    direction: string | null;
  };
};

type ConnectionRecord = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    nickname: string;
    avatar_url: string | null;
    school: string | null;
    company: string | null;
    direction: string | null;
  } | null;
};

/**
 * 获取用户的所有连接（发送和接收的）
 */
export async function getUserConnections(
  supabase: SupabaseClient,
  userId: string,
): Promise<ConnectionWithUser[]> {
  const result = await supabase
    .from("connections")
    .select(
      `id,from_user_id,to_user_id,status,message,created_at,updated_at,
      from_user:users!connections_from_user_id_fkey(id,nickname,avatar_url,school,company,direction),
      to_user:users!connections_to_user_id_fkey(id,nickname,avatar_url,school,company,direction)`,
    )
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((record: unknown) => {
    const r = record as {
      id: string;
      from_user_id: string;
      to_user_id: string;
      status: string;
      message: string | null;
      created_at: string;
      updated_at: string;
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
    };

    // 确定对方用户
    const isIncoming = r.to_user_id === userId;
    const otherUser = isIncoming ? r.from_user : r.to_user;

    return {
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      status: r.status as ConnectionStatus,
      message: r.message,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      otherUser: {
        id: otherUser?.id ?? "",
        nickname: otherUser?.nickname ?? "未知用户",
        avatarUrl: otherUser?.avatar_url ?? null,
        school: otherUser?.school ?? null,
        company: otherUser?.company ?? null,
        direction: otherUser?.direction ?? null,
      },
    };
  });
}

/**
 * 获取待处理的连接请求
 */
export async function getPendingConnections(
  supabase: SupabaseClient,
  userId: string,
): Promise<ConnectionWithUser[]> {
  const allConnections = await getUserConnections(supabase, userId);
  return allConnections.filter(
    (c) => c.status === "pending" && c.toUserId === userId,
  );
}

/**
 * 检查两个用户之间的连接状态
 */
export async function getConnectionBetweenUsers(
  supabase: SupabaseClient,
  userId1: string,
  userId2: string,
): Promise<ConnectionWithUser | null> {
  const result = await supabase
    .from("connections")
    .select(
      `id,from_user_id,to_user_id,status,message,created_at,updated_at,
      from_user:users!connections_from_user_id_fkey(id,nickname,avatar_url,school,company,direction),
      to_user:users!connections_to_user_id_fkey(id,nickname,avatar_url,school,company,direction)`,
    )
    .or(
      `and(from_user_id.eq.${userId1},to_user_id.eq.${userId2}),and(from_user_id.eq.${userId2},to_user_id.eq.${userId1})`,
    )
    .maybeSingle();

  if (result.error || !result.data) {
    return null;
  }

  const r = result.data as unknown as {
    id: string;
    from_user_id: string;
    to_user_id: string;
    status: string;
    message: string | null;
    created_at: string;
    updated_at: string;
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
  };

  const isIncoming = r.to_user_id === userId1;
  const otherUser = isIncoming ? r.from_user : r.to_user;

  return {
    id: r.id,
    fromUserId: r.from_user_id,
    toUserId: r.to_user_id,
    status: r.status as ConnectionStatus,
    message: r.message,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    otherUser: {
      id: otherUser?.id ?? "",
      nickname: otherUser?.nickname ?? "未知用户",
      avatarUrl: otherUser?.avatar_url ?? null,
      school: otherUser?.school ?? null,
      company: otherUser?.company ?? null,
      direction: otherUser?.direction ?? null,
    },
  };
}

/**
 * 检查用户是否可以连接另一个用户
 */
export async function canConnectWithUser(
  supabase: SupabaseClient,
  fromUserId: string,
  toUserId: string,
): Promise<{ canConnect: boolean; reason?: string }> {
  // 不能连接自己
  if (fromUserId === toUserId) {
    return { canConnect: false, reason: "不能与自己建立连接" };
  }

  // 检查是否已有连接
  const existing = await getConnectionBetweenUsers(supabase, fromUserId, toUserId);
  if (existing) {
    if (existing.status === "accepted") {
      return { canConnect: false, reason: "你们已经是连接关系" };
    }
    if (existing.status === "pending") {
      if (existing.fromUserId === fromUserId) {
        return { canConnect: false, reason: "你已经发送了连接请求" };
      }
      return { canConnect: false, reason: "对方已向你发送连接请求" };
    }
  }

  return { canConnect: true };
}

/**
 * 创建连接请求
 */
export async function createConnection(
  supabase: SupabaseClient,
  fromUserId: string,
  toUserId: string,
  message?: string,
): Promise<{ success: boolean; error?: string; connectionId?: string }> {
  const { canConnect, reason } = await canConnectWithUser(supabase, fromUserId, toUserId);
  if (!canConnect) {
    return { success: false, error: reason };
  }

  const result = await supabase
    .from("connections")
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      status: "pending",
      message: message?.trim() || null,
    })
    .select("id")
    .single();

  if (result.error) {
    return { success: false, error: "发送连接请求失败" };
  }

  return { success: true, connectionId: result.data.id };
}

/**
 * 接受连接请求
 */
export async function acceptConnection(
  supabase: SupabaseClient,
  connectionId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  // 验证连接存在且是当前用户的待处理请求
  const connection = await supabase
    .from("connections")
    .select("to_user_id,status")
    .eq("id", connectionId)
    .single();

  if (connection.error || !connection.data) {
    return { success: false, error: "连接请求不存在" };
  }

  if (connection.data.to_user_id !== userId) {
    return { success: false, error: "无权操作此连接请求" };
  }

  if (connection.data.status !== "pending") {
    return { success: false, error: "此请求已被处理" };
  }

  const result = await supabase
    .from("connections")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", connectionId);

  if (result.error) {
    return { success: false, error: "接受连接失败" };
  }

  return { success: true };
}

/**
 * 拒绝连接请求
 */
export async function rejectConnection(
  supabase: SupabaseClient,
  connectionId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const connection = await supabase
    .from("connections")
    .select("to_user_id,status")
    .eq("id", connectionId)
    .single();

  if (connection.error || !connection.data) {
    return { success: false, error: "连接请求不存在" };
  }

  if (connection.data.to_user_id !== userId) {
    return { success: false, error: "无权操作此连接请求" };
  }

  if (connection.data.status !== "pending") {
    return { success: false, error: "此请求已被处理" };
  }

  const result = await supabase
    .from("connections")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", connectionId);

  if (result.error) {
    return { success: false, error: "拒绝连接失败" };
  }

  return { success: true };
}
