"use client";

import { Play, Pause, Clock, ChevronDown, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

interface TrackButtonProps {
  isActive: boolean;
  trackingState?: "idle" | "running" | "paused";
  elapsedTime: number; // in seconds
  totalTime?: string; // formatted total time (e.g., "2h 30m")
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

export function TrackButton({
  isActive,
  trackingState = "idle",
  elapsedTime = 0,
  totalTime,
  onStart,
  onPause,
  onResume,
  onStop,
  onClick,
}: TrackButtonProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isActive) {
    // Active state: Purple pill with dropdown
    return (
      <div className="flex flex-col items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 rounded-full bg-violet-600 px-3 py-1.5 text-white cursor-pointer hover:bg-violet-500 transition-colors",
                "min-w-[100px] justify-center"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                {trackingState === "paused" ? (
                  <Play className="h-2.5 w-2.5 fill-white text-white" />
                ) : (
                  <Pause className="h-2.5 w-2.5 fill-white text-white" />
                )}
              </div>
              <span className="text-xs font-semibold">
                {trackingState === "paused" ? "Paused" : "Start"}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
            {trackingState === "running" && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPause?.();
                }}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </DropdownMenuItem>
            )}
            {trackingState === "paused" && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onResume?.();
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onStop?.();
              }}
              className="text-red-400"
            >
              <Clock className="mr-2 h-4 w-4" />
              Stop
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Hourglass className="h-3 w-3 shrink-0" />
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>
    );
  }

  // Idle state: Circular button with dropdown
  return (
    <div className="flex flex-col items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(e);
            }}
          >
            <Play className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStart?.();
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {totalTime && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="font-mono">{totalTime}</span>
        </div>
      )}
    </div>
  );
}

