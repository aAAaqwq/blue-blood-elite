import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, debounceMs = 0, isLoading }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFirstRender, setIsFirstRender] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Clear any pending debounced search
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (debounceMs > 0) {
      // Set up debounced call
      timerRef.current = setTimeout(() => {
        onSearch(inputValue);
      }, debounceMs);
    } else {
      // Immediately call onSearch if debounce is disabled (debounceMs = 0)
      onSearch(inputValue);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [inputValue, debounceMs, onSearch, isFirstRender]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    // Clear any pending debounced search
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onSearch('');
  }, [onSearch]);

  return (
    <div
      className="relative flex items-center w-full rounded-full px-5 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400"
      style={{ backgroundColor: '#152238' }}
      data-testid="search-bar"
    >
      <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />

      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="搜索精英、技能、任务..."
        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
      />

      {isLoading && (
        <div className="ml-2" data-testid="search-loading">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && inputValue && (
        <button
          onClick={handleClear}
          aria-label="清除搜索"
          className="ml-2 p-1 rounded-full hover:bg-blue-600/50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
