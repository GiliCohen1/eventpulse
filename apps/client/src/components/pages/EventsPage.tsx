import { useState, useMemo, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useEvents, useCategories } from '@/hooks/useEvents.js';
import { EventList } from '@/components/organisms/EventList.js';
import { SearchBar } from '@/components/molecules/SearchBar.js';
import { FilterDropdown } from '@/components/molecules/FilterDropdown.js';
import { t } from '@/lib/i18n.js';
import { type EventStatus } from '@eventpulse/shared-types';

const STATUS_OPTIONS: EventStatus[] = ['published', 'live', 'ended'];

function parseCsvParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function EventsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<'category' | 'status' | null>(null);
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get('search') ?? '';
  const categoryParam = searchParams.get('category');
  const statusParam = searchParams.get('status');
  const selectedCategories = useMemo(() => parseCsvParam(categoryParam), [categoryParam]);
  const selectedStatuses = useMemo(
    () => parseCsvParam(statusParam) as EventStatus[],
    [statusParam],
  );

  const { data, isLoading, isFetching, isError } = useEvents({
    q: search || undefined,
    category: selectedCategories.length > 0 ? selectedCategories : undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    page: 1,
    limit: 24,
  });
  const events = data?.events;

  const { data: categories } = useCategories();

  const activeFilterCount = useMemo(() => {
    return selectedCategories.length + selectedStatuses.length;
  }, [selectedCategories, selectedStatuses]);

  const allCategoriesSelected =
    !!categories && categories.length > 0 && selectedCategories.length === categories.length;
  const allStatusesSelected = selectedStatuses.length === STATUS_OPTIONS.length;

  function updateParam(key: string, value: string): void {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (next.toString() === searchParams.toString()) return;
    startTransition(() => {
      setSearchParams(next);
    });
  }

  function updateMultiParam(key: string, values: string[]): void {
    const normalized = [...new Set(values)].sort();
    const next = new URLSearchParams(searchParams);
    if (normalized.length > 0) {
      next.set(key, normalized.join(','));
    } else {
      next.delete(key);
    }
    if (next.toString() === searchParams.toString()) return;
    startTransition(() => {
      setSearchParams(next);
    });
  }

  function toggleCategory(slug: string): void {
    const nextValues = selectedCategories.includes(slug)
      ? selectedCategories.filter((v) => v !== slug)
      : [...selectedCategories, slug];
    updateMultiParam('category', nextValues);
  }

  function toggleStatus(nextStatus: EventStatus): void {
    const nextValues = selectedStatuses.includes(nextStatus)
      ? selectedStatuses.filter((v) => v !== nextStatus)
      : [...selectedStatuses, nextStatus];
    updateMultiParam('status', nextValues);
  }

  function toggleAllCategories(checked: boolean): void {
    if (!categories) return;
    updateMultiParam('category', checked ? categories.map((cat) => cat.slug) : []);
  }

  function toggleAllStatuses(checked: boolean): void {
    updateMultiParam('status', checked ? STATUS_OPTIONS : []);
  }

  function clearFilters(): void {
    const next = new URLSearchParams();
    if (search) {
      next.set('search', search);
    }
    startTransition(() => {
      setSearchParams(next);
    });
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">{t('events.title')}</h1>
        <p className="mt-2 text-secondary-500">{t('events.subtitle')}</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onSearch={(val) => updateParam('search', val)}
            placeholder={t('events.searchPlaceholder')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label={t('events.category')}
            selectedCount={selectedCategories.length}
            isOpen={openDropdown === 'category'}
            onToggle={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            onClose={() => setOpenDropdown(null)}
          >
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={allCategoriesSelected}
                onChange={(e) => toggleAllCategories(e.target.checked)}
              />
              {t('events.allCategories')}
            </label>
            {categories?.map((cat) => (
              <label key={cat.id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                />
                {cat.name}
              </label>
            ))}
          </FilterDropdown>

          <FilterDropdown
            label={t('events.status')}
            selectedCount={selectedStatuses.length}
            isOpen={openDropdown === 'status'}
            onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            onClose={() => setOpenDropdown(null)}
          >
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={allStatusesSelected}
                onChange={(e) => toggleAllStatuses(e.target.checked)}
              />
              {t('events.allStatuses')}
            </label>
            {STATUS_OPTIONS.map((status) => (
              <label key={status} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => toggleStatus(status)}
                />
                {status === 'published'
                  ? t('events.published')
                  : status === 'live'
                    ? t('events.liveNow')
                    : t('events.ended')}
              </label>
            ))}
          </FilterDropdown>

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
      </div>

      {(isFetching || isPending) && events?.length ? (
        <div className="mb-3 text-xs text-secondary-500">Updating results…</div>
      ) : null}

      <EventList
        events={events}
        isLoading={isLoading && !events}
        isError={isError}
        emptyTitle={t('events.noEventsFound')}
        emptyDescription={
          search ? t('events.noResultsFor', { query: search }) : t('events.noEventsMatchFilters')
        }
      />
    </div>
  );
}
