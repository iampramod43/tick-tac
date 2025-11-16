'use client';

import { useMemo, useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { CalendarView } from '@/src/components/calendar/CalendarView';
import { NewListModal } from '@/src/components/lists/NewListModal';
import { TikkuChat } from '@/src/components/ai/TikkuChat';
import { useTasks } from '@/src/hooks/useTasks';
import { useLists } from '@/src/hooks/useLists';
import { useJournal } from '@/src/hooks/useNotes';
import { useHabits } from '@/src/hooks/useHabits';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createApiClient } from '@/src/lib/api-client';
import { HabitCompletion } from '@/src/lib/types';
import { usePomodoro } from '@/src/hooks/usePomodoro';
import { useCountdowns } from '@/src/hooks/useCountdowns';
import { useNotes } from '@/src/hooks/useNotes';
import { useTimeTracking } from '@/src/hooks/useTimeTracking';
import { Task } from '@/src/lib/types';
import { isToday, parseISO, addDays, isBefore, startOfDay, format, subDays } from 'date-fns';

export default function CalendarPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { lists, addList } = useLists();
  const { entries: journalEntries } = useJournal();
  const { habits } = useHabits();
  const { sessions: pomodoroSessions } = usePomodoro();
  const { countdowns } = useCountdowns();
  const { notes } = useNotes();
  const { timeEntries } = useTimeTracking();
  const activeListId = 'calendar';
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  // Fetch habit completions for all habits
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());
  
  // Calculate date range for calendar view (3 months)
  const today = new Date();
  const monthStart = startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const monthEnd = addDays(monthStart, 90);
  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(monthEnd, 'yyyy-MM-dd');

  // Fetch completions for all habits
  const { data: habitCompletions = [] } = useQuery({
    queryKey: ['allHabitCompletions', habits.map(h => h.id).join(','), startDateStr, endDateStr],
    queryFn: async () => {
      const allCompletions: HabitCompletion[] = [];
      // Fetch completions for each habit
      await Promise.all(
        habits.map(async (habit) => {
          try {
            const completions = await api.habits.getCompletions(habit.id, startDateStr, endDateStr) as HabitCompletion[];
            allCompletions.push(...completions);
          } catch (error) {
            console.error(`Error fetching completions for habit ${habit.id}:`, error);
          }
        })
      );
      return allCompletions;
    },
    enabled: habits.length > 0,
  });

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Count tasks by list
    lists.forEach((list) => {
      counts[list.id] = tasks.filter(
        (task) => !task.done && task.listId === list.id
      ).length;
    });

    // Special views
    counts.inbox = tasks.filter((task) => !task.done && task.listId === 'inbox').length;
    counts.today = tasks.filter(
      (task) => !task.done && task.due && isToday(parseISO(task.due))
    ).length;

    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);
    counts.upcoming = tasks.filter(
      (task) =>
        !task.done &&
        task.due &&
        isBefore(parseISO(task.due), nextWeek) &&
        !isToday(parseISO(task.due))
    ).length;

    counts.completed = tasks.filter((task) => task.done).length;

    return counts;
  }, [tasks, lists]);

  const handleAddTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addTask(task);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleCreateList = async (title: string, color: string) => {
    await addList({ title, color });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarView
          tasks={tasks}
          journalEntries={journalEntries}
          habitCompletions={habitCompletions}
          habits={habits.map((h) => ({ id: h.id, name: h.name }))}
          pomodoroSessions={pomodoroSessions}
          countdowns={countdowns}
          notes={notes}
          timeEntries={timeEntries}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      <NewListModal
        open={isNewListModalOpen}
        onOpenChange={setIsNewListModalOpen}
        onCreateList={handleCreateList}
      />

      <TikkuChat />
    </div>
  );
}

