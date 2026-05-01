/**
 * Discover API - Stub Implementation
 *
 * 实际页面直接使用 Supabase client 查询。
 * 此文件保留供 hooks (useDiscover) 和测试使用。
 * 后续统一数据访问模式时应替换为 repository 调用。
 */

import type { InterestGroup, UserMatch, SearchResult } from "../types";

export const discoverApi = {
  async getInterestGroups(): Promise<InterestGroup[]> {
    return [];
  },

  async getSmartMatches(): Promise<UserMatch[]> {
    return [];
  },

  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    return [];
  },
};
