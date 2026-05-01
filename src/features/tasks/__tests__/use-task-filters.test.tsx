import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { MemoryRouter, useSearchParams } from "react-router";
import { useTaskFilters } from "../hooks/use-task-filters";
import type { TaskFilters } from "../types";

// Helper component to use the hook with search params
const TestComponent = ({
  initialParams,
}: {
  initialParams?: Record<string, string>;
}) => {
  const filters = useTaskFilters();

  return (
    <div>
      <span data-testid="category">{filters.filters.category || ""}</span>
      <span data-testid="status">{filters.filters.status || ""}</span>
      <span data-testid="search">{filters.filters.search || ""}</span>
      <span data-testid="rewardMin">
        {filters.filters.reward_min?.toString() || ""}
      </span>
      <span data-testid="rewardMax">
        {filters.filters.reward_max?.toString() || ""}
      </span>
      <span data-testid="sortBy">{filters.filters.sortBy || ""}</span>
      <span data-testid="sortOrder">{filters.filters.sortOrder || ""}</span>
    </div>
  );
};

const createWrapper = (initialParams?: Record<string, string>) => {
  const searchParams = new URLSearchParams(initialParams);

  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[`/?${searchParams.toString()}`]}>
      {children}
    </MemoryRouter>
  );
};

describe("useTaskFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("默认筛选状态", () => {
    it("应该返回默认空筛选条件", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      expect(result.current.filters).toEqual({
        category: undefined,
        status: undefined,
        search: undefined,
        reward_min: undefined,
        reward_max: undefined,
        sortBy: "created_at",
        sortOrder: "desc",
      });
    });

    it("应该有默认排序配置", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      expect(result.current.filters.sortBy).toBe("created_at");
      expect(result.current.filters.sortOrder).toBe("desc");
    });

    it("应该提供便捷的hasActiveFilters getter", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      // 无筛选条件时应该为false
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("更新筛选条件", () => {
    it("应该提供更新单个筛选条件的方法", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      expect(result.current.filters.category).toBe("AI开发");
    });

    it("应该保留其他筛选条件不变", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilter("search", "客服");
      });

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      expect(result.current.filters.search).toBe("客服");
      expect(result.current.filters.category).toBe("AI开发");
    });

    it("应该支持更新多个筛选条件", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilters({
          category: "AI开发",
          status: "open",
          search: "测试",
        });
      });

      expect(result.current.filters.category).toBe("AI开发");
      expect(result.current.filters.status).toBe("open");
      expect(result.current.filters.search).toBe("测试");
    });

    it("设置undefined应该清除筛选条件", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      expect(result.current.filters.category).toBe("AI开发");

      act(() => {
        result.current.updateFilter("category", undefined);
      });

      expect(result.current.filters.category).toBeUndefined();
    });

    it("应该支持排序参数更新", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilter("sortBy", "reward_usdc");
      });

      act(() => {
        result.current.updateFilter("sortOrder", "desc");
      });

      expect(result.current.filters.sortBy).toBe("reward_usdc");
      expect(result.current.filters.sortOrder).toBe("desc");
    });

    it("应该支持奖励范围筛选", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilters({
          reward_min: 100,
          reward_max: 500,
        });
      });

      expect(result.current.filters.reward_min).toBe(100);
      expect(result.current.filters.reward_max).toBe(500);
    });

    it("hasActiveFilters应该正确反映激活的筛选", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("URL同步", () => {
    it("应该从URL读取初始筛选条件", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper({
          category: "数据处理",
          status: "open",
        }),
      });

      expect(result.current.filters.category).toBe("数据处理");
      expect(result.current.filters.status).toBe("open");
    });

    it("更新筛选条件应该同步到URL", async () => {
      const { result, unmount } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      let currentSearchParams: URLSearchParams;

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      // 获取更新后的searchParams
      const TestSearchReader = () => {
        const [searchParams] = useSearchParams();
        currentSearchParams = searchParams;
        return null;
      };

      // 重新渲染以获取searchParams
      const { result: searchResult } = renderHook(() => {
        const filters = useTaskFilters();
        const [searchParams] = useSearchParams();
        return { filters, searchParams };
      }, {
        wrapper: createWrapper(),
      });

      act(() => {
        searchResult.current.filters.updateFilter("category", "AI开发");
      });

      expect(searchResult.current.searchParams.get("category")).toBe("AI开发");
    });

    it("URL参数变化应该更新内部状态", () => {
      // 初始渲染
      const { result: result1 } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper({ category: "初始分类" }),
      });

      expect(result1.current.filters.category).toBe("初始分类");

      // 模拟URL变化 - 通过重新创建wrapper
      const { result: result2 } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper({ category: "新分类" }),
      });

      expect(result2.current.filters.category).toBe("新分类");
    });

    it("应该支持数字类型的URL参数", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper({
          reward_min: "100",
          reward_max: "500",
        }),
      });

      expect(result.current.filters.reward_min).toBe(100);
      expect(result.current.filters.reward_max).toBe(500);
    });

    it("URL中的无效参数应该被忽略", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper({
          category: "有效分类",
          unknown_param: "should_be_ignored",
        }),
      });

      expect(result.current.filters.category).toBe("有效分类");
      expect(result.current.filters.unknown_param).toBeUndefined();
    });
  });

  describe("重置筛选", () => {
    it("resetFilters应该重置所有筛选条件到默认值", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilters({
          category: "AI开发",
          status: "open",
          search: "测试搜索",
          reward_min: 100,
          reward_max: 500,
        });
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.category).toBeUndefined();
      expect(result.current.filters.status).toBeUndefined();
      expect(result.current.filters.search).toBeUndefined();
      expect(result.current.filters.reward_min).toBeUndefined();
      expect(result.current.filters.reward_max).toBeUndefined();
      // 排序保持默认
      expect(result.current.filters.sortBy).toBe("created_at");
      expect(result.current.filters.sortOrder).toBe("desc");
    });

    it("resetFilters后hasActiveFilters应该为false", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("resetFilters应该同步更新URL", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilter("category", "AI开发");
      });

      act(() => {
        result.current.resetFilters();
      });

      // URL中的category参数应该被移除
      const { result: searchResult } = renderHook(() => {
        const [searchParams] = useSearchParams();
        return searchParams.get("category");
      }, {
        wrapper: createWrapper(),
      });

      expect(searchResult.current).toBeNull();
    });

    it("应该提供仅重置筛选条件的方法，保留排序", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFilters({
          category: "AI开发",
          sortBy: "reward_usdc",
        });
      });

      act(() => {
        result.current.resetFilters();
      });

      // 排序应该保持
      expect(result.current.filters.sortBy).toBe("reward_usdc");
    });
  });

  describe("便捷方法", () => {
    it("应该提供快捷设置分类的方法", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCategory("AI开发");
      });

      expect(result.current.filters.category).toBe("AI开发");
    });

    it("应该提供快捷设置状态的方法", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setStatus("in_progress");
      });

      expect(result.current.filters.status).toBe("in_progress");
    });

    it("应该提供快捷设置搜索关键词的方法", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearch("客服系统");
      });

      expect(result.current.filters.search).toBe("客服系统");
    });

    it("应该提供切换排序方向的方法", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      expect(result.current.filters.sortOrder).toBe("desc");

      act(() => {
        result.current.toggleSortOrder();
      });

      expect(result.current.filters.sortOrder).toBe("asc");

      act(() => {
        result.current.toggleSortOrder();
      });

      expect(result.current.filters.sortOrder).toBe("desc");
    });
  });

  describe("预设筛选", () => {
    it("应该提供常用筛选预设", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.applyPreset("highReward");
      });

      expect(result.current.filters.reward_min).toBe(500);
    });

    it("highReward预设应该设置高奖励筛选", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.applyPreset("highReward");
      });

      expect(result.current.filters.reward_min).toBe(500);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("urgent预设应该筛选即将截止的任务", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.applyPreset("urgent");
      });

      expect(result.current.filters).toHaveProperty("deadline");
    });

    it("myTasks预设应该筛选用户相关的任务", () => {
      const { result } = renderHook(() => useTaskFilters(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.applyPreset("myTasks");
      });

      expect(result.current.filters).toHaveProperty("status");
    });
  });
});
