import { describe, expect, it, vi } from "vitest";

import {
  getApplicationsForBounty,
  hasUserApplied,
  getApplicationById,
  createApplication,
} from "@/repositories/applications.repository";

describe("applications repository", () => {
  describe("getApplicationsForBounty", () => {
    it("returns applications with applicant nicknames", async () => {
      const mockData = [
        {
          id: "app-1",
          bounty_id: "b-1",
          applicant_id: "u-1",
          message: "我有3年RAG经验",
          status: "pending",
          created_at: "2026-04-01T00:00:00Z",
          reviewed_at: null,
          applicant: { nickname: "张三" },
        },
      ];

      const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationsForBounty({ from } as never, "b-1");

      expect(result).toHaveLength(1);
      expect(result[0].applicantNickname).toBe("张三");
      expect(result[0].status).toBe("pending");
    });
  });

  describe("hasUserApplied", () => {
    it("returns true when user has already applied", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: "app-1" },
        error: null,
      });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ select });

      const result = await hasUserApplied({ from } as never, "b-1", "u-1");

      expect(result).toBe(true);
    });

    it("returns false when user has not applied", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ select });

      const result = await hasUserApplied({ from } as never, "b-1", "u-1");

      expect(result).toBe(false);
    });
  });

  describe("createApplication", () => {
    it("creates a new application successfully", async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: "app-new" },
        error: null,
      });
      const selectInsert = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select: selectInsert });

      // hasUserApplied mock chain: from → select → eq → eq → maybeSingle
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const selectCheck = vi.fn().mockReturnValue({ eq: eq1 });

      const from = vi.fn().mockImplementation((table: string) => {
        if (table === "applications") {
          return { insert, select: selectCheck };
        }
        return { select: selectCheck };
      });

      const result = await createApplication(
        { from } as never,
        "b-1",
        "u-1",
        "我有5年AI开发经验",
      );

      expect(result.success).toBe(true);
      expect(result.applicationId).toBe("app-new");
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          bounty_id: "b-1",
          applicant_id: "u-1",
          message: "我有5年AI开发经验",
          status: "pending",
        }),
      );
    });

    it("fails when user has already applied", async () => {
      // First call: check existing → returns data
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: "existing-app" },
        error: null,
      });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const selectCheck = vi.fn().mockReturnValue({ eq: eq1 });

      // Insert should not be called
      const from = vi.fn().mockReturnValue({ select: selectCheck });

      const result = await createApplication(
        { from } as never,
        "b-1",
        "u-1",
        "再次申请",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("已提交");
    });

    it("fails when message is empty", async () => {
      const result = await createApplication(
        {} as never,
        "b-1",
        "u-1",
        "   ",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("申请说明");
    });

    it("fails when database insert fails", async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "insert failed" },
      });
      const selectInsert = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select: selectInsert });

      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const selectCheck = vi.fn().mockReturnValue({ eq: eq1 });

      const from = vi.fn().mockImplementation((table: string) => {
        if (table === "applications") {
          return { insert, select: selectCheck };
        }
        return { select: selectCheck };
      });

      const result = await createApplication(
        { from } as never,
        "b-1",
        "u-1",
        "申请说明",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("提交申请失败");
    });
  });

  describe("getApplicationById", () => {
    it("returns application by id", async () => {
      const mockData = {
        id: "app-1",
        bounty_id: "b-1",
        applicant_id: "u-1",
        message: "申请说明",
        status: "pending",
        created_at: "2026-04-01T00:00:00Z",
        reviewed_at: null,
        applicant: { nickname: "张三" },
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationById({ from } as never, "app-1");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("app-1");
      expect(result?.applicantNickname).toBe("张三");
    });

    it("returns null when application not found", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationById({ from } as never, "nonexistent");

      expect(result).toBeNull();
    });

    it("returns null on database error", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "db error" },
      });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationById({ from } as never, "app-1");

      expect(result).toBeNull();
    });

    it("handles null applicant gracefully", async () => {
      const mockData = {
        id: "app-1",
        bounty_id: "b-1",
        applicant_id: "u-1",
        message: "申请说明",
        status: "pending",
        created_at: "2026-04-01T00:00:00Z",
        reviewed_at: null,
        applicant: null,
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationById({ from } as never, "app-1");

      expect(result).not.toBeNull();
      expect(result?.applicantNickname).toBe("未知用户");
    });
  });

  describe("getApplicationsForBounty additional cases", () => {
    it("returns empty array on database error", async () => {
      const order = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationsForBounty({ from } as never, "b-1");

      expect(result).toEqual([]);
    });

    it("handles null applicant in list", async () => {
      const mockData = [
        {
          id: "app-1",
          bounty_id: "b-1",
          applicant_id: "u-1",
          message: "申请说明",
          status: "pending",
          created_at: "2026-04-01T00:00:00Z",
          reviewed_at: null,
          applicant: null,
        },
      ];

      const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getApplicationsForBounty({ from } as never, "b-1");

      expect(result).toHaveLength(1);
      expect(result[0].applicantNickname).toBe("未知用户");
    });
  });
});
