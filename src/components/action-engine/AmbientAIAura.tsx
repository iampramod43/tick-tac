"use client";

import { useEffect, useState } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { useActionEvents } from "@/src/hooks/useActionEvents";

interface AuraState {
  color: string;
  intensity: number;
}

const STATE_COLORS = {
  momentum: "rgba(34, 197, 94, 0.1)", // Green
  stall: "rgba(239, 68, 68, 0.1)", // Red
  start: "rgba(59, 130, 246, 0.1)", // Blue
  switching: "rgba(234, 179, 8, 0.1)", // Yellow
};

export function AmbientAIAura() {
  const { nudges, focusLock } = useActionEngine();
  const { sendEvent } = useActionEvents();
  const [aura, setAura] = useState<AuraState>({
    color: STATE_COLORS.start,
    intensity: 0.1,
  });
  const [taskPanel, setTaskPanel] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Determine state from nudges and focus lock
    let state: keyof typeof STATE_COLORS = "start";

    const relevantNudge = nudges.find(
      (n) =>
        n.type === "momentum" ||
        n.type === "stall" ||
        n.type === "switching"
    );

    if (relevantNudge) {
      state = relevantNudge.type as keyof typeof STATE_COLORS;
    } else if (focusLock.taskId) {
      state = "momentum";
    }

    setAura({
      color: STATE_COLORS[state],
      intensity: 0.1 + Math.sin(Date.now() / 2000) * 0.1, // Breathing effect
    });
  }, [nudges, focusLock]);

  // Find task panel element
  useEffect(() => {
    const panel = document.querySelector('[data-task-panel="true"]') as HTMLElement;
    if (panel) {
      setTaskPanel(panel);
    }
  }, []);

  if (!taskPanel) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 animate-ambient-aura"
      style={{
        borderRadius: "inherit",
        background: `radial-gradient(circle at center, ${aura.color} 0%, transparent 70%)`,
        opacity: aura.intensity,
      }}
    />
  );
}

