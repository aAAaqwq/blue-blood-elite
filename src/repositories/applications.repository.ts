import type { SupabaseClient } from "@supabase/supabase-js";

export type ApplicationWithApplicant = {
  id: string;
  bountyId: string;
  applicantId: string;
  applicantNickname: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
};

type ApplicationRecord = {
  id: string;
  bounty_id: string;
  applicant_id: string;
  message: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  applicant: { nickname: string } | null;
};

/**
 * 获取任务的所有申请
 */
export async function getApplicationsForBounty(
  supabase: SupabaseClient,
  bountyId: string,
): Promise<ApplicationWithApplicant[]> {
  const result = await supabase
    .from("applications")
    .select(
      "id,bounty_id,applicant_id,message,status,created_at,reviewed_at,applicant:users!applications_applicant_id_fkey(nickname)",
    )
    .eq("bounty_id", bountyId)
    .order("created_at", { ascending: false });

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((record: unknown) => {
    const r = record as ApplicationRecord;
    return {
      id: r.id,
      bountyId: r.bounty_id,
      applicantId: r.applicant_id,
      applicantNickname: r.applicant?.nickname ?? "未知用户",
      message: r.message,
      status: r.status as "pending" | "accepted" | "rejected",
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at,
    };
  });
}

/**
 * 检查用户是否已申请过该任务
 */
export async function hasUserApplied(
  supabase: SupabaseClient,
  bountyId: string,
  userId: string,
): Promise<boolean> {
  const result = await supabase
    .from("applications")
    .select("id")
    .eq("bounty_id", bountyId)
    .eq("applicant_id", userId)
    .maybeSingle();

  return !!result.data;
}

/**
 * 获取单个申请详情
 */
export async function getApplicationById(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<ApplicationWithApplicant | null> {
  const result = await supabase
    .from("applications")
    .select(
      "id,bounty_id,applicant_id,message,status,created_at,reviewed_at,applicant:users!applications_applicant_id_fkey(nickname)",
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (result.error || !result.data) {
    return null;
  }

  const r = result.data as unknown as ApplicationRecord;
  return {
    id: r.id,
    bountyId: r.bounty_id,
    applicantId: r.applicant_id,
    applicantNickname: r.applicant?.nickname ?? "未知用户",
    message: r.message,
    status: r.status as "pending" | "accepted" | "rejected",
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
  };
}

/**
 * 创建认领申请
 */
export async function createApplication(
  supabase: SupabaseClient,
  bountyId: string,
  applicantId: string,
  message: string,
): Promise<{ success: boolean; error?: string; applicationId?: string }> {
  const trimmedMessage = message?.trim();
  if (!trimmedMessage) {
    return { success: false, error: "请填写申请说明" };
  }

  // 检查是否已申请
  const alreadyApplied = await hasUserApplied(supabase, bountyId, applicantId);
  if (alreadyApplied) {
    return { success: false, error: "您已提交过申请" };
  }

  const result = await supabase
    .from("applications")
    .insert({
      bounty_id: bountyId,
      applicant_id: applicantId,
      message: trimmedMessage,
      status: "pending",
    })
    .select("id")
    .single();

  if (result.error) {
    return { success: false, error: "提交申请失败" };
  }

  return { success: true, applicationId: result.data.id };
}
