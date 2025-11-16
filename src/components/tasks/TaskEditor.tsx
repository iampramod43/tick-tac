"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Task,
  Subtask,
  RecurrencePattern,
  ReminderSettings,
  ReminderOffset,
} from "@/src/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/src/components/common/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_LABELS } from "@/src/lib/constants";
import {
  X,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Repeat,
  Bell,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { parseISO } from "date-fns";
import {
  generateId,
  calculateNextOccurrence,
  formatRecurrence,
  formatUTCDate,
} from "@/src/lib/utils";
import { useNotes } from "@/src/hooks/useNotes";
import { useLists } from "@/src/hooks/useLists";
import { useTaskTime } from "@/src/hooks/useTimeTracking";
import { TaskTimer } from "./TaskTimer";

interface TaskEditorProps {
  task?: Task;
  listId: string;
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

// Component to display total tracked time
function TaskTotalTime({ taskId }: { taskId: string }) {
  const { totalMinutes, totalHours, totalMinutesRemainder } =
    useTaskTime(taskId);

  if (totalMinutes === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        <Clock className="inline h-4 w-4 mr-2" />
        No time tracked yet
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">Total Tracked Time</p>
          <p className="text-xs text-muted-foreground">
            {totalHours > 0
              ? `${totalHours} hour${
                  totalHours !== 1 ? "s" : ""
                } ${totalMinutesRemainder} minute${
                  totalMinutesRemainder !== 1 ? "s" : ""
                }`
              : `${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
      <div className="text-2xl font-bold font-mono">
        {totalHours > 0
          ? `${totalHours}h ${totalMinutesRemainder}m`
          : `${totalMinutes}m`}
      </div>
    </div>
  );
}

export function TaskEditor({
  task,
  listId,
  onSave,
  onCancel,
}: TaskEditorProps) {
  const router = useRouter();
  const { notes: allNotes } = useNotes();
  const { lists } = useLists();
  const [selectedListId, setSelectedListId] = useState<string>(
    task?.listId || listId
  );
  const [title, setTitle] = useState(task?.title || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(task?.priority || 3);
  const [due, setDue] = useState<Date | undefined>(
    task?.due ? parseISO(task.due) : undefined
  );
  const [dueTime, setDueTime] = useState<string>(task?.dueTime || "");
  const [done, setDone] = useState<boolean>(task?.done || false);
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const { getToken } = useAuth();

  // Recurrence state
  const [hasRecurrence, setHasRecurrence] = useState(!!task?.recurrence);
  const [recurrenceType, setRecurrenceType] = useState<
    RecurrencePattern["type"]
  >(task?.recurrence?.type || "daily");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(
    task?.recurrence?.interval || 1
  );
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>(
    task?.recurrence?.daysOfWeek || []
  );
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<
    number | undefined
  >(task?.recurrence?.dayOfMonth);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(
    task?.recurrence?.endDate ? parseISO(task.recurrence.endDate) : undefined
  );
  const [recurrenceCount, setRecurrenceCount] = useState<number | undefined>(
    task?.recurrence?.count
  );

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(
    task?.reminderSettings?.enabled || false
  );
  const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>(
    task?.reminderSettings?.offsets || []
  );
  const [reminderCustomOffset, setReminderCustomOffset] = useState<
    number | undefined
  >(task?.reminderSettings?.customOffset);
  const [reminderRecurring, setReminderRecurring] = useState(
    task?.reminderSettings?.recurring || false
  );

  // Get notes linked to this task
  const linkedNotes = task
    ? allNotes.filter((note) => note.linkedTaskId === task.id && !note.archived)
    : [];

  const handleSave = () => {
    if (!title.trim()) return;

    let recurrence: RecurrencePattern | undefined;
    if (hasRecurrence) {
      recurrence = {
        type: recurrenceType,
        interval: recurrenceInterval > 0 ? recurrenceInterval : 1,
      };

      if (recurrenceType === "weekly" && recurrenceDaysOfWeek.length > 0) {
        recurrence.daysOfWeek = recurrenceDaysOfWeek;
      }

      if (recurrenceType === "monthly" && recurrenceDayOfMonth) {
        recurrence.dayOfMonth = recurrenceDayOfMonth;
      }

      if (recurrenceEndDate) {
        recurrence.endDate = formatUTCDate(recurrenceEndDate);
      }

      if (recurrenceCount && recurrenceCount > 0) {
        recurrence.count = recurrenceCount;
      }
    }

    const taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
      listId: selectedListId,
      title: title.trim(),
      notes: notes.trim(),
      priority,
      due: due ? formatUTCDate(due) : undefined,
      dueTime: dueTime.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      done: done,
      recurrence: hasRecurrence ? recurrence : undefined,
      isRecurrenceTemplate: hasRecurrence ? true : undefined,
      nextOccurrence:
        hasRecurrence && recurrence && due
          ? formatUTCDate(calculateNextOccurrence(recurrence, due) || due)
          : undefined,
      reminderSettings:
        reminderEnabled && due
          ? {
              enabled: true,
              offsets: reminderOffsets,
              customOffset: reminderCustomOffset,
              recurring: reminderRecurring,
            }
          : undefined,
    };

    onSave(taskData);
  };

  const toggleReminderOffset = (offset: ReminderOffset) => {
    if (reminderOffsets.includes(offset)) {
      setReminderOffsets(reminderOffsets.filter((o) => o !== offset));
    } else {
      setReminderOffsets([...reminderOffsets, offset]);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    if (recurrenceDaysOfWeek.includes(day)) {
      setRecurrenceDaysOfWeek(recurrenceDaysOfWeek.filter((d) => d !== day));
    } else {
      setRecurrenceDaysOfWeek(
        [...recurrenceDaysOfWeek, day].sort((a, b) => a - b)
      );
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        { id: generateId(), title: subtaskInput.trim(), done: false },
      ]);
      setSubtaskInput("");
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, done: !st.done } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;

    setIsGeneratingDescription(true);
    try {
      const token = await getToken();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://tick-tac-api.vercel.app"
          : "http://localhost:3001");

      const response = await fetch(`${API_URL}/api/tasks/ai/description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await response.json();
      const description = data.description || "";

      if (description) {
        // Append description to existing notes, with a separator if notes already exist
        const separator = notes.trim() ? "\n\n" : "";
        setNotes(notes + separator + description);
      }
    } catch (error) {
      console.error("Error generating description:", error);
      // You could add a toast notification here
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold"
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <div className="relative">
          <Textarea
            placeholder="Add notes or description..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] pr-10"
          />
          {title.trim() && (
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGeneratingDescription}
              className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate description with AI"
            >
              {isGeneratingDescription ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <span>✨</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">List</label>
          <Select value={selectedListId} onValueChange={setSelectedListId}>
            <SelectTrigger>
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

        <div>
          <label className="text-sm font-medium mb-2 block">Priority</label>
          <Select
            value={priority.toString()}
            onValueChange={(value) =>
              setPriority(parseInt(value) as 1 | 2 | 3 | 4)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Due Date</label>
        <DatePicker date={due} onSelect={setDue} placeholder="No due date" />
      </div>

      {due && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Due Time (optional)
          </label>
          <Input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            placeholder="No time"
            className="max-w-xs"
          />
          {dueTime && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDueTime("")}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" />
              Clear time
            </Button>
          )}
        </div>
      )}

      {/* Reminders Section */}
      {due && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              checked={reminderEnabled}
              onCheckedChange={(checked) =>
                setReminderEnabled(checked === true)
              }
            />
            <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4" />
              Set Reminders
            </Label>
          </div>

          {reminderEnabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div>
                <Label className="text-sm mb-2 block">Remind me</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "15min",
                      "30min",
                      "1hour",
                      "2hours",
                      "1day",
                    ] as ReminderOffset[]
                  ).map((offset) => (
                    <Button
                      key={offset}
                      type="button"
                      variant={
                        reminderOffsets.includes(offset) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleReminderOffset(offset)}
                      className="h-8"
                    >
                      {offset === "15min" && "15 min"}
                      {offset === "30min" && "30 min"}
                      {offset === "1hour" && "1 hour"}
                      {offset === "2hours" && "2 hours"}
                      {offset === "1day" && "1 day"}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">
                  Custom reminder (optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Minutes before"
                    value={reminderCustomOffset || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0) {
                        setReminderCustomOffset(val);
                        if (!reminderOffsets.includes("custom")) {
                          setReminderOffsets([...reminderOffsets, "custom"]);
                        }
                      } else {
                        setReminderCustomOffset(undefined);
                        setReminderOffsets(
                          reminderOffsets.filter((o) => o !== "custom")
                        );
                      }
                    }}
                  />
                  {reminderCustomOffset && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReminderCustomOffset(undefined);
                        setReminderOffsets(
                          reminderOffsets.filter((o) => o !== "custom")
                        );
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {hasRecurrence && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={reminderRecurring}
                    onCheckedChange={(checked) =>
                      setReminderRecurring(checked === true)
                    }
                  />
                  <Label className="text-sm cursor-pointer">
                    Recurring reminders (for recurring tasks)
                  </Label>
                </div>
              )}

              {reminderOffsets.length > 0 && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <strong>Reminders set:</strong>{" "}
                  {reminderOffsets
                    .map((offset) => {
                      if (offset === "custom" && reminderCustomOffset) {
                        const hours = Math.floor(reminderCustomOffset / 60);
                        const mins = reminderCustomOffset % 60;
                        if (hours > 0 && mins > 0) {
                          return `${hours}h ${mins}m before`;
                        } else if (hours > 0) {
                          return `${hours}h before`;
                        } else {
                          return `${mins}m before`;
                        }
                      }
                      return offset === "15min"
                        ? "15 min before"
                        : offset === "30min"
                        ? "30 min before"
                        : offset === "1hour"
                        ? "1 hour before"
                        : offset === "2hours"
                        ? "2 hours before"
                        : offset === "1day"
                        ? "1 day before"
                        : "";
                    })
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
              >
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Subtasks</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add subtask"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
          />
          <Button type="button" onClick={handleAddSubtask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {subtasks.length > 0 && (
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <Checkbox
                  checked={subtask.done}
                  onCheckedChange={() => handleToggleSubtask(subtask.id)}
                />
                <span
                  className={`flex-1 text-sm ${
                    subtask.done ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {subtask.title}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSubtask(subtask.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Tracker Section */}
      {task && (
        <div className="border-t pt-4 space-y-4">
          {/* Total Tracked Time */}
          <TaskTotalTime taskId={task.id} />

          {/* Timer */}
          <TaskTimer
            taskId={task.id}
            taskTitle={task.title}
            listId={task.listId}
          />
        </div>
      )}

      {/* Recurrence Section */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            checked={hasRecurrence}
            onCheckedChange={(checked) => setHasRecurrence(checked === true)}
          />
          <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
            <Repeat className="h-4 w-4" />
            Make this task recurring
          </Label>
        </div>

        {hasRecurrence && (
          <div className="space-y-4 pl-6 border-l-2 border-primary/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Repeat</Label>
                <Select
                  value={recurrenceType}
                  onValueChange={(value) =>
                    setRecurrenceType(value as RecurrencePattern["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recurrenceType !== "weekly" && (
                <div>
                  <Label className="text-sm mb-2 block">Interval</Label>
                  <Input
                    type="number"
                    min="1"
                    value={recurrenceInterval}
                    onChange={(e) =>
                      setRecurrenceInterval(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                  />
                </div>
              )}
            </div>

            {recurrenceType === "weekly" && (
              <div>
                <Label className="text-sm mb-2 block">Days of week</Label>
                <div className="flex flex-wrap gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={
                          recurrenceDaysOfWeek.includes(index)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleDayOfWeek(index)}
                        className="h-8"
                      >
                        {day}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}

            {recurrenceType === "monthly" && (
              <div>
                <Label className="text-sm mb-2 block">Day of month</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={recurrenceDayOfMonth || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 31) {
                      setRecurrenceDayOfMonth(val);
                    }
                  }}
                  placeholder="e.g., 15"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block">
                  End date (optional)
                </Label>
                <DatePicker
                  date={recurrenceEndDate}
                  onSelect={setRecurrenceEndDate}
                  placeholder="Never"
                />
              </div>

              <div>
                <Label className="text-sm mb-2 block">
                  Repeat count (optional)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={recurrenceCount || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0) {
                      setRecurrenceCount(val);
                    } else {
                      setRecurrenceCount(undefined);
                    }
                  }}
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            {hasRecurrence && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <strong>Preview:</strong>{" "}
                {recurrenceType && (
                  <span>
                    {formatRecurrence({
                      type: recurrenceType,
                      interval: recurrenceInterval,
                      daysOfWeek:
                        recurrenceType === "weekly"
                          ? recurrenceDaysOfWeek
                          : undefined,
                      dayOfMonth:
                        recurrenceType === "monthly"
                          ? recurrenceDayOfMonth
                          : undefined,
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Linked Notes Section */}
      {task && (
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Linked Notes ({linkedNotes.length})
          </label>
          {linkedNotes.length > 0 ? (
            <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
              {linkedNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    router.push(`/notes/${note.id}`);
                    onCancel(); // Close task panel when opening note
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {note.title}
                      </h4>
                      {note.pinned && (
                        <span className="text-xs text-primary">Pinned</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {note.content.replace(/[#*`\[\]]/g, "").slice(0, 100)}
                      {note.content.length > 100 ? "..." : ""}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
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
            <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30 text-center">
              No notes attached to this task
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={done}
            onCheckedChange={(checked) => {
              setDone(checked === true);
            }}
            id="task-complete"
          />
          <Label
            htmlFor="task-complete"
            className="text-sm font-medium cursor-pointer"
          >
            {done ? "Mark as incomplete" : "Mark as complete"}
          </Label>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
