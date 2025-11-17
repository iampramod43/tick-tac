"use client";

import { useEffect, useState } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface GravityNudgeProps {
  taskId: string;
  isActive: boolean;
  children: React.ReactNode;
}

export function GravityNudge({ taskId, isActive, children }: GravityNudgeProps) {
  const { nudges } = useActionEngine();
  const [shouldLift, setShouldLift] = useState(false);

  useEffect(() => {
    // Check if user has switched tasks multiple times
    const relevantNudge = nudges.find((n) => n.type === "task_switching_excessive");

    if (relevantNudge && isActive) {
      setShouldLift(true);
    } else {
      setShouldLift(false);
    }
  }, [nudges, isActive]);

  return (
    <div
      className="transition-transform duration-300 ease-out"
      style={{
        transform: shouldLift ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {children}
    </div>
  );
}

