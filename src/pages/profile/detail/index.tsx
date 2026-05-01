import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getPublicProfile, getUserCompletedBounties } from "@/repositories/users.repository";
import { getConnectionBetweenUsers } from "@/repositories/connections.repository";

export default function ProfileDetailPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [connectMessage, setConnectMessage] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getPublicProfile(supabase, id!);
    },
    enabled: !!id,
  });

  const { data: completedBounties = [] } = useQuery({
    queryKey: ["completed-bounties", id],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getUserCompletedBounties(supabase, id!);
    },
    enabled: !!id,
  });

  const { data: connection } = useQuery({
    queryKey: ["connection", userId, id],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getConnectionBetweenUsers(supabase, userId!, id!);
    },
    enabled: !!userId && !!id && userId !== id,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.rpc("create_connection", {
        p_from_user_id: userId,
        p_to_user_id: id,
        p_message: connectMessage.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection", userId, id] });
      setConnectMessage("");
      setConnectError(null);
    },
    onError: (err: Error) => setConnectError(err.message),
  });

  if (!profile) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[28px]">👤</div>
          <p className="text-body text-[var(--label-secondary)]">用户不存在</p>
          <Link to="/discover" className="mt-4 text-[15px] text-[var(--blue)]">返回发现页</Link>
        </div>
      </AppShell>
    );
  }

  const isSelf = userId === id;
  const isConnected = connection?.status === "accepted";
  const hasPendingRequest = connection?.status === "pending";

  return (
    <AppShell>
      <div className="pb-2 pt-1">
        <Link to="/discover" className="text-[15px] text-[var(--blue)]">← 返回</Link>
      </div>

      <div className="relative mb-14">
        <div className="h-28 rounded-2xl bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)]" />
        <div className="absolute -bottom-10 left-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[var(--bg)] bg-[var(--bg-secondary)] text-[28px] font-semibold text-[var(--blue)]">
          {profile.nickname[0]}
        </div>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-title-2">{profile.nickname}</h1>
        {profile.isVerified && (
          <span className="rounded-full bg-[var(--blue)] px-2 py-0.5 text-[11px] font-semibold text-white">VERIFIED</span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-subheadline text-[var(--label-secondary)]">
        {profile.school && <span>{profile.school}</span>}
        {profile.company && <span>· {profile.company}</span>}
        {profile.direction && <span>· {profile.direction}</span>}
      </div>

      <div className="mb-5 flex gap-6">
        <div className="text-center">
          <div className="text-title-3 text-[var(--blue)]">Lv.{profile.level}</div>
          <div className="text-footnote text-[var(--label-tertiary)]">等级</div>
        </div>
        <div className="text-center">
          <div className="text-title-3 text-[var(--blue)]">{profile.points}</div>
          <div className="text-footnote text-[var(--label-tertiary)]">积分</div>
        </div>
        <div className="text-center">
          <div className="text-title-3 text-[var(--blue)]">{profile.completedBountyCount}</div>
          <div className="text-footnote text-[var(--label-tertiary)]">已完成</div>
        </div>
      </div>

      {profile.bio && (
        <div className="mb-5">
          <h2 className="mb-2 text-headline text-[var(--label-primary)]">简介</h2>
          <p className="text-[15px] leading-relaxed text-[var(--label-secondary)]">{profile.bio}</p>
        </div>
      )}

      {profile.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 text-headline text-[var(--label-primary)]">技能</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[13px] font-medium text-[var(--label-secondary)]">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {(profile.githubUrl || profile.linkedinUrl) && (
        <div className="mb-5">
          <h2 className="mb-2 text-headline text-[var(--label-primary)]">链接</h2>
          <div className="flex gap-3">
            {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[13px] text-[var(--blue)]">GitHub</a>}
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[13px] text-[var(--blue)]">LinkedIn</a>}
          </div>
        </div>
      )}

      {!isSelf && (
        <div className="mb-6 flex gap-3">
          {isConnected ? (
            <Link to={`/me/messages/${id}`} className="flex-1 rounded-full bg-[var(--blue)] py-3 text-center text-[15px] font-semibold text-white">发消息</Link>
          ) : hasPendingRequest ? (
            <div className="flex-1 rounded-full bg-[var(--bg-secondary)] py-3 text-center text-[15px] font-medium text-[var(--label-secondary)]">已发送连接请求</div>
          ) : (
            <div className="flex-1">
              {connectMutation.isError && <p className="mb-2 text-footnote text-[var(--red)]">{connectError ?? "连接失败，请重试"}</p>}
              <button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="w-full rounded-full bg-[var(--blue)] py-3 text-[15px] font-semibold text-white disabled:opacity-50"
              >
                {connectMutation.isPending ? "发送中..." : "发起连接"}
              </button>
            </div>
          )}
        </div>
      )}

      {completedBounties.length > 0 && (
        <div>
          <h2 className="mb-3 text-headline text-[var(--label-primary)]">已完成任务</h2>
          <div className="space-y-2">
            {completedBounties.map((bounty) => (
              <Link key={bounty.id} to={`/tasks/${bounty.id}`} className="ios-card block">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium">{bounty.title}</span>
                  <span className="text-[15px] text-[var(--blue)]">${bounty.rewardUsdc}</span>
                </div>
                <div className="mt-1 text-footnote text-[var(--label-tertiary)]">{new Date(bounty.completedAt).toLocaleDateString("zh-CN")}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
