"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEvents } from "@/src/hooks/useActionEvents";

interface BreathingBorderProps {
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  taskId?: string;
}

export function BreathingEditorBorder({
  editorRef,
  taskId,
}: BreathingBorderProps) {
  const [isBreathing, setIsBreathing] = useState(false);
  const lastTypingRef = useRef<number>(Date.now());
  const idleEventSentRef = useRef<boolean>(false);
  const { sendEvent } = useActionEvents();

  useEffect(() => {
    if (!editorRef.current || !taskId) return;

    const editor = editorRef.current;
    const handleTyping = () => {
      lastTypingRef.current = Date.now();
      setIsBreathing(false);
      idleEventSentRef.current = false; // Reset flag when user types
    };

    const checkIdle = () => {
      const timeSinceLastTyping = Date.now() - lastTypingRef.current;
      // Trigger if user hasn't typed for 6-10 seconds after opening task
      if (timeSinceLastTyping > 6000 && timeSinceLastTyping < 10000) {
        setIsBreathing(true);
        // Only send event once per idle period to avoid spamming the backend
        if (!idleEventSentRef.current) {
          // Use note_idle instead of editor_idle (backend doesn't support editor_idle)
          sendEvent("note_idle", { taskId, duration: timeSinceLastTyping });
          idleEventSentRef.current = true;
        }
      } else {
        setIsBreathing(false);
      }
    };

    editor.addEventListener("input", handleTyping);
    editor.addEventListener("keydown", handleTyping);

    const interval = setInterval(checkIdle, 1000);

    return () => {
      editor.removeEventListener("input", handleTyping);
      editor.removeEventListener("keydown", handleTyping);
      clearInterval(interval);
    };
  }, [editorRef, taskId, sendEvent]);

  if (!isBreathing || !editorRef.current) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 animate-breathing-border"
      style={{
        borderRadius: "inherit",
        border: "2px solid rgba(59, 130, 246, 0.3)",
      }}
    />
  );
}

