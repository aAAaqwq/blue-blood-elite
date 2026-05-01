import { describe, expect, it, vi } from "vitest";

import {
  getDeliveryByBountyId,
  createDelivery,
} from "@/repositories/deliveries.repository";

describe("deliveries repository", () => {
  describe("getDeliveryByBountyId", () => {
    it("returns delivery when found", async () => {
      const mockData = {
        id: "del-1",
        bounty_id: "b-1",
        content: "交付说明",
        links: ["https://github.com/example"],
        status: "submitted",
        review_note: null,
        submitted_at: "2026-04-15T00:00:00Z",
        reviewed_at: null,
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getDeliveryByBountyId({ from } as never, "b-1");

      expect(result).not.toBeNull();
      expect(result?.content).toBe("交付说明");
      expect(result?.links).toEqual(["https://github.com/example"]);
    });

    it("returns null when no delivery found", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getDeliveryByBountyId({ from } as never, "b-1");

      expect(result).toBeNull();
    });
  });

  describe("createDelivery", () => {
    it("creates a delivery successfully", async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: "del-new" },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await createDelivery(
        { from } as never,
        "b-1",
        "已完成开发，详见链接",
        ["https://github.com/example/pr/1"],
      );

      expect(result.success).toBe(true);
      expect(result.deliveryId).toBe("del-new");
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          bounty_id: "b-1",
          content: "已完成开发，详见链接",
          links: ["https://github.com/example/pr/1"],
          status: "submitted",
        }),
      );
    });

    it("creates delivery without links", async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: "del-new" },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await createDelivery(
        { from } as never,
        "b-1",
        "交付内容",
        undefined,
      );

      expect(result.success).toBe(true);
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          links: null,
        }),
      );
    });

    it("fails when content is empty", async () => {
      const result = await createDelivery(
        {} as never,
        "b-1",
        "",
        undefined,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("交付说明");
    });

    it("fails when database error occurs", async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "db error" },
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await createDelivery(
        { from } as never,
        "b-1",
        "交付内容",
        undefined,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("失败");
    });
  });
});
