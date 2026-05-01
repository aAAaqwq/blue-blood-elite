import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "开放", color: "var(--green)", bg: "var(--green-dark)" },
  in_progress: { label: "进行中", color: "var(--orange)", bg: "var(--orange-dark)" },
  delivered: { label: "已交付", color: "var(--blue)", bg: "var(--blue-dark)" },
  completed: { label: "已完成", color: "var(--label-secondary)", bg: "var(--bg-tertiary)" },
  cancelled: { label: "已取消", color: "var(--red)", bg: "var(--red-dark)" },
};

type BountyItem = {
  id: string;
  title: string;
  status: string;
  rewardUsdc: string;
  role: "publisher" | "claimer";
};

export default function MyBountiesPage() {
  const { userId } = useAuth();

  const { data: bounties = [] } = useQuery({
    queryKey: ["my-bounties", userId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const [pubRes, claimRes] = await Promise.all([
        supabase.from("bounties").select("id,title,status,reward_usdc").eq("publisher_id", userId!).order("created_at", { ascending: false }),
        supabase.from("bounties").select("id,title,status,reward_usdc").eq("claimed_by", userId!).order("created_at", { ascending: false }),
      ]);
      const published: BountyItem[] = (pubRes.data ?? []).map((b) => ({ id: b.id, title: b.title, status: b.status, rewardUsdc: b.reward_usdc, role: "publisher" as const }));
      const claimed: BountyItem[] = (claimRes.data ?? []).map((b) => ({ id: b.id, title: b.title, status: b.status, rewardUsdc: b.reward_usdc, role: "claimer" as const }));
      return [...published, ...claimed];
    },
    enabled: !!userId,
  });

  const publishedCount = bounties.filter((b) => b.role === "publisher").length;
  const claimedCount = bounties.filter((b) => b.role === "claimer").length;

  return (
    <AppShell>
      <div className="flex items-center gap-3 pb-6 pt-2">
        <Link to="/me" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--label-secondary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <h1 className="text-title-1">我的任务</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="ios-card text-center">
          <div className="text-footnote text-[var(--label-secondary)] mb-1">我发布的</div>
          <div className="text-title-1" style={{ color: "var(--blue)" }}>{publishedCount}</div>
        </div>
        <div className="ios-card text-center">
          <div className="text-footnote text-[var(--label-secondary)] mb-1">我认领的</div>
          <div className="text-title-1" style={{ color: "var(--green)" }}>{claimedCount}</div>
        </div>
      </div>

      <div className="space-y-2">
        {bounties.length > 0 ? (
          bounties.map((bounty) => {
            const status = statusLabels[bounty.status] ?? { label: bounty.status, color: "var(--label-secondary)", bg: "var(--bg-tertiary)" };
            return (
              <Link key={bounty.id} to={`/tasks/${bounty.id}`} className="ios-card block transition-transform active:scale-[0.98]">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: status.bg, color: status.color }}>{status.label}</span>
                  <span className="text-footnote text-[var(--label-tertiary)]">{bounty.role === "publisher" ? "发布" : "认领"}</span>
                </div>
                <h3 className="text-headline mb-2">{bounty.title}</h3>
                <div className="text-title-3" style={{ color: "var(--blue)" }}>${bounty.rewardUsdc} USDC</div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[28px]">📋</div>
            <p className="text-body text-[var(--label-secondary)]">暂无任务</p>
            <Link to="/tasks" className="mt-4 rounded-full bg-[var(--blue)] px-6 py-3 text-[17px] font-semibold text-white">去任务池看看</Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
