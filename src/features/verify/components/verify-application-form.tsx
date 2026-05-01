import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { TextField } from "@/components/ui/form-fields";

export function VerifyApplicationForm() {
  const { userId } = useAuth();
  if (!userId) return <div className="text-center text-gray-400 p-8">请先登录后再申请认证</div>;
  const queryClient = useQueryClient();
  const [verifyType, setVerifyType] = useState("github_500stars");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const selectId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("verify_applications").insert({
        user_id: userId,
        verify_type: verifyType,
        evidence_url: evidenceUrl.trim(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSuccessMsg("认证申请已提交，请等待审核");
      queryClient.invalidateQueries({ queryKey: ["verify-status"] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "提交失败");
    },
  });

  if (mutation.isSuccess && successMsg) {
    return (
      <div className="rounded-lg border border-[var(--green)]/20 bg-[var(--green-dark)] p-3">
        <p className="text-[12px] font-semibold text-[var(--green)]">✓ {successMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-1.5">
        <label htmlFor={selectId} className="text-[11px] font-semibold text-[var(--label-primary)]">
          认证类型
        </label>
        <select
          id={selectId}
          value={verifyType}
          onChange={(e) => setVerifyType(e.target.value)}
          className="h-10 rounded-lg border border-[var(--separator)] bg-[var(--bg-secondary)] px-3 text-[12px] text-[var(--label-primary)] outline-none focus:border-[var(--blue)]"
        >
          <option value="github_500stars">GitHub 500+ Stars</option>
          <option value="company_proof">大厂 AI 方向 3 年以上经历</option>
          <option value="platform_tasks">完成平台任务并获得高评分</option>
        </select>
      </div>
      <TextField label="证明材料链接" name="evidenceUrl" placeholder="https://github.com/your-repo" required type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
      {errorMsg && <p className="text-[11px] text-[var(--red)]">{errorMsg}</p>}
      <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !evidenceUrl.trim()} className="w-full rounded-full bg-[linear-gradient(135deg,var(--blue),var(--cyan))] py-2.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {mutation.isPending ? "提交中..." : "提交认证申请"}
      </button>
    </div>
  );
}
