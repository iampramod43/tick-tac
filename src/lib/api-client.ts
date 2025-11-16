"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiError {
  error: {
    message: string;
    statusCode: number;
  };
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
    const error: ApiError = await response.json().catch(() => ({
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
 * Create API client with token getter
 */
export function createApiClient(getToken: () => Promise<string | null>) {
  return {
    // Tasks
    tasks: {
      getAll: async (listId?: string, done?: boolean) => {
        const params = new URLSearchParams();
        if (listId) params.append("listId", listId);
        if (done !== undefined) params.append("done", String(done));
        const token = await getToken();
        return apiRequest(`/api/tasks?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/tasks/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/tasks", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/tasks/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/tasks/${id}`, token, { method: "DELETE" });
      },
    },

    // Lists
    lists: {
      getAll: async () => {
        const token = await getToken();
        return apiRequest("/api/lists", token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/lists/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/lists", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/lists/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/lists/${id}`, token, { method: "DELETE" });
      },
      reorder: async (lists: any[]) => {
        const token = await getToken();
        return apiRequest("/api/lists/reorder", token, {
          method: "PUT",
          body: JSON.stringify({ lists }),
        });
      },
    },

    // Notes
    notes: {
      getAll: async (archived?: boolean, pinned?: boolean) => {
        const params = new URLSearchParams();
        if (archived !== undefined) params.append("archived", String(archived));
        if (pinned !== undefined) params.append("pinned", String(pinned));
        const token = await getToken();
        return apiRequest(`/api/notes?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/notes/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/notes", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/notes/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/notes/${id}`, token, { method: "DELETE" });
      },
    },

    // Journal
    journal: {
      getAll: async () => {
        const token = await getToken();
        return apiRequest("/api/journal", token);
      },
      getByDate: async (date: string) => {
        const token = await getToken();
        return apiRequest(`/api/journal/${date}`, token);
      },
      createOrUpdate: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/journal", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/journal/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/journal/${id}`, token, { method: "DELETE" });
      },
    },

    // Time Tracking
    timeTracking: {
      getAll: async (
        taskId?: string,
        date?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params = new URLSearchParams();
        if (taskId) params.append("taskId", taskId);
        if (date) params.append("date", date);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const token = await getToken();
        return apiRequest(`/api/time-tracking?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/time-tracking/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/time-tracking", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/time-tracking/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/time-tracking/${id}`, token, {
          method: "DELETE",
        });
      },
    },

    // Habits
    habits: {
      getAll: async (archived?: boolean) => {
        const params = new URLSearchParams();
        if (archived !== undefined) params.append("archived", String(archived));
        const token = await getToken();
        return apiRequest(`/api/habits?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/habits/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/habits", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/habits/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/habits/${id}`, token, { method: "DELETE" });
      },
      getCompletions: async (
        habitId: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const token = await getToken();
        return apiRequest(
          `/api/habits/${habitId}/completions?${params.toString()}`,
          token
        );
      },
      toggleCompletion: async (
        habitId: string,
        date: string,
        completed: boolean,
        value?: number,
        note?: string
      ) => {
        const token = await getToken();
        return apiRequest(`/api/habits/${habitId}/completions`, token, {
          method: "POST",
          body: JSON.stringify({ date, completed, value, note }),
        });
      },
    },

    // Countdowns
    countdowns: {
      getAll: async (completed?: boolean) => {
        const params = new URLSearchParams();
        if (completed !== undefined)
          params.append("completed", String(completed));
        const token = await getToken();
        return apiRequest(`/api/countdowns?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/countdowns/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/countdowns", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/countdowns/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/countdowns/${id}`, token, { method: "DELETE" });
      },
    },

    // Pomodoro
    pomodoro: {
      getAll: async (taskId?: string, completed?: boolean, type?: string) => {
        const params = new URLSearchParams();
        if (taskId) params.append("taskId", taskId);
        if (completed !== undefined)
          params.append("completed", String(completed));
        if (type) params.append("type", type);
        const token = await getToken();
        return apiRequest(`/api/pomodoro?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/pomodoro/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/pomodoro", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/pomodoro/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/pomodoro/${id}`, token, { method: "DELETE" });
      },
    },

    // Eisenhower
    eisenhower: {
      getAll: async (quadrant?: string, completed?: boolean) => {
        const params = new URLSearchParams();
        if (quadrant) params.append("quadrant", quadrant);
        if (completed !== undefined)
          params.append("completed", String(completed));
        const token = await getToken();
        return apiRequest(`/api/eisenhower?${params.toString()}`, token);
      },
      get: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/eisenhower/${id}`, token);
      },
      create: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/eisenhower", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      update: async (id: string, data: any) => {
        const token = await getToken();
        return apiRequest(`/api/eisenhower/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      delete: async (id: string) => {
        const token = await getToken();
        return apiRequest(`/api/eisenhower/${id}`, token, { method: "DELETE" });
      },
    },

    // Focus Compass
    focusCompass: {
      getContext: async () => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/context", token);
      },
      getRecommendation: async (params?: {
        energy?: "low" | "medium" | "high";
        skipTaskIds?: string[];
        availableMinutes?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params?.energy) queryParams.append("energy", params.energy);
        if (params?.skipTaskIds)
          queryParams.append("skipTaskIds", params.skipTaskIds.join(","));
        if (params?.availableMinutes)
          queryParams.append(
            "availableMinutes",
            params.availableMinutes.toString()
          );
        const token = await getToken();
        return apiRequest(
          `/api/focus-compass/recommend?${queryParams.toString()}`,
          token
        );
      },
      startSession: async (data: {
        taskId?: string;
        duration?: number;
        energy?: "low" | "medium" | "high";
      }) => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/session", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      getDailyPlan: async (params?: {
        energy?: "low" | "medium" | "high";
        availableMinutes?: number;
      }) => {
        const queryParams = new URLSearchParams();
        if (params?.energy) queryParams.append("energy", params.energy);
        if (params?.availableMinutes)
          queryParams.append(
            "availableMinutes",
            params.availableMinutes.toString()
          );
        const token = await getToken();
        return apiRequest(
          `/api/focus-compass/plan?${queryParams.toString()}`,
          token
        );
      },
      updateEnergy: async (energy: "low" | "medium" | "high") => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/energy", token, {
          method: "PUT",
          body: JSON.stringify({ energy }),
        });
      },
      updateAvailableTime: async (availableMinutes: number) => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/available-time", token, {
          method: "PUT",
          body: JSON.stringify({ availableMinutes }),
        });
      },
      getProfile: async () => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/profile", token);
      },
      updateProfile: async (data: any) => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/profile", token, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },
      getDailyContext: async () => {
        const token = await getToken();
        return apiRequest("/api/focus-compass/context/daily", token);
      },
      updateTaskMetadata: async (taskId: string, metadata: any) => {
        const token = await getToken();
        return apiRequest(
          `/api/focus-compass/tasks/${taskId}/metadata`,
          token,
          {
            method: "POST",
            body: JSON.stringify(metadata),
          }
        );
      },
      getTaskMetadata: async (taskId: string) => {
        const token = await getToken();
        return apiRequest(`/api/focus-compass/tasks/${taskId}/metadata`, token);
      },
    },
  };
}
