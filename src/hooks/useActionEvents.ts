"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export function useActionEvents() {
  const { getToken } = useAuth();

  const sendEvent = useCallback(
    async (type: string, payload: any = {}) => {
      try {
        const token = await getToken();
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://tick-tac-api.vercel.app"
            : "http://localhost:3001");

        const data = {
          type,
          ...payload,
          timestamp: new Date().toISOString(),
        };

        // Always use fetch when we need authentication
        // sendBeacon doesn't support custom headers like Authorization
        const response = await fetch(`${API_URL}/api/action-events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
          // Use keepalive for better reliability on page unload
          keepalive: true,
        });

        if (!response.ok) {
          // Only log error if it's not a 401/403 (auth issues are expected)
          if (response.status !== 401 && response.status !== 403) {
            console.error(
              "Failed to send action event:",
              response.status,
              response.statusText
            );
          }
        }
      } catch (error) {
        // Silently fail for network errors to avoid console spam
        // Only log unexpected errors
        if (error instanceof Error && !error.message.includes("Failed to fetch")) {
          console.error("Failed to send action event:", error);
        }
      }
    },
    [getToken]
  );

  return { sendEvent };
}

