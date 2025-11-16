'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { List } from '@/src/lib/types';
import { createApiClient } from '@/src/lib/api-client';
import { generateId } from '@/src/lib/utils';

export function useLists() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      return await api.lists.getAll() as List[];
    },
  });

  const addListMutation = useMutation({
    mutationFn: async (newList: Omit<List, 'id' | 'createdAt' | 'order'>) => {
      const listData = {
        ...newList,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return await api.lists.create(listData) as List;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<List> }) => {
      return await api.lists.update(id, updates) as List;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.lists.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const reorderListsMutation = useMutation({
    mutationFn: async (reorderedLists: List[]) => {
      return await api.lists.reorder(reorderedLists) as List[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  return {
    lists,
    isLoading,
    addList: addListMutation.mutateAsync,
    updateList: (id: string, updates: Partial<List>) =>
      updateListMutation.mutateAsync({ id, updates }),
    deleteList: deleteListMutation.mutateAsync,
    reorderLists: reorderListsMutation.mutateAsync,
  };
}
