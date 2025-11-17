"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface CursorHint {
  x: number;
  y: number;
  target: "editor" | "description" | "task";
  intent: string;
}

export function AnimatedCursorHint() {
  const { microFlows, nudges } = useActionEngine();
  const [hint, setHint] = useState<CursorHint | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect hesitation and trigger cursor hint
    const checkHesitation = () => {
      // Check for relevant nudge types
      const relevantNudge = nudges.find(
        (n) =>
          n.type === "start_small" ||
          n.type === "clarify_blocker" ||
          n.type === "avoid_switching"
      );

      if (relevantNudge) {
        // Get current cursor position
        const updateCursor = (e: MouseEvent) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            // Determine target based on intent
            let target: "editor" | "description" | "task" = "editor";
            if (relevantNudge.type === "clarify_blocker") {
              target = "description";
            } else if (relevantNudge.type === "avoid_switching") {
              target = "task";
            }

            setHint({
              x: e.clientX + 15,
              y: e.clientY + 15,
              target,
              intent: relevantNudge.type || "",
            });
          }, 500); // 500ms hesitation threshold
        };

        window.addEventListener("mousemove", updateCursor);

        return () => {
          window.removeEventListener("mousemove", updateCursor);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }
    };

    checkHesitation();
  }, [nudges, microFlows]);

  // Animate cursor movement toward target
  useEffect(() => {
    if (!hint || !cursorRef.current) return;

    const cursor = cursorRef.current;
    const editorElement = document.querySelector("textarea");
    const descriptionElement = document.querySelector(
      'textarea[placeholder*="description" i], textarea[placeholder*="notes" i]'
    );
    const taskElement = document.querySelector('[data-task-active="true"]');

    let targetElement: HTMLElement | null = null;
    if (hint.target === "editor" && editorElement) {
      targetElement = editorElement as HTMLElement;
    } else if (hint.target === "description" && descriptionElement) {
      targetElement = descriptionElement as HTMLElement;
    } else if (hint.target === "task" && taskElement) {
      targetElement = taskElement as HTMLElement;
    }

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      cursor.style.left = `${hint.x}px`;
      cursor.style.top = `${hint.y}px`;

      // Animate toward target
      requestAnimationFrame(() => {
        cursor.style.transition = "all 0.5s ease-out";
        cursor.style.left = `${targetX}px`;
        cursor.style.top = `${targetY}px`;
      });

      // Fade out after reaching target
      setTimeout(() => {
        setHint(null);
      }, 2000);
    }
  }, [hint]);

  // Hide on user movement
  useEffect(() => {
    const handleMove = () => {
      if (hint) {
        setHint(null);
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [hint]);

  if (!hint) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] animate-cursor-hint"
      style={{
        left: `${hint.x}px`,
        top: `${hint.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-35"
      >
        <path
          d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
