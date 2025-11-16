"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowFullScreen } from "@/src/components/flow/FlowFullScreen";
import { FlowTaskSequence } from "@/src/components/flow/FlowTaskSequence";
import { FlowStartModal } from "@/src/components/flow/FlowStartModal";
import { useFlowModeContext } from "@/src/context/FlowModeContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Check, SkipForward, Square, Clock } from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { isToday, parseISO, addDays, isBefore, startOfDay } from "date-fns";

export default function FlowPage() {
  const router = useRouter();
  const {
    isActive,
    currentTask,
    session,
    sequence,
    progress,
    startFlow,
    completeTask,
    skipTask,
    stopFlow,
    loading,
    error,
  } = useFlowModeContext();
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const { lists } = useLists();
  const { tasks } = useTasks();

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
    today: tasks.filter((t) => !t.done && t.due && isToday(parseISO(t.due)))
      .length,
    upcoming: tasks.filter((t) => {
      if (!t.done && t.due) {
        const today = startOfDay(new Date());
        const nextWeek = addDays(today, 7);
        return (
          isBefore(parseISO(t.due), nextWeek) && !isToday(parseISO(t.due))
        );
      }
      return false;
    }).length,
    completed: tasks.filter((t) => t.done).length,
  };

  // If not active and no session, show start screen
  if (!isActive && !session) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          lists={lists}
          activeListId="flow"
          onListSelect={() => {}}
          onNewList={() => {}}
          taskCounts={taskCounts}
        />
        <div className="flex-1 overflow-y-auto bg-slate-950">
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center space-y-6 py-16">
              <div className="flex justify-center">
                <div className="rounded-full bg-violet-600/20 p-6">
                  <Zap className="h-12 w-12 text-violet-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-100">
                  Flow Mode
                </h1>
                <p className="text-slate-400 max-w-md mx-auto">
                  Create a focused work session with an optimized sequence of
                  tasks. Flow Mode helps you maintain momentum and complete more
                  in less time.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setStartModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Flow Mode
              </Button>
            </div>
          </div>
        </div>
        <FlowStartModal
          open={startModalOpen}
          onOpenChange={setStartModalOpen}
          onStart={startFlow}
          loading={loading}
        />
      </div>
    );
  }

  // Full screen immersive view
  if (fullScreen) {
    return (
      <FlowFullScreen
        onExit={() => setFullScreen(false)}
        pomodoroComponent={
          <div className="text-slate-400">
            Pomodoro timer will appear here when integrated
          </div>
        }
      />
    );
  }

  // Regular Flow Mode page
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="flow"
        onListSelect={() => {}}
        onNewList={() => {}}
        taskCounts={taskCounts}
      />
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Flow Mode</h1>
              <p className="text-slate-400 mt-1">
                {session?.startedAt
                  ? `Started ${new Date(session.startedAt).toLocaleTimeString()}`
                  : "Active session"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFullScreen(true)}
                className="border-slate-700 hover:bg-slate-800"
              >
                Full Screen
              </Button>
              <Button
                variant="destructive"
                onClick={stopFlow}
                disabled={loading}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Flow
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Current Task Card */}
          {currentTask && (
            <div className="bg-slate-900 border border-violet-600/30 rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                    Current Task
                  </p>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    {currentTask.title}
                  </h2>
                  {currentTask.reason && (
                    <p className="text-slate-400">{currentTask.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{currentTask.duration} minutes</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-4">
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

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={completeTask}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
                <Button
                  variant="outline"
                  onClick={skipTask}
                  disabled={loading}
                  className="flex-1 border-slate-700 hover:bg-slate-800"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Task
                </Button>
              </div>
            </div>
          )}

          {/* Task Sequence */}
          {sequence.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Task Sequence
              </h3>
              <FlowTaskSequence
                sequence={sequence}
                currentIndex={session?.currentIndex || 0}
                completedTasks={session?.completedTasks || 0}
                skippedTasks={session?.skippedTasks || 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

