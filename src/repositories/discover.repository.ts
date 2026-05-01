import type { SupabaseClient } from "@supabase/supabase-js";

export type DiscoverUserCard = {
  id: string;
  nickname: string;
  school: string | null;
  company: string | null;
  direction: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  skills: string[];
  matchRate?: number;
  avatarColor?: string;
};

type DiscoverUserRecord = {
  id: string;
  nickname: string;
  school: string | null;
  company: string | null;
  direction: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  user_skills: Array<{ skill_name: string }> | null;
};

export async function listDiscoverUsers(
  supabase: SupabaseClient,
  pageSize = 20,
): Promise<DiscoverUserCard[]> {
  const result = await supabase
    .from("users")
    .select(
      "id,nickname,school,company,direction,avatar_url,is_verified,user_skills(skill_name)",
    )
    .eq("is_verified", true)
    .limit(pageSize)
    .order("created_at", { ascending: false });

  if (result.error) {
    return [];
  }

  return ((result.data ?? []) as DiscoverUserRecord[]).map((record) => ({
    id: record.id,
    nickname: record.nickname,
    school: record.school,
    company: record.company,
    direction: record.direction,
    avatarUrl: record.avatar_url,
    isVerified: record.is_verified,
    skills: (record.user_skills ?? []).map((skill) => skill.skill_name),
  }));
}
