"use client";

import { Note } from "@/src/lib/types";
import { Pin, Archive, Trash2, Link2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { useTasks } from "@/src/hooks/useTasks";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onPin,
  onArchive,
}: NoteCardProps) {
  const { tasks } = useTasks();
  const linkedTask = note.linkedTaskId
    ? tasks.find((t) => t.id === note.linkedTaskId)
    : null;
  const preview =
    note.content.slice(0, 150) + (note.content.length > 150 ? "..." : "");

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group",
        note.pinned && "border-primary border-2",
        note.archived && "opacity-60"
      )}
      style={{
        borderLeftWidth: note.color ? "4px" : undefined,
        borderLeftColor: note.color,
      }}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {note.pinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
            <h3 className="font-semibold truncate">{note.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {note.category && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {note.category}
              </span>
            )}
            {linkedTask && (
              <span
                className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1"
                title={`Linked to: ${linkedTask.title}`}
              >
                <Link2 className="h-3 w-3" />
                Task
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(note.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <Pin
              className={cn(
                "h-4 w-4",
                note.pinned && "text-primary fill-primary"
              )}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(note.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <Archive className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1 hover:bg-destructive/10 rounded text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-3 line-clamp-3 whitespace-pre-wrap">
        {preview.replace(/[#*`\[\]]/g, "")}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {format(new Date(note.updatedAt), "MMM d, yyyy • h:mm a")}
      </div>
    </div>
  );
}
