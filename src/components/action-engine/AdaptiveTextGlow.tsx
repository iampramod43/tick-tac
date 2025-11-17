"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface GlowTarget {
  element: HTMLElement;
  intent: "hesitation" | "over-edit" | "stall";
}

export function AdaptiveTextGlow() {
  const { nudges } = useActionEngine();
  const [glowTarget, setGlowTarget] = useState<GlowTarget | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for relevant nudge types
    const relevantNudge = nudges.find(
      (n) =>
        n.type === "hesitation" ||
        n.type === "over-edit" ||
        n.type === "stall"
    );

    if (relevantNudge) {
      let targetElement: HTMLElement | null = null;
      let intent: "hesitation" | "over-edit" | "stall" = "hesitation";

      if (relevantNudge.type === "hesitation") {
        // Find first blank line in notes
        const textarea = document.querySelector("textarea");
        if (textarea) {
          targetElement = textarea;
          intent = "hesitation";
        }
      } else if (relevantNudge.type === "over-edit") {
        // Find finished bullet needing next step
        const editor = document.querySelector('[contenteditable="true"]');
        if (editor) {
          targetElement = editor as HTMLElement;
          intent = "over-edit";
        }
      } else if (relevantNudge.type === "stall") {
        // Find editor input region
        const textarea = document.querySelector("textarea");
        if (textarea) {
          targetElement = textarea;
          intent = "stall";
        }
      }

      if (targetElement) {
        setGlowTarget({ element: targetElement, intent });
        // Auto-dismiss after 1.5 seconds
        setTimeout(() => {
          setGlowTarget(null);
        }, 1500);
      }
    }
  }, [nudges]);

  useEffect(() => {
    if (!glowTarget || !glowRef.current) return;

    const rect = glowTarget.element.getBoundingClientRect();
    const glow = glowRef.current;

    glow.style.left = `${rect.left}px`;
    glow.style.top = `${rect.top}px`;
    glow.style.width = `${rect.width}px`;
    glow.style.height = `${rect.height}px`;
  }, [glowTarget]);

  if (!glowTarget) return null;

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-[9998] animate-text-glow"
      style={{
        borderRadius: "8px",
      }}
    />
  );
}

