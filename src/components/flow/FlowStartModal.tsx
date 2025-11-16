"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FlowStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (duration: number, energy?: string) => Promise<void>;
  loading?: boolean;
}

const QUICK_DURATIONS = [15, 30, 60, 90, 120];

export function FlowStartModal({
  open,
  onOpenChange,
  onStart,
  loading = false,
}: FlowStartModalProps) {
  const [duration, setDuration] = useState(60);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");

  const handleStart = async () => {
    try {
      await onStart(duration, energy);
      onOpenChange(false);
    } catch (err) {
      // Error handling is done in parent
    }
  };

  const estimatedTasks = Math.ceil(duration / 25); // Rough estimate: 25 min per task

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-500" />
            Start Flow Mode
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a focused work session with an optimized task sequence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-200">
                Duration
              </Label>
              <span className="text-sm text-slate-400">
                {duration} {duration === 1 ? "minute" : "minutes"}
              </span>
            </div>

            {/* Quick Duration Buttons */}
            <div className="flex gap-2 flex-wrap">
              {QUICK_DURATIONS.map((mins) => (
                <Button
                  key={mins}
                  variant="outline"
                  size="sm"
                  onClick={() => setDuration(mins)}
                  className={cn(
                    "border-slate-700 hover:bg-slate-800",
                    duration === mins &&
                      "bg-violet-600 border-violet-600 text-white hover:bg-violet-500"
                  )}
                >
                  {mins}m
                </Button>
              ))}
            </div>

            {/* Duration Slider */}
            <div className="px-2">
              <Slider
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={15}
                max={480}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>15 min</span>
                <span>8 hours</span>
              </div>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-200">
              Energy Level
            </Label>
            <Select
              value={energy}
              onValueChange={(value) =>
                setEnergy(value as "low" | "medium" | "high")
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="low" className="text-slate-100">
                  Low Energy
                </SelectItem>
                <SelectItem value="medium" className="text-slate-100">
                  Medium Energy
                </SelectItem>
                <SelectItem value="high" className="text-slate-100">
                  High Energy
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Estimated Tasks: ~{estimatedTasks}</span>
            </div>
            <p className="text-xs text-slate-400">
              Flow Mode will create an optimized sequence of tasks based on your
              energy level and available time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 hover:bg-slate-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {loading ? "Starting..." : "Start Flow Mode"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

