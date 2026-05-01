import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatRelativeTime } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge tailwind conflicts correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format number as CNY currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
    });

    it('should format zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle decimal amounts', () => {
      const result = formatCurrency(99.5);
      expect(result).toContain('99.5');
    });

    it('should not show decimal places by default', () => {
      const result = formatCurrency(100);
      expect(result).not.toContain('.00');
    });
  });

  describe('formatDate', () => {
    it('should format date string to zh-CN format', () => {
      // Use noon to avoid timezone edge cases
      const result = formatDate('2026-04-15T12:00:00');
      expect(result).toContain('2026');
      expect(result).toContain('4月');
    });

    it('should accept Date object', () => {
      const result = formatDate(new Date(2026, 0, 1));
      expect(result).toContain('2026');
      expect(result).toContain('1月');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return 刚刚 for less than 60 seconds', () => {
      const result = formatRelativeTime(new Date());
      expect(result).toBe('刚刚');
    });

    it('should return minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinAgo);
      expect(result).toBe('5分钟前');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo);
      expect(result).toBe('2小时前');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toBe('3天前');
    });

    it('should return formatted date for dates older than 7 days', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(tenDaysAgo);
      // For dates > 7 days old, should fall back to formatDate
      expect(result).toContain('日');
    });

    it('should accept string date', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = formatRelativeTime(fiveMinAgo);
      expect(result).toBe('5分钟前');
    });
  });
});
