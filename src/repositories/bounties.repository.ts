import type { SupabaseClient } from "@supabase/supabase-js";
import { canTransitionBountyStatus, type BountyStatus } from "@/domains/bounties/status-machine";

type BountyCard = {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardUsdc: string;
  deadline: string | null;
  status: string;
  publisherNickname: string | null;
  claimedByNickname: string | null;
  techTags: string[] | null;
};

type BountyDetail = BountyCard & {
  publisherId: string;
  techTags: string[] | null;
  deliveryStandard: string | null;
};

type BountyRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  reward_usdc: string;
  deadline: string | null;
  status: string;
  publisher_id: string;
  tech_tags: string[] | null;
  delivery_standard: string | null;
  publisher: { nickname: string } | null;
  claimed_by_user: { nickname: string } | null;
};

export async function listBounties(
  supabase: SupabaseClient,
  pageSize = 20,
): Promise<BountyCard[]> {
  const result = await supabase
    .from("bounties")
    .select(
      "id,title,description,category,reward_usdc,deadline,status,tech_tags,publisher:users!bounties_publisher_id_fkey(nickname),claimed_by_user:users!bounties_claimed_by_fkey(nickname)",
    )
    .in("status", ["open", "in_progress", "delivered"])
    .limit(pageSize)
    .order("created_at", { ascending: false });

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((record: unknown) => {
    const r = record as BountyRecord;
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      rewardUsdc: r.reward_usdc,
      deadline: r.deadline,
      status: r.status,
      publisherNickname: r.publisher?.nickname ?? null,
      claimedByNickname: r.claimed_by_user?.nickname ?? null,
      techTags: r.tech_tags,
    };
  });
}

export async function getBountyById(
  supabase: SupabaseClient,
  bountyId: string,
): Promise<BountyDetail | null> {
  const result = await supabase
    .from("bounties")
    .select(
      "id,title,description,category,reward_usdc,deadline,status,publisher_id,tech_tags,delivery_standard,publisher:users!bounties_publisher_id_fkey(nickname),claimed_by_user:users!bounties_claimed_by_fkey(nickname)",
    )
    .eq("id", bountyId)
    .maybeSingle();

  if (result.error || !result.data) {
    return null;
  }

  const record = result.data as unknown as BountyRecord;
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    rewardUsdc: record.reward_usdc,
    deadline: record.deadline,
    status: record.status,
    publisherId: record.publisher_id,
    techTags: record.tech_tags,
    deliveryStandard: record.delivery_standard,
    publisherNickname: record.publisher?.nickname ?? null,
    claimedByNickname: record.claimed_by_user?.nickname ?? null,
  };
}

/**
 * 更新任务状态（带状态机校验）
 */
export async function updateBountyStatus(
  supabase: SupabaseClient,
  bountyId: string,
  nextStatus: BountyStatus,
  extraFields: Record<string, unknown> = {},
): Promise<{ success: boolean; error?: string }> {
  // 获取当前状态
  const { data: bounty, error: fetchError } = await supabase
    .from("bounties")
    .select("status")
    .eq("id", bountyId)
    .single();

  if (fetchError || !bounty) {
    return { success: false, error: "任务不存在" };
  }

  const currentStatus = bounty.status as BountyStatus;

  if (!canTransitionBountyStatus(currentStatus, nextStatus)) {
    return { success: false, error: `任务状态不允许从 ${currentStatus} 变为 ${nextStatus}` };
  }

  const { error } = await supabase
    .from("bounties")
    .update({ status: nextStatus, updated_at: new Date().toISOString(), ...extraFields })
    .eq("id", bountyId);

  if (error) {
    return { success: false, error: "更新任务状态失败" };
  }

  return { success: true };
}

/**
 * 取消任务（仅发布方可操作）
 */
export async function cancelBounty(
  supabase: SupabaseClient,
  bountyId: string,
  publisherId: string,
  cancelReason?: string,
): Promise<{ success: boolean; error?: string }> {
  // 验证发布方
  const { data: bounty, error: fetchError } = await supabase
    .from("bounties")
    .select("publisher_id,status")
    .eq("id", bountyId)
    .single();

  if (fetchError || !bounty) {
    return { success: false, error: "任务不存在" };
  }

  if (bounty.publisher_id !== publisherId) {
    return { success: false, error: "只有发布方可以取消任务" };
  }

  if (bounty.status === "in_progress") {
    // 进行中的任务需要检查是否超过宽限期
    return { success: false, error: "进行中的任务请通过争议系统处理" };
  }

  if (bounty.status !== "open") {
    return { success: false, error: `无法取消状态为 ${bounty.status} 的任务` };
  }

  const { error } = await supabase
    .from("bounties")
    .update({
      status: "cancelled",
      cancel_reason: cancelReason?.trim() || null,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bountyId);

  if (error) {
    return { success: false, error: "取消任务失败" };
  }

  return { success: true };
}
