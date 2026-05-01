import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { createBrowserSupabaseClientSafely } from "@/lib/supabase/client";
import { listBounties } from "@/repositories/bounties.repository";
import { Clock } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "开放", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
  in_progress: { label: "进行中", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
  delivered: { label: "已交付", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
  completed: { label: "已完成", color: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)" },
  cancelled: { label: "已取消", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)" },
};

const categoryColors: Record<string, string> = {
  "本地化部署": "#3B8AFF",
  "AI模型": "#A78BFA",
  "高悬赏": "#F59E0B",
  "短期实战": "#10B981",
  "智能合约": "#A78BFA",
};

const filters = ["全部", "本地化部署", "高悬赏", "短期实战", "智能合约"];

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? undefined;
  const supabase = createBrowserSupabaseClientSafely();

  const { data: bounties = [] } = useQuery({
    queryKey: ["bounties"],
    queryFn: () => {
      if (!supabase) return [];
      return listBounties(supabase);
    },
    enabled: !!supabase,
  });

  const filteredBounties = selectedCategory && selectedCategory !== "全部"
    ? bounties.filter((b) => b.category === selectedCategory)
    : bounties;

  return (
    <AppShell>
      {/* Header */}
      <div className="section-gap">
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">任务池</h1>
        <p className="mt-1 text-sm text-text-secondary">技能变现 · 实战落地</p>
      </div>

      {/* Filter Pills */}
      <div className="section-gap">
        <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
          {filters.map((item) => {
            const isActive = (!selectedCategory && item === "全部") || selectedCategory === item || (selectedCategory === "全部" && item === "全部");
            const to = item === "全部" ? "/tasks" : `/tasks?category=${encodeURIComponent(item)}`;
            return (
              <Link
                key={item}
                to={to}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-gold-500 text-blue-900 font-semibold shadow-glow"
                    : "bg-blue-800 border border-blue-600 text-text-secondary hover:border-blue-500"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="section-gap space-y-4">
        {filteredBounties.length > 0 ? (
          filteredBounties.map((bounty, index) => {
            const status = statusLabels[bounty.status] ?? { label: bounty.status, color: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)" };
            const catColor = categoryColors[bounty.category] ?? "#3B8AFF";
            const daysLeft = bounty.deadline ? Math.ceil((new Date(bounty.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <Link
                key={bounty.id}
                to={`/tasks/${bounty.id}`}
                className="card-interactive block animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Tag */}
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        color: catColor,
                        backgroundColor: `${catColor}20`,
                      }}
                    >
                      #{bounty.category}
                    </span>
                    {/* Status Tag */}
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        color: status.color,
                        backgroundColor: status.bg,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  {/* Reward */}
                  <div className="text-xl font-bold text-gold-500 flex-shrink-0">
                    ${bounty.rewardUsdc}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-[17px] font-semibold text-text-primary mb-2 line-clamp-1">
                  {bounty.title}
                </h2>

                {/* Description */}
                <p className="text-[14px] text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                  {bounty.description}
                </p>

                {/* Tech Tags */}
                {bounty.techTags && bounty.techTags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {bounty.techTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-blue-700 px-2.5 py-0.5 text-[12px] text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {bounty.techTags.length > 4 && (
                      <span className="rounded-md bg-blue-700 px-2.5 py-0.5 text-[12px] text-text-tertiary">
                        +{bounty.techTags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-blue-600/50 pt-4">
                  {/* Publisher */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[13px] font-medium text-white">
                      {bounty.publisherNickname?.[0] ?? "?"}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">
                        {bounty.publisherNickname ?? "未知发布者"}
                      </div>
                      {bounty.deadline && daysLeft !== null && (
                        <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                          <Clock className="w-3 h-3" />
                          {daysLeft > 0 ? `${daysLeft}天后截止` : "已截止"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end">
                    <span className="rounded-full bg-gold-500 px-4 py-1.5 text-[13px] font-semibold text-blue-900">
                      立即认领
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            {/* Icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-800">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-text-primary mb-2">暂无任务</h3>
            <p className="text-sm text-text-secondary text-center max-w-[280px] mb-6">
              还没有人发布相关任务，成为第一个吧！
            </p>

            {/* CTA */}
            <Link
              to="/tasks/create"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              发布任务
            </Link>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile */}
      <Link
        to="/tasks/create"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-blue-900 shadow-glow transition-all hover:shadow-glow-lg hover:scale-105 active:scale-95 md:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </AppShell>
  );
}
