import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDiscover } from '../hooks/use-discover';
import { discoverApi } from '../api/discover-api';

vi.mock('../api/discover-api');

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDiscover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches interest groups', async () => {
    const mockGroups = [
      { id: '1', name: 'AI开发', memberCount: 100 },
      { id: '2', name: '产品设计', memberCount: 80 },
    ];

    vi.mocked(discoverApi.getInterestGroups).mockResolvedValue(mockGroups);

    const { result } = renderHook(() => useDiscover(), { wrapper });

    await waitFor(() => {
      expect(result.current.groups).toEqual(mockGroups);
    });
  });

  it('fetches smart matches', async () => {
    const mockMatches = [
      { id: '1', name: '张三', matchScore: 95 },
      { id: '2', name: '李四', matchScore: 88 },
    ];

    vi.mocked(discoverApi.getSmartMatches).mockResolvedValue(mockMatches);

    const { result } = renderHook(() => useDiscover(), { wrapper });

    await waitFor(() => {
      expect(result.current.matches).toEqual(mockMatches);
    });
  });

  it('searches with debounce', async () => {
    const mockResults = [{ id: '1', name: 'AI开发者' }];
    vi.mocked(discoverApi.search).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useDiscover(), { wrapper });

    // 设置搜索查询
    result.current.setSearchQuery('AI');

    // 立即不应调用API（因为防抖）
    expect(discoverApi.search).not.toHaveBeenCalled();

    // 等待防抖时间（300ms）
    await waitFor(() => {
      expect(discoverApi.search).toHaveBeenCalledWith('AI');
    }, { timeout: 1000 });
  });

  it('handles error state', async () => {
    vi.mocked(discoverApi.getInterestGroups).mockRejectedValue(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() => useDiscover(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });
});
