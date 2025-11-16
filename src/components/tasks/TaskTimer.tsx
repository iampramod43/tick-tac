'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useTimeTracking } from '@/src/hooks/useTimeTracking';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
  listId?: string;
}

type TimerState = 'idle' | 'running' | 'paused';

export function TaskTimer({ taskId, taskTitle, listId }: TaskTimerProps) {
  const { addTimeEntry } = useTimeTracking();
  const [state, setState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalPausedSeconds, setTotalPausedSeconds] = useState(0);
  const startTimeRef = useRef<Date | null>(null);
  const originalStartTimeRef = useRef<Date | null>(null);
  const pauseTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total elapsed time (running time - paused time)
  const totalElapsedSeconds = elapsedSeconds;

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current && originalStartTimeRef.current) {
          const now = new Date();
          // Total time since original start minus total paused time
          const totalTime = Math.floor(
            (now.getTime() - originalStartTimeRef.current.getTime()) / 1000
          );
          setElapsedSeconds(totalTime - totalPausedSeconds);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, totalPausedSeconds]);

  const handleStart = () => {
    if (state === 'paused') {
      // Resume from paused state
      const now = new Date();
      if (pauseTimeRef.current) {
        // Calculate how long we were paused and add to total paused time
        const pauseDuration = Math.floor(
          (now.getTime() - pauseTimeRef.current.getTime()) / 1000
        );
        setTotalPausedSeconds((prev) => prev + pauseDuration);
      }
      // Resume the timer
      startTimeRef.current = new Date();
      setState('running');
      pauseTimeRef.current = null;
    } else {
      // Start fresh
      const now = new Date();
      originalStartTimeRef.current = now;
      startTimeRef.current = now;
      setElapsedSeconds(0);
      setTotalPausedSeconds(0);
      setState('running');
    }
  };

  const handlePause = () => {
    if (state === 'running' && originalStartTimeRef.current) {
      // Record when we paused
      pauseTimeRef.current = new Date();
      setState('paused');
    }
  };

  const handleStop = async () => {
    if (state === 'idle' || !originalStartTimeRef.current) return;

    const now = new Date();
    let totalDuration = 0;

    if (state === 'running') {
      // Calculate total time: time since start minus total paused time
      const totalTime = Math.floor(
        (now.getTime() - originalStartTimeRef.current.getTime()) / 1000
      );
      totalDuration = totalTime - totalPausedSeconds;
    } else if (state === 'paused') {
      // Use the last calculated elapsedSeconds (which already accounts for paused time)
      totalDuration = elapsedSeconds;
    }

    if (totalDuration > 0) {
      const minutes = Math.ceil(totalDuration / 60);
      const startTime = originalStartTimeRef.current;
      const endTime = new Date(startTime.getTime() + totalDuration * 1000);

      await addTimeEntry({
        taskId,
        listId,
        description: taskTitle,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: minutes,
        date: format(startTime, 'yyyy-MM-dd'),
      });
    }

    // Reset timer
    setState('idle');
    setElapsedSeconds(0);
    setTotalPausedSeconds(0);
    startTimeRef.current = null;
    originalStartTimeRef.current = null;
    pauseTimeRef.current = null;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Time Tracker</h3>
        </div>
        <div
          className={cn(
            'text-2xl font-mono font-bold',
            state === 'running' && 'text-primary',
            state === 'paused' && 'text-yellow-500',
            state === 'idle' && 'text-muted-foreground'
          )}
        >
          {formatTime(totalElapsedSeconds)}
        </div>
      </div>

      <div className="flex gap-2">
        {state === 'idle' && (
          <Button onClick={handleStart} className="flex-1" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        )}

        {state === 'running' && (
          <>
            <Button onClick={handlePause} variant="outline" className="flex-1" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button onClick={handleStop} variant="destructive" className="flex-1" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </>
        )}

        {state === 'paused' && (
          <>
            <Button onClick={handleStart} className="flex-1" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
            <Button onClick={handleStop} variant="destructive" className="flex-1" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Stop & Save
            </Button>
          </>
        )}
      </div>

      {state !== 'idle' && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {state === 'running' && 'Timer is running...'}
          {state === 'paused' && 'Timer is paused'}
        </p>
      )}
    </div>
  );
}

