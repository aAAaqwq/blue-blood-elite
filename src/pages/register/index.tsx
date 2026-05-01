import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { TextField } from "@/components/ui/form-fields";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

const benefits = [
  "浏览并连接 AI 精英",
  "发布悬赏任务赚取收益",
  "获取 VERIFIED 认证标识",
  "参与成长课程和黑客松",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, isLoading, error, clearError } = useAuth();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    clearError();
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      return;
    }
    setIsSubmitting(true);
    const result = await signUp({ email, password, nickname });
    setIsSubmitting(false);
    if (result.success) {
      navigate("/login");
    }
  };

  return (
    <AppShell hideTabBar>
      {/* Header */}
      <div className="section-gap text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #3B8AFF, #D4A853)" }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          创建你的精英身份
        </h1>
        <p className="text-sm text-text-secondary">
          加入蓝血菁英，释放你的超凡潜能
        </p>
      </div>

      {/* Benefits */}
      <div className="section-gap">
        <div className="grid grid-cols-2 gap-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-[13px] text-text-secondary">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Auth Card */}
      <AuthCard
        title="注册"
        description="填写基本信息，创建你的精英档案。"
      >
        {/* Name */}
        <TextField
          label="昵称"
          placeholder="你的专属昵称"
          value={nickname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
        />

        {/* Email */}
        <TextField
          label="邮箱地址"
          placeholder="elite@example.com"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />

        {/* Password */}
        <TextField
          label="设置密码"
          placeholder="至少 6 位字符"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Submit Button */}
        <button
          className="btn-primary w-full mt-2 inline-flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleRegister}
          disabled={isLoading || isSubmitting}
        >
          创建账户
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Terms */}
        <p className="mt-4 text-center text-[12px] text-text-tertiary">
          注册即表示同意{" "}
          <Link to="/terms" className="text-blue-400 hover:underline">
            服务条款
          </Link>
          {" "}和{" "}
          <Link to="/privacy" className="text-blue-400 hover:underline">
            隐私政策
          </Link>
        </p>
      </AuthCard>

      {/* Login Link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        已有账号？{" "}
        <Link to="/login" className="font-medium text-gold-500 hover:text-gold-400 transition-colors">
          立即登录
        </Link>
      </p>
    </AppShell>
  );
}
