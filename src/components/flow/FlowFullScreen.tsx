"use client";

import { useFlowModeContext } from "@/src/context/FlowModeContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Check, SkipForward, Square } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FlowFullScreenProps {
  onExit?: () => void;
  pomodoroComponent?: React.ReactNode;
}

export function FlowFullScreen({
  onExit,
  pomodoroComponent,
}: FlowFullScreenProps) {
  const {
    isActive,
    currentTask,
    session,
    progress,
    completeTask,
    skipTask,
    stopFlow,
    loading,
  } = useFlowModeContext();

  if (!isActive || !currentTask) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-100">
        <div className="text-center space-y-4">
          <p className="text-xl">No active Flow Mode session</p>
          {onExit && (
            <Button onClick={onExit} variant="outline">
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      {/* Header with Progress */}
      <div className="border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-100">Flow Mode</h2>
            {onExit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onExit}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                Task {progress.current} of {progress.total}
              </span>
              <span className="text-slate-300 font-medium">
                {progress.percentage}% complete
              </span>
            </div>
            <Progress
              value={progress.percentage}
              className="h-2 bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Current Task */}
          <div className="space-y-4">
            <p className="text-sm text-slate-400 uppercase tracking-wider">
              Current Task
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100">
              {currentTask.title}
            </h1>
            {currentTask.reason && (
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {currentTask.reason}
              </p>
            )}
          </div>

          {/* Pomodoro Timer */}
          {pomodoroComponent && (
            <div className="py-8">{pomodoroComponent}</div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={completeTask}
              disabled={loading}
              className="bg-green-600 hover:bg-green-500 text-white px-8"
            >
              <Check className="h-5 w-5 mr-2" />
              Complete Task
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={skipTask}
              disabled={loading}
              className="border-slate-700 hover:bg-slate-800 px-8"
            >
              <SkipForward className="h-5 w-5 mr-2" />
              Skip
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={stopFlow}
              disabled={loading}
              className="px-8"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop Flow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

