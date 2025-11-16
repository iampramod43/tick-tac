import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO, addDays, addWeeks, addMonths, addYears, startOfDay, isAfter, getDay, setDate } from "date-fns";
import { RecurrencePattern } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to YYYY-MM-DD in UTC
 * Uses noon UTC to prevent date shifting when converting from local timezone
 */
export function formatUTCDate(date: Date): string {
  // Extract year, month, day from local date
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create a new date at noon UTC for the selected date
  // This ensures the date won't shift when converted to UTC
  const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
  
  // Format as YYYY-MM-DD
  return utcDate.toISOString().split('T')[0];
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE');
  }
  return format(dateObj, 'MMM d');
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function isOverdue(date: string): boolean {
  return isPast(parseISO(date)) && !isToday(parseISO(date));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseNaturalLanguage(input: string): {
  title: string;
  due?: string;
  priority?: 1 | 2 | 3 | 4;
} {
  let title = input;
  let due: string | undefined;
  let priority: 1 | 2 | 3 | 4 | undefined;

  // Extract priority indicators
  if (/(!{3}|urgent)/i.test(input)) {
    priority = 1;
    title = title.replace(/(!{3}|urgent)/gi, '').trim();
  } else if (/(!{2}|high)/i.test(input)) {
    priority = 2;
    title = title.replace(/(!{2}|high)/gi, '').trim();
  }

  // Extract date patterns (simplified)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (/\btoday\b/i.test(input)) {
    due = format(today, 'yyyy-MM-dd');
    title = title.replace(/\btoday\b/gi, '').trim();
  } else if (/\btomorrow\b/i.test(input)) {
    due = format(tomorrow, 'yyyy-MM-dd');
    title = title.replace(/\btomorrow\b/gi, '').trim();
  }

  return { title, due, priority };
}

/**
 * Calculate the next occurrence date based on a recurrence pattern
 */
export function calculateNextOccurrence(
  pattern: RecurrencePattern,
  fromDate: Date = new Date()
): Date | null {
  const interval = pattern.interval || 1;
  const start = startOfDay(fromDate);

  switch (pattern.type) {
    case 'daily':
      return addDays(start, interval);

    case 'weekly': {
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find the next matching day of week
        const days = pattern.daysOfWeek.sort((a, b) => a - b);
        const currentDay = getDay(start);
        
        // Find next day in the same week
        for (const day of days) {
          if (day > currentDay) {
            return addDays(start, day - currentDay);
          }
        }
        // If no day found in current week, get first day of next week
        const daysUntilNext = 7 - currentDay + days[0];
        return addDays(start, daysUntilNext);
      }
      return addWeeks(start, interval);
    }

    case 'monthly': {
      if (pattern.dayOfMonth) {
        const targetDay = pattern.dayOfMonth;
        const currentDay = start.getDate();
        
        if (currentDay < targetDay) {
          // This month
          return setDate(start, targetDay);
        } else {
          // Next month
          const nextMonth = addMonths(start, 1);
          return setDate(nextMonth, Math.min(targetDay, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
        }
      }
      return addMonths(start, interval);
    }

    case 'yearly':
      return addYears(start, interval);

    case 'custom':
      // For custom, default to daily with interval
      return addDays(start, interval);

    default:
      return null;
  }
}

/**
 * Check if a recurrence pattern should stop based on endDate or count
 */
export function shouldStopRecurrence(
  pattern: RecurrencePattern,
  occurrenceCount: number,
  currentDate: Date = new Date()
): boolean {
  if (pattern.endDate) {
    const endDate = parseISO(pattern.endDate);
    return isAfter(currentDate, endDate);
  }
  
  if (pattern.count) {
    return occurrenceCount >= pattern.count;
  }
  
  return false;
}

/**
 * Format recurrence pattern as human-readable text
 */
export function formatRecurrence(pattern: RecurrencePattern): string {
  const interval = pattern.interval || 1;
  
  switch (pattern.type) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;
    
    case 'weekly': {
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = pattern.daysOfWeek.map(d => dayNames[d]).join(', ');
        return `Weekly on ${days}`;
      }
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    }
    
    case 'monthly': {
      if (pattern.dayOfMonth) {
        const suffix = pattern.dayOfMonth === 1 ? 'st' : 
                      pattern.dayOfMonth === 2 ? 'nd' : 
                      pattern.dayOfMonth === 3 ? 'rd' : 'th';
        return `Monthly on the ${pattern.dayOfMonth}${suffix}`;
      }
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;
    }
    
    case 'yearly':
      return interval === 1 ? 'Yearly' : `Every ${interval} years`;
    
    case 'custom':
      return `Every ${interval} days`;
    
    default:
      return 'Recurring';
  }
}

