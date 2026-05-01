/**
 * Tasks API - Stub Implementation
 *
 * 实际页面直接使用 Supabase client 查询。
 * 此文件保留供 hooks (useTasks, useTaskDetail) 和测试使用。
 * 后续统一数据访问模式时应替换为 repository 调用。
 */

import type { Task, TaskFilters, PaginationParams } from "../types";

interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export const tasksApi = {
  async getTasks(
    filters?: TaskFilters,
    pagination?: PaginationParams,
  ): Promise<TasksResponse> {
    return {
      data: [],
      total: 0,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  },

  async getTaskById(id: string): Promise<Task | null> {
    return null;
  },

  async applyToTask(
    taskId: string,
    message: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "未实现" };
  },
};
