"use client";

import { Task } from "@/src/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityIndicator } from "@/src/components/common/PriorityIndicator";
import { formatDate, isOverdue } from "@/src/lib/utils";
import {
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Repeat,
  Bell,
  FolderSymlink,
  Play,
  Pause,
  Clock,
  ChevronDown,
  ExternalLink,
  Paperclip,
  Tag,
  Hourglass,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLists } from "@/src/hooks/useLists";
import { useTaskTime } from "@/src/hooks/useTimeTracking";
import { useActionEvents } from "@/src/hooks/useActionEvents";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { GravityNudge } from "@/src/components/action-engine/GravityNudge";
import { FlowMagnetMode } from "@/src/components/action-engine/FlowMagnetMode";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  onMoveToList?: (taskId: string, listId: string) => void;
  isActive?: boolean;
  onStartTimer?: (taskId: string) => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  onStopTimer?: () => void;
  elapsedTime?: number; // in seconds
  trackingState?: "idle" | "running" | "paused";
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onClick,
  onMoveToList,
  isActive = false,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  elapsedTime = 0,
  trackingState,
}: TaskItemProps) {
  const { lists } = useLists();
  const { totalMinutes, totalHours, totalMinutesRemainder } = useTaskTime(
    task.id
  );
  const { sendEvent } = useActionEvents();
  const { focusLock } = useActionEngine();

  // Use provided elapsedTime if active
  const displayTime = isActive ? elapsedTime : 0;

  // Format total tracked time
  const formatTotalTime = () => {
    if (totalMinutes === 0) return null;
    if (totalHours > 0) {
      return `${totalHours}h ${totalMinutesRemainder}m`;
    }
    return `${totalMinutes}m`;
  };

  const totalTimeDisplay = formatTotalTime();

  const handleCheckboxChange = (checked: boolean) => {
    onToggle(task.id, checked);
    sendEvent(checked ? "task_completed" : "task_uncompleted", {
      taskId: task.id,
    });
  };

  const handleTaskClick = (e?: React.MouseEvent) => {
    // Check focus lock
    if (focusLock.taskId && task.id !== focusLock.taskId) {
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    sendEvent("task_opened", { taskId: task.id });
    onClick(task);
  };

  const handleTaskContextMenu = () => {
    sendEvent("task_reopened", { taskId: task.id });
  };

  // Use trackingState from props if active
  const currentTrackingState = isActive ? trackingState || "running" : "idle";

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isDue = task.due && isOverdue(task.due);
  const list = lists.find((l) => l.id === task.listId);
  const listColor = list?.color || "#8b5cf6"; // Default to violet

  return (
    <GravityNudge taskId={task.id} isActive={isActive}>
      <FlowMagnetMode taskId={task.id}>
        <div
          className={cn(
            "group relative w-full rounded-2xl border bg-card px-4 py-3 transition-all",
            "hover:shadow-lg hover:border-border cursor-pointer",
            "focus-within:outline-2 focus-within:outline-violet-500 focus-within:outline-offset-2",
            task.done && "opacity-60",
            isActive && "border-violet-600 bg-card/50"
          )}
          onClick={handleTaskClick}
          onContextMenu={handleTaskContextMenu}
          tabIndex={0}
          data-task-active={isActive}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTaskClick();
            }
          }}
        >
      {isActive ? (
        // Active state: Purple block layout matching KosmoTime design
        <div className="flex items-center gap-4">
          {/* Left Rail - Purple block with dropdown */}
          <div className="flex shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className="flex flex-col gap-1 rounded-2xl bg-violet-600 px-3 py-2.5 text-white cursor-pointer hover:bg-violet-500 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top row: Play/Pause icon (in circle), Start/Pause text, Chevron down */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      {currentTrackingState === "paused" ? (
                        <Play className="h-3 w-3 fill-white text-white" />
                      ) : (
                        <Pause className="h-3 w-3 fill-white text-white" />
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {currentTrackingState === "paused" ? "Paused" : "Start"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  {/* Bottom row: Hourglass icon + Timer */}
                  <div className="flex items-center gap-1.5 pl-7">
                    <Hourglass className="h-3 w-3 shrink-0" />
                    <span className="font-mono text-xs font-medium">
                      {formatTime(displayTime)}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                onClick={(e) => e.stopPropagation()}
              >
                {currentTrackingState === "running" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onPauseTimer?.();
                    }}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </DropdownMenuItem>
                )}
                {currentTrackingState === "paused" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onResumeTimer?.();
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopTimer?.();
                  }}
                  className="text-red-400"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Stop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center - Task content to the right of purple block */}
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.done}
                onCheckedChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />
              <h3
                className={cn(
                  "text-sm font-semibold text-foreground md:text-base",
                  task.done && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              {(task.isRecurrenceTemplate || task.recurrenceTemplateId) && (
                <Repeat
                  className="h-3.5 w-3.5 shrink-0 text-violet-400"
                  aria-label="Recurring task"
                />
              )}
              {task.reminderSettings?.enabled &&
                task.reminderSettings.offsets.length > 0 && (
                  <Bell
                    className="h-3.5 w-3.5 shrink-0 text-yellow-500"
                    aria-label="Reminders set"
                  />
                )}
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Source link with paperclip */}
              {task.notes && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">
                    {task.notes.substring(0, 30)}
                  </span>
                </span>
              )}

              {/* Priority */}
              <PriorityIndicator priority={task.priority} size="sm" />

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {task.tags[0]}
                  </span>
                  {task.tags.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {task.tags.length - 1} more...
                    </span>
                  )}
                </div>
              )}

              {/* Due Date */}
              {task.due && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isDue ? "text-red-400" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(task.due)}
                    {task.dueTime && ` at ${task.dueTime}`}
                  </span>
                </div>
              )}

              {/* Total Tracked Time */}
              {totalTimeDisplay && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{totalTimeDisplay}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Project/Context */}
          <div className="flex shrink-0 items-center justify-end gap-2 text-right">
            {list && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">{list.title}</span>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: listColor }}
                />
              </div>
            )}

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    const newDone = !task.done;
                    onToggle(task.id, newDone);
                    sendEvent(newDone ? "task_completed" : "task_uncompleted", {
                      taskId: task.id,
                    });
                  }}
                >
                  {task.done ? (
                    <>
                      <span className="mr-2">✓</span>
                      Mark as incomplete
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✓</span>
                      Mark as complete
                    </>
                  )}
                </DropdownMenuItem>
                {onMoveToList && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FolderSymlink className="mr-2 h-4 w-4" />
                      Move to list
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToList(task.id, "inbox");
                        }}
                      >
                        Inbox
                      </DropdownMenuItem>
                      {lists.map((l) => (
                        <DropdownMenuItem
                          key={l.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToList(task.id, l.id);
                          }}
                        >
                          {l.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    sendEvent("task_edit_started", { taskId: task.id });
                    onEdit(task);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        // Normal state: 3-column layout
        <div className="flex items-center gap-4">
          {/* Left Rail - Controls with dropdown */}
          <div className="flex w-20 shrink-0 items-center justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      sendEvent("timer_started", { taskId: task.id });
                      onStartTimer?.(task.id);
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Center Column - Main Content */}
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.done}
                onCheckedChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />
              <h3
                className={cn(
                  "text-sm font-semibold text-foreground md:text-base truncate",
                  task.done && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              {(task.isRecurrenceTemplate || task.recurrenceTemplateId) && (
                <Repeat
                  className="h-3.5 w-3.5 shrink-0 text-violet-400"
                  aria-label="Recurring task"
                />
              )}
              {task.reminderSettings?.enabled &&
                task.reminderSettings.offsets.length > 0 && (
                  <Bell
                    className="h-3.5 w-3.5 shrink-0 text-yellow-500"
                    aria-label="Reminders set"
                  />
                )}
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Source link placeholder - can be enhanced later */}
              {task.notes && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">
                    {task.notes.substring(0, 30)}
                  </span>
                </span>
              )}

              {/* Priority */}
              <PriorityIndicator priority={task.priority} size="sm" />

              {/* Due Date */}
              {task.due && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isDue ? "text-red-400" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(task.due)}
                    {task.dueTime && ` at ${task.dueTime}`}
                  </span>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {task.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{task.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Subtasks count */}
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {task.subtasks.filter((st) => st.done).length}/
                  {task.subtasks.length}
                </span>
              )}

              {/* Total Tracked Time */}
              {totalTimeDisplay && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{totalTimeDisplay}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Project/Context */}
          <div className="flex shrink-0 items-center justify-end gap-2 text-right">
            {list && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">{list.title}</span>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: listColor }}
                />
              </div>
            )}

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    const newDone = !task.done;
                    onToggle(task.id, newDone);
                    sendEvent(newDone ? "task_completed" : "task_uncompleted", {
                      taskId: task.id,
                    });
                  }}
                >
                  {task.done ? (
                    <>
                      <span className="mr-2">✓</span>
                      Mark as incomplete
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✓</span>
                      Mark as complete
                    </>
                  )}
                </DropdownMenuItem>
                {onMoveToList && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FolderSymlink className="mr-2 h-4 w-4" />
                      Move to list
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToList(task.id, "inbox");
                        }}
                      >
                        Inbox
                      </DropdownMenuItem>
                      {lists.map((l) => (
                        <DropdownMenuItem
                          key={l.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToList(task.id, l.id);
                          }}
                        >
                          {l.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    sendEvent("task_edit_started", { taskId: task.id });
                    onEdit(task);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
        </div>
      </FlowMagnetMode>
    </GravityNudge>
  );
}
