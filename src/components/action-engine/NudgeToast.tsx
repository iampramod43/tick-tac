"use client";

import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

export function NudgeToast() {
  const { nudges, setNudges } = useActionEngine();

  if (!nudges.length) return null;

  const nudge = nudges[nudges.length - 1];

  const handleDismiss = () => {
    setNudges((prev) => prev.filter((x) => x.id !== nudge.id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[var(--color-surface-1)] border border-[var(--color-glass-outline)] text-[var(--color-text-primary)] p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[var(--blur-glass-1)] max-w-xs glass-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="font-semibold mb-1 text-[var(--color-accent-mint)]">
              Coach
            </div>
            <p className="text-sm text-[var(--color-text-primary)]">{nudge.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

