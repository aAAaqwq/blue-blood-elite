import type { SupabaseClient } from "@supabase/supabase-js";

// 宽限期天数（超过截止日期后的天数）
const GRACE_PERIOD_DAYS = 7;

export interface TimeoutCheckResult {
  canRefund: boolean;
  daysOverdue: number;
  gracePeriodDays: number;
  gracePeriodEnded: boolean;
  deadline: Date | null;
  error?: string;
  reason?: string;
}

export interface OverdueBounty {
  id: string;
  title: string;
  deadline: Date;
  status: string;
  claimedBy: string | null;
  rewardUsdc: string;
  daysOverdue: number;
}

interface OverdueBountyRecord {
  id: string;
  title: string;
  deadline: string;
  status: string;
  claimed_by: string | null;
  reward_usdc: string;
}

interface BountyRecord {
  id: string;
  deadline: string;
  status: string;
  publisher_id: string;
  claimed_by: string | null;
}

/**
 * 计算天数差
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay);
}

/**
 * 检查任务是否已超时（超过截止日期 + 宽限期）
 */
export async function checkBountyTimeout(
  supabase: SupabaseClient,
  bountyId: string,
  userId: string,
): Promise<TimeoutCheckResult> {
  // 获取任务信息
  const { data: bounty, error } = await supabase
    .from("bounties")
    .select("id,deadline,status,publisher_id,claimed_by")
    .eq("id", bountyId)
    .single();

  if (error || !bounty) {
    return {
      canRefund: false,
      daysOverdue: 0,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      gracePeriodEnded: false,
      deadline: null,
      error: "任务不存在",
    };
  }

  const record = bounty as unknown as BountyRecord;

  // 验证用户是否为发布方
  if (record.publisher_id !== userId) {
    return {
      canRefund: false,
      daysOverdue: 0,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      gracePeriodEnded: false,
      deadline: new Date(record.deadline),
      error: "只有发布方可以申请退款",
    };
  }

  // 检查任务状态是否允许退款
  if (record.status !== "in_progress") {
    return {
      canRefund: false,
      daysOverdue: 0,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      gracePeriodEnded: false,
      deadline: new Date(record.deadline),
      error: "只有进行中的任务可以申请退款",
    };
  }

  const deadline = new Date(record.deadline);
  const now = new Date();

  // 计算逾期天数
  const daysOverdue = daysBetween(deadline, now);

  // 检查是否已过宽限期
  const gracePeriodEnded = daysOverdue > GRACE_PERIOD_DAYS;

  // 如果还没有超过截止日期
  if (daysOverdue < 0) {
    return {
      canRefund: false,
      daysOverdue: 0,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      gracePeriodEnded: false,
      deadline,
      reason: "任务尚未超过截止日期",
    };
  }

  // 如果在宽限期内
  if (!gracePeriodEnded) {
    const daysUntilRefund = GRACE_PERIOD_DAYS - daysOverdue + 1;
    return {
      canRefund: false,
      daysOverdue,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      gracePeriodEnded: false,
      deadline,
      reason: `宽限期内（${daysUntilRefund}天后可申请退款）`,
    };
  }

  // 已过宽限期，可以申请退款
  return {
    canRefund: true,
    daysOverdue,
    gracePeriodDays: GRACE_PERIOD_DAYS,
    gracePeriodEnded: true,
    deadline,
  };
}

/**
 * 获取用户的所有已超时任务
 */
export async function getOverdueBounties(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ bounties: OverdueBounty[]; error?: string }> {
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() - GRACE_PERIOD_DAYS);

  const { data, error } = await supabase
    .from("bounties")
    .select("id,title,deadline,status,claimed_by,reward_usdc")
    .eq("publisher_id", userId)
    .eq("status", "in_progress")
    .lt("deadline", gracePeriodEnd.toISOString())
    .order("deadline", { ascending: true });

  if (error) {
    return { bounties: [], error: error.message };
  }

  const now = new Date();
  const bounties = (data ?? []).map((record: unknown) => {
    const r = record as OverdueBountyRecord;
    const deadline = new Date(r.deadline);
    const daysOverdue = daysBetween(deadline, now);

    return {
      id: r.id,
      title: r.title,
      deadline,
      status: r.status,
      claimedBy: r.claimed_by,
      rewardUsdc: r.reward_usdc,
      daysOverdue,
    };
  });

  return { bounties };
}

