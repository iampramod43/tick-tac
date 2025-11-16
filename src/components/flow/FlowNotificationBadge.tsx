"use client";

import { useFlowModeContext } from "@/src/context/FlowModeContext";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";

export function FlowNotificationBadge() {
  const { isActive, currentTask } = useFlowModeContext();
  const router = useRouter();

  if (!isActive) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer border-violet-600 bg-violet-600/10 text-violet-400 hover:bg-violet-600/20",
        "animate-pulse"
      )}
      onClick={() => router.push("/flow")}
    >
      <Zap className="h-3 w-3 mr-1.5" />
      <span className="text-xs font-medium">
        Flow Mode Active
        {currentTask && `: ${currentTask.title}`}
      </span>
    </Badge>
  );
}

