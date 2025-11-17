"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  createFlowApi,
  FlowStartRequest,
  FlowStartResponse,
  FlowNextResponse,
  FlowStatusResponse,
  FlowTask,
} from "@/src/lib/api/flowApi";
import { useActionEvents } from "./useActionEvents";

export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
}

export interface UseFlowModeReturn {
  // State
  isActive: boolean;
  session: FlowStatusResponse | null;
  currentTask: FlowTask | null;
  sequence: FlowTask[];
  progress: ProgressInfo;

  // Actions
  startFlow: (duration: number, energy?: string) => Promise<void>;
  nextTask: () => Promise<void>;
  completeTask: () => Promise<void>;
  skipTask: () => Promise<void>;
  stopFlow: () => Promise<void>;
  refreshStatus: () => Promise<void>;

  // Loading/Error states
  loading: boolean;
  error: string | null;
}

const FLOW_SESSION_KEY = "flow_mode_session";

export function useFlowMode(): UseFlowModeReturn {
  const { getToken } = useAuth();
  const { sendEvent } = useActionEvents();
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState<FlowStatusResponse | null>(null);
  const [currentTask, setCurrentTask] = useState<FlowTask | null>(null);
  const [sequence, setSequence] = useState<FlowTask[]>([]);
  const [progress, setProgress] = useState<ProgressInfo>({
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const flowApi = createFlowApi(getToken);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(FLOW_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.active) {
          refreshStatus();
        }
      } catch (err) {
        console.error("Failed to load saved session:", err);
      }
    }
  }, []);

  // Auto-refresh status every 30 seconds when active
  useEffect(() => {
    if (isActive) {
      pollingIntervalRef.current = setInterval(() => {
        refreshStatus();
      }, 30000); // 30 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [isActive]);

  // Update state when session changes
  useEffect(() => {
    if (session) {
      setIsActive(session.active);
      setCurrentTask(
        session.currentTask
          ? {
              id: session.currentTask.id,
              title: session.currentTask.title,
              duration: session.currentTask.duration,
              order: session.currentIndex || 0,
            }
          : null
      );
      setProgress(
        session.progress || {
          current: session.completedTasks || 0,
          total: session.totalTasks || 0,
          percentage: 0,
        }
      );

      // Persist to localStorage
      localStorage.setItem(FLOW_SESSION_KEY, JSON.stringify(session));
    } else {
      setIsActive(false);
      setCurrentTask(null);
      setProgress({ current: 0, total: 0, percentage: 0 });
      localStorage.removeItem(FLOW_SESSION_KEY);
    }
  }, [session]);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await flowApi.getStatus();
      setSession(status);
      setError(null);
    } catch (err: any) {
      console.error("Failed to refresh Flow Mode status:", err);
      setError(err.message || "Failed to refresh status");
      // If session not found, clear state
      if (err.message?.includes("not found") || err.message?.includes("404")) {
        setIsActive(false);
        setSession(null);
        localStorage.removeItem(FLOW_SESSION_KEY);
      }
    }
  }, [flowApi]);

  const startFlow = useCallback(
    async (duration: number, energy?: string) => {
      setLoading(true);
      setError(null);
      try {
        const request: FlowStartRequest = {
          duration,
          energy: energy as "low" | "medium" | "high" | undefined,
        };
        const response = await flowApi.start(request);
        setSequence(response.sequence);
        sendEvent("flow_session_started", {
          duration,
          energy,
          sessionId: response.sessionId,
        });
        await refreshStatus();
      } catch (err: any) {
        setError(err.message || "Failed to start Flow Mode");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [flowApi, refreshStatus, sendEvent]
  );

  const nextTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await flowApi.next();
      if (response.task) {
        setCurrentTask(response.task);
      }
      if (response.progress) {
        setProgress(response.progress);
      }
      await refreshStatus();
    } catch (err: any) {
      setError(err.message || "Failed to move to next task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flowApi, refreshStatus]);

  const completeTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await flowApi.complete();
      if (currentTask) {
        sendEvent("timer_completed", {
          taskId: currentTask.id,
          sessionId: session?.startedAt,
        });
      }
      if (response.task) {
        setCurrentTask(response.task);
      }
      if (response.progress) {
        setProgress(response.progress);
      }
      if (response.type === "flow_complete") {
        setIsActive(false);
        setSession(null);
        localStorage.removeItem(FLOW_SESSION_KEY);
      } else {
        await refreshStatus();
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flowApi, refreshStatus, currentTask, session, sendEvent]);

  const skipTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await flowApi.skip();
      if (currentTask) {
        sendEvent("flow_session_skipped_task", {
          taskId: currentTask.id,
        });
      }
      if (response.task) {
        setCurrentTask(response.task);
      }
      if (response.progress) {
        setProgress(response.progress);
      }
      await refreshStatus();
    } catch (err: any) {
      setError(err.message || "Failed to skip task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flowApi, refreshStatus, currentTask, sendEvent]);

  const stopFlow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await flowApi.stop();
      setIsActive(false);
      setSession(null);
      setCurrentTask(null);
      setSequence([]);
      setProgress({ current: 0, total: 0, percentage: 0 });
      localStorage.removeItem(FLOW_SESSION_KEY);
    } catch (err: any) {
      setError(err.message || "Failed to stop Flow Mode");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [flowApi]);

  return {
    isActive,
    session,
    currentTask,
    sequence,
    progress,
    startFlow,
    nextTask,
    completeTask,
    skipTask,
    stopFlow,
    refreshStatus,
    loading,
    error,
  };
}

