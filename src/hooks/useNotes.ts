"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { Note, JournalEntry } from "@/src/lib/types";
import { createApiClient } from "@/src/lib/api-client";
import { generateId } from "@/src/lib/utils";

export function useNotes() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      return (await api.notes.getAll()) as Note[];
    },
  });

  const addNote = async (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    const newNote: Note = {
      ...note,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = (await api.notes.create(newNote)) as Note;
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    return created;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    await api.notes.update(id, updates);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const deleteNote = async (id: string) => {
    await api.notes.delete(id);
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const pinNote = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      await updateNote(id, { pinned: !note.pinned });
    }
  };

  const archiveNote = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      await updateNote(id, { archived: !note.archived });
    }
  };

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
  };
}

export function useJournal() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal"],
    queryFn: async () => {
      return (await api.journal.getAll()) as JournalEntry[];
    },
  });

  const getEntryByDate = (date: string) => {
    return entries.find((entry) => entry.date === date);
  };

  const addOrUpdateEntry = async (
    date: string,
    content: string,
    mood?: JournalEntry["mood"],
    tags?: string[]
  ) => {
    const entryData = {
      date,
      content,
      mood,
      tags,
    };
    const entry = (await api.journal.createOrUpdate(entryData)) as JournalEntry;
    queryClient.invalidateQueries({ queryKey: ["journal"] });
    return entry.id;
  };

  const deleteEntry = async (id: string) => {
    await api.journal.delete(id);
    queryClient.invalidateQueries({ queryKey: ["journal"] });
  };

  return {
    entries,
    isLoading,
    getEntryByDate,
    addOrUpdateEntry,
    deleteEntry,
  };
}
