import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyApplicationForm } from "@/features/verify/components/verify-application-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getUserVerifyStatus } from "@/repositories/users.repository";
import { Shield, CheckCircle, Clock, XCircle, Award, Star, Briefcase, GitBranch } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: {
    label: "待审核",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    icon: <Clock className="w-4 h-4" />,
  },
  approved: {
    label: "已通过",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: "已拒绝",
    color: "text-red-400",
    bg: "bg-red-500/15",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  github_500stars: { label: "GitHub 500+ Stars", icon: <GitBranch className="w-4 h-4" /> },
  company_proof: { label: "大厂 AI 方向 3 年以上经历", icon: <Briefcase className="w-4 h-4" /> },
  platform_tasks: { label: "完成平台任务并获得高评分", icon: <Star className="w-4 h-4" /> },
};

const typeDescriptions: Record<string, string> = {
  github_500stars: "提供 GitHub 个人主页链接，需有 500+ stars 的开源项目",
  company_proof: "提供 LinkedIn 或公司邮箱验证，需 3 年以上 AI 相关工作经验",
  platform_tasks: "在平台完成 3 个及以上任务，平均评分 4.5+",
};

export default function VerifyPage() {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const { data: verifyStatus } = useQuery({
    queryKey: ["verify-status", userId],
    queryFn: () => {
      const supabase = createBrowserSupabaseClient();
      return getUserVerifyStatus(supabase, userId!);
    },
    enabled: !!userId,
  });

  const isVerified = verifyStatus?.isVerified ?? false;
  const verifiedAt = verifyStatus?.verifiedAt ?? null;
  const applications = verifyStatus?.applications ?? [];

  return (
    <AppShell>
      {/* Header */}
      <div className="pb-6 pt-2 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-gold-500 mb-4 shadow-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">VERIFIED 认证</h1>
        <p className="text-sm text-text-secondary">获取认证标识，解锁更多权益</p>
      </div>

      {/* Benefits Card */}
      {!isVerified && (
        <div className="card-interactive mb-4">
          <h3 className="text-[15px] font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-gold-500" />
            认证权益
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "✓", text: "发布悬赏任务" },
              { icon: "✓", text: "优先推荐曝光" },
              { icon: "✓", text: "专属认证标识" },
            ].map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-2 text-[14px] text-text-secondary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-[12px] font-bold">
                  {benefit.icon}
                </span>
                {benefit.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <AuthCard
        title={isVerified ? "认证状态" : "申请 VERIFIED 认证"}
        description={isVerified ? "恭喜！您已通过 VERIFIED 认证" : "选择适合您的认证方式，提交申请"}
      >
        {isVerified ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-emerald-400 mb-1">已认证</p>
            <p className="text-[13px] text-text-secondary">
              认证时间：{verifiedAt ? new Date(verifiedAt).toLocaleDateString("zh-CN") : "未知"}
            </p>
          </div>
        ) : (
          <>
            {/* Verification Types */}
            <div className="mb-5 space-y-3">
              <p className="text-[13px] font-medium text-text-tertiary uppercase tracking-wide">
                可选认证类型
              </p>
              {Object.entries(typeLabels).map(([type, { label, icon }]) => (
                <div
                  key={type}
                  className="rounded-xl border border-blue-600/30 bg-blue-800/50 p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400">{icon}</span>
                    <span className="text-[14px] font-semibold text-text-primary">{label}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary pl-6">
                    {typeDescriptions[type]}
                  </p>
                </div>
              ))}
            </div>
            <VerifyApplicationForm />
          </>
        )}

        {/* Application History */}
        {applications.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-[13px] font-medium text-text-tertiary uppercase tracking-wide">
              历史申请
            </p>
            {applications.map((app) => {
              const status = statusLabels[app.status] ?? {
                label: app.status,
                color: "text-text-secondary",
                bg: "bg-blue-800",
                icon: <Clock className="w-4 h-4" />,
              };
              const typeInfo = typeLabels[app.verify_type] ?? { label: app.verify_type, icon: <Shield className="w-4 h-4" /> };

              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-xl border border-blue-600/30 bg-blue-800/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">{typeInfo.icon}</span>
                    <span className="text-[14px] text-text-secondary">{typeInfo.label}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.bg} ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </AuthCard>
    </AppShell>
  );
}
