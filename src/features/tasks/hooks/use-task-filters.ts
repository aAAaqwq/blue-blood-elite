/**
 * 任务筛选Hook
 *
 * @description 管理任务列表的筛选条件，并与URL同步
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { TaskFilters } from "../types";

type SortBy = "created_at" | "reward_usdc" | "deadline" | "applicant_count";
type SortOrder = "asc" | "desc";

interface UseTaskFiltersResult {
  /** 当前筛选条件 */
  filters: TaskFilters;
  /** 是否有激活的筛选条件 */
  hasActiveFilters: boolean;
  /** 更新单个筛选条件 */
  updateFilter: <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K]
  ) => void;
  /** 批量更新筛选条件 */
  updateFilters: (filters: Partial<TaskFilters>) => void;
  /** 重置所有筛选条件 */
  resetFilters: () => void;
  /** 快捷方法：设置分类 */
  setCategory: (category: string | undefined) => void;
  /** 快捷方法：设置状态 */
  setStatus: (status: TaskFilters["status"]) => void;
  /** 快捷方法：设置搜索关键词 */
  setSearch: (search: string | undefined) => void;
  /** 切换排序方向 */
  toggleSortOrder: () => void;
  /** 应用预设筛选 */
  applyPreset: (preset: "highReward" | "urgent" | "myTasks") => void;
}

export function useTaskFilters(): UseTaskFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // 从URL解析筛选条件
  const filters = useMemo((): TaskFilters => {
    const category = searchParams.get("category") ?? undefined;
    const status = (searchParams.get("status") as TaskFilters["status"]) ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const reward_min = searchParams.get("reward_min");
    const reward_max = searchParams.get("reward_max");
    const deadline = searchParams.get("deadline") ?? undefined;
    const sortBy = (searchParams.get("sortBy") as SortBy) ?? "created_at";
    const sortOrder = (searchParams.get("sortOrder") as SortOrder) ?? "desc";

    return {
      category,
      status,
      search,
      reward_min: reward_min ? Number(reward_min) : undefined,
      reward_max: reward_max ? Number(reward_max) : undefined,
      deadline,
      sortBy,
      sortOrder,
    };
  }, [searchParams]);

  // 检查是否有激活的筛选条件（排除排序）
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.category ||
      filters.status ||
      filters.search ||
      filters.reward_min !== undefined ||
      filters.reward_max !== undefined ||
      filters.deadline !== undefined
    );
  }, [filters]);

  // 更新单个筛选条件
  const updateFilter = useCallback(
    <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }

        // 排序条件变化时重置页码
        next.delete("page");

        return next;
      });
    },
    [setSearchParams]
  );

  // 批量更新筛选条件
  const updateFilters = useCallback(
    (newFilters: Partial<TaskFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        Object.entries(newFilters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });

        // 重置页码
        next.delete("page");

        return next;
      });
    },
    [setSearchParams]
  );

  // 重置筛选条件（保留排序）
  const resetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      // 保留排序
      const sortBy = prev.get("sortBy") ?? "created_at";
      const sortOrder = prev.get("sortOrder") ?? "desc";
      next.set("sortBy", sortBy);
      next.set("sortOrder", sortOrder);
      return next;
    });
  }, [setSearchParams]);

  // 快捷方法
  const setCategory = useCallback(
    (category: string | undefined) => updateFilter("category", category),
    [updateFilter]
  );

  const setStatus = useCallback(
    (status: TaskFilters["status"]) => updateFilter("status", status),
    [updateFilter]
  );

  const setSearch = useCallback(
    (search: string | undefined) => updateFilter("search", search),
    [updateFilter]
  );

  const toggleSortOrder = useCallback(() => {
    const newOrder = filters.sortOrder === "asc" ? "desc" : "asc";
    updateFilter("sortOrder", newOrder);
  }, [filters.sortOrder, updateFilter]);

  // 应用预设筛选
  const applyPreset = useCallback(
    (preset: "highReward" | "urgent" | "myTasks") => {
      switch (preset) {
        case "highReward":
          updateFilters({ reward_min: 500, reward_max: undefined });
          break;
        case "urgent": {
          // 设置截止日期为未来7天内
          const oneWeekLater = new Date();
          oneWeekLater.setDate(oneWeekLater.getDate() + 7);
          updateFilters({
            deadline: oneWeekLater.toISOString().split("T")[0],
          });
          break;
        }
        case "myTasks":
          updateFilters({ status: "in_progress" });
          break;
      }
    },
    [updateFilters]
  );

  return {
    filters,
    hasActiveFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    setCategory,
    setStatus,
    setSearch,
    toggleSortOrder,
    applyPreset,
  };
}
