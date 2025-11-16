'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimeTracking } from './useTimeTracking';
import { format } from 'date-fns';

type TrackingState = 'idle' | 'running' | 'paused';

/**
 * Hook to manage active time tracking
 * Handles starting/pausing/stopping time entries and calculates elapsed time
 */
export function useActiveTimeTracking() {
  const { timeEntries, addTimeEntry, updateTimeEntry } = useTimeTracking();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [trackingState, setTrackingState] = useState<TrackingState>('idle');
  const [pausedTime, setPausedTime] = useState(0); // Total paused time in seconds
  const pauseStartRef = useRef<Date | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Find the active time entry (one without endTime)
  // If multiple exist (shouldn't happen), use the most recent one
  const activeEntry = timeEntries
    .filter((entry) => !entry.endTime && entry.taskId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];

  // Initialize tracking state when active entry changes
  useEffect(() => {
    if (activeEntry && trackingState === 'idle') {
      setTrackingState('running');
      startTimeRef.current = new Date(activeEntry.startTime);
      setPausedTime(0);
    } else if (!activeEntry) {
      setTrackingState('idle');
      setElapsedTime(0);
      setPausedTime(0);
      startTimeRef.current = null;
      pauseStartRef.current = null;
    }
  }, [activeEntry, trackingState]);

  // Calculate elapsed time for active entry
  useEffect(() => {
    if (activeEntry && trackingState === 'running' && startTimeRef.current) {
      const interval = setInterval(() => {
        const now = new Date();
        const totalElapsed = Math.floor(
          (now.getTime() - startTimeRef.current!.getTime()) / 1000
        );
        const actualElapsed = totalElapsed - pausedTime;
        setElapsedTime(actualElapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else if (trackingState === 'paused' && startTimeRef.current && pauseStartRef.current) {
      // When paused, calculate elapsed time up to when pause started
      const pauseStart = pauseStartRef.current;
      const totalElapsed = Math.floor(
        (pauseStart.getTime() - startTimeRef.current.getTime()) / 1000
      );
      const actualElapsed = totalElapsed - pausedTime;
      setElapsedTime(actualElapsed);
    }
  }, [activeEntry, trackingState, pausedTime]);

  /**
   * Pause tracking time for the active task
   */
  const pauseTracking = useCallback(() => {
    if (trackingState === 'running' && !pauseStartRef.current) {
      setTrackingState('paused');
      pauseStartRef.current = new Date();
    }
  }, [trackingState]);

  /**
   * Resume tracking time for the active task
   */
  const resumeTracking = useCallback(() => {
    if (trackingState === 'paused' && pauseStartRef.current) {
      const now = new Date();
      const pauseDuration = Math.floor(
        (now.getTime() - pauseStartRef.current.getTime()) / 1000
      );
      setPausedTime((prev) => prev + pauseDuration);
      pauseStartRef.current = null;
      setTrackingState('running');
    }
  }, [trackingState]);

  /**
   * Stop tracking time for the active task
   */
  const stopTracking = useCallback(async () => {
    // Get the current active entry at call time
    const currentActiveEntry = timeEntries.find((entry) => !entry.endTime && entry.taskId);
    if (!currentActiveEntry) return;

    const now = new Date();
    const startTime = new Date(currentActiveEntry.startTime);
    
    // Calculate total elapsed time including any paused time
    let totalPaused = pausedTime;
    if (pauseStartRef.current && trackingState === 'paused') {
      // Add current pause duration
      const currentPauseDuration = Math.floor(
        (now.getTime() - pauseStartRef.current.getTime()) / 1000
      );
      totalPaused += currentPauseDuration;
    }

    const totalElapsedSeconds = Math.floor(
      (now.getTime() - startTime.getTime()) / 1000
    );
    const actualDurationSeconds = totalElapsedSeconds - totalPaused;
    const durationMinutes = Math.ceil(actualDurationSeconds / 60);

    // Update the entry with endTime and duration
    await updateTimeEntry(currentActiveEntry.id, {
      endTime: now.toISOString(),
      duration: durationMinutes,
    });

    // Reset state
    setTrackingState('idle');
    setPausedTime(0);
    pauseStartRef.current = null;
    startTimeRef.current = null;
  }, [timeEntries, updateTimeEntry, pausedTime, trackingState]);

  /**
   * Start tracking time for a task
   * If there's already an active entry, stop it first
   */
  const startTracking = useCallback(
    async (taskId: string, taskTitle: string, listId?: string) => {
      // Stop any existing active entry
      const currentActiveEntry = timeEntries.find((entry) => !entry.endTime && entry.taskId);
      if (currentActiveEntry) {
        await stopTracking();
      }

      // Create new active time entry
      const now = new Date();
      await addTimeEntry({
        taskId,
        listId,
        description: taskTitle,
        startTime: now.toISOString(),
        // endTime is undefined for active entries
        duration: 0, // Will be calculated when stopped
        date: format(now, 'yyyy-MM-dd'),
      });
    },
    [timeEntries, addTimeEntry, stopTracking]
  );

  return {
    activeTaskId: activeEntry?.taskId,
    activeEntry,
    elapsedTime,
    trackingState,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    isTracking: !!activeEntry,
  };
}

