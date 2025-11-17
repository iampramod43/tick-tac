# Action Engine™ — Frontend Integration Guide

### _(Mode C — Deep Behavioral Engine, High-Performance Coach)_

This document explains how to integrate the **Action Engine™** into your Next.js frontend.

The frontend performs 4 jobs:

1. **Emit behavioral events** (typing, switching, idle, edits).
2. **Receive real-time nudges & focus interventions** via WebSocket.
3. **Render micro-nudges, micro-flows, focus-lock UI, debriefs**.
4. **Provide context back to backend** when AI needs more information.

This guide uses:

- **Next.js App Router**
- **TypeScript**
- **Socket.IO or native WebSocket** (your choice)
- **ShadCN UI components**

---

# 1. Architecture Overview

```
<ActionEngineProvider>
    Entire App
</ActionEngineProvider>
```

The provider handles:

- WebSocket connection to backend’s `/ws/action-engine`
- Local state for nudges, micro-flow programs, and focus lock
- React context to expose engine state + event emitters

---

# 2. ActionEngineProvider

```tsx
// app/providers/ActionEngineProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ActionEngineContext = createContext(null);

export function ActionEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nudges, setNudges] = useState([]);
  const [focusLock, setFocusLock] = useState<{ taskId: string | null }>({
    taskId: null,
  });
  const [microFlows, setMicroFlows] = useState([]);
  const [sessionDebrief, setSessionDebrief] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_ACTION_WS!);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "nudge":
          setNudges((prev) => [...prev, msg.payload]);
          break;

        case "focus_lock":
          setFocusLock({ taskId: msg.payload.taskId });
          break;

        case "micro_flow_program":
          setMicroFlows((prev) => [...prev, msg.payload]);
          break;

        case "session_debrief":
          setSessionDebrief(msg.payload);
          break;
      }
    };

    return () => ws.close();
  }, []);

  return (
    <ActionEngineContext.Provider
      value={{ nudges, setNudges, focusLock, microFlows, sessionDebrief }}
    >
      {children}
    </ActionEngineContext.Provider>
  );
}

export const useActionEngine = () => useContext(ActionEngineContext);
```

---

# 3. Emitting Behavioral Events

Use a lightweight hook to send events to backend using `sendBeacon` or `fetch`.

```tsx
// lib/useActionEvents.ts
export function useActionEvents() {
  const sendEvent = (type: string, payload: any = {}) => {
    const data = JSON.stringify({ type, ...payload });
    navigator.sendBeacon("/api/action-events", data);
  };
  return { sendEvent };
}
```

## 3.1 Task View Events

```tsx
onClick={() => sendEvent("task_opened", { taskId })}
onContextMenu={() => sendEvent("task_reopened", { taskId })}
```

## 3.2 Task Switch

```tsx
sendEvent("task_switched", { fromTaskId, toTaskId });
```

## 3.3 Editor Events

```tsx
onFocus={() => sendEvent("note_started", { taskId })}
onChange={(text) => sendEvent("note_updated", { taskId, length: text.length })}
onBlur={() => sendEvent("note_idle", { taskId })}
```

## 3.4 Typing Events

Hook into keystrokes:

```tsx
onKeyDown={() => sendEvent("typing_started", { taskId })}
onKeyUp={() => sendEvent("typing_stopped", { taskId })}
```

## 3.5 Flow & Pomodoro

```tsx
sendEvent("timer_started", { taskId, sessionId });
sendEvent("timer_completed", { taskId, sessionId });
sendEvent("flow_session_skipped_task", { taskId });
```

## 3.6 Idle Detection (Global)

Create an idle detector:

```tsx
useEffect(() => {
  let timeout: any;
  const reset = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => sendEvent("app_idle", {}), 8000);
  };

  window.addEventListener("mousemove", reset);
  window.addEventListener("keydown", reset);
  reset();

  return () => {
    window.removeEventListener("mousemove", reset);
    window.removeEventListener("keydown", reset);
  };
}, []);
```

---

# 4. Rendering Nudges (ShadCN Toast Style)

Create a toast-like component for nudges.

```tsx
// components/action-engine/NudgeToast.tsx
import { useActionEngine } from "@/providers/ActionEngineProvider";

export function NudgeToast() {
  const { nudges, setNudges } = useActionEngine();

  if (!nudges.length) return null;
  const n = nudges[nudges.length - 1];

  return (
    <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg max-w-xs">
      <div className="font-semibold mb-1">Coach</div>
      <p>{n.message}</p>
      <button
        className="text-xs mt-2 underline opacity-70"
        onClick={() => setNudges((prev) => prev.filter((x) => x.id !== n.id))}
      >
        Dismiss
      </button>
    </div>
  );
}
```

Render inside root layout:

```tsx
<NudgeToast />
```

---

# 5. Focus Lock UI

When focus lock is active:

- lock switching to other tasks
- blur or disable click of other tasks
- display a top banner

```tsx
const { focusLock } = useActionEngine();

function handleTaskClick(taskId: string) {
  if (focusLock.taskId && taskId !== focusLock.taskId) {
    toast({ description: "Finish the current step before switching." });
    return;
  }
  openTask(taskId);
}
```

Banner:

```tsx
{
  focusLock.taskId && (
    <div className="p-2 text-center bg-yellow-600 text-black text-sm font-medium">
      Focus Mode: finish the active task before switching.
    </div>
  );
}
```

---

# 6. Micro-Flow Program UI

A side panel showing a 2–4 step micro-flow.

```tsx
// components/action-engine/MicroFlowPanel.tsx
export function MicroFlowPanel() {
  const { microFlows } = useActionEngine();
  const flow = microFlows[microFlows.length - 1];

  if (!flow) return null;

  return (
    <div className="fixed bottom-6 left-6 bg-slate-800 text-white p-4 rounded-xl max-w-xs shadow-lg">
      <h3 className="font-semibold mb-2">3-Minute Push</h3>
      <ol className="text-sm list-decimal list-inside space-y-1">
        {flow.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
```

Add to layout:

```tsx
<MicroFlowPanel />
```

---

# 7. Session Debrief

Shown after Pomodoro/Flow Mode ends.

```tsx
export function DebriefModal() {
  const { sessionDebrief } = useActionEngine();
  if (!sessionDebrief) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-md">
        <h2 className="font-semibold mb-3">Session Debrief</h2>
        {sessionDebrief.highlights.map((h: string, i: number) => (
          <p key={i} className="mb-1 text-sm">
            • {h}
          </p>
        ))}
      </div>
    </div>
  );
}
```

---

# 8. Putting It All Together

In `app/layout.tsx`:

```tsx
<ActionEngineProvider>
  <NudgeToast />
  <MicroFlowPanel />
  <DebriefModal />
  {children}
</ActionEngineProvider>
```

---

# 9. UX Principles (Mode C)

- 1–2 nudges per minute max
- never interrupt real work
- nudges appear bottom-right for 4–5s
- micro-flows appear only during hesitation/stall
- focus lock is subtle, not strict
- debrief appears only at session end

---

# 10. Future Enhancements

- optional sound cues
- progress ring for micro-flow steps
- mini coach avatar
- gesture-based dismiss
- short vibration feedback (mobile)

---

This completes the **Action Engine™ Frontend Integration**.
