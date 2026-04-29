import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge.js';
import { classNames } from '@/lib/utils.js';

interface FilterDropdownProps {
  label: string;
  selectedCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function FilterDropdown({
  label,
  selectedCount,
  isOpen,
  onToggle,
  onClose,
  children,
}: FilterDropdownProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: PointerEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        title={label}
        className={classNames(
          'filter-dropdown-trigger',
          isOpen && 'border-primary-500 bg-primary-50 text-primary-700',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {label}
        {selectedCount > 0 && (
          <Badge variant="primary" className="ml-0.5 text-xs">
            {selectedCount}
          </Badge>
        )}
        <ChevronDown
          className={classNames(
            'h-4 w-4 transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu" role="listbox" aria-multiselectable="true">
          {children}
        </div>
      )}
    </div>
  );
}
