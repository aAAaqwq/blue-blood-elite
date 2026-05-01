import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router";

import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

const navItems = [
  { href: "/", label: "蓝血菁英" },
  { href: "/discover", label: "发现" },
  { href: "/growth", label: "成长" },
  { href: "/tasks", label: "任务" },
  { href: "/me", label: "我的" },
];

function DesktopNav() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-blue-600/50 bg-blue-900/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #3B8AFF, #D4A853)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-text-primary hidden sm:block">
            蓝血菁英
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`rounded-lg px-3 py-1.5 text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-blue-800 text-text-primary"
                    : "text-text-secondary hover:bg-blue-800/50 hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-blue-600 bg-transparent px-4 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:border-gold-500 hover:text-gold-500"
          >
            登录
          </Link>
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-1.5 text-[13px] font-semibold text-blue-900 shadow-glow transition-all hover:bg-gold-400 hover:shadow-glow-lg"
          >
            注册
          </Link>
        </div>
      </div>
    </header>
  );
}

interface AppShellProps extends PropsWithChildren {
  hideTabBar?: boolean;
}

export function AppShell({ children, hideTabBar }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-blue-900 text-text-primary">
      {/* Background Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59,138,255,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Subtle Grid Pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <DesktopNav />

      {/* Main Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 px-4 md:px-6 lg:px-10">
        <main className={hideTabBar ? "pb-8 pt-6" : "pb-28 pt-6 md:pb-8"}>
          {children}
        </main>
      </div>

      {/* Mobile Tab Bar */}
      {!hideTabBar && <MobileTabBar />}
    </div>
  );
}
