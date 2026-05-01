import { describe, it, expect } from 'vitest';
import { tasksApi } from '../api/tasks-api';

describe('tasksApi', () => {
  describe('getTasks', () => {
    it('returns paginated response with defaults', async () => {
      const result = await tasksApi.getTasks();

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('respects pagination params', async () => {
      const result = await tasksApi.getTasks(undefined, { page: 2, limit: 5 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('respects filters', async () => {
      const result = await tasksApi.getTasks({ category: 'AI模型' });

      expect(result.data).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('returns null for non-existent task', async () => {
      const result = await tasksApi.getTaskById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('applyToTask', () => {
    it('returns not implemented error', async () => {
      const result = await tasksApi.applyToTask('task-1', 'message', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('未实现');
    });
  });
});
