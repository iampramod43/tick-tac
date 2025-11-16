"use client";

import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { useNotes } from "@/src/hooks/useNotes";
import { NoteEditor } from "@/src/components/notes/NoteEditor";
import { Note } from "@/src/lib/types";
import { NewListModal } from "@/src/components/lists/NewListModal";
import { TikkuChat } from "@/src/components/ai/TikkuChat";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const { notes, updateNote, isLoading } = useNotes();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter((t) => t.done).length,
  };

  // Find the note using useMemo
  const currentNote = useMemo(() => {
    if (isLoading) return null;
    return notes.find((n) => n.id === noteId) || null;
  }, [noteId, notes, isLoading]);

  useEffect(() => {
    // Wait for notes to load before checking
    if (isLoading) {
      return;
    }

    // If notes are loaded but note not found, wait a bit in case it's still being saved
    if (notes.length > 0 && !currentNote) {
      const timeout = setTimeout(() => {
        const noteAgain = notes.find((n) => n.id === noteId);
        if (!noteAgain) {
          // Note doesn't exist, redirect to notes list
          router.push("/notes");
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [noteId, notes, isLoading, router, currentNote]);

  const handleSaveNote = async (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    if (currentNote) {
      await updateNote(currentNote.id, noteData);
      router.push("/notes");
    }
  };

  const handleCancel = () => {
    router.push("/notes");
  };

  if (isLoading || !currentNote) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          lists={lists}
          activeListId="notes"
          onListSelect={() => {}}
          onNewList={() => setIsNewListModalOpen(true)}
          taskCounts={taskCounts}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            {isLoading ? "Loading notes..." : "Note not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="notes"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">Edit Note</h1>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 lg:px-12 lg:py-8">
          <div className="max-w-6xl mx-auto h-full">
            <NoteEditor
              note={currentNote}
              onSave={handleSaveNote}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>

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
