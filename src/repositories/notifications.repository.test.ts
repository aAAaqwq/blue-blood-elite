import { describe, expect, it, vi } from "vitest";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/repositories/notifications.repository";

describe("notifications repository", () => {
  describe("getNotifications", () => {
    it("returns list of notifications for user", async () => {
      const mockData = [
        {
          id: "notif-1",
          user_id: "user-1",
          type: "task_assigned",
          title: "新任务分配",
          content: "你被分配了一个新任务",
          related_id: "task-1",
          is_read: false,
          created_at: "2026-04-30T10:00:00Z",
        },
        {
          id: "notif-2",
          user_id: "user-1",
          type: "message_received",
          title: "新消息",
          content: null,
          related_id: "msg-1",
          is_read: true,
          created_at: "2026-04-29T10:00:00Z",
        },
      ];

      const limit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getNotifications({ from } as never, "user-1");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("notif-1");
      expect(result[0].isRead).toBe(false);
      expect(result[1].isRead).toBe(true);
    });

    it("returns empty array when no notifications", async () => {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getNotifications({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("returns empty array on database error", async () => {
      const limit = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getNotifications({ from } as never, "user-1");

      expect(result).toEqual([]);
    });

    it("respects custom limit parameter", async () => {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      await getNotifications({ from } as never, "user-1", 10);

      expect(limit).toHaveBeenCalledWith(10);
    });

    it("maps snake_case to camelCase correctly", async () => {
      const mockData = [
        {
          id: "notif-1",
          user_id: "user-1",
          type: "test",
          title: "Test",
          content: "Test content",
          related_id: "related-1",
          is_read: true,
          created_at: "2026-04-30T10:00:00Z",
        },
      ];

      const limit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getNotifications({ from } as never, "user-1");

      expect(result[0].userId).toBe("user-1");
      expect(result[0].relatedId).toBe("related-1");
      expect(result[0].isRead).toBe(true);
      expect(result[0].createdAt).toBe("2026-04-30T10:00:00Z");
    });
  });

  describe("getUnreadNotificationCount", () => {
    it("returns count of unread notifications", async () => {
      const eq2 = vi.fn().mockResolvedValue({ count: 5, error: null });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUnreadNotificationCount({ from } as never, "user-1");

      expect(result).toBe(5);
    });

    it("returns 0 when no unread notifications", async () => {
      const eq2 = vi.fn().mockResolvedValue({ count: 0, error: null });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUnreadNotificationCount({ from } as never, "user-1");

      expect(result).toBe(0);
    });

    it("returns 0 on error", async () => {
      const eq2 = vi.fn().mockResolvedValue({ count: null, error: { message: "db error" } });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ select });

      const result = await getUnreadNotificationCount({ from } as never, "user-1");

      expect(result).toBe(0);
    });
  });

  describe("markNotificationAsRead", () => {
    it("marks notification as read successfully", async () => {
      const eq2 = vi.fn().mockResolvedValue({ error: null });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const update = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ update });

      const result = await markNotificationAsRead(
        { from } as never,
        "notif-1",
        "user-1"
      );

      expect(result).toBe(true);
      expect(update).toHaveBeenCalledWith({ is_read: true });
    });

    it("returns false on database error", async () => {
      const eq2 = vi.fn().mockResolvedValue({ error: { message: "db error" } });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const update = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ update });

      const result = await markNotificationAsRead(
        { from } as never,
        "notif-1",
        "user-1"
      );

      expect(result).toBe(false);
    });
  });

  describe("markAllNotificationsAsRead", () => {
    it("marks all notifications as read successfully", async () => {
      const eq2 = vi.fn().mockResolvedValue({ error: null });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const update = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ update });

      const result = await markAllNotificationsAsRead({ from } as never, "user-1");

      expect(result).toBe(true);
      expect(update).toHaveBeenCalledWith({ is_read: true });
    });

    it("returns false on database error", async () => {
      const eq2 = vi.fn().mockResolvedValue({ error: { message: "db error" } });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const update = vi.fn().mockReturnValue({ eq: eq1 });
      const from = vi.fn().mockReturnValue({ update });

      const result = await markAllNotificationsAsRead({ from } as never, "user-1");

      expect(result).toBe(false);
    });
  });
});
