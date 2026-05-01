import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { TextAreaField, TextField, SelectField } from "@/components/ui/form-fields";
import { AlertCircle, Info, FileText, Tag, DollarSign, Calendar, CheckCircle } from "lucide-react";

const categories = [
  { value: "本地化部署", label: "本地化部署" },
  { value: "AI模型", label: "AI模型" },
  { value: "Agent开发", label: "Agent开发" },
  { value: "Web3", label: "Web3" },
  { value: "数据分析", label: "数据分析" },
  { value: "其他", label: "其他" },
];

export function CreateBountyForm() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("本地化部署");
  const [techTags, setTechTags] = useState("");
  const [rewardUsdc, setRewardUsdc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deliveryStandard, setDeliveryStandard] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.from("bounties").insert({
        publisher_id: userId,
        title,
        description,
        category,
        tech_tags: techTags.split(",").map((t) => t.trim()).filter(Boolean),
        reward_usdc: parseFloat(rewardUsdc),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        delivery_standard: deliveryStandard,
        status: "open",
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (bountyId) => {
      navigate(`/tasks/${bountyId}`);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "发布失败");
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-xl py-8 text-center bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <p className="text-lg font-semibold text-emerald-400 mb-2">任务发布成功</p>
        <p className="text-sm text-text-secondary">正在跳转到任务详情页...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <TextField
        label="任务标题"
        placeholder="例如：RAG 系统开发"
        required
        maxLength={50}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Description */}
      <TextAreaField
        label="任务描述"
        placeholder="详细描述任务需求、技术栈要求和交付标准。"
        required
        rows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Category */}
      <div className="grid gap-2">
        <label className="text-[13px] font-medium text-text-primary">
          任务分类
        </label>
        <select
          className="ios-input h-12"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Tech Tags */}
      <TextField
        label="技术标签"
        placeholder="例如：Python, RAG, LangChain"
        helper="使用逗号分隔"
        required
        value={techTags}
        onChange={(e) => setTechTags(e.target.value)}
      />

      {/* Reward */}
      <div className="grid gap-2">
        <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gold-500" />
          悬赏金额 (USDC)
        </label>
        <div className="relative">
          <input
            type="number"
            min="50"
            step="1"
            placeholder="最低 50 USDC"
            required
            value={rewardUsdc}
            onChange={(e) => setRewardUsdc(e.target.value)}
            className="ios-input pl-10"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-medium">
            $
          </span>
        </div>
        <p className="text-[12px] text-text-tertiary">
          建议金额：简单任务 50-200 USDC，复杂任务 500+ USDC
        </p>
      </div>

      {/* Deadline */}
      <div className="grid gap-2">
        <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          截止日期
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
          className="ios-input"
        />
        <p className="text-[12px] text-text-tertiary">
          截止日期至少在 3 天后
        </p>
      </div>

      {/* Delivery Standard */}
      <TextAreaField
        label="交付标准"
        placeholder="明确列出验收条件和交付物要求。"
        required
        rows={4}
        value={deliveryStandard}
        onChange={(e) => setDeliveryStandard(e.target.value)}
      />

      {/* Info / Error */}
      {errorMsg ? (
        <div className="flex items-center gap-2 text-[14px] text-red-400">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      ) : (
        <div className="flex items-start gap-2 text-[13px] text-text-secondary bg-blue-800/50 p-3 rounded-xl">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <span>
            发布任务后需要 Escrow 托管 USDC 才可正式上线（待合约开发后）。
            <br />
            托管资金将在任务完成后自动释放给认领者。
          </span>
        </div>
      )}

      {/* Submit Button */}
      <button
        className="btn-primary w-full"
        disabled={mutation.isPending}
        onClick={() => {
          const reward = parseFloat(rewardUsdc);
          if (isNaN(reward) || reward <= 0) {
            setErrorMsg("请输入有效的悬赏金额");
            return;
          }
          mutation.mutate();
        }}
      >
        {mutation.isPending ? "发布中..." : "发布任务"}
      </button>
    </div>
  );
}
