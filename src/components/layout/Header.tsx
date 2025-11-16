"use client";

import { SearchBar } from "@/src/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskFilters } from "@/src/components/tasks/TaskFilters";
import { TaskFilter } from "@/src/lib/types";

interface HeaderProps {
  title: string;
  onSearch: (query: string) => void;
  onNewTask: () => void;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export function Header({
  title,
  onSearch,
  onNewTask,
  filter,
  onFilterChange,
}: HeaderProps) {
  return (
    <header className="border-b border-[var(--color-glass-outline)] glass-1 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <Button onClick={onNewTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar onSearch={onSearch} />
          <TaskFilters filter={filter} onFilterChange={onFilterChange} />
        </div>
      </div>
    </header>
  );
}
