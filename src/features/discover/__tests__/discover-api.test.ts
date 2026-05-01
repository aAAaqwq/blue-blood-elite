import { describe, it, expect } from 'vitest';
import { discoverApi } from '../api/discover-api';

describe('discoverApi', () => {
  describe('getInterestGroups', () => {
    it('returns an array (stub implementation)', async () => {
      const result = await discoverApi.getInterestGroups();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getSmartMatches', () => {
    it('returns an array (stub implementation)', async () => {
      const result = await discoverApi.getSmartMatches();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('search', () => {
    it('returns empty array for empty query', async () => {
      const result = await discoverApi.search('');

      expect(result).toEqual([]);
    });

    it('returns an array for non-empty query (stub implementation)', async () => {
      const result = await discoverApi.search('AI');

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
