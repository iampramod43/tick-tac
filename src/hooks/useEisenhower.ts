'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { EisenhowerTask } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';

export function useEisenhower() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['eisenhower'],
    queryFn: async () => {
      return await api.eisenhower.getAll() as EisenhowerTask[];
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<EisenhowerTask, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const taskData = {
        ...newTask,
        createdAt: now,
        updatedAt: now,
      };
      const task = await api.eisenhower.create(taskData) as EisenhowerTask;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EisenhowerTask> }) => {
      const updatedTask = await api.eisenhower.update(id, updates) as EisenhowerTask;
      return { id, updates: updatedTask };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.eisenhower.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower'] });
    },
  });

  return {
    tasks,
    isLoading,
    addTask: addTaskMutation.mutateAsync,
    updateTask: (id: string, updates: Partial<EisenhowerTask>) =>
      updateTaskMutation.mutateAsync({ id, updates }),
    deleteTask: deleteTaskMutation.mutateAsync,
  };
}

