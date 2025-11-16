'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Countdown } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';

export function useCountdowns() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: countdowns = [], isLoading } = useQuery({
    queryKey: ['countdowns'],
    queryFn: async () => {
      return await api.countdowns.getAll() as Countdown[];
    },
  });

  const addCountdownMutation = useMutation({
    mutationFn: async (newCountdown: Omit<Countdown, 'id' | 'createdAt' | 'completed'>) => {
      const now = new Date().toISOString();
      const countdownData = {
        ...newCountdown,
        completed: false,
        createdAt: now,
      };
      const countdown = await api.countdowns.create(countdownData) as Countdown;
      return countdown;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
  });

  const updateCountdownMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Countdown> }) => {
      const updatedCountdown = await api.countdowns.update(id, updates) as Countdown;
      return { id, updates: updatedCountdown };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
  });

  const deleteCountdownMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.countdowns.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
  });

  return {
    countdowns,
    isLoading,
    addCountdown: addCountdownMutation.mutateAsync,
    updateCountdown: (id: string, updates: Partial<Countdown>) =>
      updateCountdownMutation.mutateAsync({ id, updates }),
    deleteCountdown: deleteCountdownMutation.mutateAsync,
  };
}

