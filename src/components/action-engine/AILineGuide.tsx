"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface LineGuideState {
  x: number;
  intent: "start_small" | "avoid_switching" | "take_micro_break" | "deep_focus" | null;
}

const INTENT_COLORS = {
  start_small: "rgba(59, 130, 246, 0.4)", // Blue
  avoid_switching: "rgba(234, 179, 8, 0.4)", // Yellow
  take_micro_break: "rgba(239, 68, 68, 0.4)", // Red
  deep_focus: "rgba(34, 197, 94, 0.4)", // Green
};

export function AILineGuide() {
  const { nudges, focusLock } = useActionEngine();
  const [guide, setGuide] = useState<LineGuideState>({
    x: 0,
    intent: null,
  });
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine intent from nudges or focus lock
    let intent: LineGuideState["intent"] = null;

    const relevantNudge = nudges.find(
      (n) =>
        n.type === "start_small" ||
        n.type === "avoid_switching" ||
        n.type === "take_micro_break"
    );

    if (relevantNudge) {
      intent = relevantNudge.type as LineGuideState["intent"];
    } else if (focusLock.taskId) {
      intent = "deep_focus";
    }

    if (intent) {
      const updateGuide = (e: MouseEvent) => {
        setGuide({ x: e.clientX, intent });
      };

      window.addEventListener("mousemove", updateGuide);

      return () => {
        window.removeEventListener("mousemove", updateGuide);
      };
    } else {
      setGuide({ x: 0, intent: null });
    }
  }, [nudges, focusLock]);

  if (!guide.intent) return null;

  return (
    <div
      ref={guideRef}
      className="fixed top-0 bottom-0 pointer-events-none z-[9995] w-1 animate-line-guide"
      style={{
        left: `${guide.x}px`,
        background: `linear-gradient(to bottom, transparent, ${INTENT_COLORS[guide.intent]}, transparent)`,
        transform: "translateX(-50%)",
      }}
    />
  );
}

