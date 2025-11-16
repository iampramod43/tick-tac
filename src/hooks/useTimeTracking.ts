'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { TimeEntry } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';
import { generateId } from '@/src/lib/utils';

export function useTimeTracking() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      return await api.timeTracking.getAll() as TimeEntry[];
    },
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const entry: TimeEntry = {
        ...newEntry,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      return await api.timeTracking.create(entry) as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return await api.timeTracking.update(id, updatedData) as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.timeTracking.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  return {
    timeEntries,
    isLoading,
    addTimeEntry: addTimeEntryMutation.mutateAsync,
    updateTimeEntry: (id: string, updates: Partial<TimeEntry>) =>
      updateTimeEntryMutation.mutateAsync({ id, updates }),
    deleteTimeEntry: deleteTimeEntryMutation.mutateAsync,
  };
}

/**
 * Get time entries grouped by date
 */
export function useTimeEntriesByDate() {
  const { timeEntries } = useTimeTracking();

  const grouped = timeEntries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  return grouped;
}

/**
 * Get time entries for a specific date range
 */
export function useTimeEntriesByDateRange(startDate: string, endDate: string) {
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: filtered = [] } = useQuery({
    queryKey: ['timeEntries', startDate, endDate],
    queryFn: async () => {
      return await api.timeTracking.getAll(undefined, undefined, startDate, endDate) as TimeEntry[];
    },
  });

  return filtered;
}

/**
 * Get total time for a specific task
 */
export function useTaskTime(taskId: string) {
  const { timeEntries } = useTimeTracking();

  const taskEntries = timeEntries.filter((entry) => entry.taskId === taskId);
  const totalMinutes = taskEntries.reduce((sum, entry) => sum + entry.duration, 0);

  return {
    entries: taskEntries,
    totalMinutes,
    totalHours: Math.floor(totalMinutes / 60),
    totalMinutesRemainder: totalMinutes % 60,
  };
}
