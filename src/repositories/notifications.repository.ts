import type { SupabaseClient } from "@supabase/supabase-js";

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationRecord = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};

/**
 * 获取用户的通知列表
 */
export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<Notification[]> {
  const result = await supabase
    .from("notifications")
    .select("id,user_id,type,title,content,related_id,is_read,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((record: unknown) => {
    const r = record as NotificationRecord;
    return {
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      content: r.content,
      relatedId: r.related_id,
      isRead: r.is_read,
      createdAt: r.created_at,
    };
  });
}

/**
 * 获取未读通知数量
 */
export async function getUnreadNotificationCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const result = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return result.count ?? 0;
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(
  supabase: SupabaseClient,
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  return !result.error;
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsAsRead(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return !result.error;
}
