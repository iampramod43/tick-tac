"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { useNotes } from "@/src/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Plus, Search, Archive, Pin } from "lucide-react";
import { NoteCard } from "@/src/components/notes/NoteCard";
import { Note } from "@/src/lib/types";
import { Input } from "@/components/ui/input";
import { NewListModal } from "@/src/components/lists/NewListModal";
import { TikkuChat } from "@/src/components/ai/TikkuChat";

export default function NotesPage() {
  const router = useRouter();
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const { notes, deleteNote, pinNote, archiveNote } = useNotes();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned" | "archived">("all");

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter((t) => t.done).length,
  };

  const handleNewNote = () => {
    router.push("/notes/new");
  };

  const handleEditNote = (note: Note) => {
    router.push(`/notes/${note.id}`);
  };

  const filteredNotes = notes.filter((note) => {
    // Filter by status
    if (filter === "pinned" && !note.pinned) return false;
    if (filter === "archived" && !note.archived) return false;
    if (filter === "all" && note.archived) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        note.category?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="notes"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Notes</h2>
            <Button onClick={handleNewNote}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "pinned" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pinned")}
              >
                <Pin className="h-4 w-4 mr-1" />
                Pinned
              </Button>
              <Button
                variant={filter === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("archived")}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archived
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No notes found" : "No notes yet"}
              </p>
              {!searchQuery && (
                <Button onClick={handleNewNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={deleteNote}
                  onPin={pinNote}
                  onArchive={archiveNote}
                />
              ))}
            </div>
          )}
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
