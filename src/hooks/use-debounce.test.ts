import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebounceCallback } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });
    expect(result.current).toBe('hello');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });

  it('should cancel previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    rerender({ value: 'c', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('c');
  });

  it('should work with different types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 100 } }
    );

    rerender({ value: [4, 5, 6], delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual([4, 5, 6]);
  });
});

describe('useDebounceCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should delay callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 300));

    result.current('test');

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should debounce rapid calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 200));

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledWith('first');
  });

  it('should clear previous timeout when called again before delay', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(callback, 300));

    act(() => {
      result.current('first');
    });

    // Call again before delay expires — should clear previous timeout
    act(() => {
      result.current('second');
    });

    // Advance past the first call's delay — 'first' should NOT fire
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });
});
