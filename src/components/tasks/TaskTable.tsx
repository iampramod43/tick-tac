"use client";

import { Task } from "@/src/lib/types";
import { TaskTableRow } from "./TaskTableRow";
import { Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TaskTableProps {
  tasks: Task[];
  onToggle: (id: string, done: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onMoveToList?: (taskId: string, listId: string) => void;
  emptyMessage?: string;
  activeTaskId?: string;
  elapsedTime?: number;
  trackingState?: "idle" | "running" | "paused";
  onStartTimer?: (taskId: string) => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  onStopTimer?: () => void;
}

export function TaskTable({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onTaskClick,
  onMoveToList,
  emptyMessage = "No tasks yet. Add one to get started!",
  activeTaskId,
  elapsedTime = 0,
  trackingState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tasks</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-[120px] text-muted-foreground font-medium">
              Track
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              Name
            </TableHead>
            <TableHead className="hidden md:table-cell w-[120px] text-muted-foreground font-medium">
              Start Date
            </TableHead>
            <TableHead className="w-[120px] text-muted-foreground font-medium">
              Due Date
            </TableHead>
            <TableHead className="w-[100px] text-muted-foreground font-medium">
              Priority
            </TableHead>
            <TableHead className="w-[100px] text-muted-foreground font-medium">
              Status
            </TableHead>
            <TableHead className="hidden lg:table-cell text-muted-foreground font-medium">
              Tags
            </TableHead>
            <TableHead className="w-[120px] text-right text-muted-foreground font-medium">
              Project
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => (
            <TaskTableRow
              key={task.id}
              task={task}
              index={index}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onTaskClick}
              onMoveToList={onMoveToList}
              isActive={activeTaskId === task.id}
              elapsedTime={activeTaskId === task.id ? elapsedTime : 0}
              trackingState={
                activeTaskId === task.id ? trackingState : undefined
              }
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResumeTimer={onResumeTimer}
              onStopTimer={onStopTimer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
