import { describe, expect, it, vi } from "vitest";

import type { ProfileUpdateInput, VerifyApplicationInput } from "@/domains/users/contracts";
import {
  saveUserProfile,
  getUserProfile,
  submitVerifyApplication,
  getUserVerifyStatus,
  getUserCompletedBounties,
  getPublicProfile,
} from "@/repositories/users.repository";

const profilePayload: ProfileUpdateInput = {
  nickname: "张云飞",
  bio: "专注企业级大模型落地。",
  school: "清华大学",
  company: "独立开发者",
  direction: "AI模型",
  githubUrl: "https://github.com/example",
  linkedinUrl: "https://linkedin.com/in/example",
  skills: ["Python", "RAG", "Docker"],
};

const verifyPayload: VerifyApplicationInput = {
  verifyType: "github_500stars",
  evidenceUrl: "https://github.com/example/repo",
};

describe("users repository", () => {
  it("upserts profile and skill tags", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn(() => ({ eq }));
    const from = vi.fn((table: string) => {
      if (table === "users") return { upsert };
      if (table === "user_skills") return { delete: deleteFn, insert };
      throw new Error(`Unexpected table: ${table}`);
    });

    await saveUserProfile({ from } as never, "user-id", profilePayload);

    expect(from).toHaveBeenCalledWith("users");
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("user_skills");
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("reads and normalizes a user profile with skills", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "user-id",
        nickname: "张云飞",
        bio: "专注企业级大模型落地。",
        school: "清华大学",
        company: "独立开发者",
        direction: "AI模型",
        github_url: "https://github.com/example",
        linkedin_url: "https://linkedin.com/in/example",
        is_verified: true,
      },
      error: null,
    });
    const order = vi.fn().mockResolvedValue({
      data: [{ skill_name: "Python" }, { skill_name: "RAG" }],
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const eqSkills = vi.fn(() => ({ order }));
    const select = vi.fn((columns: string) => {
      if (columns === "*" || columns === "id,nickname,bio,school,company,direction,github_url,linkedin_url,is_verified") {
        return { eq };
      }
      if (columns === "skill_name") {
        return { eq: eqSkills };
      }
      return { eq };
    });
    const from = vi.fn(() => ({ select }));

    await expect(getUserProfile({ from } as never, "user-id")).resolves.toEqual({
      id: "user-id",
      nickname: "张云飞",
      bio: "专注企业级大模型落地。",
      school: "清华大学",
      company: "独立开发者",
      direction: "AI模型",
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      isVerified: true,
      skills: ["Python", "RAG"],
    });
  });

  it("returns null when a user profile does not exist", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    await expect(getUserProfile({ from } as never, "missing-user")).resolves.toBeNull();
  });

  it("throws when reading a user profile fails", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    await expect(getUserProfile({ from } as never, "user-id")).rejects.toThrow(
      "permission denied",
    );
  });

  it("creates a verification application", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert }));

    await submitVerifyApplication({ from } as never, "user-id", verifyPayload);

    expect(from).toHaveBeenCalledWith("verify_applications");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-id",
      verify_type: verifyPayload.verifyType,
      evidence_url: verifyPayload.evidenceUrl,
    });
  });

  describe("getUserCompletedBounties", () => {
    it("returns completed bounties for a user", async () => {
      const mockData = [
        { id: "b-1", title: "RAG系统", reward_usdc: "500", updated_at: "2026-04-20T00:00:00Z" },
        { id: "b-2", title: "Agent脚本", reward_usdc: "300", updated_at: "2026-04-18T00:00:00Z" },
      ];
      const limit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ or });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUserCompletedBounties({ from } as never, "u-1");

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("RAG系统");
      expect(result[0].rewardUsdc).toBe("500");
    });

    it("returns empty array on error", async () => {
      const limit = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ or });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUserCompletedBounties({ from } as never, "u-1");

      expect(result).toEqual([]);
    });
  });

  describe("getPublicProfile", () => {
    it("returns full public profile with stats", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: {
          id: "u-1",
          nickname: "张云飞",
          bio: "AI工程师",
          school: "清华大学",
          company: "独立开发者",
          direction: "AI模型",
          github_url: null,
          linkedin_url: null,
          is_verified: true,
        },
        error: null,
      });
      const orderSkills = vi.fn().mockResolvedValue({
        data: [{ skill_name: "Python" }, { skill_name: "RAG" }],
        error: null,
      });
      const eqSkills = vi.fn().mockReturnValue({ order: orderSkills });
      const orCount = vi.fn().mockResolvedValue({ count: 3, error: null });
      const eqCount = vi.fn().mockReturnValue({ or: orCount });
      const selectCount = vi.fn().mockReturnValue({ eq: eqCount });
      const singleMeta = vi.fn().mockResolvedValue({
        data: { level: 2, points: 150 },
        error: null,
      });
      const eqMeta = vi.fn().mockReturnValue({ single: singleMeta });

      const from = vi.fn().mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: vi.fn().mockImplementation((cols: string) => {
              if (cols.includes("level")) return { eq: eqMeta };
              return { eq: vi.fn().mockReturnValue({ maybeSingle }) };
            }),
          };
        }
        if (table === "user_skills") return { select: vi.fn().mockReturnValue({ eq: eqSkills }) };
        if (table === "bounties") return { select: selectCount };
        return { select: vi.fn() };
      });

      const result = await getPublicProfile({ from } as never, "u-1");

      expect(result).not.toBeNull();
      expect(result?.nickname).toBe("张云飞");
      expect(result?.isVerified).toBe(true);
      expect(result?.skills).toEqual(["Python", "RAG"]);
      expect(result?.completedBountyCount).toBe(3);
      expect(result?.level).toBe(2);
      expect(result?.points).toBe(150);
    });

    it("returns null when user not found", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getPublicProfile({ from } as never, "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("saveUserProfile error handling", () => {
    it("throws on upsert error", async () => {
      const upsert = vi.fn().mockResolvedValue({ error: { message: "upsert failed" } });
      const from = vi.fn().mockReturnValue({ upsert });

      await expect(
        saveUserProfile({ from } as never, "user-id", profilePayload),
      ).rejects.toThrow("upsert failed");
    });

    it("throws on skills delete error", async () => {
      const upsert = vi.fn().mockResolvedValue({ error: null });
      const eq = vi.fn().mockResolvedValue({ error: { message: "delete failed" } });
      const deleteFn = vi.fn(() => ({ eq }));
      const from = vi.fn((table: string) => {
        if (table === "users") return { upsert };
        if (table === "user_skills") return { delete: deleteFn };
        return {};
      });

      await expect(
        saveUserProfile({ from } as never, "user-id", profilePayload),
      ).rejects.toThrow("delete failed");
    });

    it("throws on skills insert error", async () => {
      const upsert = vi.fn().mockResolvedValue({ error: null });
      const insert = vi.fn().mockResolvedValue({ error: { message: "insert failed" } });
      const eq = vi.fn().mockResolvedValue({ error: null });
      const deleteFn = vi.fn(() => ({ eq }));
      const from = vi.fn((table: string) => {
        if (table === "users") return { upsert };
        if (table === "user_skills") return { delete: deleteFn, insert };
        return {};
      });

      await expect(
        saveUserProfile({ from } as never, "user-id", profilePayload),
      ).rejects.toThrow("insert failed");
    });
  });

  describe("submitVerifyApplication error handling", () => {
    it("throws on insert error", async () => {
      const insert = vi.fn().mockResolvedValue({ error: { message: "insert failed" } });
      const from = vi.fn().mockReturnValue({ insert });

      await expect(
        submitVerifyApplication({ from } as never, "user-id", verifyPayload),
      ).rejects.toThrow("insert failed");
    });
  });

  describe("getUserVerifyStatus", () => {
    it("returns verification status with applications", async () => {
      const mockUser = { is_verified: true, verified_at: "2026-04-15T00:00:00Z" };
      const mockApps = [
        {
          id: "va-1",
          verify_type: "github_500stars",
          evidence_url: "https://github.com/repo",
          status: "approved",
          reviewer_id: "admin-1",
          review_note: "通过",
          created_at: "2026-04-10T00:00:00Z",
          reviewed_at: "2026-04-15T00:00:00Z",
        },
      ];

      let callCount = 0;
      const from = vi.fn().mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1 && table === "users") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
              }),
            }),
          };
        }
        if (table === "verify_applications") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockApps, error: null }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const result = await getUserVerifyStatus({ from } as never, "user-1");

      expect(result.isVerified).toBe(true);
      expect(result.verifiedAt).toBe("2026-04-15T00:00:00Z");
      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].verify_type).toBe("github_500stars");
    });

    it("returns unverified status when no data", async () => {
      let callCount = 0;
      const from = vi.fn().mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1 && table === "users") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      });

      const result = await getUserVerifyStatus({ from } as never, "user-1");

      expect(result.isVerified).toBe(false);
      expect(result.verifiedAt).toBeNull();
      expect(result.applications).toEqual([]);
    });

    it("throws on user query error", async () => {
      const from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } }),
          }),
        }),
      });

      await expect(
        getUserVerifyStatus({ from } as never, "user-1"),
      ).rejects.toThrow("db error");
    });

    it("throws on applications query error", async () => {
      let callCount = 0;
      const from = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { is_verified: false }, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: { message: "apps error" } }),
            }),
          }),
        };
      });

      await expect(
        getUserVerifyStatus({ from } as never, "user-1"),
      ).rejects.toThrow("apps error");
    });
  });
});
