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
  Clock,
  ExternalLink,
  Paperclip,
  Tag,
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
import { Badge } from "@/components/ui/badge";
import { useLists } from "@/src/hooks/useLists";
import { useTaskTime } from "@/src/hooks/useTimeTracking";
import { TrackButton } from "./TrackButton";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { parseISO } from "date-fns";

interface TaskTableRowProps {
  task: Task;
  index: number;
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

export function TaskTableRow({
  task,
  index,
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
}: TaskTableRowProps) {
  const { lists } = useLists();
  const { totalMinutes, totalHours, totalMinutesRemainder } = useTaskTime(
    task.id
  );

  // Format total tracked time
  const formatTotalTime = () => {
    if (totalMinutes === 0) return undefined;
    if (totalHours > 0) {
      return `${totalHours}h ${totalMinutesRemainder}m`;
    }
    return `${totalMinutes}m`;
  };

  const totalTimeDisplay = formatTotalTime();
  const isDue = task.due && isOverdue(task.due);
  const list = lists.find((l) => l.id === task.listId);
  const listColor = list?.color || "#8b5cf6";

  // Get start date (createdAt or due date if available)
  const startDate = task.createdAt ? parseISO(task.createdAt) : null;

  // Status badge
  const getStatusBadge = () => {
    if (task.done) {
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 dark:bg-green-500/10 border-green-500/30 dark:border-green-500/30 text-green-600 dark:text-green-400"
        >
          Done
        </Badge>
      );
    }
    if (isDue) {
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 dark:bg-red-500/10 border-red-500/30 dark:border-red-500/30 text-red-600 dark:text-red-400"
        >
          Overdue
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-orange-500/10 dark:bg-orange-500/10 border-orange-500/30 dark:border-orange-500/30 text-orange-600 dark:text-orange-400"
      >
        Ongoing
      </Badge>
    );
  };

  // Priority badge
  const getPriorityBadge = () => {
    const priorityColors = {
      1: "bg-red-500/10 dark:bg-red-500/10 border-red-500/30 dark:border-red-500/30 text-red-600 dark:text-red-400",
      2: "bg-yellow-500/10 dark:bg-yellow-500/10 border-yellow-500/30 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400",
      3: "bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30 dark:border-blue-500/30 text-blue-600 dark:text-blue-400",
      4: "bg-muted border-border text-muted-foreground",
    };
    const priorityLabels = {
      1: "Urgent",
      2: "High",
      3: "Normal",
      4: "Low",
    };

    return (
      <Badge
        variant="outline"
        className={cn("bg-muted/50 border-border", priorityColors[task.priority])}
      >
        {priorityLabels[task.priority]}
      </Badge>
    );
  };

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-all group",
        "hover:bg-muted/50 hover:shadow-md",
        index % 2 === 0 ? "bg-muted/30" : "bg-background",
        isActive && "border-l-4 border-l-violet-600 bg-violet-50 dark:bg-violet-950/20",
        task.done && "opacity-60"
      )}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(task);
        }
      }}
      tabIndex={0}
    >
      {/* Track Column */}
      <TableCell className="py-3">
        <TrackButton
          isActive={isActive}
          trackingState={trackingState}
          elapsedTime={elapsedTime}
          totalTime={totalTimeDisplay}
          onStart={() => onStartTimer?.(task.id)}
          onPause={onPauseTimer}
          onResume={onResumeTimer}
          onStop={onStopTimer}
        />
      </TableCell>

      {/* Name Column */}
      <TableCell className="py-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={task.done}
              onCheckedChange={(checked) => {
                onToggle(task.id, checked === true);
              }}
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
          <div className="flex flex-wrap items-center gap-2 pl-6">
            {task.notes && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-[200px]">
                  {task.notes.substring(0, 30)}
                </span>
              </span>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground bg-muted"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Start Date Column */}
      <TableCell className="hidden md:table-cell py-3 text-muted-foreground text-sm">
        {startDate ? formatDate(startDate.toISOString()) : "-"}
      </TableCell>

      {/* Due Date Column */}
      <TableCell className="py-3">
        {task.due ? (
          <div
            className={cn(
              "flex items-center gap-1 text-sm",
              isDue ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(task.due)}
              {task.dueTime && ` ${task.dueTime}`}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Priority Column */}
      <TableCell className="py-3">
        {getPriorityBadge()}
      </TableCell>

      {/* Status Column */}
      <TableCell className="py-3">
        {getStatusBadge()}
      </TableCell>

      {/* Tags Column (hidden on smaller screens) */}
      <TableCell className="hidden lg:table-cell py-3">
        {task.tags && task.tags.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground bg-muted"
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
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Project Column */}
      <TableCell className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {list && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground">{list.title}</span>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: listColor }}
              />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(task.id, !task.done);
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
      </TableCell>
    </TableRow>
  );
}

