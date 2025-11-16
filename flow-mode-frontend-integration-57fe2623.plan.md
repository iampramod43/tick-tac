<!-- 57fe2623-af76-4f75-91e4-0f9ef83d5080 b82e5f22-42d2-4cf8-8079-059bd9ef3077 -->
# Flow Mode Frontend Integration Plan

## Overview

Integrate Flow Mode into the frontend with multiple access points: Focus Compass widget integration, dedicated page, modal overlay, sidebar panel, and AI chat agent support. Includes full-screen immersive view, progress tracking, and automatic Pomodoro timer integration.

## 1. API Client Layer

### File: `src/lib/api/flowApi.ts`

Create Flow Mode API client functions:

```typescript
interface FlowStartRequest {
  duration: number; // 15-480 minutes
  energy?: 'low' | 'medium' | 'high';
}

interface FlowStartResponse {
  type: 'flow_start';
  sessionId: string;
  sequence: Array<{
    id: string;
    title: string;
    duration: number;
    order: number;
    reason?: string;
  }>;
  totalDuration: number;
  estimatedCompletion: string;
  pomodoroSession?: PomodoroSession;
}

interface FlowNextResponse {
  type: 'flow_next' | 'flow_complete';
  task?: {
    id: string;
    title: string;
    duration: number;
    order: number;
    reason?: string;
  };
  isLast?: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  pomodoroSession?: PomodoroSession;
  message?: string;
}

interface FlowStatusResponse {
  active: boolean;
  startedAt?: string;
  duration?: number;
  currentIndex?: number;
  totalTasks?: number;
  completedTasks?: number;
  skippedTasks?: number;
  currentTask?: {
    id: string;
    title: string;
    duration: number;
  };
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

export const flowApi = {
  start: async (data: FlowStartRequest): Promise<FlowStartResponse>,
  next: async (): Promise<FlowNextResponse>,
  complete: async (): Promise<FlowNextResponse>,
  skip: async (): Promise<FlowNextResponse>,
  stop: async (): Promise<{ status: string; completed: number; skipped: number; total: number }>,
  getStatus: async (): Promise<FlowStatusResponse>,
};
```

## 2. React Hooks

### File: `src/hooks/useFlowMode.ts`

Custom hook for Flow Mode state management:

```typescript
interface UseFlowModeReturn {
  // State
  isActive: boolean;
  session: FlowStatusResponse | null;
  currentTask: FlowTask | null;
  sequence: FlowTask[];
  progress: ProgressInfo;
  
  // Actions
  startFlow: (duration: number, energy?: string) => Promise<void>;
  nextTask: () => Promise<void>;
  completeTask: () => Promise<void>;
  skipTask: () => Promise<void>;
  stopFlow: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  
  // Loading/Error states
  loading: boolean;
  error: string | null;
}

export function useFlowMode(): UseFlowModeReturn;
```

Features:

- Auto-refresh status every 30 seconds when active
- Poll for next task when Pomodoro timer completes
- Handle errors gracefully
- Persist session state in localStorage for recovery

### File: `src/hooks/useFlowNotification.ts`

Hook for Flow Mode notification system:

```typescript
export function useFlowNotification() {
  // Show notification when Flow Mode starts
  // Show notification when task changes
  // Show notification when session completes
  // Allow dismissing notifications
}
```

## 3. UI Components

### 3.1 Focus Compass Widget Integration

**File: `src/components/focus-compass/FocusCompassWidget.tsx`**

Add Flow Mode button to existing widget:

- "Start Flow Mode" button next to "Start Session"
- Quick duration selector (15min, 30min, 60min, 90min, custom)
- Show active Flow Mode indicator if session is running
- Link to Flow Mode page when active

### 3.2 Flow Mode Start Modal

**File: `src/components/flow/FlowStartModal.tsx`**

Modal for starting Flow Mode:

- Duration slider/input (15-480 minutes)
- Energy level selector
- Preview of estimated task count
- "Start Flow Mode" button
- Close/cancel option

### 3.3 Flow Mode Page