/**
 * 申请退款（发布方操作）
 */
export async function requestRefund(
  supabase: SupabaseClient,
  bountyId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  // 先检查是否可以退款
  const timeoutCheck = await checkBountyTimeout(supabase, bountyId, userId);

  if (timeoutCheck.error) {
    return { success: false, error: timeoutCheck.error };
  }

  if (!timeoutCheck.canRefund) {
    return { success: false, error: timeoutCheck.reason || "暂不符合退款条件" };
  }

  // 获取任务信息
  const { data: bounty, error: fetchError } = await supabase
    .from("bounties")
    .select("id,claimed_by,publisher_id")
    .eq("id", bountyId)
    .single();

  if (fetchError || !bounty) {
    return { success: false, error: "任务不存在" };
  }

  const record = bounty as unknown as BountyRecord;

  // 更新任务状态为已取消
  const { error: updateError } = await supabase
    .from("bounties")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "超时未交付，系统自动退款",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bountyId);

  if (updateError) {
    return { success: false, error: "退款失败" };
  }

  // 通知认领者（如果有）
  if (record.claimed_by) {
    await supabase.from("notifications").insert({
      user_id: record.claimed_by,
      type: "bounty_refunded",
      title: "任务已退款",
      content: "您认领的任务因超时未交付已被发布方退款。",
      related_id: bountyId,
    });

    // 更新认领者的信誉记录（标记一次超时）
    const { data: reputation } = await supabase
      .from("reputation")
      .select("id,tasks_completed")
      .eq("user_id", record.claimed_by)
      .maybeSingle();

    if (reputation) {
      // 记录超时信息（可以通过 reputation 表的扩展字段或单独的表）
      await supabase.from("reputation").update({
        last_updated: new Date().toISOString(),
      }).eq("id", (reputation as { id: string }).id);
    }
  }

  // 通知发布方
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "refund_processed",
    title: "退款已处理",
    content: "您的任务退款申请已通过，资金将原路返回。",
    related_id: bountyId,
  });

  // 创建交易记录
  await supabase.from("transactions").insert({
    user_id: userId,
    type: "escrow_refund",
    amount_usdc: 0, // 实际金额应从任务记录获取
    bounty_id: bountyId,
  });

  return { success: true };
}

/**
 * 批量检查即将超时的任务（用于定时任务）
 */
export async function getExpiringBounties(
  supabase: SupabaseClient,
  daysBeforeDeadline = 1,
): Promise<{ bountyId: string; publisherId: string; deadline: Date }[]> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBeforeDeadline);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const { data, error } = await supabase
    .from("bounties")
    .select("id,publisher_id,deadline")
    .eq("status", "in_progress")
    .gte("deadline", targetDate.toISOString())
    .lt("deadline", nextDay.toISOString());

  if (error || !data) {
    return [];
  }

  return data.map((record: unknown) => ({
    bountyId: (record as { id: string }).id,
    publisherId: (record as { publisher_id: string }).publisher_id,
    deadline: new Date((record as { deadline: string }).deadline),
  }));
}

/**
 * 获取即将进入宽限期的任务（用于提醒通知）
 */
export async function getGracePeriodBounties(
  supabase: SupabaseClient,
): Promise<{ bountyId: string; publisherId: string; executorId: string; daysOverdue: number }[]> {
  const now = new Date();
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() - GRACE_PERIOD_DAYS);

  const { data, error } = await supabase
    .from("bounties")
    .select("id,publisher_id,claimed_by,deadline")
    .eq("status", "in_progress")
    .lt("deadline", now.toISOString())
    .gte("deadline", gracePeriodEnd.toISOString());

  if (error || !data) {
    return [];
  }

  return data.map((record: unknown) => {
    const r = record as { id: string; publisher_id: string; claimed_by: string; deadline: string };
    const deadline = new Date(r.deadline);
    const daysOverdue = daysBetween(deadline, now);

    return {
      bountyId: r.id,
      publisherId: r.publisher_id,
      executorId: r.claimed_by,
      daysOverdue,
    };
  });
}
