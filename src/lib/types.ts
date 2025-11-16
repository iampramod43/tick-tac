export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval?: number; // e.g., every 2 days, every 3 weeks (default: 1)
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: string; // ISO date string - when to stop recurring
  count?: number; // How many times to repeat (alternative to endDate)
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  notes?: string;
  priority: 1 | 2 | 3 | 4;
  due?: string; // ISO date string
  dueTime?: string; // Time string
  tags?: string[];
  done: boolean;
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
  reminder?: string; // ISO date string (deprecated, use reminderSettings)
  reminderSettings?: ReminderSettings;
  // Recurrence fields
  recurrence?: RecurrencePattern;
  recurrenceTemplateId?: string; // If this is an instance, link to the template
  isRecurrenceTemplate?: boolean; // Mark if this is a template
  nextOccurrence?: string; // ISO date string - when the next instance should be created
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface List {
  id: string;
  title: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type ViewType = "inbox" | "today" | "upcoming" | "completed" | "list";

export interface TaskFilter {
  priority?: number[];
  tags?: string[];
  due?: "today" | "overdue" | "next7days";
  completed?: boolean;
  search?: string;
}

export type Theme = "light" | "dark" | "system";

// Pomodoro Timer
export interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  type: "work" | "shortBreak" | "longBreak";
  completed: boolean;
}

export interface PomodoroSettings {
  workDuration: number; // default 25 min
  shortBreakDuration: number; // default 5 min
  longBreakDuration: number; // default 15 min
  sessionsUntilLongBreak: number; // default 4
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

// Habit Tracker
export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "custom";
  customDays?: number[]; // 0-6 for Sunday-Saturday
  color: string;
  icon?: string;
  goal?: number; // for quantifiable habits
  unit?: string; // e.g., "glasses", "minutes", "pages"
  createdAt: string;
  archived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number; // for quantifiable habits
  note?: string;
}

// Countdown
export interface Countdown {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  color: string;
  category?: string;
  completed: boolean;
  createdAt: string;
}

// Eisenhower Matrix
export type EisenhowerQuadrant =
  | "urgent-important"
  | "not-urgent-important"
  | "urgent-not-important"
  | "not-urgent-not-important";

export interface EisenhowerTask {
  id: string;
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notes & Journaling
export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  tags?: string[];
  category?: string;
  color?: string;
  linkedTaskId?: string;
  linkedHabitId?: string;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string; // Markdown content
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  tags?: string[];
  linkedTasks?: string[]; // Task IDs
  linkedHabits?: string[]; // Habit IDs
  createdAt: string;
  updatedAt: string;
}

// Time Tracking
export interface TimeEntry {
  id: string;
  taskId?: string; // Linked task ID
  listId?: string; // Linked list/project ID
  description: string; // What was worked on
  startTime: string; // ISO date string
  endTime?: string; // ISO date string (optional for active entries)
  duration: number; // Duration in minutes
  date: string; // YYYY-MM-DD for easy filtering
  tags?: string[];
  billable?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Reminders & Notifications
export type ReminderOffset =
  | "15min"
  | "30min"
  | "1hour"
  | "2hours"
  | "1day"
  | "custom";

export interface ReminderSettings {
  enabled: boolean;
  offsets: ReminderOffset[]; // Multiple reminders can be set
  customOffset?: number; // Minutes for custom offset
  recurring?: boolean; // Recurring reminders for recurring tasks
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  browser: boolean;
}
