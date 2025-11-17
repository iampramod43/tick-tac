"use client";

import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { Lock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function FocusLockBanner() {
  const { focusLock } = useActionEngine();

  if (!focusLock.taskId) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-warning)]/20 border-b border-[var(--color-warning)]/30 backdrop-blur-sm">
      <div className="px-4 py-2 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
          <Lock className="h-4 w-4 text-[var(--color-warning)]" />
          <span>
            Focus Mode: Finish the active task before switching.
          </span>
        </div>
      </div>
    </div>
  );
}

