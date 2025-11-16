'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { PomodoroSession } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';

export function usePomodoro() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['pomodoro'],
    queryFn: async () => {
      return await api.pomodoro.getAll() as PomodoroSession[];
    },
  });

  const addSessionMutation = useMutation({
    mutationFn: async (newSession: Omit<PomodoroSession, 'id'>) => {
      const session = await api.pomodoro.create(newSession) as PomodoroSession;
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PomodoroSession> }) => {
      const updatedSession = await api.pomodoro.update(id, updates) as PomodoroSession;
      return { id, updates: updatedSession };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.pomodoro.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
    },
  });

  return {
    sessions,
    isLoading,
    addSession: addSessionMutation.mutateAsync,
    updateSession: (id: string, updates: Partial<PomodoroSession>) =>
      updateSessionMutation.mutateAsync({ id, updates }),
    deleteSession: deleteSessionMutation.mutateAsync,
  };
}

