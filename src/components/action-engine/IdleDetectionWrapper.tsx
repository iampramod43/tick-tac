"use client";

import { useIdleDetection } from "@/src/hooks/useIdleDetection";
import { ReactNode } from "react";

export function IdleDetectionWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useIdleDetection();
  return <>{children}</>;
}

