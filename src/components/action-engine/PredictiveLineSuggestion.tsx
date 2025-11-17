"use client";

import { useEffect, useState, useRef } from "react";
import { useActionEngine } from "@/src/providers/ActionEngineProvider";

interface LineSuggestionProps {
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function PredictiveLineSuggestion({
  editorRef,
}: LineSuggestionProps) {
  const { nudges } = useActionEngine();
  const [showLine, setShowLine] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const hesitationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    let lastInputTime = Date.now();

    const handleInput = () => {
      lastInputTime = Date.now();
      setShowLine(false);
      if (hesitationTimeoutRef.current) {
        clearTimeout(hesitationTimeoutRef.current);
      }
    };

    const checkHesitation = () => {
      const timeSinceInput = Date.now() - lastInputTime;
      // Show line if user hesitates for more than 2 seconds
      if (timeSinceInput > 2000 && editor === document.activeElement) {
        setShowLine(true);
      } else {
        setShowLine(false);
      }
    };

    editor.addEventListener("input", handleInput);
    editor.addEventListener("focus", () => {
      hesitationTimeoutRef.current = setInterval(checkHesitation, 500);
    });
    editor.addEventListener("blur", () => {
      setShowLine(false);
      if (hesitationTimeoutRef.current) {
        clearInterval(hesitationTimeoutRef.current);
        hesitationTimeoutRef.current = null;
      }
    });

    return () => {
      editor.removeEventListener("input", handleInput);
      if (hesitationTimeoutRef.current) {
        clearInterval(hesitationTimeoutRef.current);
        hesitationTimeoutRef.current = null;
      }
    };
  }, [editorRef]);

  useEffect(() => {
    if (!showLine || !editorRef.current || !lineRef.current) return;

    const editor = editorRef.current;
    const line = lineRef.current;

    // Calculate position for the line (at cursor or end of text)
    const text = editor.value;
    const lines = text.split("\n");
    const currentLineIndex = text.substring(0, editor.selectionStart).split("\n").length - 1;
    const lineHeight = 24; // Approximate line height
    const padding = 12; // Textarea padding

    line.style.top = `${padding + currentLineIndex * lineHeight + lineHeight / 2}px`;
    line.style.left = `${padding}px`;
    line.style.width = `calc(100% - ${padding * 2}px)`;
  }, [showLine, editorRef]);

  if (!showLine || !editorRef.current) return null;

  return (
    <div
      ref={lineRef}
      className="absolute pointer-events-none z-10 animate-line-suggestion"
      style={{
        borderBottom: "1px dashed rgba(255, 255, 255, 0.3)",
      }}
    />
  );
}

