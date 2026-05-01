import { describe, expect, it, vi } from "vitest";

describe("discover repository", () => {
  it("maps verified user records into discover cards", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "user-1",
          nickname: "张云飞",
          school: "清华大学",
          company: "独立开发者",
          direction: "AI模型",
          avatar_url: null,
          is_verified: true,
          user_skills: [
            { skill_name: "Python" },
            { skill_name: "RAG" },
          ],
        },
      ],
      error: null,
    });
    const limit = vi.fn(() => ({ order }));
    const eq = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    const { listDiscoverUsers } = await import("@/repositories/discover.repository");

    const users = await listDiscoverUsers({ from } as never);

    expect(users).toEqual([
      {
        id: "user-1",
        nickname: "张云飞",
        school: "清华大学",
        company: "独立开发者",
        direction: "AI模型",
        avatarUrl: null,
        isVerified: true,
        skills: ["Python", "RAG"],
      },
    ]);
  });

  it("returns an empty list when the query fails", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });
    const limit = vi.fn(() => ({ order }));
    const eq = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    const { listDiscoverUsers } = await import("@/repositories/discover.repository");

    await expect(listDiscoverUsers({ from } as never)).resolves.toEqual([]);
  });

  it("returns an empty list when the users table is missing", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Could not find the table 'public.users' in the schema cache" },
    });
    const limit = vi.fn(() => ({ order }));
    const eq = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    const { listDiscoverUsers } = await import("@/repositories/discover.repository");

    await expect(listDiscoverUsers({ from } as never)).resolves.toEqual([]);
  });

  it("returns an empty list when the query returns null data", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const limit = vi.fn(() => ({ order }));
    const eq = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    const { listDiscoverUsers } = await import("@/repositories/discover.repository");

    await expect(listDiscoverUsers({ from } as never)).resolves.toEqual([]);
  });
});
