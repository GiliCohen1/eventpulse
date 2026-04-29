import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  className?: string;
  /** Debounce delay in ms. Set to 0 to only fire on Enter. */
  debounceMs?: number;
}

export function SearchBar({
  placeholder = t('search.placeholder'),
  value = '',
  onSearch,
  className,
  debounceMs = 500,
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchRef = useRef(onSearch);
  const lastEmittedQueryRef = useRef(value);
  const skipNextDebounceRef = useRef(false);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Sync external value changes (e.g. clear filters)
  useEffect(() => {
    if (value === query) return;
    skipNextDebounceRef.current = true;
    setQuery(value);
  }, [value, query]);

  // Debounce: fire search after user stops typing
  useEffect(() => {
    if (debounceMs <= 0) return;
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (lastEmittedQueryRef.current === query) return;
      lastEmittedQueryRef.current = query;
      onSearchRef.current(query);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    lastEmittedQueryRef.current = query;
    onSearch(query);
  };

  const handleClear = () => {
    if (!query) return;
    setQuery('');
    if (timerRef.current) clearTimeout(timerRef.current);
    lastEmittedQueryRef.current = '';
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={classNames('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
        aria-label={t('search.label')}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="icon-input-btn right-3"
          aria-label={t('search.clear')}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
