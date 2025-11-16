"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useFlowMode, UseFlowModeReturn } from "@/src/hooks/useFlowMode";

interface FlowModeContextValue extends UseFlowModeReturn {}

const FlowModeContext = createContext<FlowModeContextValue | undefined>(
  undefined
);

export function FlowModeProvider({ children }: { children: ReactNode }) {
  const flowMode = useFlowMode();

  return (
    <FlowModeContext.Provider value={flowMode}>
      {children}
    </FlowModeContext.Provider>
  );
}

export function useFlowModeContext(): FlowModeContextValue {
  const context = useContext(FlowModeContext);
  if (context === undefined) {
    throw new Error("useFlowModeContext must be used within FlowModeProvider");
  }
  return context;
}

