"use client";

import { FlowTask } from "@/src/lib/api/flowApi";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FlowTaskSequenceProps {
  sequence: FlowTask[];
  currentIndex: number;
  completedTasks: number;
  skippedTasks: number;
}

export function FlowTaskSequence({
  sequence,
  currentIndex,
  completedTasks,
  skippedTasks,
}: FlowTaskSequenceProps) {
  const getTaskStatus = (index: number) => {
    if (index < currentIndex) {
      // Check if it was completed or skipped
      // For simplicity, assume tasks before current are completed
      return "completed";
    } else if (index === currentIndex) {
      return "current";
    } else {
      return "upcoming";
    }
  };

  return (
    <div className="space-y-2">
      {sequence.map((task, index) => {
        const status = getTaskStatus(index);
        const isCompleted = status === "completed";
        const isCurrent = status === "current";
        const isUpcoming = status === "upcoming";

        return (
          <div
            key={task.id || `task-${index}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              isCurrent &&
                "bg-violet-600/20 border-violet-600 shadow-lg shadow-violet-600/20",
              isCompleted &&
                "bg-slate-800/50 border-slate-700 opacity-60",
              isUpcoming && "bg-slate-800/30 border-slate-800"
            )}
          >
            {/* Status Icon */}
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full shrink-0",
                isCurrent && "bg-violet-600",
                isCompleted && "bg-green-500",
                isUpcoming && "bg-slate-700"
              )}
            >
              {isCompleted ? (
                <Check className="h-3.5 w-3.5 text-white" />
              ) : isCurrent ? (
                <span className="text-xs font-bold text-white">{index + 1}</span>
              ) : (
                <span className="text-xs text-slate-400">{index + 1}</span>
              )}
            </div>

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-violet-300",
                  isCompleted && "text-slate-400 line-through",
                  isUpcoming && "text-slate-300"
                )}
              >
                {task.title}
              </div>
              {task.reason && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {task.reason}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{task.duration}m</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

