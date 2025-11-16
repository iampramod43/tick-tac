'use client';

import { TaskFilter } from '@/src/lib/types';
import { PRIORITY_LABELS } from '@/src/lib/constants';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskFiltersProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export function TaskFilters({ filter, onFilterChange }: TaskFiltersProps) {
  const hasActiveFilters =
    filter.priority?.length ||
    filter.tags?.length ||
    filter.due ||
    filter.completed !== undefined;

  const handlePriorityToggle = (priority: number) => {
    const current = filter.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFilterChange({ ...filter, priority: updated.length > 0 ? updated : undefined });
  };

  const handleDueChange = (due: 'today' | 'overdue' | 'next7days' | undefined) => {
    onFilterChange({ ...filter, due: filter.due === due ? undefined : due });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-[var(--radius-md)]">
            Priority
            {filter.priority && filter.priority.length > 0 && (
              <span className="ml-1 bg-[var(--color-accent-mint)] text-[var(--color-black)] rounded-full px-1.5 py-0.5 text-xs font-medium">
                {filter.priority.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filter.priority?.includes(parseInt(value))}
              onCheckedChange={() => handlePriorityToggle(parseInt(value))}
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-[var(--radius-md)]">
            Due Date
            {filter.due && (
              <span className="ml-1 bg-[var(--color-accent-mint)] text-[var(--color-black)] rounded-full px-1.5 py-0.5 text-xs font-medium">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Due Date</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filter.due === 'today'}
            onCheckedChange={() => handleDueChange('today')}
          >
            Today
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filter.due === 'overdue'}
            onCheckedChange={() => handleDueChange('overdue')}
          >
            Overdue
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filter.due === 'next7days'}
            onCheckedChange={() => handleDueChange('next7days')}
          >
            Next 7 Days
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

