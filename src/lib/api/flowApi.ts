"use client";

import { PomodoroSession } from "@/src/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface FlowTask {
  id: string;
  title: string;
  duration: number;
  order: number;
  reason?: string;
}

export interface FlowStartRequest {
  duration: number; // 15-480 minutes
  energy?: "low" | "medium" | "high";
}

export interface FlowStartResponse {
  type: "flow_start";
  sessionId: string;
  sequence: FlowTask[];
  totalDuration: number;
  estimatedCompletion: string;
  pomodoroSession?: PomodoroSession;
}

export interface FlowNextResponse {
  type: "flow_next" | "flow_complete";
  task?: FlowTask;
  isLast?: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  pomodoroSession?: PomodoroSession;
  message?: string;
}

export interface FlowStatusResponse {
  active: boolean;
  startedAt?: string;
  duration?: number;
  currentIndex?: number;
  totalTasks?: number;
  completedTasks?: number;
  skippedTasks?: number;
  currentTask?: {
    id: string;
    title: string;
    duration: number;
  };
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

export interface FlowStopResponse {
  status: string;
  completed: number;
  skipped: number;
  total: number;
}

/**
 * Make API request with authentication token
 */
async function apiRequest<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: {
        message: response.statusText,
        statusCode: response.status,
      },
    }));

    throw new Error(error.error?.message || "API request failed");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * Flow Mode API client
 */
export function createFlowApi(getToken: () => Promise<string | null>) {
  return {
    /**
     * Start a new Flow Mode session
     */
    start: async (data: FlowStartRequest): Promise<FlowStartResponse> => {
      const token = await getToken();
      return apiRequest<FlowStartResponse>("/api/flow/start", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    /**
     * Move to the next task in the Flow sequence
     */
    next: async (): Promise<FlowNextResponse> => {
      const token = await getToken();
      return apiRequest<FlowNextResponse>("/api/flow/next", token, {
        method: "POST",
      });
    },

    /**
     * Complete the current task
     */
    complete: async (): Promise<FlowNextResponse> => {
      const token = await getToken();
      return apiRequest<FlowNextResponse>("/api/flow/complete", token, {
        method: "POST",
      });
    },

    /**
     * Skip the current task
     */
    skip: async (): Promise<FlowNextResponse> => {
      const token = await getToken();
      return apiRequest<FlowNextResponse>("/api/flow/skip", token, {
        method: "POST",
      });
    },

    /**
     * Stop the Flow Mode session
     */
    stop: async (): Promise<FlowStopResponse> => {
      const token = await getToken();
      return apiRequest<FlowStopResponse>("/api/flow/stop", token, {
        method: "POST",
      });
    },

    /**
     * Get current Flow Mode status
     */
    getStatus: async (): Promise<FlowStatusResponse> => {
      const token = await getToken();
      return apiRequest<FlowStatusResponse>("/api/flow/status", token);
    },
  };
}

