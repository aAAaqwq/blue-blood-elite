import { describe, expect, it, vi } from "vitest";

import {
  listBounties,
  getBountyById,
  updateBountyStatus,
  cancelBounty,
} from "@/repositories/bounties.repository";

describe("bounties repository", () => {
  it("lists open and in_progress bounties", async () => {
    const mockData = [
      {
        id: "bounty-1",
        title: "RAG 系统开发",
        description: "需要开发一个基于 LlamaIndex 的 RAG 系统",
        category: "AI模型",
        reward_usdc: "500",
        deadline: "2026-05-15T00:00:00Z",
        status: "open",
        publisher: { nickname: "张三" },
        claimed_by_user: null,
      },
      {
        id: "bounty-2",
        title: "Agent 自动化脚本",
        description: "需要开发一个自动化 Agent 脚本",
        category: "Agent开发",
        reward_usdc: "300",
        deadline: "2026-05-20T00:00:00Z",
        status: "in_progress",
        publisher: { nickname: "李四" },
        claimed_by_user: { nickname: "王五" },
      },
    ];

    const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const limit = vi.fn().mockReturnValue({ order });
    const inFn = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ in: inFn });
    const from = vi.fn().mockReturnValue({ select });

    const result = await listBounties({ from } as never);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("RAG 系统开发");
    expect(result[0].publisherNickname).toBe("张三");
    expect(result[1].status).toBe("in_progress");
    expect(result[1].claimedByNickname).toBe("王五");
  });

  it("returns empty array when fetching bounties fails", async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
    const limit = vi.fn().mockReturnValue({ order });
    const inFn = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ in: inFn });
    const from = vi.fn().mockReturnValue({ select });

    const result = await listBounties({ from } as never);

    expect(result).toEqual([]);
  });

  it("gets a single bounty by id", async () => {
    const mockData = {
      id: "bounty-1",
      title: "RAG 系统开发",
      description: "需要开发一个基于 LlamaIndex 的 RAG 系统",
      category: "AI模型",
      reward_usdc: "500",
      deadline: "2026-05-15T00:00:00Z",
      status: "open",
      publisher: { nickname: "张三" },
      claimed_by_user: null,
    };

    const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    const result = await getBountyById({ from } as never, "bounty-1");

    expect(result).not.toBeNull();
    expect(result?.title).toBe("RAG 系统开发");
  });

  it("returns null when bounty not found", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    const result = await getBountyById({ from } as never, "non-existent");

    expect(result).toBeNull();
  });

  describe("updateBountyStatus", () => {
    it("transitions status successfully", async () => {
      // First call: fetch current status → open
      const singleFetch = vi.fn().mockResolvedValue({
        data: { status: "open" },
        error: null,
      });
      // Second call: update → success
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const eqUpdate = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdate });

      const from = vi.fn().mockImplementation((table: string) => {
        // Both calls target "bounties"
        return { select: selectFetch, update: updateMock };
      });

      const result = await updateBountyStatus(
        { from } as never,
        "b-1",
        "in_progress" as never,
      );

      expect(result.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
    });

    it("fails when bounty not found", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "not found" },
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select: selectFetch });

      const result = await updateBountyStatus(
        { from } as never,
        "non-existent",
        "in_progress" as never,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("不存在");
    });

    it("fails when status transition is invalid", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { status: "completed" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select: selectFetch });

      const result = await updateBountyStatus(
        { from } as never,
        "b-1",
        "open" as never,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("不允许");
    });

    it("fails when database update errors", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { status: "open" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const eqUpdate = vi.fn().mockResolvedValue({ error: { message: "db error" } });
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdate });

      const from = vi.fn().mockImplementation(() => ({
        select: selectFetch,
        update: updateMock,
      }));

      const result = await updateBountyStatus(
        { from } as never,
        "b-1",
        "in_progress" as never,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("失败");
    });
  });

  describe("cancelBounty", () => {
    it("cancels an open bounty as publisher", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { publisher_id: "u-1", status: "open" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const eqUpdate = vi.fn().mockResolvedValue({ error: null });
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdate });

      const from = vi.fn().mockImplementation(() => ({
        select: selectFetch,
        update: updateMock,
      }));

      const result = await cancelBounty(
        { from } as never,
        "b-1",
        "u-1",
        "不需要了",
      );

      expect(result.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
    });

    it("fails when bounty not found", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "not found" },
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const from = vi.fn().mockReturnValue({ select: selectFetch });

      const result = await cancelBounty(
        { from } as never,
        "non-existent",
        "u-1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("不存在");
    });

    it("fails when user is not the publisher", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { publisher_id: "u-2", status: "open" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const from = vi.fn().mockReturnValue({ select: selectFetch });

      const result = await cancelBounty(
        { from } as never,
        "b-1",
        "u-1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("发布方");
    });

    it("fails when bounty is in_progress", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { publisher_id: "u-1", status: "in_progress" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const from = vi.fn().mockReturnValue({ select: selectFetch });

      const result = await cancelBounty(
        { from } as never,
        "b-1",
        "u-1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("争议");
    });

    it("fails when bounty status is not open or in_progress", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { publisher_id: "u-1", status: "completed" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const from = vi.fn().mockReturnValue({ select: selectFetch });

      const result = await cancelBounty(
        { from } as never,
        "b-1",
        "u-1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("无法取消");
    });

    it("fails when database update errors", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { publisher_id: "u-1", status: "open" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });
      const eqUpdate = vi.fn().mockResolvedValue({ error: { message: "db error" } });
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdate });

      const from = vi.fn().mockImplementation(() => ({
        select: selectFetch,
        update: updateMock,
      }));

      const result = await cancelBounty(
        { from } as never,
        "b-1",
        "u-1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("失败");
    });
  });
});