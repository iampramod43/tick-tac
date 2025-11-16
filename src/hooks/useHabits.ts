'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Habit, HabitCompletion } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';

export function useHabits() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      return await api.habits.getAll(false) as Habit[];
    },
  });

  const addHabitMutation = useMutation({
    mutationFn: async (newHabit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
      const now = new Date().toISOString();
      const habitData = {
        ...newHabit,
        frequency: newHabit.frequency || 'daily',
        archived: false,
        createdAt: now,
      };
      const habit = await api.habits.create(habitData) as Habit;
      return habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Habit> }) => {
      const updatedHabit = await api.habits.update(id, updates) as Habit;
      return { id, updates: updatedHabit };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.habits.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) => {
      await api.habits.toggleCompletion(habitId, date, completed);
      return { habitId, date, completed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habitCompletions'] });
    },
  });

  return {
    habits,
    isLoading,
    addHabit: addHabitMutation.mutateAsync,
    updateHabit: (id: string, updates: Partial<Habit>) =>
      updateHabitMutation.mutateAsync({ id, updates }),
    deleteHabit: deleteHabitMutation.mutateAsync,
    toggleCompletion: (habitId: string, date: string, completed: boolean) =>
      toggleCompletionMutation.mutateAsync({ habitId, date, completed }),
  };
}

export function useHabitCompletions(habitId: string, startDate?: string, endDate?: string) {
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['habitCompletions', habitId, startDate, endDate],
    queryFn: async () => {
      return await api.habits.getCompletions(habitId, startDate, endDate) as HabitCompletion[];
    },
    enabled: !!habitId,
  });

  return { completions, isLoading };
}

