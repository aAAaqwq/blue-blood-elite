/**
 * 任务列表Hook
 *
 * @description 提供任务列表的获取、筛选、分页功能
 */

import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks-api";
import type { Task, TaskFilters, PaginationParams } from "../types";

interface UseTasksOptions {
  filters?: TaskFilters;
  pagination?: PaginationParams;
}

interface UseTasksResult {
  /** 任务列表 */
  tasks: Task[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 是否有更多数据 */
  hasMore: boolean;
  /** 是否加载中 */
  isLoading: boolean;
  /** 是否正在获取（包含后台刷新） */
  isFetching: boolean;
  /** 是否成功 */
  isSuccess: boolean;
  /** 是否有错误 */
  isError: boolean;
  /** 错误信息 */
  error: Error | null;
}

export function useTasks(options: UseTasksOptions | TaskFilters = {}): UseTasksResult {
  // 支持两种调用方式：useTasks({ filters, pagination }) 或 useTasks({ category, status, page, limit })
  const isOptionsFormat = 'filters' in options || 'pagination' in options;
  const filters = isOptionsFormat
    ? (options as UseTasksOptions).filters ?? {}
    : (options as TaskFilters);
  const pagination = isOptionsFormat
    ? (options as UseTasksOptions).pagination ?? {}
    : { page: (options as TaskFilters & PaginationParams).page, limit: (options as TaskFilters & PaginationParams).limit };

  const queryResult = useQuery({
    queryKey: ["tasks", filters, pagination],
    queryFn: () => tasksApi.getTasks(filters, pagination),
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  const { data, isLoading, isFetching, isSuccess, isError, error } = queryResult;

  const tasks = data?.data ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? pagination.page ?? 1;
  const limit = data?.limit ?? pagination.limit ?? 10;
  const hasMore = page * limit < total;

  return {
    tasks,
    total,
    page,
    limit,
    hasMore,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  };
}
