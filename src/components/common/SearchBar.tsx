'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search tasks...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative flex items-center w-full max-w-md">
      <div className="absolute left-3 flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.06)] bg-transparent pointer-events-none">
        <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-12 pr-10 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.03)]"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-2 h-7 w-7 rounded-[var(--radius-sm)]"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

