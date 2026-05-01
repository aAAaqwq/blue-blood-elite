import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getUserConnections, type ConnectionWithUser } from "@/repositories/connections.repository";

function ConnectionActionButtons({ connectionId, action }: { connectionId: string; action: "accept" | "reject" }) {
  const queryClient = useQueryClient();
  const label = action === "accept" ? "接受" : "拒绝";

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const fn = action === "accept" ? "accept_connection" : "reject_connection";
      const { error } = await supabase.rpc(fn, { p_connection_id: connectionId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  if (mutation.isSuccess) {
    const color = action === "accept" ? "bg-[var(--green-dark)] text-[var(--green)]" : "bg-[var(--red-dark)] text-[var(--red)]";
    return <div className={`flex-1 rounded-full py-3 text-center text-[17px] font-medium ${color}`}>已{label}</div>;
  }

  const btnClass = action === "accept"
    ? "bg-[var(--blue)] text-white"
    : "bg-[var(--red-dark)] text-[var(--red)]";

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={`flex-1 rounded-full py-3 text-[17px] font-semibold disabled:opacity-50 ${btnClass}`}
    >
      {mutation.isPending ? "处理中..." : label}
    </button>
  );
}

export default function ConnectionsPage() {
  const { userId } = useAuth();

  const { data: connections = [] } = useQuery({
    queryKey: ["connections", userId],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getUserConnections(supabase, userId!);
    },
    enabled: !!userId,
  });

  const pendingConnections = connections.filter((c) => c.status === "pending" && c.toUserId === userId);
  const acceptedConnections = connections.filter((c) => c.status === "accepted");
  const sentConnections = connections.filter((c) => c.status === "pending" && c.fromUserId === userId);

  return (
    <AppShell>
      <div className="flex items-center gap-3 pb-6 pt-2">
        <Link to="/me" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--label-secondary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <h1 className="text-title-1">我的连接</h1>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="ios-card text-center">
          <div className="text-footnote text-[var(--label-secondary)] mb-1">已连接</div>
          <div className="text-title-1" style={{ color: "var(--green)" }}>{acceptedConnections.length}</div>
        </div>
        <div className="ios-card text-center">
          <div className="text-footnote text-[var(--label-secondary)] mb-1">待确认</div>
          <div className="text-title-1" style={{ color: "var(--orange)" }}>{pendingConnections.length}</div>
        </div>
        <div className="ios-card text-center">
          <div className="text-footnote text-[var(--label-secondary)] mb-1">已发送</div>
          <div className="text-title-1" style={{ color: "var(--blue)" }}>{sentConnections.length}</div>
        </div>
      </div>

      {pendingConnections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-title-3 mb-3">待处理请求</h2>
          <div className="space-y-3">
            {pendingConnections.map((conn) => (
              <div key={conn.id} className="ios-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[17px] font-semibold text-white">{conn.otherUser.nickname[0]}</div>
                  <div className="flex-1">
                    <div className="text-[17px] font-semibold">{conn.otherUser.nickname}</div>
                    <div className="text-[13px] text-[var(--label-secondary)]">{conn.otherUser.direction} · {conn.otherUser.school || conn.otherUser.company}</div>
                  </div>
                </div>
                {conn.message && (
                  <div className="mb-3 rounded-xl bg-[var(--bg-tertiary)] p-3 text-[15px] text-[var(--label-secondary)]">{conn.message}</div>
                )}
                <div className="flex gap-3">
                  <ConnectionActionButtons connectionId={conn.id} action="reject" />
                  <ConnectionActionButtons connectionId={conn.id} action="accept" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {acceptedConnections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-title-3 mb-3">已连接</h2>
          <div className="ios-group">
            {acceptedConnections.map((conn, index) => (
              <Link
                key={conn.id}
                to={`/me/messages/${conn.otherUser.id}`}
                className={`ios-list-item ${index !== acceptedConnections.length - 1 ? "border-b border-[var(--separator)]" : ""}`}
              >
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[15px] font-semibold text-white">{conn.otherUser.nickname[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-semibold truncate">{conn.otherUser.nickname}</div>
                  <div className="text-[15px] text-[var(--label-secondary)]">{conn.otherUser.direction} · {conn.otherUser.school || conn.otherUser.company || "精英成员"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-footnote text-[var(--green)]">发消息</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--label-quaternary)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sentConnections.length > 0 && (
        <div>
          <h2 className="text-title-3 mb-3">已发送请求</h2>
          <div className="ios-group">
            {sentConnections.map((conn, index) => (
              <div key={conn.id} className={`ios-list-item ${index !== sentConnections.length - 1 ? "border-b border-[var(--separator)]" : ""}`}>
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-[15px] font-semibold text-white">{conn.otherUser.nickname[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-semibold truncate">{conn.otherUser.nickname}</div>
                  <div className="text-[15px] text-[var(--label-secondary)]">{conn.otherUser.direction} · {conn.otherUser.school || conn.otherUser.company || "精英成员"}</div>
                </div>
                <span className="text-footnote text-[var(--label-tertiary)]">等待确认</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {connections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[28px]">🤝</div>
          <p className="text-body text-[var(--label-secondary)] mb-2">暂无连接</p>
          <p className="text-footnote text-[var(--label-tertiary)] mb-4">去发现页面寻找志同道合的伙伴</p>
          <Link to="/discover" className="rounded-full bg-[var(--blue)] px-6 py-3 text-[17px] font-semibold text-white">去发现</Link>
        </div>
      )}
    </AppShell>
  );
}
