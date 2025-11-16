'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Task } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';
import { generateId } from '@/src/lib/utils';

export function useTasks(listId?: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', listId],
    queryFn: async () => {
      const allTasks = await api.tasks.getAll(listId);
      return allTasks as Task[];
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const taskData = {
        ...newTask,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      return await api.tasks.create(taskData) as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return await api.tasks.update(id, updatedData) as Task;
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[] = []) =>
        old.map(task => (task.id === id ? { ...task, ...updates } : task))
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.tasks.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    addTask: addTaskMutation.mutateAsync,
    updateTask: (id: string, updates: Partial<Task>) =>
      updateTaskMutation.mutateAsync({ id, updates }),
    deleteTask: deleteTaskMutation.mutateAsync,
  };
}

export function useTask(taskId: string) {
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      return await api.tasks.get(taskId) as Task | null;
    },
    enabled: !!taskId,
  });

  return { task, isLoading };
}
