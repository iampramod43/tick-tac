"use client";

import { useFlowModeContext } from "@/src/context/FlowModeContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlowTaskSequence } from "./FlowTaskSequence";
import { Check, SkipForward, Square, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FlowSidebarProps {
  onNavigateToFlow?: () => void;
}

export function FlowSidebar({ onNavigateToFlow }: FlowSidebarProps) {
  const {
    isActive,
    currentTask,
    session,
    sequence,
    progress,
    completeTask,
    skipTask,
    stopFlow,
    loading,
  } = useFlowModeContext();

  if (!isActive || !session) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Flow Mode</h3>
        {onNavigateToFlow && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToFlow}
            className="text-slate-400 hover:text-slate-200"
          >
            View Full
          </Button>
        )}
      </div>

      {/* Current Task Card */}
      {currentTask && (
        <div className="bg-slate-800 border border-violet-600/30 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Current Task
            </p>
            <h4 className="text-base font-semibold text-slate-100">
              {currentTask.title}
            </h4>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>{currentTask.duration} minutes</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={completeTask}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={skipTask}
              disabled={loading}
              className="flex-1 border-slate-700 hover:bg-slate-700"
            >
              <SkipForward className="h-3.5 w-3.5 mr-1.5" />
              Skip
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-200 font-medium">
            {progress.current} / {progress.total}
          </span>
        </div>
        <Progress
          value={progress.percentage}
          className="h-2 bg-slate-800"
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{progress.percentage}% complete</span>
          <span>
            {session.completedTasks || 0} completed, {session.skippedTasks || 0}{" "}
            skipped
          </span>
        </div>
      </div>

      {/* Task Sequence */}
      {sequence.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Task Sequence
          </p>
          <FlowTaskSequence
            sequence={sequence}
            currentIndex={session.currentIndex || 0}
            completedTasks={session.completedTasks || 0}
            skippedTasks={session.skippedTasks || 0}
          />
        </div>
      )}

      {/* Stop Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={stopFlow}
        disabled={loading}
        className="w-full"
      >
        <Square className="h-3.5 w-3.5 mr-1.5" />
        Stop Flow Mode
      </Button>
    </div>
  );
}