**File: `src/pages/flow/index.tsx` or `src/app/flow/page.tsx`**

Dedicated Flow Mode page:

- Full-screen immersive view
- Current task display (large, centered)
- Task sequence timeline/playlist view
- Progress bar and stats
- Controls: Complete, Skip, Stop
- Energy level indicator
- Estimated completion time

### 3.4 Flow Mode Sidebar Panel

**File: `src/components/flow/FlowSidebar.tsx`**

Collapsible sidebar panel:

- Current task card
- Progress indicator
- Task sequence list (upcoming tasks)
- Quick actions (Complete, Skip, Stop)
- Session stats (completed, skipped, remaining time)

### 3.5 Flow Mode Notification Badge

**File: `src/components/flow/FlowNotificationBadge.tsx`**

Minimal notification indicator:

- Small badge/icon in header/navbar
- Shows "Flow Mode Active" with current task
- Click to open sidebar or navigate to Flow page
- Pulsing animation when active

### 3.6 Flow Mode Full-Screen View

**File: `src/components/flow/FlowFullScreen.tsx`**

Immersive full-screen component:

- Large task title and description
- Pomodoro timer integration (centered)
- Minimal UI (distraction-free)
- Progress indicator at top
- Exit button (top-right corner)
- Auto-advance when timer completes

### 3.7 Flow Task Sequence Component

**File: `src/components/flow/FlowTaskSequence.tsx`**

Visual task playlist:

- Vertical list of tasks in sequence
- Current task highlighted
- Completed tasks checked/grayed
- Skipped tasks crossed out
- Upcoming tasks shown
- Duration estimates for each task
- Drag to reorder (optional future feature)

## 4. AI Chat Agent Integration

### File: `src/services/chatAgent.ts` (update existing)

Add Flow Mode tool calls to chat agent:

- Detect natural language requests like "Start flow mode for 1 hour"
- Call `startFlowSession` MCP tool
- Parse response and show Flow Mode UI
- Handle "next task", "skip task", "stop flow" commands

Example:

```typescript
// In chat agent message processing
if (message.includes('flow mode') || message.includes('flow session')) {
  // Extract duration from message
  // Call startFlowSession tool
  // Show Flow Mode UI
}
```

## 5. Pomodoro Timer Integration

### File: `src/components/pomodoro/PomodoroTimer.tsx` (update existing)

Integrate with Flow Mode:

- Auto-start Pomodoro when Flow Mode task begins
- Auto-advance to next Flow task when Pomodoro completes
- Show current Flow task in Pomodoro UI
- Handle Flow Mode completion when timer ends

### File: `src/hooks/usePomodoro.ts` (update existing)

Add Flow Mode awareness:

- Check if Flow Mode is active
- Auto-call `flowApi.next()` when timer completes
- Update Flow Mode state when task changes

## 6. Routing & Navigation

### File: `src/app/flow/page.tsx` (Next.js App Router) or `src/pages/flow/index.tsx` (Pages Router)

Create Flow Mode route:

- `/flow` - Main Flow Mode page
- Protected route (requires auth)
- Redirect to login if not authenticated
- Show loading state while checking active session

### Update Navigation

Add Flow Mode link to:

- Main navigation menu
- Focus Compass widget
- Header/navbar (when active, show badge)

## 7. State Management

### File: `src/context/FlowModeContext.tsx`

React Context for global Flow Mode state:

- Share Flow Mode state across components
- Provide Flow Mode actions
- Handle session persistence
- Sync with backend status
```typescript
interface FlowModeContextValue {
  session: FlowSession | null;
  isActive: boolean;
  startFlow: (duration: number, energy?: string) => Promise<void>;
  nextTask: () => Promise<void>;
  // ... other actions
}

export const FlowModeProvider: React.FC<{ children: React.ReactNode }>;
export const useFlowModeContext: () => FlowModeContextValue;
```


## 8. Real-time Updates

### File: `src/hooks/useFlowPolling.ts`

Polling hook for Flow Mode status:

- Poll `/api/flow/status` every 30 seconds when active
- Update local state when status changes
- Handle session completion
- Stop polling when session ends

