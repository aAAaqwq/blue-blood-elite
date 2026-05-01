/**
 * 任务详情Hook
 *
 * @description 提供单个任务详情的获取和申请功能
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks-api";
import type { Task, ApplyResult } from "../types";

interface UseTaskDetailResult {
  /** 任务详情 */
  task: Task | null;
  /** 是否加载中 */
  isLoading: boolean;
  /** 是否成功 */
  isSuccess: boolean;
  /** 是否有错误 */
  isError: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 任务是否不存在 */
  isNotFound: boolean;
  /** 不存在时的错误信息 */
  notFoundError: Error | null;
  /** 是否正在申请 */
  isApplying: boolean;
  /** 申请任务函数 */
  applyToTask: (message: string) => Promise<ApplyResult>;
}

export function useTaskDetail(taskId: string): UseTaskDetailResult {
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useState(false);

  const queryResult = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.getTaskById(taskId),
    enabled: !!taskId,
  });

  const { data: task, isLoading, isSuccess, isError, error } = queryResult;

  const isNotFound = isSuccess && task === null;
  const notFoundError = isNotFound
    ? new Error(`任务 ${taskId} 不存在`)
    : null;

  const applyToTask = useCallback(
    async (message: string): Promise<ApplyResult> => {
      if (isApplying) {
        return { success: false, error: "正在提交中" };
      }

      setIsApplying(true);

      try {
        const result = await tasksApi.applyToTask(taskId, message, "");

        if (result.success) {
          // 申请成功后刷新任务详情
          queryClient.invalidateQueries({ queryKey: ["task", taskId] });
        }

        return result;
      } finally {
        setIsApplying(false);
      }
    },
    [taskId, isApplying, queryClient]
  );

  return {
    task: task ?? null,
    isLoading,
    isSuccess,
    isError,
    error,
    isNotFound,
    notFoundError,
    isApplying,
    applyToTask,
  };
}
