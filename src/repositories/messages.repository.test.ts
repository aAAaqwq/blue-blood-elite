import { describe, expect, it, vi } from "vitest";
import {
  getMessagesBetweenUsers,
  sendMessage,
  markMessagesAsRead,
  getConversations,
  getUnreadMessageCount,
} from "@/repositories/messages.repository";

describe("messages repository", () => {
  describe("getMessagesBetweenUsers", () => {
    it("returns messages between two users", async () => {
      const mockData = [
        {
          id: "msg-1",
          sender_id: "user-1",
          receiver_id: "user-2",
          content: "Hello",
          is_read: true,
          created_at: "2026-04-30T10:00:00Z",
          sender: { id: "user-1", nickname: "张三", avatar_url: null },
        },
        {
          id: "msg-2",
          sender_id: "user-2",
          receiver_id: "user-1",
          content: "Hi there",
          is_read: false,
          created_at: "2026-04-30T10:01:00Z",
          sender: { id: "user-2", nickname: "李四", avatar_url: "avatar.jpg" },
        },
      ];

      const limit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getMessagesBetweenUsers({ from } as never, "user-1", "user-2");

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("Hello");
      expect(result[1].content).toBe("Hi there");
      expect(result[0].sender.nickname).toBe("张三");
      expect(result[1].sender.nickname).toBe("李四");
    });

    it("returns empty array when no messages", async () => {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getMessagesBetweenUsers({ from } as never, "user-1", "user-2");

      expect(result).toEqual([]);
    });

    it("returns empty array on error", async () => {
      const limit = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getMessagesBetweenUsers({ from } as never, "user-1", "user-2");

      expect(result).toEqual([]);
    });

    it("respects custom limit parameter", async () => {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      await getMessagesBetweenUsers({ from } as never, "user-1", "user-2", 20);

      expect(limit).toHaveBeenCalledWith(20);
    });

    it("orders messages by created_at ascending", async () => {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      const from = vi.fn().mockReturnValue({ select });

      await getMessagesBetweenUsers({ from } as never, "user-1", "user-2");

      expect(order).toHaveBeenCalledWith("created_at", { ascending: true });
    });
  });

  describe("sendMessage", () => {
    it("sends message successfully", async () => {
      const single = vi.fn().mockResolvedValue({ data: { id: "msg-new" }, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await sendMessage({ from } as never, "user-1", "user-2", "Hello!");

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-new");
      expect(insert).toHaveBeenCalledWith({
        sender_id: "user-1",
        receiver_id: "user-2",
        content: "Hello!",
      });
    });

    it("fails when content is empty", async () => {
      const from = vi.fn();

      const result = await sendMessage({ from } as never, "user-1", "user-2", "");

      expect(result.success).toBe(false);
      expect(result.error).toContain("不能为空");
    });

    it("fails when content is whitespace only", async () => {
      const from = vi.fn();

      const result = await sendMessage({ from } as never, "user-1", "user-2", "   ");

      expect(result.success).toBe(false);
      expect(result.error).toContain("不能为空");
    });

    it("fails when content exceeds 2000 characters", async () => {
      const from = vi.fn();
      const longContent = "a".repeat(2001);

      const result = await sendMessage({ from } as never, "user-1", "user-2", longContent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("2000字符");
    });

    it("trims content before sending", async () => {
      const single = vi.fn().mockResolvedValue({ data: { id: "msg-new" }, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      await sendMessage({ from } as never, "user-1", "user-2", "  Hello!  ");

      expect(insert).toHaveBeenCalledWith({
        sender_id: "user-1",
        receiver_id: "user-2",
        content: "Hello!",
      });
    });

    it("fails when database insert errors", async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ insert });

      const result = await sendMessage({ from } as never, "user-1", "user-2", "Hello!");

      expect(result.success).toBe(false);
      expect(result.error).toContain("发送消息失败");
    });
  });

  describe("markMessagesAsRead", () => {
    it("marks messages as read successfully", async () => {
      const eq3 = vi.fn().mockResolvedValue({ error: null });
      const eq2 = vi.fn().mockReturnValue({ eq: eq3 });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const update = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ update });

      await markMessagesAsRead({ from } as never, "user-2", "user-1");

      expect(update).toHaveBeenCalledWith({ is_read: true });
    });
  });

  describe("getConversations", () => {
    it("returns empty array when no connections", async () => {
      const orConn = vi.fn().mockReturnValue({ data: [], error: null });
      const eqStatus = vi.fn().mockReturnValue({ or: orConn });
      const selectConn = vi.fn().mockReturnValue({ eq: eqStatus });
      const from = vi.fn().mockReturnValue({ select: selectConn });

      const result = await getConversations({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("returns empty array on database error", async () => {
      const orConn = vi.fn().mockReturnValue({ data: null, error: { message: "db error" } });
      const eqStatus = vi.fn().mockReturnValue({ or: orConn });
      const selectConn = vi.fn().mockReturnValue({ eq: eqStatus });
      const from = vi.fn().mockReturnValue({ select: selectConn });

      const result = await getConversations({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("returns conversations with last message and unread count", async () => {
      const connections = [
        {
          from_user_id: "user-1",
          to_user_id: "user-2",
          from_user: {
            id: "user-1",
            nickname: "张三",
            avatar_url: null,
            school: "清华大学",
            company: null,
            direction: "AI",
          },
          to_user: {
            id: "user-2",
            nickname: "李四",
            avatar_url: "avatar.jpg",
            school: null,
            company: "Google",
            direction: "Web3",
          },
        },
      ];

      const lastMsg = {
        id: "msg-last",
        content: "最近怎么样？",
        sender_id: "user-2",
        is_read: false,
        created_at: "2026-04-30T10:00:00Z",
      };

      let callCount = 0;
      const from = vi.fn().mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1 && table === "connections") {
          // connections query
          const orConn = vi.fn().mockResolvedValue({ data: connections, error: null });
          const eqStatus = vi.fn().mockReturnValue({ or: orConn });
          return { select: vi.fn().mockReturnValue({ eq: eqStatus }) };
        }
        if (table === "messages") {
          return {
            select: vi.fn().mockImplementation((cols: string) => {
              if (cols === "id,content,sender_id,is_read,created_at") {
                // last message query
                const maybeSingle = vi.fn().mockResolvedValue({ data: lastMsg, error: null });
                const limit = vi.fn().mockReturnValue({ maybeSingle });
                const order = vi.fn().mockReturnValue({ limit });
                const or = vi.fn().mockReturnValue({ order });
                return { or };
              }
              // count query
              const eq3 = vi.fn().mockResolvedValue({ count: 2, error: null });
              const eq2 = vi.fn().mockReturnValue({ eq: eq3 });
              const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
              return { eq: eq1 };
            }),
          };
        }
        return { select: vi.fn() };
      });

      const result = await getConversations({ from } as never, "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].otherUser.nickname).toBe("李四");
      expect(result[0].lastMessage?.content).toBe("最近怎么样？");
      expect(result[0].unreadCount).toBe(2);
    });

    it("skips connections with null user data", async () => {
      const connections = [
        {
          from_user_id: "user-1",
          to_user_id: "user-2",
          from_user: null,
          to_user: null,
        },
      ];

      const from = vi.fn().mockImplementation(() => {
        const orConn = vi.fn().mockResolvedValue({ data: connections, error: null });
        const eqStatus = vi.fn().mockReturnValue({ or: orConn });
        return { select: vi.fn().mockReturnValue({ eq: eqStatus }) };
      });

      const result = await getConversations({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("handles conversation with no messages", async () => {
      const connections = [
        {
          from_user_id: "user-1",
          to_user_id: "user-2",
          from_user: { id: "user-1", nickname: "张三", avatar_url: null, school: null, company: null, direction: null },
          to_user: { id: "user-2", nickname: "李四", avatar_url: null, school: null, company: null, direction: null },
        },
      ];

      let callCount = 0;
      const from = vi.fn().mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1 && table === "connections") {
          const orConn = vi.fn().mockResolvedValue({ data: connections, error: null });
          const eqStatus = vi.fn().mockReturnValue({ or: orConn });
          return { select: vi.fn().mockReturnValue({ eq: eqStatus }) };
        }
        if (table === "messages") {
          return {
            select: vi.fn().mockImplementation((cols: string) => {
              if (cols === "id,content,sender_id,is_read,created_at") {
                return {
                  or: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                      }),
                    }),
                  }),
                };
              }
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
                  }),
                }),
              };
            }),
          };
        }
        return { select: vi.fn() };
      });

      const result = await getConversations({ from } as never, "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].lastMessage).toBeNull();
      expect(result[0].unreadCount).toBe(0);
    });
  });

  describe("getUnreadMessageCount", () => {
    it("returns count of unread messages", async () => {
      const from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
          }),
        }),
      });

      const result = await getUnreadMessageCount({ from } as never, "user-1");

      expect(result).toBe(3);
    });

    it("returns 0 when no unread messages", async () => {
      const from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
      });

      const result = await getUnreadMessageCount({ from } as never, "user-1");

      expect(result).toBe(0);
    });

    it("returns 0 on error", async () => {
      const from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: null, error: { message: "db error" } }),
          }),
        }),
      });

      const result = await getUnreadMessageCount({ from } as never, "user-1");

      expect(result).toBe(0);
    });
  });
});
