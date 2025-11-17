"use client";

import { useEffect } from "react";
import { useActionEvents } from "./useActionEvents";

export function useIdleDetection() {
  const { sendEvent } = useActionEvents();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sendEvent("app_idle", {});
      }, 8000); // 8 seconds of inactivity
    };

    // Listen to user activity
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("click", reset);
    window.addEventListener("scroll", reset);
    window.addEventListener("touchstart", reset);

    // Initialize
    reset();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("click", reset);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, [sendEvent]);
}

