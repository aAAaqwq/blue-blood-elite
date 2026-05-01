import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CheckCircle, AlertCircle, Link2, FileText } from "lucide-react";

interface DeliveryFormProps {
  bountyId: string;
}

export function DeliveryForm({ bountyId }: DeliveryFormProps) {
  const { userId } = useAuth();
  if (!userId) return <div className="text-center text-gray-400 p-8">请先登录后再提交交付</div>;
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [links, setLinks] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const parsedLinks = links.trim() ? links.split("\n").map((l) => l.trim()).filter(Boolean) : null;
      const { error } = await supabase.rpc("submit_delivery", {
        p_bounty_id: bountyId,
        p_content: content.trim(),
        p_links: parsedLinks,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bounty", bountyId] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "提交失败");
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-xl py-6 text-center bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-[16px] font-medium text-emerald-400">交付已提交成功</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <div className="flex items-center gap-2 text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-2">
          <FileText className="w-4 h-4" />
          交付说明
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请详细描述：1) 完成的工作内容 2) 实现的功能 3) 测试情况"
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          className="ios-input resize-none"
        />
      </label>
      <label className="block">
        <div className="flex items-center gap-2 text-[12px] font-medium text-text-tertiary uppercase tracking-wide mb-2">
          <Link2 className="w-4 h-4" />
          相关链接（可选，每行一个）
        </div>
        <textarea
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="https://github.com/username/repo&#10;https://demo.example.com"
          maxLength={500}
          rows={2}
          className="ios-input resize-none"
        />
      </label>
      <p className="text-[12px] text-text-tertiary">
        提示：详细的交付说明能帮助发布方更快确认
      </p>
      {errorMsg && (
        <div className="flex items-center gap-2 text-[14px] text-red-400">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !content.trim()}
        className="btn-primary w-full"
      >
        {mutation.isPending ? "提交中..." : "提交交付"}
      </button>
    </div>
  );
}
