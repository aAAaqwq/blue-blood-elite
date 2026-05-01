import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { TextAreaField, TextField } from "@/components/ui/form-fields";
import type { UserProfile } from "@/domains/users/mappers";

interface ProfileEditFormProps {
  initialData?: Partial<UserProfile>;
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState(initialData?.nickname ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [school, setSchool] = useState(initialData?.school ?? "");
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [direction, setDirection] = useState(initialData?.direction ?? "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedinUrl ?? "");
  const [skills, setSkills] = useState(initialData?.skills?.join(", ") ?? "");
  const [statusMsg, setStatusMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("users").update({
        nickname,
        bio,
        school,
        company,
        direction,
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      }).eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      setStatusMsg("资料已保存");
      queryClient.invalidateQueries({ queryKey: ["profile-edit"] });
    },
    onError: (err: Error) => {
      setStatusMsg(err.message || "保存失败");
    },
  });

  return (
    <div className="space-y-4">
      <TextField label="昵称" name="nickname" defaultValue={initialData?.nickname ?? ""} placeholder="张云飞" required value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <TextAreaField label="个人简介" name="bio" defaultValue={initialData?.bio ?? ""} placeholder="介绍你的技术方向、项目经验和擅长的 AI 能力。" required value={bio} onChange={(e) => setBio(e.target.value)} />
      <TextField label="学校" name="school" defaultValue={initialData?.school ?? ""} placeholder="清华大学" required value={school} onChange={(e) => setSchool(e.target.value)} />
      <TextField label="公司 / 团队" name="company" defaultValue={initialData?.company ?? ""} placeholder="独立开发者" required value={company} onChange={(e) => setCompany(e.target.value)} />
      <TextField label="技术方向" name="direction" defaultValue={initialData?.direction ?? ""} placeholder="AI模型 / Agent开发 / 本地化部署" required value={direction} onChange={(e) => setDirection(e.target.value)} />
      <TextField label="GitHub 链接" name="githubUrl" defaultValue={initialData?.githubUrl ?? ""} placeholder="https://github.com/your-name" required type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
      <TextField label="LinkedIn 链接" name="linkedinUrl" defaultValue={initialData?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/your-name" required type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
      <TextField label="技能标签" name="skills" defaultValue={initialData?.skills?.join(", ") ?? ""} helper="使用逗号分隔" placeholder="Python, RAG, Docker" required value={skills} onChange={(e) => setSkills(e.target.value)} />
      <p className={mutation.isError ? "text-sm text-rose-300" : "text-sm text-emerald-300"}>
        {statusMsg || "当前支持通过 Supabase 直接保存资料。"}
      </p>
      <button className="rounded-2xl bg-[linear-gradient(135deg,#1890FF,#00D4AA)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "保存中..." : "保存资料"}
      </button>
    </div>
  );
}
