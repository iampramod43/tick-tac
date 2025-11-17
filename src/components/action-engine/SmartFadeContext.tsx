"use client";

import { useEffect, useState } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface FadeContext {
  focusElement: HTMLElement | null;
  isActive: boolean;
}

export function SmartFadeContext() {
  const { nudges } = useActionEngine();
  const [fadeContext, setFadeContext] = useState<FadeContext>({
    focusElement: null,
    isActive: false,
  });

  useEffect(() => {
    // Check for relevant nudge types
    const relevantNudge = nudges.find(
      (n) =>
        n.type === "stall_detected" ||
        n.type === "reading_not_acting" ||
        n.type === "revisit_task"
    );

    if (relevantNudge) {
      // Find focus element (active task or editor)
      const activeTask = document.querySelector(
        '[data-task-active="true"]'
      ) as HTMLElement;
      const editor = document.querySelector("textarea") as HTMLElement;

      const focusElement = activeTask || editor;

      if (focusElement) {
        setFadeContext({ focusElement, isActive: true });

        // Auto-dismiss after 2 seconds
        setTimeout(() => {
          setFadeContext({ focusElement: null, isActive: false });
        }, 2000);
      }
    } else {
      setFadeContext({ focusElement: null, isActive: false });
    }
  }, [nudges]);

  if (!fadeContext.isActive || !fadeContext.focusElement) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9996] transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at ${fadeContext.focusElement.getBoundingClientRect().left + fadeContext.focusElement.getBoundingClientRect().width / 2}px ${fadeContext.focusElement.getBoundingClientRect().top + fadeContext.focusElement.getBoundingClientRect().height / 2}px, transparent 0%, rgba(0, 0, 0, 0.5) 100%)`,
      }}
    />
  );
}

