/**
 * 任务相关类型定义
 */

export interface Task {
  /** 任务ID */
  id: string;
  /** 任务标题 */
  title: string;
  /** 任务描述 */
  description: string;
  /** 任务分类 */
  category: string;
  /** 奖励金额（USDC） */
  reward_usdc: string;
  /** 截止日期 */
  deadline: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 发布者ID */
  publisher_id: string;
  /** 发布者信息 */
  publisher: TaskPublisher;
  /** 申请人数 */
  applicant_count: number;
  /** 任务要求 */
  requirements?: string[];
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at?: string;
  /** 已认领用户信息 */
  claimed_by_user?: TaskPublisher | null;
}

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface TaskPublisher {
  /** 用户昵称 */
  nickname: string;
  /** 用户头像 */
  avatar: string;
}

/**
 * 任务筛选条件
 */
export interface TaskFilters {
  /** 分类筛选 */
  category?: string;
  /** 状态筛选 */
  status?: TaskStatus;
  /** 关键词搜索 */
  search?: string;
  /** 最小奖励金额 */
  reward_min?: number;
  /** 最大奖励金额 */
  reward_max?: number;
  /** 截止日期筛选（ISO日期字符串，筛选截止于此日期之前的任务） */
  deadline?: string;
  /** 排序字段 */
  sortBy?: "created_at" | "reward_usdc" | "deadline" | "applicant_count";
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码（从1开始） */
  page?: number;
  /** 每页数量 */
  limit?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  data: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
}

/**
 * 任务申请结果
 */
export interface ApplyResult {
  /** 是否成功 */
  success: boolean;
  /** 申请ID */
  applicationId?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 任务申请信息
 */
export interface TaskApplication {
  /** 申请ID */
  id: string;
  /** 任务ID */
  task_id: string;
  /** 申请者ID */
  applicant_id: string;
  /** 申请说明 */
  message: string;
  /** 申请状态 */
  status: ApplicationStatus;
  /** 创建时间 */
  created_at: string;
  /** 审核时间 */
  reviewed_at?: string;
  /** 申请者信息 */
  applicant?: TaskPublisher;
}

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";
