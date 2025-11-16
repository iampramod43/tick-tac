# 🎨 Focus Compass - Frontend Integration Plan

This document outlines the complete plan for integrating the Focus Compass backend APIs with your frontend application.

---

## 📋 Table of Contents

1. [API Endpoints Overview](#api-endpoints-overview)
2. [Data Models](#data-models)
3. [UI Components](#ui-components)
4. [Integration Steps](#integration-steps)
5. [Example API Calls](#example-api-calls)
6. [State Management](#state-management)
7. [User Flows](#user-flows)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)

---

## 🔌 API Endpoints Overview

### Base URL

All endpoints are prefixed with `/api/focus-compass`

### Authentication

All endpoints require authentication. Include the user's authentication token in the request headers:

```
Authorization: Bearer <token>
```

---

## 📡 Available Endpoints

### 1. **Get Focus Context**

```
GET /api/focus-compass/context
```

Returns complete focus context including tasks, habits, user context, and focus profile.

**Response:**

```json
{
  "tasks": [
    {
      "task": {
        /* task object */
      },
      "metadata": {
        /* task metadata */
      },
      "urgencyScore": 0.9,
      "importanceScore": 0.8,
      "energyAlignment": 1.0,
      "habitImpact": 0.5,
      "difficultyPenalty": 0.1,
      "totalScore": 0.85,
      "reason": "overdue or due today + matches your energy level"
    }
  ],
  "habits": [
    /* habit objects */
  ],
  "userContext": {
    "energy": "low",
    "availableMinutes": 60,
    "currentTimeBlock": "afternoon"
  },
  "focusProfile": {
    /* focus profile object */
  }
}
```

---

### 2. **Get Task Recommendation**

```
GET /api/focus-compass/recommend
```

Get the next best task recommendation.

**Query Parameters:**

- `energy` (optional): `"low" | "medium" | "high"` - Override current energy level
- `skipTaskIds` (optional): Comma-separated task IDs to skip
- `availableMinutes` (optional): Available time window in minutes

**Response:**

```json
{
  "recommendedTask": {
    "task": {
      /* task object */
    },
    "metadata": {
      /* task metadata */
    },
    "urgencyScore": 0.9,
    "importanceScore": 0.8,
    "energyAlignment": 1.0,
    "totalScore": 0.85,
    "reason": "overdue or due today + matches your energy level"
  },
  "alternatives": [
    /* top 3 alternative tasks */
  ],
  "suggestedPomodoroMinutes": 25,
  "reason": "overdue or due today + matches your energy level"
}
```

**Example:**

```javascript
// Get recommendation for low energy
fetch("/api/focus-compass/recommend?energy=low&availableMinutes=30", {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

### 3. **Start Focus Session**

```
POST /api/focus-compass/session
```

Start a Pomodoro/focus session with a recommended or specified task.

**Request Body:**

```json
{
  "taskId": "optional-task-id", // If not provided, will auto-recommend
  "duration": 25, // Optional, defaults to 25
  "energy": "low" // Optional
}
```

**Response:**

```json
{
  "session": {
    "_id": "session-id",
    "userId": "user-id",
    "taskId": "task-id",
    "startTime": "2024-01-15T10:00:00.000Z",
    "duration": 25,
    "type": "work",
    "completed": false
  },
  "message": "Focus session started"
}
```

---

### 4. **Generate Daily Plan**

```
GET /api/focus-compass/plan
```

Generate a complete daily focus plan.

**Query Parameters:**

- `energy` (optional): `"low" | "medium" | "high"`
- `availableMinutes` (optional): Total available time

**Response:**

```json
{
  "tasks": [
    /* scored tasks */
  ],
  "estimatedTotalTime": 180,
  "suggestedSequence": ["task-id-1", "task-id-2", "task-id-3"],
  "energyDistribution": {
    "low": 2,
    "medium": 5,
    "high": 3
  }
}
```

---

### 5. **Update Energy Level**

```
PUT /api/focus-compass/energy
```

Update user's current energy level.

**Request Body:**

```json
{
  "energy": "low" // "low" | "medium" | "high"
}
```

**Response:**

```json
{
  "success": true,
  "energy": "low",
  "message": "Energy level set to low"
}
```

---

### 6. **Update Available Time**

```
PUT /api/focus-compass/available-time
```

Update available time window.

**Request Body:**

```json
{
  "availableMinutes": 60
}
```

---

### 7. **Get/Update Focus Profile**

```
GET /api/focus-compass/profile
PUT /api/focus-compass/profile
```

**Profile Structure:**

```json
{
  "userId": "user-id",
  "preferredWorkTimes": ["09:00-12:00", "14:00-17:00"],
  "peakEnergySlots": ["morning", "afternoon"],
  "defaultPomodoroMinutes": 25,
  "energyTrackingEnabled": true
}
```

---

### 8. **Get Daily Context**

```
GET /api/focus-compass/context/daily
```

**Response:**

```json
{
  "userId": "user-id",
  "date": "2024-01-15",
  "energy": "low",
  "availableMinutes": 60,
  "currentTimeBlock": "afternoon",
  "lastUpdated": "2024-01-15T14:30:00.000Z"
}
```

---

### 9. **Task Metadata Management**

```
POST /api/focus-compass/tasks/:taskId/metadata
GET /api/focus-compass/tasks/:taskId/metadata
```

**Metadata Structure:**

```json
{
  "taskId": "task-id",
  "difficulty": "low", // "low" | "medium" | "high"
  "durationEstimate": 30, // minutes
  "energyRequired": "low", // "low" | "medium" | "high"
  "importanceScore": 4, // 1-5
  "category": "work",
  "streakImpact": 50 // 0-100, if tied to habits
}
```

---

## 🧩 Data Models

### TaskMetadata

```typescript
interface TaskMetadata {
  taskId: string;
  userId: string;
  difficulty: "low" | "medium" | "high";
  durationEstimate: number; // minutes
  energyRequired: "low" | "medium" | "high";
  importanceScore: number; // 1-5
  category?: string;
  streakImpact?: number; // 0-100
}
```

### FocusProfile

```typescript
interface FocusProfile {
  userId: string;
  preferredWorkTimes: string[]; // e.g., ["09:00-12:00"]
  peakEnergySlots: string[]; // e.g., ["morning"]
  defaultPomodoroMinutes: number;
  energyTrackingEnabled: boolean;
}
```

### DailyContext

```typescript
interface DailyContext {
  userId: string;
  date: string; // YYYY-MM-DD
  energy: "low" | "medium" | "high";
  availableMinutes: number;
  currentTimeBlock: string; // morning, afternoon, evening, night
  lastUpdated: string;
}
```

### RecommendationResult

```typescript
interface RecommendationResult {
  recommendedTask: TaskWithMetadata | null;
  alternatives: TaskWithMetadata[];
  suggestedPomodoroMinutes?: number;
  reason: string;
}
```

---

## 🎨 UI Components

### 1. **Focus Compass Widget** (Main Component)

**Location:** Dashboard (right side or center)

**Features:**

- Display recommended task
- Show reason for recommendation
- Energy level selector
- Quick action buttons (Start, Skip, Details)
- Suggested Pomodoro duration

**Design:**

```
╔══════════════════════════════════╗
║ 🔮 Focus Compass                 ║
║                                  ║
║ Next Best Action:                ║
║ "Design Button Fix"              ║
║                                  ║
║ Reason: Low-energy + short +     ║
║         urgent                   ║
║                                  ║
║ Energy: [Low] [Medium] [High]    ║
║                                  ║
║ [Start 25m] [Skip] [Details]     ║
╚══════════════════════════════════╝
```

---

### 2. **Energy Selector Component**

**Features:**

- Three-button toggle (Low/Medium/High)
- Visual indicators (colors/icons)
- Auto-saves to backend

**Implementation:**

```typescript
const EnergySelector = ({ currentEnergy, onEnergyChange }) => {
  const updateEnergy = async (energy: "low" | "medium" | "high") => {
    await fetch("/api/focus-compass/energy", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ energy }),
    });
    onEnergyChange(energy);
  };

  // Render buttons...
};
```

---

### 3. **Daily Plan View Component**

**Features:**

- List of top recommended tasks
- Estimated total time
- Task sequence visualization
- Energy distribution chart

**Design:**

```
╔══════════════════════════════════╗
║ 📅 Today's Focus Plan            ║
║                                  ║
║ Estimated Time: 2h 30m            ║
║                                  ║
║ 1. Design Button Fix (25m)        ║
║ 2. Review PR (45m)               ║
║ 3. Write Documentation (60m)     ║
║                                  ║
║ Energy Distribution:             ║
║ ███ Low: 2 tasks                 ║
║ ███████ Medium: 5 tasks           ║
║ ████ High: 3 tasks               ║
╚══════════════════════════════════╝
```

---

### 4. **Task Metadata Editor**

**Features:**

- Edit task difficulty
- Set duration estimate
- Set energy required
- Set importance score
- Link to habits (for streak impact)

**Use Case:** When creating/editing tasks, allow users to optionally set metadata for better recommendations.

---

## 🔄 Integration Steps

### Step 1: Set Up API Client

Create a service file for Focus Compass API calls:

```typescript
// services/focusCompassApi.ts
const API_BASE = "/api/focus-compass";

export const focusCompassApi = {
  getContext: () =>
    fetch(`${API_BASE}/context`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getRecommendation: (params?: {
    energy?: "low" | "medium" | "high";
    skipTaskIds?: string[];
    availableMinutes?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.energy) query.append("energy", params.energy);
    if (params?.skipTaskIds)
      query.append("skipTaskIds", params.skipTaskIds.join(","));
    if (params?.availableMinutes)
      query.append("availableMinutes", params.availableMinutes.toString());

    return fetch(`${API_BASE}/recommend?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },

  startSession: (data: {
    taskId?: string;
    duration?: number;
    energy?: "low" | "medium" | "high";
  }) =>
    fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  setEnergy: (energy: "low" | "medium" | "high") =>
    fetch(`${API_BASE}/energy`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ energy }),
    }).then((r) => r.json()),

  getDailyPlan: (params?: {
    energy?: "low" | "medium" | "high";
    availableMinutes?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.energy) query.append("energy", params.energy);
    if (params?.availableMinutes)
      query.append("availableMinutes", params.availableMinutes.toString());

    return fetch(`${API_BASE}/plan?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },

  updateTaskMetadata: (taskId: string, metadata: Partial<TaskMetadata>) =>
    fetch(`${API_BASE}/tasks/${taskId}/metadata`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    }).then((r) => r.json()),
};
```

---

### Step 2: Create Focus Compass Widget Component

```typescript
// components/FocusCompassWidget.tsx
import { useState, useEffect } from "react";
import { focusCompassApi } from "../services/focusCompassApi";
import { EnergySelector } from "./EnergySelector";

export const FocusCompassWidget = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendation();
  }, [energy]);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      const result = await focusCompassApi.getRecommendation({ energy });
      setRecommendation(result);
    } catch (error) {
      console.error("Failed to load recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!recommendation?.recommendedTask) return;

    try {
      const session = await focusCompassApi.startSession({
        taskId: recommendation.recommendedTask.task._id,
        duration: recommendation.suggestedPomodoroMinutes,
        energy,
      });

      // Navigate to Pomodoro timer or show success
      console.log("Session started:", session);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const handleSkip = async () => {
    if (!recommendation?.recommendedTask) return;

    const skipId = recommendation.recommendedTask.task._id;
    await loadRecommendation(); // Reload with skip
  };

  if (loading) return <div>Loading...</div>;
  if (!recommendation?.recommendedTask) {
    return <div>No tasks available</div>;
  }

  const { recommendedTask, suggestedPomodoroMinutes, reason } = recommendation;

  return (
    <div className="focus-compass-widget">
      <h3>🔮 Focus Compass</h3>

      <div className="recommended-task">
        <h4>Next Best Action:</h4>
        <p className="task-title">{recommendedTask.task.title}</p>
        <p className="reason">{reason}</p>
      </div>

      <EnergySelector currentEnergy={energy} onEnergyChange={setEnergy} />

      <div className="actions">
        <button onClick={handleStartSession}>
          Start {suggestedPomodoroMinutes}m
        </button>
        <button onClick={handleSkip}>Skip</button>
        <button
          onClick={() => {
            /* Show details */
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
};
```

---

### Step 3: Integrate with Task Creation/Editing

When users create or edit tasks, allow them to optionally set metadata:

```typescript
// In TaskForm component
const TaskMetadataFields = ({ taskId, metadata, onChange }) => {
  return (
    <div className="task-metadata">
      <label>Difficulty</label>
      <select
        value={metadata?.difficulty || "medium"}
        onChange={(e) => onChange({ ...metadata, difficulty: e.target.value })}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <label>Duration Estimate (minutes)</label>
      <input
        type="number"
        value={metadata?.durationEstimate || 30}
        onChange={(e) =>
          onChange({ ...metadata, durationEstimate: parseInt(e.target.value) })
        }
      />

      <label>Energy Required</label>
      <select
        value={metadata?.energyRequired || "medium"}
        onChange={(e) =>
          onChange({ ...metadata, energyRequired: e.target.value })
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <label>Importance (1-5)</label>
      <input
        type="number"
        min="1"
        max="5"
        value={metadata?.importanceScore || 3}
        onChange={(e) =>
          onChange({ ...metadata, importanceScore: parseInt(e.target.value) })
        }
      />
    </div>
  );
};

// Save metadata when task is saved
const handleSaveTask = async (taskData, metadata) => {
  // Save task first
  const task = await saveTask(taskData);

  // Then save metadata
  if (metadata) {
    await focusCompassApi.updateTaskMetadata(task._id, metadata);
  }
};
```

---

### Step 4: Add Daily Plan View

```typescript
// components/DailyPlanView.tsx
export const DailyPlanView = () => {
  const [plan, setPlan] = useState(null);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    loadPlan();
  }, [energy]);

  const loadPlan = async () => {
    try {
      const result = await focusCompassApi.getDailyPlan({ energy });
      setPlan(result);
    } catch (error) {
      console.error("Failed to load plan:", error);
    }
  };

  if (!plan) return <div>Loading...</div>;

  return (
    <div className="daily-plan">
      <h2>📅 Today's Focus Plan</h2>

      <div className="summary">
        <p>Estimated Time: {formatMinutes(plan.estimatedTotalTime)}</p>
      </div>

      <div className="task-list">
        {plan.tasks.map((item, index) => (
          <div key={item.task._id} className="task-item">
            <span className="number">{index + 1}.</span>
            <span className="title">{item.task.title}</span>
            <span className="duration">
              {item.metadata?.durationEstimate || 30}m
            </span>
          </div>
        ))}
      </div>

      <div className="energy-distribution">
        <h3>Energy Distribution</h3>
        <div>Low: {plan.energyDistribution.low} tasks</div>
        <div>Medium: {plan.energyDistribution.medium} tasks</div>
        <div>High: {plan.energyDistribution.high} tasks</div>
      </div>
    </div>
  );
};
```

---

## 📱 User Flows

### Flow 1: Quick Recommendation

1. User opens dashboard
2. Focus Compass widget loads automatically
3. Shows recommended task based on current energy
4. User clicks "Start 25m" → Starts Pomodoro session
5. Timer begins

### Flow 2: Energy-Based Recommendation

1. User feels tired
2. Clicks "Low" energy button
3. Widget refreshes with low-energy task recommendations
4. User selects a task and starts session

### Flow 3: Daily Planning

1. User clicks "View Daily Plan"
2. System generates plan based on current energy and available time
3. User reviews sequence and time estimates
4. User can start tasks from the plan

### Flow 4: Skip and Get Alternative

1. User sees recommended task
2. Clicks "Skip"
3. Widget shows next best alternative
4. Process repeats until user finds suitable task

---

## 🔄 State Management

### Recommended State Structure

```typescript
interface FocusCompassState {
  currentEnergy: "low" | "medium" | "high";
  availableMinutes: number;
  recommendation: RecommendationResult | null;
  dailyPlan: DailyPlan | null;
  loading: boolean;
  error: string | null;
}
```

### State Updates

- **On Energy Change:** Update `currentEnergy`, reload recommendation
- **On Time Change:** Update `availableMinutes`, reload recommendation
- **On Task Complete:** Reload recommendation
- **On New Task Created:** Reload recommendation (if metadata provided)

---

## ⚠️ Error Handling

### Common Error Scenarios

1. **No Tasks Available**

   - Show friendly message: "No tasks match your current energy and time"
   - Suggest creating new tasks or adjusting energy/time

2. **Network Errors**

   - Show retry button
   - Cache last successful recommendation

3. **Invalid Energy Level**
   - Validate before API call
   - Show error message if invalid

### Error Handling Example

```typescript
const loadRecommendation = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await focusCompassApi.getRecommendation({ energy });

    if (!result.recommendedTask) {
      setError(
        "No tasks available. Try adjusting your energy level or available time."
      );
    } else {
      setRecommendation(result);
    }
  } catch (error) {
    setError("Failed to load recommendation. Please try again.");
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

---

## ⚡ Performance Optimization

### 1. **Caching**

- Cache recommendation for 5 minutes
- Invalidate cache on: task completion, new task creation, energy change

### 2. **Debouncing**

- Debounce energy/time changes before API calls
- Wait 300ms after user stops adjusting slider

### 3. **Optimistic Updates**

- Update UI immediately when energy changes
- Show loading state while API call completes

### 4. **Lazy Loading**

- Only load daily plan when user clicks "View Plan"
- Load alternatives on-demand (when user clicks "Show More")

---

## 🎯 Next Steps

1. **Implement Core Widget**

   - Create `FocusCompassWidget` component
   - Integrate with API
   - Add basic styling

2. **Add Energy Selector**

   - Create `EnergySelector` component
   - Persist energy preference
   - Auto-update recommendations

3. **Integrate with Task Management**

   - Add metadata fields to task forms
   - Auto-save metadata on task creation/update

4. **Build Daily Plan View**

   - Create `DailyPlanView` component
   - Add time estimates visualization
   - Add energy distribution chart

5. **Add Advanced Features**

   - Task skipping with alternatives
   - Session history tracking
   - Recommendation accuracy feedback

6. **Polish & Test**
   - Add loading states
   - Add error handling
   - Add animations/transitions
   - Test all user flows

---

## 📚 Additional Resources

- **API Documentation:** See OpenAPI/Swagger docs (if available)
- **MCP Integration:** For AI agent integration, see MCP tools documentation
- **Design System:** Follow your existing design system for consistency

---

## 🚀 Quick Start Example

```typescript
// Minimal integration example
import { focusCompassApi } from "./services/focusCompassApi";

// Get recommendation
const recommendation = await focusCompassApi.getRecommendation({
  energy: "low",
  availableMinutes: 30,
});

console.log("Recommended task:", recommendation.recommendedTask.task.title);
console.log("Reason:", recommendation.reason);

// Start session
const session = await focusCompassApi.startSession({
  taskId: recommendation.recommendedTask.task._id,
  duration: recommendation.suggestedPomodoroMinutes,
});

console.log("Session started:", session);
```

---

**Happy Building! 🎉**

The Focus Compass backend is ready. Now it's time to create an amazing user experience that helps users focus on what matters most, right now.
