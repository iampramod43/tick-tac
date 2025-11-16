export const PRIORITY_LABELS = {
  1: "Urgent",
  2: "High",
  3: "Normal",
  4: "Low",
} as const;

export const PRIORITY_COLORS = {
  1: "#FF3B30",
  2: "#FF9500",
  3: "#007AFF",
  4: "#8E8E93",
} as const;

export const DEFAULT_LISTS = [
  { id: "inbox", title: "Inbox", color: "#007AFF", order: 0 },
  { id: "today", title: "Today", color: "#34C759", order: 1 },
  { id: "upcoming", title: "Upcoming", color: "#FF9500", order: 2 },
];

export const STORAGE_KEYS = {
  TASKS: "tickTac_tasks",
  LISTS: "tickTac_lists",
  THEME: "tickTac_theme",
} as const;

export const KEYBOARD_SHORTCUTS = {
  NEW_TASK: "n",
  SEARCH: "/",
  TOGGLE_THEME: "t",
  QUICK_ADD: "q",
} as const;
