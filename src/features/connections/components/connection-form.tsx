import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface ConnectionFormProps {
  toUserId: string;
  toUserName: string;
  onSuccess?: () => void;
}

export function ConnectionForm({
  toUserId,
  toUserName,
  onSuccess,
}: ConnectionFormProps) {
  const { userId } = useAuth();
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async (intro: string) => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) throw new Error("Supabase not configured");

      const { error } = await supabase.rpc("create_connection", {
        p_from_user_id: userId,
        p_to_user_id: toUserId,
        p_message: intro,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (err) => {
      setErrorMsg(err.message || "发送失败，请重试");
    },
  });

  if (mutation.isSuccess) {
    return (
      <div
        className="rounded-xl py-4 text-center"
        style={{ backgroundColor: "var(--green-dark)" }}
      >
        <p className="flex items-center justify-center gap-2 text-[17px] font-medium text-[var(--green)]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          连接请求已发送
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-body text-[var(--label-secondary)]">
          向 <span className="font-semibold text-[var(--label-primary)]">{toUserName}</span> 发送连接请求
        </p>
      </div>

      <label className="block">
        <span className="text-footnote mb-2 block text-[var(--label-secondary)] uppercase tracking-wide">
          自我介绍（可选）
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="简单介绍自己，说明为什么想建立连接..."
          maxLength={500}
          rows={3}
          className="ios-input resize-none"
        />
      </label>

      {errorMsg && (
        <p className="text-body text-[var(--red)]">{errorMsg}</p>
      )}

      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(message)}
        className="w-full rounded-full bg-[var(--blue)] py-3 text-[17px] font-semibold text-white disabled:opacity-50"
      >
        {mutation.isPending ? "发送中..." : "发送请求"}
      </button>
    </div>
  );
}
