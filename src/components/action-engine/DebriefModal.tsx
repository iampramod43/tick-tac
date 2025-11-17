"use client";

import { useActionEngine } from "@/src/providers/ActionEngineProvider";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DebriefModal() {
  const { sessionDebrief, setSessionDebrief } = useActionEngine();

  if (!sessionDebrief) return null;

  const handleClose = () => {
    setSessionDebrief(null);
  };

  return (
    <Dialog open={!!sessionDebrief} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--color-surface-1)] border-[var(--color-glass-outline)] glass-1">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text-primary)]">
            Session Debrief
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-secondary)]">
            Here's what you accomplished
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {sessionDebrief.highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Highlights
              </h3>
              <ul className="space-y-1">
                {sessionDebrief.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="text-sm text-[var(--color-text-primary)] flex items-start gap-2"
                  >
                    <span className="text-[var(--color-accent-mint)] mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sessionDebrief.insights && sessionDebrief.insights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Insights
              </h3>
              <ul className="space-y-1">
                {sessionDebrief.insights.map((insight, i) => (
                  <li
                    key={i}
                    className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                  >
                    <span className="text-[var(--color-accent-teal)] mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

