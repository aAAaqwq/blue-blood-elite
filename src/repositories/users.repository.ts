import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileUpdateInput, VerifyApplicationInput } from "@/domains/users/contracts";
import {
  normalizeUserRecord,
  type UserProfile,
  type UserProfileRecord,
} from "@/domains/users/mappers";

interface UserWithSkills extends UserProfileRecord {
  user_skills?: Array<{ skill_name: string }>;
}

export async function saveUserProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: ProfileUpdateInput,
) {
  const userResult = await supabase.from("users").upsert({
    id: userId,
    nickname: payload.nickname,
    bio: payload.bio,
    school: payload.school,
    company: payload.company,
    direction: payload.direction,
    github_url: payload.githubUrl,
    linkedin_url: payload.linkedinUrl,
    updated_at: new Date().toISOString(),
  });

  if (userResult.error) {
    throw new Error(userResult.error.message);
  }

  const skillsTable = supabase.from("user_skills");
  const deleteResult = await skillsTable.delete().eq("user_id", userId);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  const insertResult = await skillsTable.insert(
    payload.skills.map((skillName) => ({
      user_id: userId,
      skill_name: skillName,
    })),
  );

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const result = await supabase
    .from("users")
    .select("id,nickname,bio,school,company,direction,github_url,linkedin_url,is_verified")
    .eq("id", userId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    return null;
  }

  const record = result.data as UserWithSkills;

  // Fetch user skills
  const skillsResult = await supabase
    .from("user_skills")
    .select("skill_name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const skills =
    skillsResult.data?.map((s) => s.skill_name) ?? [];

  const normalized = normalizeUserRecord(record, skills);
  return normalized;
}

export async function submitVerifyApplication(
  supabase: SupabaseClient,
  userId: string,
  payload: VerifyApplicationInput,
) {
  const result = await supabase.from("verify_applications").insert({
    user_id: userId,
    verify_type: payload.verifyType,
    evidence_url: payload.evidenceUrl,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

interface VerifyApplicationRecord {
  id: string;
  verify_type: string;
  evidence_url: string;
  status: "pending" | "approved" | "rejected";
  reviewer_id: string | null;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface UserVerifyStatus {
  isVerified: boolean;
  verifiedAt: string | null;
  applications: VerifyApplicationRecord[];
}

export async function getUserVerifyStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserVerifyStatus> {
  // Get user verification status
  const userResult = await supabase
    .from("users")
    .select("is_verified, verified_at")
    .eq("id", userId)
    .maybeSingle();

  if (userResult.error) {
    throw new Error(userResult.error.message);
  }

  // Get verification applications
  const applicationsResult = await supabase
    .from("verify_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (applicationsResult.error) {
    throw new Error(applicationsResult.error.message);
  }

  return {
    isVerified: userResult.data?.is_verified ?? false,
    verifiedAt: userResult.data?.verified_at ?? null,
    applications: (applicationsResult.data ?? []) as VerifyApplicationRecord[],
  };
}

type CompletedBounty = {
  id: string;
  title: string;
  rewardUsdc: string;
  completedAt: string;
};

/**
 * 获取用户已完成的任务列表（作为认领方或发布方）
 */
export async function getUserCompletedBounties(
  supabase: SupabaseClient,
  userId: string,
): Promise<CompletedBounty[]> {
  const result = await supabase
    .from("bounties")
    .select("id,title,reward_usdc,updated_at")
    .eq("status", "completed")
    .or(`publisher_id.eq.${userId},claimed_by.eq.${userId}`)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (result.error || !result.data) {
    return [];
  }

  return result.data.map((r: { id: string; title: string; reward_usdc: string; updated_at: string }) => ({
    id: r.id,
    title: r.title,
    rewardUsdc: r.reward_usdc,
    completedAt: r.updated_at,
  }));
}

/**
 * 获取用户公开资料（含技能和已完成任务数）
 */
export async function getPublicProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<(UserProfile & { completedBountyCount: number; level: number; points: number }) | null> {
  const profile = await getUserProfile(supabase, userId);
  if (!profile) {
    return null;
  }

  const countResult = await supabase
    .from("bounties")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed")
    .or(`publisher_id.eq.${userId},claimed_by.eq.${userId}`);

  const userMeta = await supabase
    .from("users")
    .select("level,points")
    .eq("id", userId)
    .single();

  return {
    ...profile,
    completedBountyCount: countResult.count ?? 0,
    level: userMeta.data?.level ?? 1,
    points: userMeta.data?.points ?? 0,
  };
}
