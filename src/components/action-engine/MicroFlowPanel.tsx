"use client";

import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

export function MicroFlowPanel() {
  const { microFlows, setMicroFlows } = useActionEngine();
  const flow = microFlows[microFlows.length - 1];

  if (!flow) return null;

  const handleDismiss = () => {
    setMicroFlows((prev) => prev.filter((f) => f.id !== flow.id));
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-4 fade-in duration-300">
      <div className="bg-[var(--color-surface-1)] border border-[var(--color-glass-outline)] text-[var(--color-text-primary)] p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[var(--blur-glass-1)] max-w-xs glass-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-[var(--color-accent-mint)]">
            {flow.title || "3-Minute Push"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ol className="text-sm list-decimal list-inside space-y-2 text-[var(--color-text-primary)]">
          {flow.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

