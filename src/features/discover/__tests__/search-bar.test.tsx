import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../components/search-bar';

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText('搜索精英、技能、任务...')).toBeInTheDocument();
  });

  it('calls onSearch when input changes', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('搜索精英、技能、任务...');
    fireEvent.change(input, { target: { value: 'AI开发' } });

    expect(handleSearch).toHaveBeenCalledWith('AI开发');
  });

  it('debounces search input', async () => {
    vi.useFakeTimers();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText('搜索精英、技能、任务...');
    fireEvent.change(input, { target: { value: 'test' } });

    // 立即调用不应触发
    expect(handleSearch).not.toHaveBeenCalled();

    // 等待防抖时间
    vi.advanceTimersByTime(300);
    expect(handleSearch).toHaveBeenCalledWith('test');

    vi.useRealTimers();
  });

  it('clears search when clear button clicked', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('搜索精英、技能、任务...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('清除搜索');
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
    expect(handleSearch).toHaveBeenLastCalledWith('');
  });

  it('shows loading state', () => {
    render(<SearchBar onSearch={vi.fn()} isLoading />);
    expect(screen.getByTestId('search-loading')).toBeInTheDocument();
  });
});
