import { Task, ReminderOffset } from './types';
import { parseISO, addMinutes, addHours, addDays, isBefore, isAfter } from 'date-fns';

/**
 * Calculate reminder time based on due date and offset
 */
export function calculateReminderTime(
  dueDate: string,
  dueTime?: string,
  offset: ReminderOffset = '15min',
  customOffset?: number
): Date | null {
  try {
    let dueDateTime: Date;

    if (dueTime) {
      // Combine date and time
      dueDateTime = parseISO(`${dueDate}T${dueTime}`);
    } else {
      // Use start of day if no time specified
      dueDateTime = parseISO(`${dueDate}T09:00:00`);
    }

    let reminderTime: Date;

    switch (offset) {
      case '15min':
        reminderTime = addMinutes(dueDateTime, -15);
        break;
      case '30min':
        reminderTime = addMinutes(dueDateTime, -30);
        break;
      case '1hour':
        reminderTime = addHours(dueDateTime, -1);
        break;
      case '2hours':
        reminderTime = addHours(dueDateTime, -2);
        break;
      case '1day':
        reminderTime = addDays(dueDateTime, -1);
        break;
      case 'custom':
        if (customOffset !== undefined) {
          reminderTime = addMinutes(dueDateTime, -customOffset);
        } else {
          return null;
        }
        break;
      default:
        return null;
    }

    return reminderTime;
  } catch (error) {
    console.error('Error calculating reminder time:', error);
    return null;
  }
}

/**
 * Get all reminder times for a task
 */
export function getReminderTimes(task: Task): Date[] {
  if (!task.due || !task.reminderSettings?.enabled || !task.reminderSettings.offsets.length) {
    return [];
  }

  const reminderTimes: Date[] = [];

  for (const offset of task.reminderSettings.offsets) {
    const reminderTime = calculateReminderTime(
      task.due!,
      task.dueTime,
      offset,
      task.reminderSettings.customOffset
    );

    if (reminderTime && !isBefore(reminderTime, new Date())) {
      reminderTimes.push(reminderTime);
    }
  }

  return reminderTimes.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Check if a reminder should be triggered now
 */
export function shouldTriggerReminder(reminderTime: Date, toleranceSeconds: number = 30): boolean {
  const now = new Date();
  const diff = Math.abs(now.getTime() - reminderTime.getTime()) / 1000;
  return diff <= toleranceSeconds;
}

/**
 * Get reminder offset in minutes
 */
export function getReminderOffsetMinutes(offset: ReminderOffset, customOffset?: number): number {
  switch (offset) {
    case '15min':
      return 15;
    case '30min':
      return 30;
    case '1hour':
      return 60;
    case '2hours':
      return 120;
    case '1day':
      return 1440;
    case 'custom':
      return customOffset || 0;
    default:
      return 0;
  }
}

/**
 * Format reminder offset as human-readable text
 */
export function formatReminderOffset(offset: ReminderOffset, customOffset?: number): string {
  switch (offset) {
    case '15min':
      return '15 minutes before';
    case '30min':
      return '30 minutes before';
    case '1hour':
      return '1 hour before';
    case '2hours':
      return '2 hours before';
    case '1day':
      return '1 day before';
    case 'custom':
      if (customOffset) {
        const hours = Math.floor(customOffset / 60);
        const minutes = customOffset % 60;
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}m before`;
        } else if (hours > 0) {
          return `${hours} hour${hours > 1 ? 's' : ''} before`;
        } else {
          return `${minutes} minute${minutes > 1 ? 's' : ''} before`;
        }
      }
      return 'Custom';
    default:
      return '';
  }
}

