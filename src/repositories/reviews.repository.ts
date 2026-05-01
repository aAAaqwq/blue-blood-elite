import type { SupabaseClient } from "@supabase/supabase-js";

export type Review = {
  id: string;
  bountyId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerNickname: string;
  revieweeNickname: string;
};

type ReviewRecord = {
  id: string;
  bounty_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { nickname: string } | null;
  reviewee: { nickname: string } | null;
};

/**
 * 获取任务的所有评价
 */
export async function getReviewsForBounty(
  supabase: SupabaseClient,
  bountyId: string,
): Promise<Review[]> {
  const result = await supabase
    .from("reviews")
    .select(
      "id,bounty_id,reviewer_id,reviewee_id,rating,comment,created_at,reviewer:users!reviews_reviewer_id_fkey(nickname),reviewee:users!reviews_reviewee_id_fkey(nickname)",
    )
    .eq("bounty_id", bountyId)
    .order("created_at", { ascending: false });

  if (result.error) {
    return [];
  }

  return (result.data ?? []).map((record: unknown) => {
    const r = record as ReviewRecord;
    return {
      id: r.id,
      bountyId: r.bounty_id,
      reviewerId: r.reviewer_id,
      revieweeId: r.reviewee_id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      reviewerNickname: r.reviewer?.nickname ?? "未知用户",
      revieweeNickname: r.reviewee?.nickname ?? "未知用户",
    };
  });
}

/**
 * 创建评价
 */
export async function createReview(
  supabase: SupabaseClient,
  bountyId: string,
  reviewerId: string,
  revieweeId: string,
  rating: number,
  comment?: string,
): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  if (rating < 1 || rating > 5) {
    return { success: false, error: "评分必须在1-5之间" };
  }

  const result = await supabase
    .from("reviews")
    .insert({
      bounty_id: bountyId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      comment: comment?.trim() || null,
    })
    .select("id")
    .single();

  if (result.error) {
    return { success: false, error: "提交评价失败" };
  }

  return { success: true, reviewId: result.data.id };
}
