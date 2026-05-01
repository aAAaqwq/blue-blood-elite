import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getNotifications } from "@/repositories/notifications.repository";
import { Bell, CheckCheck, ArrowRight, AlertCircle, CheckCircle, XCircle, FileText, UserPlus } from "lucide-react";

const notificationTypeLabels: Record<string, string> = {
  application_received: "新申请",
  application_accepted: "申请通过",
  application_rejected: "申请未通过",
  delivery_received: "新交付",
  delivery_accepted: "交付确认",
  delivery_rejected: "交付未通过",
};

const notificationTypeIcons: Record<string, React.ReactNode> = {
  application_received: <UserPlus className="w-4 h-4" />,
  application_accepted: <CheckCircle className="w-4 h-4" />,
  application_rejected: <XCircle className="w-4 h-4" />,
  delivery_received: <FileText className="w-4 h-4" />,
  delivery_accepted: <CheckCircle className="w-4 h-4" />,
  delivery_rejected: <XCircle className="w-4 h-4" />,
};

const notificationTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  application_received: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.3)" },
  application_accepted: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" },
  application_rejected: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" },
  delivery_received: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)" },
  delivery_accepted: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" },
  delivery_rejected: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" },
};

export default function NotificationsPage() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [markError, setMarkError] = useState<string | null>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getNotifications(supabase, userId!);
    },
    enabled: !!userId,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId!)
        .eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setMarkError(null);
    },
    onError: (err: Error) => setMarkError(err.message),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between pb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">通知</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {unreadCount} 条未读通知
              </span>
            ) : (
              "暂无新通知"
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="btn-secondary inline-flex items-center gap-2 text-[13px]"
          >
            <CheckCheck className="w-4 h-4" />
            全部已读
          </button>
        )}
      </div>
      {markError && <p className="text-sm text-red-400 mb-3">{markError}</p>}

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const typeStyle = notificationTypeColors[notification.type] ?? {
              bg: "rgba(148, 163, 184, 0.15)",
              text: "#94A3B8",
              border: "rgba(148, 163, 184, 0.3)",
            };
            const typeIcon = notificationTypeIcons[notification.type] ?? <Bell className="w-4 h-4" />;
            const typeLabel = notificationTypeLabels[notification.type] ?? "通知";

            return (
              <article
                key={notification.id}
                className={`rounded-2xl border p-5 transition-all ${
                  !notification.isRead
                    ? "border-blue-500/30 bg-blue-800/30"
                    : "border-blue-600/30 bg-blue-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-400 animate-pulse" />
                  )}
                  {notification.isRead && (
                    <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-600/50" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Type Badge */}
                    <span
                      className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
                      style={{
                        backgroundColor: typeStyle.bg,
                        color: typeStyle.text,
                        borderColor: typeStyle.border,
                      }}
                    >
                      {typeIcon}
                      {typeLabel}
                    </span>

                    {/* Title */}
                    <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
                      {notification.title}
                    </h3>

                    {/* Content */}
                    {notification.content && (
                      <p className="text-[14px] text-text-secondary leading-relaxed mb-3">
                        {notification.content}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-text-tertiary">
                        {new Date(notification.createdAt).toLocaleString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {notification.relatedId && (
                        <Link
                          to={`/tasks/${notification.relatedId}`}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-400 hover:text-gold-500 transition-colors"
                        >
                          查看详情
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-800 border border-blue-600/30">
              <Bell className="w-10 h-10 text-text-tertiary" />
            </div>
            <p className="text-lg font-semibold text-text-primary mb-2">暂无通知</p>
            <p className="text-sm text-text-secondary">当有新的任务动态时，您会在这里收到通知</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
