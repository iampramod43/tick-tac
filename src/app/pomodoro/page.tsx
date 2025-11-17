'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { useLists } from '@/src/hooks/useLists';
import { useTasks } from '@/src/hooks/useTasks';
import { usePomodoro } from '@/src/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, Sparkles, Zap, Target, Clock } from 'lucide-react';
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        lists={lists}
        activeListId="pomodoro"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Animated Background with Gradient Mesh */}
        <div className="fixed inset-0 left-0 right-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-gradient-start)] via-background to-[var(--color-bg-gradient-end)]" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-accent-mint)]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-accent-magenta)]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[var(--color-accent-teal)]/5 rounded-full blur-[100px] animate-pulse delay-500" />
        </div>

        {/* Flow Mode Task Display */}
        {isActive && currentTask && (
          <div className="relative z-10 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-violet-500/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                <p className="text-xs text-violet-300 uppercase tracking-wider font-medium">
                  Flow Mode Active
                </p>
                <span className="text-sm text-violet-200 font-medium ml-2">
                  {currentTask.title}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
              {/* Header Section */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-primary animate-pulse" />
                  <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-foreground">
                    AI-Powered Focus Timer
                  </h1>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground max-w-2xl mx-auto">
                  Harness the power of focused work sessions with intelligent productivity tracking
                </p>
              </div>

              {/* Timer Type Selector */}
              <div className="flex justify-center">
                <div className="inline-flex gap-2 p-1.5 glass-2 rounded-full">
                  <Button
                    variant={timerType === 'work' ? 'default' : 'ghost'}
                    onClick={() => switchTo('work')}
                    disabled={isRunning}
                    className={cn(
                      'rounded-full px-6 transition-all duration-300',
                      timerType === 'work'
                        ? 'bg-gradient-to-r from-primary to-[var(--color-accent-teal)] text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Work
                  </Button>
                  <Button
                    variant={timerType === 'shortBreak' ? 'default' : 'ghost'}
                    onClick={() => switchTo('shortBreak')}
                    disabled={isRunning}
                    className={cn(
                      'rounded-full px-6 transition-all duration-300',
                      timerType === 'shortBreak'
                        ? 'bg-gradient-to-r from-primary to-[var(--color-accent-teal)] text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Short Break
                  </Button>
                  <Button
                    variant={timerType === 'longBreak' ? 'default' : 'ghost'}
                    onClick={() => switchTo('longBreak')}
                    disabled={isRunning}
                    className={cn(
                      'rounded-full px-6 transition-all duration-300',
                      timerType === 'longBreak'
                        ? 'bg-gradient-to-r from-primary to-[var(--color-accent-teal)] text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Long Break
                  </Button>
                </div>
              </div>

              {/* Timer Display - Main Focus */}
              <div className="relative flex justify-center items-center px-4">
                <div className="relative w-full max-w-xs aspect-square">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-[var(--color-accent-magenta)]/20 blur-3xl animate-pulse" />

                  {/* Glass Circle Container */}
                  <div className="relative w-full h-full rounded-full glass-2 p-3 lg:p-4 flex items-center justify-center border-2 border-border">
                    {/* Progress Ring SVG */}
                    <svg className="absolute inset-3 lg:inset-4 w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)] h-[calc(100%-1.5rem)] lg:h-[calc(100%-2rem)] -rotate-90">
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--color-accent-mint)" />
                          <stop offset="50%" stopColor="var(--color-accent-teal)" />
                          <stop offset="100%" stopColor="var(--color-accent-magenta)" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 2.83} 283`}
                        className="transition-all duration-1000"
                        style={{
                          filter: isRunning ? 'drop-shadow(0 0 12px var(--color-accent-mint))' : 'none'
                        }}
                      />
                    </svg>

                    {/* Time Display */}
                    <div className="text-center z-10 space-y-1 lg:space-y-2">
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-light tabular-nums tracking-tight text-foreground">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={cn(
                          'w-1.5 h-1.5 rounded-full transition-all duration-300',
                          isRunning ? 'bg-primary animate-pulse shadow-lg shadow-primary/50' : 'bg-muted-foreground/30'
                        )} />
                        <div className="text-xs lg:text-sm text-muted-foreground font-medium">
                          {timerType === 'work' ? 'Deep Focus Mode' : timerType === 'shortBreak' ? 'Quick Recharge' : 'Extended Rest'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-2 lg:gap-3 px-4">
                <Button
                  size="default"
                  onClick={toggleTimer}
                  className={cn(
                    'w-28 lg:w-32 rounded-full transition-all duration-300 text-sm lg:text-base font-medium',
                    'bg-gradient-to-r from-primary to-[var(--color-accent-teal)] text-primary-foreground',
                    'hover:shadow-xl hover:shadow-primary/30 hover:scale-105',
                    'active:scale-95'
                  )}
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-1.5 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-1.5 h-4 w-4 fill-current" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={resetTimer}
                  className="rounded-full glass-1 border-border text-foreground hover:bg-accent hover:border-border/50 transition-all duration-300"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => setIsSettingsOpen(true)}
                  className="rounded-full glass-1 border-border text-foreground hover:bg-accent hover:border-border/50 transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4">
                <div className="glass-2 rounded-xl p-4 text-center border border-border hover:border-primary/30 transition-all duration-300 group">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2 group-hover:bg-primary/20 transition-colors">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-light text-foreground mb-0.5">{sessionsCompleted}</div>
                  <div className="text-xs text-muted-foreground">Sessions Today</div>
                </div>
                <div className="glass-2 rounded-xl p-4 text-center border border-border hover:border-[var(--color-accent-teal)]/30 transition-all duration-300 group">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent-teal)]/10 mb-2 group-hover:bg-[var(--color-accent-teal)]/20 transition-colors">
                    <Sparkles className="w-5 h-5 text-[var(--color-accent-teal)]" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-light text-foreground mb-0.5">{savedSessions.length}</div>
                  <div className="text-xs text-muted-foreground">Total Sessions</div>
                </div>
                <div className="glass-2 rounded-xl p-4 text-center border border-border hover:border-[var(--color-accent-magenta)]/30 transition-all duration-300 group sm:col-span-1 col-span-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent-magenta)]/10 mb-2 group-hover:bg-[var(--color-accent-magenta)]/20 transition-colors">
                    <Zap className="w-5 h-5 text-[var(--color-accent-magenta)]" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-light text-foreground mb-0.5">
                    {Math.round(savedSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Time Focused</div>
                </div>
              </div>

              {/* Recent Sessions */}
              {savedSessions.length > 0 && (
                <div className="glass-2 rounded-xl border border-border p-4 mx-4 sm:mx-0">
                  <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Recent Sessions
                  </h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {savedSessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors border border-border"
                      >
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm',
                          session.type === 'work'
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        )}>
                          {session.type === 'work' ? 'Work' : session.type === 'shortBreak' ? 'Short' : 'Long'}
                        </span>
                        <span className="text-muted-foreground text-xs">
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
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="glass-2 border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Timer Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Work Duration (minutes)
              </Label>
              <Input
                type="number"
                value={settings.workDuration}
                onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                min={1}
                max={60}
                className="glass-1 border-border text-foreground focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-accent-teal)]" />
                Short Break (minutes)
              </Label>
              <Input
                type="number"
                value={settings.shortBreakDuration}
                onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value) || 5})}
                min={1}
                max={30}
                className="glass-1 border-border text-foreground focus:border-[var(--color-accent-teal)]/50 focus:ring-[var(--color-accent-teal)]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-accent-magenta)]" />
                Long Break (minutes)
              </Label>
              <Input
                type="number"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value) || 15})}
                min={1}
                max={60}
                className="glass-1 border-border text-foreground focus:border-[var(--color-accent-magenta)]/50 focus:ring-[var(--color-accent-magenta)]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Sessions Until Long Break
              </Label>
              <Input
                type="number"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4})}
                min={1}
                max={10}
                className="glass-1 border-border text-foreground focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="glass-1 border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-primary to-[var(--color-accent-teal)] text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
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

