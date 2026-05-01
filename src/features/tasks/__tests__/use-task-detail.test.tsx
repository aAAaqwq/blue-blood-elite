import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTaskDetail } from "../hooks/use-task-detail";
import type { Task } from "../types";

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

describe("useTaskDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("获取单个任务详情", () => {
    it("应该返回任务详情数据", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "AI客服系统开发",
        description: "需要开发一个基于ChatGPT的客服系统，支持多轮对话和知识库检索",
        category: "AI开发",
        reward_usdc: "500",
        deadline: "2026-05-15T00:00:00Z",
        status: "open",
        publisher_id: "user-pub",
        publisher: { nickname: "张三", avatar: "" },
        applicant_count: 3,
        requirements: ["熟练掌握Python", "有LangChain使用经验"],
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.task).toBeDefined();
      expect(result.current.task?.title).toBe("AI客服系统开发");
      expect(result.current.task?.description).toBe(
        "需要开发一个基于ChatGPT的客服系统，支持多轮对话和知识库检索"
      );
    });

    it("应该包含发布者信息", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "user-pub",
        publisher: { nickname: "李四", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.task?.publisher).toBeDefined();
      expect(result.current.task?.publisher.nickname).toBe("李四");
    });
  });

  describe("任务不存在处理", () => {
    it("任务不存在时应该返回null", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(null);

      const { result } = renderHook(() => useTaskDetail("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.task).toBeNull();
      expect(result.current.isNotFound).toBe(true);
    });

    it("isNotFound标志应该正确设置", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(null);

      const { result } = renderHook(() => useTaskDetail("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isNotFound).toBe(true);
      expect(result.current.notFoundError).toBeDefined();
      expect(result.current.notFoundError?.message).toContain("不存在");
    });

    it("已找到任务时isNotFound应该为false", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "存在的任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isNotFound).toBe(false);
    });
  });

  describe("申请任务功能", () => {
    it("应该提供applyToTask函数", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(tasksApi.applyToTask).mockResolvedValue({
        success: true,
        applicationId: "app-new",
      });

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.applyToTask).toBeDefined();
      expect(typeof result.current.applyToTask).toBe("function");
    });

    it("applyToTask应该返回成功结果", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(tasksApi.applyToTask).mockResolvedValue({
        success: true,
        applicationId: "app-123",
      });

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const applyResult = await result.current.applyToTask("我有相关经验");
      expect(applyResult.success).toBe(true);
      expect(applyResult.applicationId).toBe("app-123");
    });

    it("applyToTask失败时应该返回错误信息", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(tasksApi.applyToTask).mockResolvedValue({
        success: false,
        error: "您已经申请过此任务",
      });

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const applyResult = await result.current.applyToTask("申请信息");
      expect(applyResult.success).toBe(false);
      expect(applyResult.error).toBe("您已经申请过此任务");
    });
  });

  describe("申请中状态", () => {
    it("applyToTask调用时应该设置isApplying状态", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(tasksApi.applyToTask).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { success: true, applicationId: "app-123" };
      });

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 开始申请 - 使用act包裹
      let applyPromise: Promise<{ success: boolean; applicationId?: string }>;
      await act(async () => {
        applyPromise = result.current.applyToTask("申请信息");
      });

      // 立即检查isApplying状态
      expect(result.current.isApplying).toBe(true);

      await act(async () => {
        await applyPromise;
      });

      // 申请完成后isApplying应该变为false
      await waitFor(() =>
        expect(result.current.isApplying).toBe(false)
      );
    });

    it("applyToTask完成后应该重置isApplying即使失败", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(tasksApi.applyToTask).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { success: false, error: "申请失败" };
      });

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      await act(async () => {
        await result.current.applyToTask("申请信息");
      });

      await waitFor(() =>
        expect(result.current.isApplying).toBe(false)
      );
    });

    it("isApplying时不应允许重复提交", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(tasksApi.applyToTask).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { success: true, applicationId: "app-123" };
      });

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 第一次申请 - 使用act包裹
      await act(async () => {
        result.current.applyToTask("第一次");
      });

      // isApplying时再次调用应该被阻止 - 使用act包裹
      await act(async () => {
        result.current.applyToTask("第二次");
      });

      // applyToTask应该只被调用一次
      expect(tasksApi.applyToTask).toHaveBeenCalledTimes(1);
    });
  });

  describe("加载和错误状态", () => {
    it("初始加载状态", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      // 使用waitFor检查加载状态
      await waitFor(() => expect(result.current.isLoading).toBe(true));
      expect(result.current.task).toBeNull();
    });

    it("任务详情加载完成", async () => {
      const mockTask: Task = {
        id: "task-1",
        title: "测试任务",
        description: "描述",
        category: "分类",
        reward_usdc: "100",
        deadline: "2026-05-01T00:00:00Z",
        status: "open",
        publisher_id: "pub",
        publisher: { nickname: "发布者", avatar: "" },
        applicant_count: 0,
        created_at: "2026-04-01T00:00:00Z",
      };

      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockResolvedValue(mockTask);

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isSuccess).toBe(true);
    });

    it("API错误时应该处理错误", async () => {
      const { tasksApi } = await import("../api/tasks-api");
      vi.mocked(tasksApi.getTaskById).mockRejectedValue(
        new Error("加载任务详情失败")
      );

      const { result } = renderHook(() => useTaskDetail("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("加载任务详情失败");
    });
  });
});
