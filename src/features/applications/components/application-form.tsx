import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

interface ApplicationFormProps {
  bountyId: string;
  isVerified: boolean;
}

export function ApplicationForm({ bountyId, isVerified }: ApplicationFormProps) {
  const { userId } = useAuth();
  if (!userId) return <div className="text-center text-gray-400 p-8">请先登录后再申请任务</div>;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("applications").insert({
        bounty_id: bountyId,
        applicant_id: userId,
        message: message.trim(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] });
      queryClient.invalidateQueries({ queryKey: ["has-applied", bountyId] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "提交失败");
    },
  });

  if (!isVerified) {
    return (
      <div className="rounded-xl py-6 text-center bg-amber-500/10 border border-amber-500/20">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-[16px] font-medium text-amber-400 mb-2">需要 VERIFIED 认证才能申请</p>
        <Link
          to="/verify"
          className="inline-flex items-center gap-1 text-[15px] text-blue-400 hover:text-gold-500 transition-colors"
        >
          前往认证 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="rounded-xl py-6 text-center bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-[16px] font-medium text-emerald-400">申请已提交成功</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-2 block">
          申请说明
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="请详细描述：1) 为什么您适合这个任务 2) 您的技术方案 3) 预计完成时间"
          required
          minLength={10}
          maxLength={500}
          rows={4}
          className="ios-input resize-none"
        />
      </label>
      <p className="text-[12px] text-text-tertiary">
        提示：详细的申请说明能提高被选中概率
      </p>
      {errorMsg && (
        <div className="flex items-center gap-2 text-[14px] text-red-400">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !message.trim()}
        className="btn-primary w-full"
      >
        {mutation.isPending ? "提交中..." : "提交申请"}
      </button>
    </div>
  );
}
