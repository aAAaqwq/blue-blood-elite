import type { SupabaseClient } from "@supabase/supabase-js";

type Delivery = {
  id: string;
  bountyId: string;
  content: string;
  links: string[] | null;
  status: "submitted" | "accepted" | "rejected";
  reviewNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

type DeliveryRecord = {
  id: string;
  bounty_id: string;
  content: string;
  links: string[] | null;
  status: string;
  review_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

/**
 * 获取任务的交付记录
 */
export async function getDeliveryByBountyId(
  supabase: SupabaseClient,
  bountyId: string,
): Promise<Delivery | null> {
  const result = await supabase
    .from("deliveries")
    .select("id,bounty_id,content,links,status,review_note,submitted_at,reviewed_at")
    .eq("bounty_id", bountyId)
    .maybeSingle();

  if (result.error || !result.data) {
    return null;
  }

  const r = result.data as unknown as DeliveryRecord;
  return {
    id: r.id,
    bountyId: r.bounty_id,
    content: r.content,
    links: r.links,
    status: r.status as "submitted" | "accepted" | "rejected",
    reviewNote: r.review_note,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
  };
}

/**
 * 检查任务是否已有交付
 */
async function hasDelivery(
  supabase: SupabaseClient,
  bountyId: string,
): Promise<boolean> {
  const result = await supabase
    .from("deliveries")
    .select("id")
    .eq("bounty_id", bountyId)
    .maybeSingle();

  return !!result.data;
}

/**
 * 创建交付记录
 */
export async function createDelivery(
  supabase: SupabaseClient,
  bountyId: string,
  content: string,
  links?: string[],
): Promise<{ success: boolean; error?: string; deliveryId?: string }> {
  const trimmedContent = content?.trim();
  if (!trimmedContent) {
    return { success: false, error: "请填写交付说明" };
  }

  const result = await supabase
    .from("deliveries")
    .insert({
      bounty_id: bountyId,
      content: trimmedContent,
      links: links && links.length > 0 ? links : null,
      status: "submitted",
    })
    .select("id")
    .single();

  if (result.error) {
    return { success: false, error: "提交交付失败" };
  }

  return { success: true, deliveryId: result.data.id };
}
