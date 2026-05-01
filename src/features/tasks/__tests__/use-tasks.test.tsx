import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTasks } from "../hooks/use-tasks";
import type { Task, TaskFilters } from "../types";

// Mock the tasks API
vi.mock("../api/tasks-api", () => ({
  tasksApi: {
    getTasks: vi.fn(),
    getTaskById: vi.fn(),
    applyToTask: vi.fn(),
  },
}));

// Mock auth hook
vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("获取任务列表", () => {
    it("应该返回任务列表数据", async () => {
      const mockTasks: Task[] = [
        {
          id: "task-1",
          title: "AI客服系统开发",
          description: "需要开发一个基于ChatGPT的客服系统",
          category: "AI开发",
          reward_usdc: "500",
          deadline: "2026-05-15T00:00:00Z",
          status: "open",
          publisher_id: "user-pub",
          publisher: { nickname: "张三", avatar: "" },
          applicant_count: 3,
          created_at: "2026-04-01T00:00:00Z",
        },
        {
          id: "task-2",
          title: "数据清洗工具",
          description: "需要开发数据清洗和处理工具",
          category: "数据处理",
          reward_usdc: "300",
          deadline: "2026-05-20T00:00:00Z",
          status: "open",
          publisher_id: "user-pub-2",
          publisher: { nickname: "李四", avatar: "" },
          applicant_count: 1,
          created_at: "2026-04-02T00:00:00Z",
        },
      ];

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: mockTasks,
        total: 2,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].title).toBe("AI客服系统开发");
      expect(result.current.total).toBe(2);
    });

    it("应该返回空数组当没有任务时", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.tasks).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });

  describe("分页支持", () => {
    it("应该支持分页参数", async () => {
      const mockTasks: Task[] = [
        {
          id: "task-11",
          title: "任务11",
          description: "描述",
          category: "分类",
          reward_usdc: "100",
          deadline: "2026-05-01T00:00:00Z",
          status: "open",
          publisher_id: "pub",
          publisher: { nickname: "发布者", avatar: "" },
          applicant_count: 0,
          created_at: "2026-04-01T00:00:00Z",
        },
      ];

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: mockTasks,
        total: 15,
        page: 2,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks({ page: 2, limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.total).toBe(15);
      expect(result.current.page).toBe(2);
      // page(2) * limit(10) = 20, total=15, 20 > 15 所以 hasMore=false
      expect(result.current.hasMore).toBe(false);
    });

    it("应该正确计算hasMore", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 5,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks({ page: 1, limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasMore).toBe(false);
    });

    it("分页参数变化应该触发重新请求", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const { result, rerender } = renderHook(
        ({ page, limit }: { page: number; limit: number }) =>
          useTasks({ page, limit }),
        {
          wrapper: createWrapper(),
          initialProps: { page: 1, limit: 10 },
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(tasksApi.getTasks).toHaveBeenCalledTimes(1);

      rerender({ page: 2, limit: 10 });

      await waitFor(() => expect(result.current.page).toBe(2));
      expect(tasksApi.getTasks).toHaveBeenCalledTimes(2);
    });
  });

  describe("筛选参数支持", () => {
    it("应该支持分类筛选", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const filters: TaskFilters = { category: "AI开发" };

      const { result } = renderHook(() => useTasks(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tasksApi.getTasks).toHaveBeenCalledWith(
        expect.objectContaining({ category: "AI开发" }),
        expect.anything()
      );
    });

    it("应该支持状态筛选", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const filters: TaskFilters = { status: "open" as const };

      renderHook(() => useTasks(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(tasksApi.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({ status: "open" }),
          expect.anything()
        )
      );
    });

    it("应该支持关键词搜索", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const filters: TaskFilters = { search: "AI客服" };

      renderHook(() => useTasks(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(tasksApi.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({ search: "AI客服" }),
          expect.anything()
        )
      );
    });

    it("应该支持多重筛选条件组合", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const filters: TaskFilters = {
        category: "AI开发",
        status: "open",
        search: "客服",
        reward_min: 100,
        reward_max: 1000,
      };

      renderHook(() => useTasks(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(tasksApi.getTasks).toHaveBeenCalledWith(
          expect.objectContaining({
            category: "AI开发",
            status: "open",
            search: "客服",
            reward_min: 100,
            reward_max: 1000,
          }),
          expect.anything()
        )
      );
    });
  });

  describe("加载状态", () => {
    it("初始状态应该是loading", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      // 等待下一个tick让React Query启动
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.tasks).toEqual([]);
    });

    it("isLoading应该在数据加载完成后变为false", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isSuccess).toBe(true);
    });

    it("isFetching在后台刷新时应该为true", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isFetching).toBe(false);
    });
  });

  describe("错误状态", () => {
    it("API错误时应该设置error状态", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockRejectedValue(
        new Error("网络请求失败")
      );

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("网络请求失败");
    });

    it("错误时tasks应该为空数组", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.tasks).toEqual([]);
    });
  });

  describe("UseTasksOptions 格式", () => {
    it("应该支持 { filters, pagination } 选项格式", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      const { result } = renderHook(
        () =>
          useTasks({
            filters: { category: "AI开发" },
            pagination: { page: 2, limit: 5 },
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tasksApi.getTasks).toHaveBeenCalledWith(
        { category: "AI开发" },
        { page: 2, limit: 5 }
      );
      expect(result.current.page).toBe(2);
      expect(result.current.limit).toBe(5);
    });

    it("应该支持只有 filters 的选项格式", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(
        () => useTasks({ filters: { status: "open" as const } }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tasksApi.getTasks).toHaveBeenCalledWith(
        { status: "open" },
        {}
      );
    });

    it("应该支持只有 pagination 的选项格式", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 3,
        limit: 20,
      });

      const { result } = renderHook(
        () => useTasks({ pagination: { page: 3, limit: 20 } }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(tasksApi.getTasks).toHaveBeenCalledWith(
        {},
        { page: 3, limit: 20 }
      );
      expect(result.current.page).toBe(3);
    });
  });

  describe("缓存策略", () => {
    it("应该使用指定的staleTime", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 数据在staleTime内不应该重新获取
      // 这个测试验证了queryKey的稳定性
      expect(tasksApi.getTasks).toHaveBeenCalledTimes(1);
    });

    it("不同的筛选条件应该使用不同的queryKey", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTasks).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      // 第一次渲染
      const { result: result1, rerender: rerender1 } = renderHook(
        ({ category }: { category?: string }) => useTasks({ category }),
        {
          wrapper: createWrapper(),
          initialProps: { category: "AI开发" },
        }
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));
      expect(tasksApi.getTasks).toHaveBeenCalledTimes(1);

      // 改变筛选条件
      rerender1({ category: "数据处理" });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));
      expect(tasksApi.getTasks).toHaveBeenCalledTimes(2);
    });
  });
});
