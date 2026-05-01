import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { discoverApi } from '../api/discover-api';
import type { InterestGroup, UserMatch, SearchResult } from '../types';

const DEBOUNCE_MS = 300;

export function useDiscover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch interest groups
  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    error: groupsError,
  } = useQuery({
    queryKey: ['discover', 'groups'],
    queryFn: discoverApi.getInterestGroups,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch smart matches
  const {
    data: matches = [],
    isLoading: isLoadingMatches,
    error: matchesError,
  } = useQuery({
    queryKey: ['discover', 'matches'],
    queryFn: discoverApi.getSmartMatches,
    staleTime: 5 * 60 * 1000,
  });

  // Search
  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useQuery({
    queryKey: ['discover', 'search', debouncedQuery],
    queryFn: () => discoverApi.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 60 * 1000,
  });

  // Refresh data
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['discover'] });
  }, [queryClient]);

  // Refresh matches specifically
  const refreshMatches = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['discover', 'matches'] });
  }, [queryClient]);

  return {
    groups,
    matches,
    searchResults,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    isLoadingGroups,
    isLoadingMatches,
    isSearching,
    isError: !!groupsError || !!matchesError,
    error: groupsError || matchesError,
    refresh,
    refreshMatches,
  };
}
