'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { useLists } from '@/src/hooks/useLists';
import { useTasks } from '@/src/hooks/useTasks';
import { usePomodoro } from '@/src/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, Plus } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NewListModal } from '@/src/components/lists/NewListModal';
import { TikkuChat } from '@/src/components/ai/TikkuChat';
import { format } from 'date-fns';
import { useFlowModeContext } from '@/src/context/FlowModeContext';

type TimerType = 'work' | 'shortBreak' | 'longBreak';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

export default function PomodoroPage() {
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const { sessions: savedSessions, addSession } = usePomodoro();
  const { isActive, currentTask, nextTask, completeTask } = useFlowModeContext();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  const [timerType, setTimerType] = useState<TimerType>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate sessions completed today from saved sessions
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = savedSessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= today && s.type === 'work' && s.completed;
    });
    setSessionsCompleted(todaySessions.length);
  }, [savedSessions]);

  const getDuration = useCallback((type: TimerType): number => {
    switch (type) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
    }
  }, [settings]);

  const switchTo = useCallback((type: TimerType) => {
    setTimerType(type);
    setTimeLeft(getDuration(type) * 60);
    setIsRunning(false);
    setStartTime(null);
  }, [getDuration]);

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);
    
    // Play completion sound (optional)
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Save session to API
    if (startTime) {
      await addSession({
        type: timerType,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: getDuration(timerType),
        completed: true,
      });
    }

    // Flow Mode integration: If Flow Mode is active and work session completes, advance to next task
    if (isActive && timerType === 'work') {
      try {
        await completeTask();
        // Flow Mode will automatically move to next task
      } catch (err) {
        console.error('Failed to complete Flow Mode task:', err);
      }
    }

    // Auto-advance to next phase
    if (timerType === 'work') {
      const nextSessions = sessionsCompleted + 1;
      
      if (nextSessions % settings.sessionsUntilLongBreak === 0) {
        switchTo('longBreak');
      } else {
        switchTo('shortBreak');
      }
    } else {
      switchTo('work');
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: `${timerType === 'work' ? 'Work session' : 'Break'} finished!`,
      });
    }
  }, [timerType, sessionsCompleted, settings.sessionsUntilLongBreak, startTime, addSession, getDuration, switchTo, isActive, completeTask]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (!isRunning && !startTime) {
      setStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(timerType) * 60);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration(timerType) * 60 - timeLeft) / (getDuration(timerType) * 60)) * 100;

  const taskCounts = {
    inbox: tasks.filter(t => !t.done && t.listId === 'inbox').length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter(t => t.done).length,
  };

  const handleSaveSettings = () => {
    setTimeLeft(settings.workDuration * 60);
    setTimerType('work');
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="pomodoro"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background to-muted/30">
        {/* Flow Mode Task Display */}
        {isActive && currentTask && (
          <div className="bg-violet-600/10 border-b border-violet-600/30 p-4">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">
                Flow Mode Active
              </p>
              <p className="text-sm font-medium text-violet-300">
                {currentTask.title}
              </p>
            </div>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-8">
            {/* Timer Type Selector */}
            <div className="flex justify-center gap-2">
              <Button
                variant={timerType === 'work' ? 'default' : 'outline'}
                onClick={() => switchTo('work')}
                disabled={isRunning}
              >
                Work
              </Button>
              <Button
                variant={timerType === 'shortBreak' ? 'default' : 'outline'}
                onClick={() => switchTo('shortBreak')}
                disabled={isRunning}
              >
                Short Break
              </Button>
              <Button
                variant={timerType === 'longBreak' ? 'default' : 'outline'}
                onClick={() => switchTo('longBreak')}
                disabled={isRunning}
              >
                Long Break
              </Button>
            </div>

            {/* Timer Display */}
            <div className="relative">
              <div className="w-full aspect-square max-w-md mx-auto rounded-full bg-card border-8 border-primary/20 flex items-center justify-center relative overflow-hidden">
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-primary"
                    strokeDasharray={`${progress * 2.83} 283`}
                  />
                </svg>

                {/* Time */}
                <div className="text-center z-10">
                  <div className="text-8xl font-bold tabular-nums">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xl text-muted-foreground mt-2">
                    {timerType === 'work' ? 'Focus Time' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-32"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-3xl font-bold">{sessionsCompleted}</div>
                <div className="text-sm text-muted-foreground">Sessions Today</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-3xl font-bold">{savedSessions.length}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-3xl font-bold">
                  {Math.round(savedSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
                </div>
                <div className="text-sm text-muted-foreground">Time Focused</div>
              </div>
            </div>

            {/* Recent Sessions */}
            {savedSessions.length > 0 && (
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-semibold mb-3">Recent Sessions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        session.type === 'work' 
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {session.type === 'work' ? 'Work' : session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                      </span>
                      <span className="text-muted-foreground">
                        {session.duration} min • {format(new Date(session.startTime), 'HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pomodoro Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Work Duration (minutes)</Label>
              <Input
                type="number"
                value={settings.workDuration}
                onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                min={1}
                max={60}
              />
            </div>
            <div className="space-y-2">
              <Label>Short Break (minutes)</Label>
              <Input
                type="number"
                value={settings.shortBreakDuration}
                onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value) || 5})}
                min={1}
                max={30}
              />
            </div>
            <div className="space-y-2">
              <Label>Long Break (minutes)</Label>
              <Input
                type="number"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value) || 15})}
                min={1}
                max={60}
              />
            </div>
            <div className="space-y-2">
              <Label>Sessions Until Long Break</Label>
              <Input
                type="number"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4})}
                min={1}
                max={10}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <NewListModal
        open={isNewListModalOpen}
        onOpenChange={setIsNewListModalOpen}
        onCreateList={async (title, color) => {
          await addList({ title, color });
        }}
      />

      <TikkuChat />
    </div>
  );
}

