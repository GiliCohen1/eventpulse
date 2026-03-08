import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEvents, useCategories } from '@/hooks/useEvents.js';
import { EventList } from '@/components/organisms/EventList.js';
import { SearchBar } from '@/components/molecules/SearchBar.js';
import { Button } from '@/components/atoms/Button.js';
import { Badge } from '@/components/atoms/Badge.js';
import { t } from '@/lib/i18n.js';
import { type EventStatus } from '@eventpulse/shared-types';

export function EventsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = (searchParams.get('status') ?? '') as EventStatus | '';

  const { data, isLoading, isError } = useEvents({
    q: search || undefined,
    category: category || undefined,
    status: status || undefined,
    page: 1,
    limit: 24,
  });

  const { data: categories } = useCategories();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (status) count++;
    return count;
  }, [category, status]);

  function updateParam(key: string, value: string): void {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  function clearFilters(): void {
    setSearchParams(search ? { search } : {});
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">{t('events.title')}</h1>
        <p className="mt-2 text-secondary-500">{t('events.subtitle')}</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onSearch={(val) => updateParam('search', val)}
            placeholder={t('events.searchPlaceholder')}
          />
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
        >
          {t('common.filters')}
          {activeFilterCount > 0 && (
            <Badge variant="primary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-xl border border-secondary-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary-700">{t('common.filters')}</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-secondary-500 hover:text-secondary-700"
              >
                <X className="h-3 w-3" />
                {t('common.clearAll')}
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('events.category')}</label>
              <select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="input-field"
              >
                <option value="">{t('events.allCategories')}</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('events.status')}</label>
              <select
                value={status}
                onChange={(e) => updateParam('status', e.target.value)}
                className="input-field"
              >
                <option value="">{t('events.allStatuses')}</option>
                <option value="published">{t('events.published')}</option>
                <option value="live">{t('events.liveNow')}</option>
                <option value="ended">{t('events.ended')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <EventList
        events={data?.events}
        isLoading={isLoading}
        isError={isError}
        emptyTitle={t('events.noEventsFound')}
        emptyDescription={
          search ? t('events.noResultsFor', { query: search }) : t('events.noEventsMatchFilters')
        }
      />
    </div>
  );
}
