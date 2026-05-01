import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getUnreadNotificationCount } from "@/repositories/notifications.repository";
import { getUnreadMessageCount } from "@/repositories/messages.repository";
import { getPendingConnections } from "@/repositories/connections.repository";
import { Settings, ChevronRight, Star, Users, MessageCircle, FileText, Bell, Award } from "lucide-react";

const levelLabels: Record<number, string> = {
  1: "青铜",
  2: "白银",
  3: "黄金",
  4: "铂金",
  5: "钻石",
};

const levelColors: Record<number, string> = {
  1: "#CD7F32",
  2: "#C0C0C0",
  3: "#D4A853",
  4: "#E5E4E2",
  5: "#B9F2FF",
};

const menuItems = [
  {
    to: "/me/connections",
    icon: Users,
    iconColor: "#3B8AFF",
    iconBg: "rgba(59, 138, 255, 0.15)",
    title: "我的连接",
    desc: "管理连接关系",
    badgeKey: "pendingConnectionCount",
  },
  {
    to: "/me/messages",
    icon: MessageCircle,
    iconColor: "#10B981",
    iconBg: "rgba(16, 185, 129, 0.15)",
    title: "我的消息",
    desc: "与连接伙伴交流",
    badgeKey: "unreadMessageCount",
  },
  {
    to: "/me/bounties",
    icon: FileText,
    iconColor: "#A78BFA",
    iconBg: "rgba(167, 139, 250, 0.15)",
    title: "我的任务",
    desc: "发布与认领",
    badgeKey: null,
  },
  {
    to: "/notifications",
    icon: Bell,
    iconColor: "#F59E0B",
    iconBg: "rgba(245, 158, 11, 0.15)",
    title: "我的通知",
    desc: "查看系统通知",
    badgeKey: "unreadNotificationCount",
  },
  {
    to: "/verify",
    icon: Award,
    iconColor: "#10B981",
    iconBg: "rgba(16, 185, 129, 0.15)",
    title: "VERIFIED 认证",
    desc: "获取精英标识",
    badgeKey: null,
    isLast: true,
  },
];

export default function MePage() {
  const { userId } = useAuth();

  const { data: user } = useQuery({
    queryKey: ["me-profile", userId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("users")
        .select("nickname, school, is_verified, level, points")
        .eq("id", userId!)
        .single();
      if (!data) return null;
      return {
        nickname: data.nickname,
        school: data.school,
        isVerified: data.is_verified ?? false,
        level: data.level ?? 1,
        points: data.points ?? 0,
      };
    },
    enabled: !!userId,
  });

  const { data: unreadNotificationCount = 0 } = useQuery({
    queryKey: ["unread-notifications", userId],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getUnreadNotificationCount(supabase, userId!);
    },
    enabled: !!userId,
  });

  const { data: unreadMessageCount = 0 } = useQuery({
    queryKey: ["unread-messages", userId],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getUnreadMessageCount(supabase, userId!);
    },
    enabled: !!userId,
  });

  const { data: pendingConnectionCount = 0 } = useQuery({
    queryKey: ["pending-connections", userId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      return (await getPendingConnections(supabase, userId!)).length;
    },
    enabled: !!userId,
  });

  const levelColor = levelColors[user?.level ?? 1];
  const levelLabel = levelLabels[user?.level ?? 1] ?? "青铜";

  return (
    <AppShell>
      {/* Profile Header */}
      <section className="section-gap">
        <div className="card-interactive flex flex-col items-center py-8 text-center">
          {/* Avatar with Glow Effect */}
          <div className="relative mb-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-[26px] font-bold text-white shadow-lg"
              style={{
                background: user?.isVerified
                  ? "linear-gradient(135deg, #3B8AFF, #D4A853)"
                  : "linear-gradient(135deg, #3B8AFF, #6B8DB5)",
              }}
            >
              {user?.nickname?.[0] ?? "?"}
            </div>
            {/* Verified Badge */}
            {user?.isVerified && (
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-900 bg-emerald-500 shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-xl font-bold text-text-primary">
            {user?.nickname ?? "未登录"}
          </h1>

          {/* School/Title */}
          <p className="mt-1 text-sm text-text-secondary">
            {user?.school ? user.school : "加入蓝血菁英，开启精英之路"}
          </p>

          {/* Level Badge */}
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{
              backgroundColor: `${levelColor}20`,
              color: levelColor,
            }}
          >
            <Star className="w-3.5 h-3.5" />
            {levelLabel}等级
          </div>

          {/* Edit Profile Button */}
          <Link
            to="/profile/edit"
            className="btn-secondary mt-5 inline-flex items-center gap-2 text-[13px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            编辑资料
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="section-gap">
        <div className="grid grid-cols-2 gap-3">
          {/* Wallet */}
          <div className="card-interactive">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-text-tertiary">我的钱包</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
            </div>
            <div className="text-xl font-bold text-gold-500">¥0</div>
            <div className="mt-2 text-[12px] text-blue-400 hover:text-blue-300 cursor-pointer">
              立即提现 →
            </div>
          </div>

          {/* Level Progress */}
          <div className="card-interactive">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-text-tertiary">成长等级</span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${levelColor}20` }}
              >
                <Star className="w-4 h-4" style={{ color: levelColor }} />
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: levelColor }}>
              {levelLabel}
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 rounded-full bg-blue-700">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: "60%",
                  backgroundColor: levelColor,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu List */}
      <section className="section-gap">
        <div className="ios-group">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = item.badgeKey === "pendingConnectionCount"
              ? pendingConnectionCount
              : item.badgeKey === "unreadMessageCount"
                ? unreadMessageCount
                : item.badgeKey === "unreadNotificationCount"
                  ? unreadNotificationCount
                  : 0;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`ios-list-item group ${!item.isLast ? "border-b border-blue-600/50" : ""}`}
              >
                {/* Icon */}
                <div
                  className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: item.iconBg,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-text-primary">
                    {item.title}
                  </div>
                  <div className="text-[12px] text-text-tertiary">
                    {item.desc}
                  </div>
                </div>

                {/* Badge */}
                {badgeCount > 0 && (
                  <span className="mr-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}

                {/* Arrow */}
                <div className="text-text-tertiary transition-transform group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Settings */}
      <section className="section-gap">
        <Link
          to="/settings"
          className="ios-list-item group"
        >
          <div
            className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(148, 163, 184, 0.15)" }}
          >
            <Settings className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium text-text-primary">设置</div>
            <div className="text-[12px] text-text-tertiary">账户与偏好</div>
          </div>
          <div className="text-text-tertiary">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>
      </section>

      {/* Footer */}
      <footer className="section-gap pb-8 text-center">
        <div className="rounded-full bg-blue-800/50 px-4 py-2 inline-block">
          <span className="text-[12px] text-text-tertiary">
            蓝血菁英 v2.0 · OPENCAIO
          </span>
        </div>
      </footer>
    </AppShell>
  );
}
