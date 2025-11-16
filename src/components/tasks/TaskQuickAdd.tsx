'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { parseNaturalLanguage } from '@/src/lib/utils';
import { Task } from '@/src/lib/types';

interface TaskQuickAddProps {
  listId: string;
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function TaskQuickAdd({ listId, onAdd }: TaskQuickAddProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseNaturalLanguage(input);

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      listId,
      title: parsed.title,
      done: false,
      priority: parsed.priority || 3,
      due: parsed.due,
      notes: '',
    };

    onAdd(newTask);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t bg-background"
    >
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="shrink-0"
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Input
        type="text"
        placeholder="Add a task... (e.g., 'Call mom tomorrow !! for high priority')"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="border-0 shadow-none focus-visible:ring-0"
      />
    </form>
  );
}

