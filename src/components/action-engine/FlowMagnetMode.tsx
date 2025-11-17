"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { useFlowMode } from "@/src/hooks/useFlowMode";

interface FlowMagnetProps {
  taskId: string;
  children: React.ReactNode;
}

export function FlowMagnetMode({ taskId, children }: FlowMagnetProps) {
  const { focusLock } = useActionEngine();
  const { isActive: isFlowActive } = useFlowMode();
  const [isMagnetic, setIsMagnetic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Enable magnet mode when in deep focus or timer running
    const shouldEnable =
      (focusLock.taskId === taskId || isFlowActive) && focusLock.taskId !== null;

    setIsMagnetic(shouldEnable);
  }, [focusLock, isFlowActive, taskId]);

  useEffect(() => {
    if (!isMagnetic || !containerRef.current) return;

    const container = containerRef.current;
    let isLeaving = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Check if mouse is leaving the container
      if (
        mouseX < rect.left ||
        mouseX > rect.right ||
        mouseY < rect.top ||
        mouseY > rect.bottom
      ) {
        if (!isLeaving) {
          isLeaving = true;
          // Add slight resistance by slowing cursor (visual feedback only)
          container.style.cursor = "not-allowed";
          setTimeout(() => {
            container.style.cursor = "";
            isLeaving = false;
          }, 100);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMagnetic]);

  return (
    <div
      ref={containerRef}
      className={isMagnetic ? "transition-all duration-200" : ""}
    >
      {children}
    </div>
  );
}

