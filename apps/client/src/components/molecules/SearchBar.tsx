import { useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = t('search.placeholder'),
  value = '',
  onSearch,
  className,
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState(value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          aria-label={t('search.clear')}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
