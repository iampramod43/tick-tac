"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface HandTapTarget {
  x: number;
  y: number;
  element: HTMLElement;
}

export function AIMicroHandTap() {
  const { nudges } = useActionEngine();
  const [tapTarget, setTapTarget] = useState<HandTapTarget | null>(null);
  const handRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for relevant nudge types
    const relevantNudge = nudges.find(
      (n) => n.type === "avoid_switching" || n.type === "scroll_aimless"
    );

    if (relevantNudge) {
      let targetElement: HTMLElement | null = null;

      if (relevantNudge.type === "avoid_switching") {
        // Tap on active task
        targetElement = document.querySelector(
          '[data-task-active="true"]'
        ) as HTMLElement;
      } else if (relevantNudge.type === "scroll_aimless") {
        // Tap on editor
        targetElement = document.querySelector("textarea") as HTMLElement;
      }

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTapTarget({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          element: targetElement,
        });

        // Auto-dismiss after animation
        setTimeout(() => {
          setTapTarget(null);
        }, 1000);
      }
    }
  }, [nudges]);

  useEffect(() => {
    if (!tapTarget || !handRef.current) return;

    const hand = handRef.current;
    hand.style.left = `${tapTarget.x}px`;
    hand.style.top = `${tapTarget.y}px`;
  }, [tapTarget]);

  if (!tapTarget) return null;

  return (
    <div
      ref={handRef}
      className="fixed pointer-events-none z-[9997] animate-hand-tap"
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 11V5C9 3.89543 9.89543 3 11 3C12.1046 3 13 3.89543 13 5V11M9 11H7C5.89543 11 5 11.8954 5 13V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V13C19 11.8954 18.1046 11 17 11H15M9 11H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

