"use client";

import { Task } from "@/src/lib/types";
import { TaskItem } from "./TaskItem";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";

interface TaskListProps {
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

export function TaskList({
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
}: TaskListProps) {
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
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <TaskItem
              task={task}
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
