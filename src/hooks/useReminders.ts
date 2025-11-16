"use client";

import { useEffect, useRef } from "react";
import { useTasks } from "./useTasks";
import { Task, NotificationPreferences } from "@/src/lib/types";
import {
  getReminderTimes,
  shouldTriggerReminder,
} from "@/src/lib/reminderUtils";
import { format, parseISO } from "date-fns";

interface NotificationData {
  taskId: string;
  taskTitle: string;
  reminderTime: Date;
  dueDate?: string;
}

const STORAGE_KEY_NOTIFICATIONS = "tickTac_notification_preferences";
const STORAGE_KEY_SENT_REMINDERS = "tickTac_sent_reminders";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  desktop: true,
  browser: true,
};

/**
 * Get notification preferences from localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;

  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading notification preferences:", error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save notification preferences to localStorage
 */
export function saveNotificationPreferences(
  prefs: NotificationPreferences
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(prefs));
  } catch (error) {
    console.error("Error saving notification preferences:", error);
  }
}

/**
 * Check if a reminder has already been sent
 */
function hasReminderBeenSent(taskId: string, reminderTime: Date): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SENT_REMINDERS);
    if (stored) {
      const sentReminders: Record<string, string[]> = JSON.parse(stored);
      const reminderKey = reminderTime.toISOString();
      return sentReminders[taskId]?.includes(reminderKey) || false;
    }
  } catch (error) {
    console.error("Error checking sent reminders:", error);
  }

  return false;
}

/**
 * Mark a reminder as sent
 */
function markReminderAsSent(taskId: string, reminderTime: Date): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SENT_REMINDERS);
    const sentReminders: Record<string, string[]> = stored
      ? JSON.parse(stored)
      : {};

    if (!sentReminders[taskId]) {
      sentReminders[taskId] = [];
    }

    const reminderKey = reminderTime.toISOString();
    if (!sentReminders[taskId].includes(reminderKey)) {
      sentReminders[taskId].push(reminderKey);
      localStorage.setItem(
        STORAGE_KEY_SENT_REMINDERS,
        JSON.stringify(sentReminders)
      );
    }
  } catch (error) {
    console.error("Error marking reminder as sent:", error);
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Show browser notification
 */
function showNotification(
  task: Task,
  reminderTime: Date,
  preferences: NotificationPreferences
): void {
  if (!preferences.enabled || !preferences.browser) return;

  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const dueText = task.due
    ? `Due: ${format(parseISO(task.due), "MMM d, yyyy")}`
    : "";

  const notification = new Notification(`Reminder: ${task.title}`, {
    body: dueText || "Task reminder",
    icon: "/favicon.ico",
    tag: `reminder-${task.id}-${reminderTime.getTime()}`,
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Play sound if enabled
  if (preferences.sound) {
    // You can add a sound file here if needed
    // const audio = new Audio('/notification-sound.mp3');
    // audio.play().catch(() => {});
  }
}

/**
 * Check and trigger reminders for all tasks
 */
function checkReminders(
  tasks: Task[],
  preferences: NotificationPreferences
): void {
  const now = new Date();

  for (const task of tasks) {
    // Skip completed tasks
    if (task.done) continue;

    // Skip tasks without due dates or reminder settings
    if (!task.due || !task.reminderSettings?.enabled) continue;

    const reminderTimes = getReminderTimes(task);

    for (const reminderTime of reminderTimes) {
      // Check if reminder should be triggered (within 30 seconds tolerance)
      if (shouldTriggerReminder(reminderTime, 30)) {
        // Check if we've already sent this reminder
        if (!hasReminderBeenSent(task.id, reminderTime)) {
          showNotification(task, reminderTime, preferences);
          markReminderAsSent(task.id, reminderTime);
        }
      }
    }
  }
}

/**
 * Hook to manage reminders and notifications
 */
export function useReminders() {
  const { tasks } = useTasks();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const preferencesRef = useRef<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Load preferences
    preferencesRef.current = getNotificationPreferences();

    // Request permission on mount if enabled
    if (preferencesRef.current.enabled && preferencesRef.current.browser) {
      requestNotificationPermission();
    }

    // Check reminders every 30 seconds
    const checkInterval = () => {
      checkReminders(tasks, preferencesRef.current);
    };

    // Initial check
    checkInterval();

    // Set up interval
    intervalRef.current = setInterval(checkInterval, 30000); // Check every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tasks]);

  return {
    preferences: preferencesRef.current,
    updatePreferences: (prefs: Partial<NotificationPreferences>) => {
      const updated = { ...preferencesRef.current, ...prefs };
      preferencesRef.current = updated;
      saveNotificationPreferences(updated);
    },
    requestPermission: requestNotificationPermission,
  };
}
