import { describe, expect, it, vi } from "vitest";
import {
  getUserConnections,
  getPendingConnections,
  getConnectionBetweenUsers,
  canConnectWithUser,
  createConnection,
  acceptConnection,
  rejectConnection,
  type ConnectionStatus,
} from "@/repositories/connections.repository";

describe("connections repository", () => {
  describe("getUserConnections", () => {
    it("returns connections for user", async () => {
      const mockData = [
        {
          id: "conn-1",
          from_user_id: "user-1",
          to_user_id: "user-2",
          status: "accepted",
          message: "Hello",
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
          from_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
          to_user: { id: "user-2", nickname: "李四", avatar_url: null, school: "清华", company: null, direction: null },
        },
      ];

      const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUserConnections({ from } as never, "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("accepted");
      expect(result[0].otherUser.nickname).toBe("李四");
    });

    it("returns empty array when no connections", async () => {
      const order = vi.fn().mockResolvedValue({ data: [], error: null });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUserConnections({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("returns empty array on error", async () => {
      const order = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUserConnections({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("correctly identifies incoming vs outgoing connections", async () => {
      const mockData = [
        {
          id: "conn-1",
          from_user_id: "user-2",
          to_user_id: "user-1",
          status: "pending",
          message: "Connect with me",
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
          from_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
          to_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
        },
      ];

      const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUserConnections({ from } as never, "user-1");

      // user-1 is the recipient (to_user_id), so otherUser should be from_user
      expect(result[0].toUserId).toBe("user-1");
      expect(result[0].otherUser.id).toBe("user-2");
    });
  });

  describe("getPendingConnections", () => {
    it("returns only pending incoming connections", async () => {
      const mockData = [
        {
          id: "conn-1",
          from_user_id: "user-2",
          to_user_id: "user-1",
          status: "pending",
          message: "Hello",
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
          from_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
          to_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
        },
        {
          id: "conn-2",
          from_user_id: "user-1",
          to_user_id: "user-3",
          status: "pending",
          message: "Hi",
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
          from_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
          to_user: { id: "user-3", nickname: "王五", avatar_url: null, school: null, company: null, direction: null },
        },
      ];

      const order = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getPendingConnections({ from } as never, "user-1");

      // Only conn-1 is incoming to user-1
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("conn-1");
    });
  });

  describe("getConnectionBetweenUsers", () => {
    it("returns connection between two users", async () => {
      const mockData = {
        id: "conn-1",
        from_user_id: "user-1",
        to_user_id: "user-2",
        status: "accepted",
        message: null,
        created_at: "2026-04-30T10:00:00Z",
        updated_at: "2026-04-30T10:00:00Z",
        from_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
        to_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getConnectionBetweenUsers({ from } as never, "user-1", "user-2");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("conn-1");
    });

    it("returns null when no connection exists", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getConnectionBetweenUsers({ from } as never, "user-1", "user-2");

      expect(result).toBeNull();
    });
  });

  describe("canConnectWithUser", () => {
    it("allows connection when no existing connection", async () => {
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await canConnectWithUser({ from } as never, "user-1", "user-2");

      expect(result.canConnect).toBe(true);
    });

    it("prevents connecting with self", async () => {
      const from = vi.fn();

      const result = await canConnectWithUser({ from } as never, "user-1", "user-1");

      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain("自己");
    });

    it("prevents connecting when already connected", async () => {
      const mockData = {
        id: "conn-1",
        from_user_id: "user-1",
        to_user_id: "user-2",
        status: "accepted",
        message: null,
        created_at: "2026-04-30T10:00:00Z",
        updated_at: "2026-04-30T10:00:00Z",
        from_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
        to_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await canConnectWithUser({ from } as never, "user-1", "user-2");

      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain("已经是连接关系");
    });

    it("prevents duplicate pending request from same user", async () => {
      const mockData = {
        id: "conn-1",
        from_user_id: "user-1",
        to_user_id: "user-2",
        status: "pending",
        message: "Hello",
        created_at: "2026-04-30T10:00:00Z",
        updated_at: "2026-04-30T10:00:00Z",
        from_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
        to_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await canConnectWithUser({ from } as never, "user-1", "user-2");

      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain("已经发送了连接请求");
    });

    it("prevents request when other user already sent pending request", async () => {
      const mockData = {
        id: "conn-1",
        from_user_id: "user-2",
        to_user_id: "user-1",
        status: "pending",
        message: "Hello",
        created_at: "2026-04-30T10:00:00Z",
        updated_at: "2026-04-30T10:00:00Z",
        from_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
        to_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
      };

      const maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await canConnectWithUser({ from } as never, "user-1", "user-2");

      expect(result.canConnect).toBe(false);
      expect(result.reason).toContain("对方已向你发送");
    });
  });

  describe("createConnection", () => {
    it("creates connection successfully", async () => {
      // Mock no existing connection
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      // Mock insert success
      const single = vi.fn().mockResolvedValue({ data: { id: "conn-new" }, error: null });
      const selectInsert = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select: selectInsert });

      const from = vi.fn().mockImplementation((table: string) => ({
        select,
        insert,
      }));

      const result = await createConnection({ from } as never, "user-1", "user-2", "Hello!");

      expect(result.success).toBe(true);
      expect(result.connectionId).toBe("conn-new");
    });

    it("fails when cannot connect", async () => {
      const from = vi.fn();

      const result = await createConnection({ from } as never, "user-1", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toContain("自己");
    });

    it("fails when database insert errors", async () => {
      // Mock no existing connection
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const or = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ or });
      // Mock insert failure
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const selectInsert = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select: selectInsert });

      const from = vi.fn().mockImplementation((table: string) => ({
        select,
        insert,
      }));

      const result = await createConnection({ from } as never, "user-1", "user-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("发送连接请求失败");
    });
  });

  describe("acceptConnection", () => {
    it("accepts pending connection successfully", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { to_user_id: "user-2", status: "pending" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });
      const eqUpdate = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq: eqUpdate });

      const from = vi.fn().mockImplementation(() => ({ select, update }));

      const result = await acceptConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(true);
    });

    it("fails when connection not found", async () => {
      const singleFetch = vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select });

      const result = await acceptConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("不存在");
    });

    it("fails when user is not the recipient", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { to_user_id: "user-3", status: "pending" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select });

      const result = await acceptConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("无权操作");
    });

    it("fails when connection is not pending", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { to_user_id: "user-2", status: "accepted" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select });

      const result = await acceptConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("已被处理");
    });
  });

  describe("rejectConnection", () => {
    it("rejects pending connection successfully", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { to_user_id: "user-2", status: "pending" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });
      const eqUpdate = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq: eqUpdate });

      const from = vi.fn().mockImplementation(() => ({ select, update }));

      const result = await rejectConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(true);
    });

    it("fails when connection not found", async () => {
      const singleFetch = vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select });

      const result = await rejectConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("不存在");
    });

    it("fails when user is not the recipient", async () => {
      const singleFetch = vi.fn().mockResolvedValue({
        data: { to_user_id: "user-3", status: "pending" },
        error: null,
      });
      const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
      const select = vi.fn().mockReturnValue({ eq: eqFetch });

      const from = vi.fn().mockReturnValue({ select });

      const result = await rejectConnection({ from } as never, "conn-1", "user-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("无权操作");
    });
  });
});
