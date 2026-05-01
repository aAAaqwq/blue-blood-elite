import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getBountyById } from "@/repositories/bounties.repository";
import { getApplicationsForBounty, hasUserApplied } from "@/repositories/applications.repository";
import { getDeliveryByBountyId } from "@/repositories/deliveries.repository";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { DeliveryForm } from "@/features/deliveries/components/delivery-form";
import { ArrowLeft, Clock, User, CheckCircle, AlertCircle, XCircle, FileText, Link2, Calendar } from "lucide-react";

function useActionError() {
  const [actionError, setActionError] = useState<string | null>(null);
  const clearError = () => setActionError(null);
  return { actionError, setActionError, clearError };
}

const statusLabels: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open: {
    label: "开放申请",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.15)",
    icon: <CheckCircle className="w-4 h-4" />
  },
  in_progress: {
    label: "进行中",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.15)",
    icon: <Clock className="w-4 h-4" />
  },
  delivered: {
    label: "已交付",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.15)",
    icon: <FileText className="w-4 h-4" />
  },
  completed: {
    label: "已完成",
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.15)",
    icon: <CheckCircle className="w-4 h-4" />
  },
  cancelled: {
    label: "已取消",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.15)",
    icon: <XCircle className="w-4 h-4" />
  },
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  "本地化部署": { color: "#3B8AFF", bg: "rgba(59, 138, 255, 0.15)" },
  "AI模型": { color: "#A78BFA", bg: "rgba(167, 139, 250, 0.15)" },
  "高悬赏": { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
  "短期实战": { color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
  "智能合约": { color: "#A78BFA", bg: "rgba(167, 139, 250, 0.15)" },
};

export default function BountyDetailPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewNote, setReviewNote] = useState("");
  const { actionError, setActionError } = useActionError();

  const { data: bounty } = useQuery({
    queryKey: ["bounty", id],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getBountyById(supabase, id!);
    },
    enabled: !!id,
  });

  const { data: userMeta } = useQuery({
    queryKey: ["user-meta", userId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.from("users").select("is_verified").eq("id", userId!).single();
      return { isVerified: data?.is_verified ?? false };
    },
    enabled: !!userId,
  });

  const isPublisher = bounty?.publisherId === userId;

  const { data: hasApplied = false } = useQuery({
    queryKey: ["has-applied", id, userId],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return hasUserApplied(supabase, id!, userId!);
    },
    enabled: !!userId && !!id && !isPublisher,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", id],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getApplicationsForBounty(supabase, id!);
    },
    enabled: !!id && isPublisher,
  });

  const showDelivery = bounty && (bounty.status === "delivered" || bounty.status === "completed");
  const { data: delivery } = useQuery({
    queryKey: ["delivery", id],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getDeliveryByBountyId(supabase, id!);
    },
    enabled: !!id && !!showDelivery,
  });

  const isClaimer = bounty?.claimedByNickname !== null && !isPublisher;
  const isVerified = userMeta?.isVerified ?? false;

  const acceptAppMutation = useMutation({
    mutationFn: async (appId: string) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.rpc("accept_application", { p_app_id: appId, p_bounty_id: id! });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bounty", id] }),
    onError: (err: Error) => setActionError(err.message),
  });

  const rejectAppMutation = useMutation({
    mutationFn: async (appId: string) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.rpc("reject_application", { p_app_id: appId, p_bounty_id: id! });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bounty", id] }),
    onError: (err: Error) => setActionError(err.message),
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.rpc("accept_delivery", { p_delivery_id: delivery!.id, p_bounty_id: id! });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bounty", id] }),
    onError: (err: Error) => setActionError(err.message),
  });

  const rejectDeliveryMutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.rpc("reject_delivery", { p_delivery_id: delivery!.id, p_bounty_id: id!, p_review_note: reviewNote });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bounty", id] }),
    onError: (err: Error) => setActionError(err.message),
  });

  if (!bounty) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-800 text-[28px]">📋</div>
          <p className="text-[16px] text-text-secondary">任务不存在</p>
          <Link to="/tasks" className="mt-4 text-[15px] text-blue-400 hover:text-gold-500 transition-colors">返回任务池</Link>
        </div>
      </AppShell>
    );
  }

  const status = statusLabels[bounty.status] ?? {
    label: bounty.status,
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.15)",
    icon: <AlertCircle className="w-4 h-4" />
  };
  const catStyle = categoryColors[bounty.category] ?? { color: "#3B8AFF", bg: "rgba(59, 138, 255, 0.15)" };
  const canApply = bounty.status === "open" && !isPublisher && !hasApplied && !!userId;
  const showApplicationForm = canApply || (!isVerified && !!userId && !isPublisher && !hasApplied);
  const canSubmitDelivery = bounty.status === "in_progress" && isClaimer;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 pt-2">
        <Link to="/tasks" className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-600 bg-blue-800 text-text-secondary transition-all hover:border-blue-500 hover:text-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">任务详情</h1>
      </div>

      {/* Main Card */}
      <div className="card-interactive mb-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
              style={{ color: catStyle.color, backgroundColor: catStyle.bg }}
            >
              #{bounty.category}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium"
              style={{ color: status.color, backgroundColor: status.bg }}
            >
              {status.icon}
              {status.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-gold-500">${bounty.rewardUsdc}</div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-text-primary mb-5">{bounty.title}</h2>

        {/* Publisher */}
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #3B8AFF, #6B8DB5)" }}
          >
            {bounty.publisherNickname?.[0] ?? "?"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-medium text-text-primary">{bounty.publisherNickname ?? "未知发布者"}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
          </div>
        </div>

        <div className="my-5 h-px bg-blue-600/30" />

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-2">任务描述</h3>
          <p className="text-[15px] leading-relaxed text-text-secondary whitespace-pre-wrap">{bounty.description}</p>
        </div>

        {/* Tech Tags */}
        {bounty.techTags && bounty.techTags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {bounty.techTags.map((tag) => (
              <span key={tag} className="rounded-md bg-blue-700 px-3 py-1 text-[13px] text-blue-200">{tag}</span>
            ))}
          </div>
        )}

        {/* Delivery Standard */}
        {bounty.deliveryStandard && (
          <div className="mb-5">
            <h3 className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-2">交付标准</h3>
            <p className="text-[15px] leading-relaxed text-text-secondary whitespace-pre-wrap">{bounty.deliveryStandard}</p>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-[14px]">
          {bounty.deadline && (
            <div className="flex items-center gap-1.5 text-text-tertiary">
              <Calendar className="w-4 h-4" />
              <span>{new Date(bounty.deadline).toLocaleDateString("zh-CN")}</span>
            </div>
          )}
          {bounty.claimedByNickname && (
            <div className="flex items-center gap-1.5">
              <span className="text-text-tertiary">认领者:</span>
              <span className="font-medium text-emerald-400">{bounty.claimedByNickname}</span>
            </div>
          )}
        </div>
      </div>

      {/* Application Form */}
      {showApplicationForm && (
        <div className="card-interactive mb-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">申请认领</h3>
          <ApplicationForm bountyId={id!} isVerified={isVerified} />
        </div>
      )}

      {/* Already Applied */}
      {hasApplied && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 mb-4">
          <p className="flex items-center gap-2 text-[16px] font-medium text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            您已提交申请，请等待发布方审核
          </p>
        </div>
      )}

      {/* Delivery Form */}
      {canSubmitDelivery && (
        <div className="card-interactive mb-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">提交交付</h3>
          <DeliveryForm bountyId={id!} />
        </div>
      )}

      {/* Delivery Content */}
      {showDelivery && delivery && (
        <div className="card-interactive mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">交付内容</h3>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: delivery.status === "submitted" ? "rgba(245, 158, 11, 0.15)" : delivery.status === "accepted" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: delivery.status === "submitted" ? "#F59E0B" : delivery.status === "accepted" ? "#10B981" : "#EF4444",
              }}
            >
              {delivery.status === "submitted" ? "待确认" : delivery.status === "accepted" ? "已确认" : "已拒绝"}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-1">交付说明</div>
              <p className="text-[15px] leading-relaxed text-text-secondary whitespace-pre-wrap">{delivery.content}</p>
            </div>
            {delivery.links && delivery.links.length > 0 && (
              <div>
                <div className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-1">相关链接</div>
                <div className="space-y-1">
                  {delivery.links.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[15px] text-blue-400 hover:text-gold-500 transition-colors truncate">
                      <Link2 className="w-4 h-4 flex-shrink-0" />
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="text-[12px] text-text-tertiary">
              提交于 {new Date(delivery.submittedAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
            {isPublisher && delivery.status === "submitted" && bounty.status === "delivered" && (
              <>
                {actionError && <p className="text-sm text-red-400 mt-2">{actionError}</p>}
                <div className="flex gap-3 pt-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="拒绝原因（可选）"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="ios-input mb-3 text-[14px]"
                    />
                    <button
                      onClick={() => rejectDeliveryMutation.mutate()}
                      disabled={rejectDeliveryMutation.isPending}
                      className="w-full rounded-xl bg-red-500/15 py-3 text-[15px] font-medium text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                    >
                      {rejectDeliveryMutation.isPending ? "处理中..." : "拒绝交付"}
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="h-[76px]" /> {/* Spacer for alignment */}
                    <button
                      onClick={() => acceptDeliveryMutation.mutate()}
                      disabled={acceptDeliveryMutation.isPending}
                      className="w-full rounded-xl bg-blue-400 py-3 text-[15px] font-semibold text-white hover:bg-blue-300 transition-colors disabled:opacity-50"
                    >
                      {acceptDeliveryMutation.isPending ? "处理中..." : "确认完成"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Applications List */}
      {isPublisher && applications.length > 0 && (
        <div className="card-interactive">
          <h3 className="text-lg font-semibold text-text-primary mb-4">认领申请 ({applications.length})</h3>
          {actionError && <p className="text-sm text-red-400 mt-2 mb-3">{actionError}</p>}
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="rounded-xl bg-blue-700/30 p-4 border border-blue-600/30">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-medium text-white"
                      style={{ background: "linear-gradient(135deg, #3B8AFF, #6B8DB5)" }}
                    >
                      {app.applicantNickname[0]}
                    </div>
                    <div>
                      <div className="text-[16px] font-medium text-text-primary">{app.applicantNickname}</div>
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: app.status === "pending" ? "rgba(245, 158, 11, 0.15)" : app.status === "accepted" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: app.status === "pending" ? "#F59E0B" : app.status === "accepted" ? "#10B981" : "#EF4444",
                        }}
                      >
                        {app.status === "pending" ? "待审核" : app.status === "accepted" ? "已通过" : "已拒绝"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[15px] mb-3 text-text-secondary leading-relaxed">{app.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-text-tertiary">
                    {new Date(app.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {app.status === "pending" && bounty.status === "open" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectAppMutation.mutate(app.id)}
                        disabled={rejectAppMutation.isPending}
                        className="rounded-xl bg-red-500/15 px-4 py-2 text-[14px] font-medium text-red-400 hover:bg-red-500/25 transition-colors"
                      >
                        拒绝
                      </button>
                      <button
                        onClick={() => acceptAppMutation.mutate(app.id)}
                        disabled={acceptAppMutation.isPending}
                        className="rounded-xl bg-blue-400 px-4 py-2 text-[14px] font-semibold text-white hover:bg-blue-300 transition-colors"
                      >
                        接受
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
