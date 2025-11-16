'use client';

import { useState, useMemo } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { useLists } from '@/src/hooks/useLists';
import { useTasks } from '@/src/hooks/useTasks';
import { useHabits, useHabitCompletions } from '@/src/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Plus, Check, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NewListModal } from '@/src/components/lists/NewListModal';
import { TikkuChat } from '@/src/components/ai/TikkuChat';
import { format, startOfWeek, addDays, isSameDay, subDays } from 'date-fns';
import { Habit } from '@/src/lib/types';

const PRESET_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA'];

// Component to render a single habit with its completions
function HabitCard({ 
  habit, 
  weekDays, 
  onToggle, 
  onDelete 
}: { 
  habit: Habit; 
  weekDays: Date[];
  onToggle: (habitId: string, date: string, isCompleted: boolean) => Promise<void>;
  onDelete: (habitId: string) => void;
}) {
  const weekStartStr = format(weekDays[0], 'yyyy-MM-dd');
  const weekEndStr = format(weekDays[6], 'yyyy-MM-dd');
  const { completions } = useHabitCompletions(habit.id, weekStartStr, weekEndStr);

  const completedDates = useMemo(() => {
    return new Set(completions.filter(c => c.completed).map(c => c.date));
  }, [completions]);

  const getStreak = () => {
    let streak = 0;
    const today = new Date();
    const sortedCompletions = completions
      .filter(c => c.completed)
      .map(c => c.date)
      .sort()
      .reverse();
    
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      if (sortedCompletions.includes(date)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const weekCompletions = weekDays.filter(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return completedDates.has(dateStr);
  }).length;

  const totalCompletions = completions.filter(c => c.completed).length;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: habit.color }}
          >
            {habit.name[0]}
          </div>
          <div>
            <h3 className="font-semibold">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              🔥 {getStreak()} day streak
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(habit.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCompleted = completedDates.has(dateStr);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={dateStr}
              onClick={() => onToggle(habit.id, dateStr, isCompleted)}
              className={cn(
                'aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all hover:scale-105 relative',
                isCompleted
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50',
                isToday && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <div className="text-xs font-medium">
                {format(day, 'EEE')}
              </div>
              <div className="text-lg font-bold">
                {format(day, 'd')}
              </div>
              {isCompleted && (
                <Check className="h-4 w-4 absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {weekCompletions} / 7 this week
        </span>
        <span className="text-muted-foreground">
          {totalCompletions} total completions
        </span>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const { habits, isLoading: habitsLoading, addHabit, deleteHabit, toggleCompletion } = useHabits();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);

  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
  });

  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleToggleHabit = async (habitId: string, dateStr: string, isCompleted: boolean) => {
    // Toggle completion
    await toggleCompletion(habitId, dateStr, !isCompleted);
  };

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) return;
    
    await addHabit({
      name: newHabit.name.trim(),
      description: newHabit.description.trim() || undefined,
      color: newHabit.color,
      frequency: 'daily',
    });
    
    setNewHabit({ name: '', description: '', color: PRESET_COLORS[0] });
    setIsNewHabitModalOpen(false);
  };

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId);
  };

  const taskCounts = {
    inbox: tasks.filter(t => !t.done && t.listId === 'inbox').length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter(t => t.done).length,
  };

  if (habitsLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          lists={lists}
          activeListId="habits"
          onListSelect={() => {}}
          onNewList={() => setIsNewListModalOpen(true)}
          taskCounts={taskCounts}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="habits"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Habit Tracker</h2>
            <Button onClick={() => setIsNewHabitModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Habit
            </Button>
          </div>
          <p className="text-muted-foreground">Build positive habits, one day at a time</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No habits yet</p>
              <Button onClick={() => setIsNewHabitModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  weekDays={weekDays}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Habit Dialog */}
      <Dialog open={isNewHabitModalOpen} onOpenChange={setIsNewHabitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Habit Name</Label>
              <Input
                value={newHabit.name}
                onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                placeholder="e.g., Morning Exercise"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                placeholder="Add details about your habit..."
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewHabit({...newHabit, color})}
                    className={cn(
                      'h-10 w-10 rounded-full border-2 transition-transform hover:scale-110',
                      newHabit.color === color ? 'border-primary scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewHabitModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit}>Create Habit</Button>
          </div>
        </DialogContent>
      </Dialog>

      <NewListModal
        open={isNewListModalOpen}
        onOpenChange={setIsNewListModalOpen}
        onCreateList={async (title, color) => {
          await addList({ title, color });
        }}
      />

      <TikkuChat />
    </div>
  );
}
