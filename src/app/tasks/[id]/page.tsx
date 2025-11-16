"use client";

import { useParams, useRouter } from "next/navigation";
import { useTask, useTasks } from "@/src/hooks/useTasks";
import { useNotes } from "@/src/hooks/useNotes";
import { useLists } from "@/src/hooks/useLists";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { PriorityIndicator } from "@/src/components/common/PriorityIndicator";
import { formatDateTime } from "@/src/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TaskTimer } from "@/src/components/tasks/TaskTimer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TikkuChat } from "@/src/components/ai/TikkuChat";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { task, isLoading } = useTask(taskId);
  const { updateTask } = useTasks();
  const { notes: allNotes } = useNotes();
  const { lists } = useLists();

  // Get notes linked to this task
  const linkedNotes = task
    ? allNotes.filter((note) => note.linkedTaskId === task.id && !note.archived)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Task not found</h2>
          <Button onClick={() => router.push("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>

        <div className="bg-card border rounded-lg p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2 pt-1">
              <Checkbox
                checked={task.done}
                onCheckedChange={async (checked) => {
                  await updateTask(task.id, { done: checked === true });
                }}
                id="task-complete-detail"
              />
              <Label
                htmlFor="task-complete-detail"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                {task.done ? "Completed" : "Complete"}
              </Label>
            </div>
            <div className="flex-1">
              <h1
                className={`text-3xl font-bold mb-2 ${
                  task.done ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <PriorityIndicator priority={task.priority} showLabel />
                </div>
                {task.due && <span>Due: {formatDateTime(task.due)}</span>}
                <div className="flex items-center gap-2">
                  <Label className="text-sm">List:</Label>
                  <Select
                    value={task.listId}
                    onValueChange={async (newListId) => {
                      await updateTask(task.id, { listId: newListId });
                    }}
                  >
                    <SelectTrigger className="w-[150px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbox">Inbox</SelectItem>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {task.notes && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.notes}
              </p>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Tags</h2>
              <div className="flex gap-2 flex-wrap">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Subtasks</h2>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox checked={subtask.done} disabled />
                    <span
                      className={
                        subtask.done ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Tracker Section */}
          <div>
            <TaskTimer
              taskId={task.id}
              taskTitle={task.title}
              listId={task.listId}
            />
          </div>

          {/* Linked Notes Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Linked Notes ({linkedNotes.length})
            </h2>
            {linkedNotes.length > 0 ? (
              <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                {linkedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group border bg-background"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {note.title}
                        </h4>
                        {note.pinned && (
                          <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {note.content.replace(/[#*`\[\]]/g, "").slice(0, 150)}
                        {note.content.length > 150 ? "..." : ""}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30 text-center">
                No notes attached to this task
              </div>
            )}
          </div>

          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>Created: {formatDateTime(task.createdAt)}</p>
            <p>Last updated: {formatDateTime(task.updatedAt)}</p>
          </div>
        </div>
      </div>

      <TikkuChat />
    </div>
  );
}
