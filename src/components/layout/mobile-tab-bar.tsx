import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClientSafely } from "@/lib/supabase/client";
import { getUnreadMessageCount } from "@/repositories/messages.repository";
import { useAuth } from "@/lib/hooks/use-auth";

const tabs = [
  { href: "/discover", label: "发现", icon: "compass" },
  { href: "/growth", label: "成长", icon: "bolt" },
  { href: "/tasks", label: "任务", icon: "building" },
  { href: "/me", label: "我的", icon: "person" },
];

function Icon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "#D4A853" : "#64748B";
  const icons: Record<string, React.ReactElement> = {
    compass: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    bolt: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    building: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
        <line x1="8" y1="6" x2="8.01" y2="6" />
        <line x1="12" y1="6" x2="12.01" y2="6" />
        <line x1="16" y1="6" x2="16.01" y2="6" />
        <line x1="8" y1="12" x2="8.01" y2="12" />
        <line x1="12" y1="12" x2="12.01" y2="12" />
      </svg>
    ),
    person: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export function MobileTabBar() {
  const { pathname } = useLocation();
  const { userId } = useAuth();
  const supabase = createBrowserSupabaseClientSafely();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages-tab", userId],
    queryFn: async () => {
      if (!supabase || !userId) return 0;
      return getUnreadMessageCount(supabase, userId);
    },
    enabled: !!supabase && !!userId,
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] flex h-16 border-t border-blue-600/50 bg-blue-900/95 backdrop-blur-xl px-2 pb-safe md:hidden">
      {tabs.map((tab) => {
        const isActive =
          pathname !== null &&
          (pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`));
        const showBadge = tab.href === "/me" && unreadCount > 0;

        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-all ${
              isActive ? "scale-100" : "scale-95 opacity-70"
            }`}
          >
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-gold-500" />
            )}

            {/* Icon */}
            <div className="relative">
              <Icon name={tab.icon} active={isActive} />

              {/* Badge */}
              {showBadge && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-medium tracking-wide ${
                isActive ? "text-gold-500" : "text-text-tertiary"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