### Optional: WebSocket Integration

If WebSocket support is added later:

- Subscribe to Flow Mode events
- Real-time task updates
- Session completion notifications

## 9. Error Handling & Edge Cases

### Error Scenarios:

- Network errors during Flow operations
- Session expired or not found
- No tasks available for Flow Mode
- Pomodoro timer fails to start
- User navigates away during session

### Recovery:

- Show error messages with retry options
- Persist session state for recovery
- Auto-refresh on network reconnection
- Graceful degradation (fallback to manual task selection)

## 10. Styling & Animations

### Design System Integration:

- Use existing design tokens/theme
- Consistent with Focus Compass styling
- Smooth transitions between tasks
- Loading skeletons
- Success/error animations

### Key Animations:

- Task transition fade/slide
- Progress bar fill animation
- Notification slide-in
- Completion celebration animation

## 11. Testing Considerations

### Unit Tests:

- API client functions
- Custom hooks
- Component rendering

### Integration Tests:

- Flow Mode start → task sequence → completion
- Skip task → next task
- Stop session → cleanup
- AI chat → Flow Mode trigger

### E2E Tests:

- Complete Flow Mode session flow
- Multiple access points (widget, page, AI)
- Error recovery scenarios

## 12. Implementation Order

1. **API Client** (`flowApi.ts`) - Foundation
2. **Custom Hook** (`useFlowMode.ts`) - State management
3. **Context Provider** (`FlowModeContext.tsx`) - Global state
4. **Basic Components** (Start Modal, Status Badge)
5. **Focus Compass Integration** (Widget button)
6. **Flow Mode Page** (Dedicated route)
7. **Sidebar Panel** (Collapsible)
8. **Full-Screen View** (Immersive mode)
9. **Pomodoro Integration** (Auto-start/advance)
10. **AI Chat Integration** (Natural language)
11. **Polish & Animations** (UX enhancements)

## 13. File Structure

```
src/
├── lib/
│   └── api/
│       └── flowApi.ts
├── hooks/
│   ├── useFlowMode.ts
│   ├── useFlowNotification.ts
│   └── useFlowPolling.ts
├── components/
│   ├── focus-compass/
│   │   └── FocusCompassWidget.tsx (update)
│   ├── flow/
│   │   ├── FlowStartModal.tsx
│   │   ├── FlowSidebar.tsx
│   │   ├── FlowFullScreen.tsx
│   │   ├── FlowTaskSequence.tsx
│   │   └── FlowNotificationBadge.tsx
│   └── pomodoro/
│       └── PomodoroTimer.tsx (update)
├── context/
│   └── FlowModeContext.tsx
├── pages/flow/ (or app/flow/)
│   └── index.tsx (or page.tsx)
└── services/
    └── chatAgent.ts (update)
```

## 14. Environment Variables

No new environment variables needed - uses existing `NEXT_PUBLIC_API_URL`.

## 15. Dependencies

No new dependencies required if using existing:

- React hooks
- API client setup
- Design system components
- Routing (Next.js or React Router)

### To-dos

- [ ] Create Flow Mode API client (flowApi.ts) with all CRUD operations
- [ ] Create useFlowMode custom hook for state management and actions
- [ ] Create FlowModeContext provider for global state sharing
- [ ] Create FlowStartModal component with duration and energy selectors
- [ ] Create FlowNotificationBadge component for header/navbar
- [ ] Add Flow Mode button and integration to FocusCompassWidget
- [ ] Create dedicated Flow Mode page (/flow) with full-screen view
- [ ] Create FlowSidebar component with task sequence and controls
- [ ] Create FlowFullScreen immersive component
- [ ] Create FlowTaskSequence component for visual playlist
- [ ] Integrate Pomodoro timer with Flow Mode (auto-start/advance)
- [ ] Add Flow Mode tool calls to AI chat agent
- [ ] Create useFlowPolling hook for real-time status updates
- [ ] Add comprehensive error handling and recovery mechanisms
- [ ] Add styling, animations, and polish to all Flow Mode components