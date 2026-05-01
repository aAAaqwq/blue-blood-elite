import { describe, expect, it, vi } from "vitest";

import {
  getReviewsForBounty,
  createReview,
} from "@/repositories/reviews.repository";

describe("reviews repository", () => {
  describe("getReviewsForBounty", () => {
    it("returns reviews for a bounty", async () => {
      const mockData = [
        {
          id: "rev-1",
          bounty_id: "b-1",
          reviewer_id: "u-1",
          reviewee_id: "u-2",
          rating: 5,
          comment: "非常出色的工作",
          created_at: "2026-04-25T00:00:00Z",
          reviewer: { nickname: "张三" },
          reviewee: { nickname: "李四" },
        },
      ];
      const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getReviewsForBounty({ from } as never, "b-1");

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
      expect(result[0].reviewerNickname).toBe("张三");
      expect(result[0].revieweeNickname).toBe("李四");
    });

    it("returns empty array on error", async () => {
      const order = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getReviewsForBounty({ from } as never, "b-1");

      expect(result).toEqual([]);
    });
  });

  describe("createReview", () => {
    it("creates a review successfully", async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: "rev-new" },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await createReview(
        { from } as never,
        "b-1",
        "u-1",
        "u-2",
        5,
        "优秀的工作质量",
      );

      expect(result.success).toBe(true);
      expect(result.reviewId).toBe("rev-new");
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          bounty_id: "b-1",
          reviewer_id: "u-1",
          reviewee_id: "u-2",
          rating: 5,
          comment: "优秀的工作质量",
        }),
      );
    });

    it("fails when rating is out of range", async () => {
      const result = await createReview(
        {} as never,
        "b-1",
        "u-1",
        "u-2",
        0,
        "bad",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("1-5");
    });

    it("fails when rating exceeds 5", async () => {
      const result = await createReview(
        {} as never,
        "b-1",
        "u-1",
        "u-2",
        6,
        "too high",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("1-5");
    });

    it("fails when database error occurs", async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "db error" },
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await createReview(
        { from } as never,
        "b-1",
        "u-1",
        "u-2",
        4,
        "不错",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("失败");
    });
  });
});
