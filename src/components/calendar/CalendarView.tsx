"use client";

import { useState, useMemo } from "react";
import {
  Task,
  JournalEntry,
  HabitCompletion,
  PomodoroSession,
  Countdown,
  Note,
  TimeEntry,
} from "@/src/lib/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  addWeeks,
  addDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfDay,
} from "date-fns";
import {
  Plus,
  CheckSquare,
  BookOpen,
  Repeat,
  Timer,
  Clock,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { PriorityIndicator } from "@/src/components/common/PriorityIndicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskEditor } from "@/src/components/tasks/TaskEditor";
import { TaskList } from "@/src/components/tasks/TaskList";
import Link from "next/link";

type ViewMode =
  | "month"
  | "week"
  | "day"
  | "agenda"
  | "multi-day"
  | "multi-week";

type CalendarItem =
  | { type: "task"; data: Task }
  | { type: "journal"; data: JournalEntry }
  | { type: "habit"; data: HabitCompletion; habitName: string }
  | { type: "pomodoro"; data: PomodoroSession }
  | { type: "countdown"; data: Countdown }
  | { type: "note"; data: Note }
  | { type: "timeEntry"; data: TimeEntry };

interface CalendarViewProps {
  tasks: Task[];
  journalEntries?: JournalEntry[];
  habitCompletions?: HabitCompletion[];
  habits?: Array<{ id: string; name: string }>;
  pomodoroSessions?: PomodoroSession[];
  countdowns?: Countdown[];
  notes?: Note[];
  timeEntries?: TimeEntry[];
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function CalendarView({
  tasks,
  journalEntries = [],
  habitCompletions = [],
  habits = [],
  pomodoroSessions = [],
  countdowns = [],
  notes = [],
  timeEntries = [],
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [multiDayCount] = useState(3); // For multi-day view
  const [multiWeekCount] = useState(3); // For multi-week view

  const { calendarDays, viewStart, viewEnd } = useMemo(() => {
    if (viewMode === "day") {
      const dayStart = startOfDay(currentDate);
      return {
        calendarDays: [dayStart],
        viewStart: dayStart,
        viewEnd: dayStart,
      };
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return {
        calendarDays: eachDayOfInterval({ start: weekStart, end: weekEnd }),
        viewStart: weekStart,
        viewEnd: weekEnd,
      };
    } else if (viewMode === "multi-day") {
      const dayStart = startOfDay(currentDate);
      const dayEnd = addDays(dayStart, multiDayCount - 1);
      return {
        calendarDays: eachDayOfInterval({ start: dayStart, end: dayEnd }),
        viewStart: dayStart,
        viewEnd: dayEnd,
      };
    } else if (viewMode === "multi-week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const lastWeekStart = addWeeks(weekStart, multiWeekCount - 1);
      const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 0 });
      return {
        calendarDays: eachDayOfInterval({ start: weekStart, end: lastWeekEnd }),
        viewStart: weekStart,
        viewEnd: lastWeekEnd,
      };
    } else if (viewMode === "agenda") {
      // Agenda shows all upcoming tasks sorted by date
      const today = startOfDay(new Date());
      const futureDate = addMonths(today, 3); // Show 3 months ahead
      return {
        calendarDays: eachDayOfInterval({ start: today, end: futureDate }),
        viewStart: today,
        viewEnd: futureDate,
      };
    } else {
      // Month view
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return {
        calendarDays: eachDayOfInterval({
          start: calendarStart,
          end: calendarEnd,
        }),
        viewStart: monthStart,
        viewEnd: monthEnd,
      };
    }
  }, [currentDate, viewMode, multiDayCount, multiWeekCount]);

  // Create a map of all items by date
  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();

    // Tasks
    tasks.forEach((task) => {
      if (task.due && !task.done) {
        const dateKey = format(parseISO(task.due), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push({ type: "task", data: task });
      }
    });

    // Journal entries
    journalEntries.forEach((entry) => {
      const dateKey = entry.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push({ type: "journal", data: entry });
    });

    // Habit completions
    habitCompletions.forEach((completion) => {
      if (completion.completed) {
        const dateKey = completion.date;
        const habit = habits.find((h) => h.id === completion.habitId);
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push({
          type: "habit",
          data: completion,
          habitName: habit?.name || "Habit",
        });
      }
    });

    // Pomodoro sessions
    pomodoroSessions.forEach((session) => {
      if (session.completed && session.startTime) {
        const dateKey = format(parseISO(session.startTime), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push({ type: "pomodoro", data: session });
      }
    });

    // Countdowns
    countdowns.forEach((countdown) => {
      if (!countdown.completed && countdown.targetDate) {
        const dateKey = format(parseISO(countdown.targetDate), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push({ type: "countdown", data: countdown });
      }
    });

    // Notes (by creation date)
    notes.forEach((note) => {
      if (!note.archived && note.createdAt) {
        const dateKey = format(parseISO(note.createdAt), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push({ type: "note", data: note });
      }
    });

    // Time entries
    timeEntries.forEach((entry) => {
      const dateKey = entry.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push({ type: "timeEntry", data: entry });
    });

    return map;
  }, [
    tasks,
    journalEntries,
    habitCompletions,
    habits,
    pomodoroSessions,
    countdowns,
    notes,
    timeEntries,
  ]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.due && !task.done) {
        const dateKey = format(parseISO(task.due), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const selectedDateItems = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return itemsByDate.get(dateKey) || [];
  }, [selectedDate, itemsByDate]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return tasksByDate.get(dateKey) || [];
  }, [selectedDate, tasksByDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTask = () => {
    setIsNewTaskDialogOpen(true);
  };

  const handleSaveNewTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    await onAddTask(task);
    setIsNewTaskDialogOpen(false);
  };

  const handleToggleTask = async (id: string, done: boolean) => {
    await onUpdateTask(id, { done });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSaveTask = async (id: string, updates: Partial<Task>) => {
    await onUpdateTask(id, updates);
    setSelectedTask(null);
  };

  // Get all tasks for agenda view (sorted by date)
  const agendaTasks = useMemo(() => {
    if (viewMode !== "agenda") return [];
    const today = startOfDay(new Date());
    return tasks
      .filter((task) => task.due && !task.done && parseISO(task.due) >= today)
      .sort((a, b) => parseISO(a.due!).getTime() - parseISO(b.due!).getTime());
  }, [tasks, viewMode]);

  return (
    <div className="flex h-full relative">
      {/* Calendar Grid */}
      <div className="flex-1 p-6 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {viewMode === "day"
                ? format(currentDate, "EEEE, MMMM d, yyyy")
                : viewMode === "week"
                ? `${format(viewStart, "MMM d")} - ${format(
                    viewEnd,
                    "MMM d, yyyy"
                  )}`
                : viewMode === "multi-day"
                ? `${format(viewStart, "MMM d")} - ${format(
                    viewEnd,
                    "MMM d, yyyy"
                  )}`
                : viewMode === "multi-week"
                ? `${format(viewStart, "MMM d")} - ${format(
                    viewEnd,
                    "MMM d, yyyy"
                  )}`
                : viewMode === "agenda"
                ? "Agenda"
                : format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Agenda View */}
        {viewMode === "agenda" ? (
          <div className="space-y-4">
            {agendaTasks.length > 0 ? (
              agendaTasks.map((task) => {
                const taskDate = parseISO(task.due!);
                const isTodayTask = isToday(taskDate);

                return (
                  <div
                    key={task.id}
                    className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-4 hover:border-[var(--color-accent-mint)]/30 transition-colors cursor-pointer"
                    onClick={() => handleEditTask(task)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <PriorityIndicator
                            priority={task.priority}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {task.title}
                          </span>
                        </div>
                        {task.notes && (
                          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isTodayTask
                              ? "text-[var(--color-accent-mint)]"
                              : "text-[var(--color-text-secondary)]"
                          )}
                        >
                          {isTodayTask ? "Today" : format(taskDate, "MMM d")}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {format(taskDate, "EEEE")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                <p>No upcoming tasks</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div
              className={cn(
                "grid gap-2 mb-2",
                viewMode === "day" ? "grid-cols-1" : "grid-cols-7"
              )}
            >
              {viewMode === "day" ? (
                <div className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {format(currentDate, "EEEE")}
                </div>
              ) : (
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))
              )}
            </div>

            {/* Calendar days */}
            <div
              className={cn(
                "grid gap-2",
                viewMode === "day"
                  ? "grid-cols-1"
                  : viewMode === "multi-day"
                  ? "grid-cols-3"
                  : "grid-cols-7"
              )}
            >
              {calendarDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayItems = itemsByDate.get(dateKey) || [];
                const dayTasks = dayItems.filter(
                  (item) => item.type === "task"
                ) as Array<{ type: "task"; data: Task }>;
                const isCurrentMonth =
                  viewMode === "month" ? isSameMonth(day, currentDate) : true;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                const maxItems =
                  viewMode === "day"
                    ? 20
                    : viewMode === "week" || viewMode === "multi-week"
                    ? 8
                    : viewMode === "multi-day"
                    ? 10
                    : 3;

                const visibleItems = dayItems.slice(0, maxItems);
                const remainingCount = dayItems.length - maxItems;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "p-2 rounded-[var(--radius-md)] border-2 transition-all hover:border-[var(--color-accent-mint)]/30",
                      "flex flex-col items-start glass-1",
                      viewMode === "day"
                        ? "min-h-[400px]"
                        : viewMode === "week" || viewMode === "multi-week"
                        ? "min-h-[200px]"
                        : viewMode === "multi-day"
                        ? "min-h-[300px]"
                        : "min-h-[120px]",
                      isCurrentMonth
                        ? "bg-[var(--color-surface-1)]"
                        : "bg-[rgba(255,255,255,0.02)] text-[var(--color-text-muted)]",
                      isSelected &&
                        "border-[var(--color-accent-mint)] bg-[rgba(94,247,166,0.1)]",
                      !isSelected && "border-[var(--color-glass-outline)]",
                      isTodayDate &&
                        !isSelected &&
                        "border-[var(--color-accent-mint)]/30 bg-[rgba(94,247,166,0.05)]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium mb-1",
                        isTodayDate &&
                          "bg-[var(--color-accent-mint)] text-[var(--color-black)] rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    <div className="w-full space-y-1 flex-1">
                      {visibleItems.map((item) => {
                        const getItemContent = () => {
                          switch (item.type) {
                            case "task":
                              return (
                                <div
                                  className="text-xs truncate bg-[rgba(94,247,166,0.1)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(94,247,166,0.15)] transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(item.data);
                                  }}
                                >
                                  <CheckSquare className="h-3 w-3" />
                                  <PriorityIndicator
                                    priority={item.data.priority}
                                    size="sm"
                                  />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    {item.data.title}
                                  </span>
                                </div>
                              );
                            case "journal":
                              return (
                                <Link
                                  href="/journal"
                                  className="text-xs truncate bg-[rgba(147,197,253,0.15)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(147,197,253,0.25)] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <BookOpen className="h-3 w-3" />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    Journal
                                  </span>
                                </Link>
                              );
                            case "habit":
                              return (
                                <Link
                                  href="/habits"
                                  className="text-xs truncate bg-[rgba(251,191,36,0.15)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(251,191,36,0.25)] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Repeat className="h-3 w-3" />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    {item.habitName}
                                  </span>
                                </Link>
                              );
                            case "pomodoro":
                              return (
                                <Link
                                  href="/pomodoro"
                                  className="text-xs truncate bg-[rgba(239,68,68,0.15)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(239,68,68,0.25)] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Timer className="h-3 w-3" />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    Pomodoro
                                  </span>
                                </Link>
                              );
                            case "countdown":
                              return (
                                <Link
                                  href="/countdown"
                                  className="text-xs truncate bg-[rgba(168,85,247,0.15)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(168,85,247,0.25)] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <CalendarIcon className="h-3 w-3" />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    {item.data.title}
                                  </span>
                                </Link>
                              );
                            case "note":
                              return (
                                <Link
                                  href={`/notes/${item.data.id}`}
                                  className="text-xs truncate bg-[rgba(34,197,94,0.15)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(34,197,94,0.25)] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileText className="h-3 w-3" />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    {item.data.title}
                                  </span>
                                </Link>
                              );
                            case "timeEntry":
                              return (
                                <Link
                                  href="/time-tracking"
                                  className="text-xs truncate bg-[rgba(59,130,246,0.15)] px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1 hover:bg-[rgba(59,130,246,0.25)] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Clock className="h-3 w-3" />
                                  <span className="truncate text-[var(--color-text-primary)]">
                                    {item.data.description || "Time Entry"}
                                  </span>
                                </Link>
                              );
                          }
                        };

                        return (
                          <div key={`${item.type}-${item.data.id}`}>
                            {getItemContent()}
                          </div>
                        );
                      })}
                      {remainingCount > 0 && (
                        <div className="text-xs text-[var(--color-text-muted)] px-2">
                          +{remainingCount} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating View Toolbar - Bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-2 elevation-2 rounded-[var(--radius-pill)] border border-[var(--color-glass-outline)] p-1 flex items-center gap-0">
        {(
          [
            "month",
            "week",
            "day",
            "agenda",
            "multi-day",
            "multi-week",
          ] as ViewMode[]
        ).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-[var(--radius-pill)]",
              "text-[var(--color-text-primary)]",
              viewMode === mode
                ? "bg-[rgba(255,255,255,0.1)] text-[var(--color-text-primary)]"
                : "hover:bg-[rgba(255,255,255,0.05)]"
            )}
          >
            {mode === "multi-day"
              ? "Multi-Day"
              : mode === "multi-week"
              ? "Multi-Week"
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Right sidebar - Selected date items */}
      {selectedDate && (
        <div className="w-80 border-l border-[var(--color-glass-outline)] glass-1 p-6 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {isToday(selectedDate)
                ? "Today"
                : format(selectedDate, "EEEE, MMM d")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDateItems.length}{" "}
              {selectedDateItems.length === 1 ? "item" : "items"}
            </p>
          </div>

          <Button className="w-full mb-4" onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task for This Day
          </Button>

          <div className="space-y-4">
            {/* Tasks */}
            {selectedDateTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Tasks ({selectedDateTasks.length})
                </h4>
                <TaskList
                  tasks={selectedDateTasks}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={onDeleteTask}
                  onTaskClick={handleEditTask}
                  emptyMessage="No tasks for this day"
                />
              </div>
            )}

            {/* Journal */}
            {selectedDateItems
              .filter((item) => item.type === "journal")
              .map((item) => (
                <div key={item.data.id}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Journal
                  </h4>
                  <Link
                    href="/journal"
                    className="block p-3 rounded-lg bg-[rgba(147,197,253,0.1)] border border-[rgba(147,197,253,0.2)] hover:bg-[rgba(147,197,253,0.15)] transition-colors"
                  >
                    <p className="text-sm text-[var(--color-text-primary)] line-clamp-3">
                      {item.data.content.slice(0, 100)}
                      {item.data.content.length > 100 ? "..." : ""}
                    </p>
                    {item.data.mood && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Mood: {item.data.mood}
                      </div>
                    )}
                  </Link>
                </div>
              ))}

            {/* Habits */}
            {selectedDateItems
              .filter((item) => item.type === "habit")
              .map((item) => (
                <div key={item.data.id}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Habits
                  </h4>
                  <Link
                    href="/habits"
                    className="block p-3 rounded-lg bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] hover:bg-[rgba(251,191,36,0.15)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {item.habitName}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}

            {/* Pomodoro Sessions */}
            {selectedDateItems.filter((item) => item.type === "pomodoro")
              .length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Pomodoro Sessions (
                  {
                    selectedDateItems.filter((item) => item.type === "pomodoro")
                      .length
                  }
                  )
                </h4>
                <Link
                  href="/pomodoro"
                  className="block p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                >
                  <div className="text-sm text-[var(--color-text-primary)]">
                    {
                      selectedDateItems.filter(
                        (item) => item.type === "pomodoro"
                      ).length
                    }{" "}
                    completed session
                    {selectedDateItems.filter(
                      (item) => item.type === "pomodoro"
                    ).length !== 1
                      ? "s"
                      : ""}
                  </div>
                </Link>
              </div>
            )}

            {/* Countdowns */}
            {selectedDateItems
              .filter((item) => item.type === "countdown")
              .map((item) => (
                <div key={item.data.id}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Countdown
                  </h4>
                  <Link
                    href="/countdown"
                    className="block p-3 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] hover:bg-[rgba(168,85,247,0.15)] transition-colors"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {item.data.title}
                    </div>
                    {item.data.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.data.description}
                      </div>
                    )}
                  </Link>
                </div>
              ))}

            {/* Notes */}
            {selectedDateItems
              .filter((item) => item.type === "note")
              .map((item) => (
                <div key={item.data.id}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h4>
                  <Link
                    href={`/notes/${item.data.id}`}
                    className="block p-3 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.15)] transition-colors"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {item.data.title}
                    </div>
                    {item.data.content && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.data.content
                          .replace(/[#*`\[\]]/g, "")
                          .slice(0, 80)}
                        {item.data.content.length > 80 ? "..." : ""}
                      </div>
                    )}
                  </Link>
                </div>
              ))}

            {/* Time Entries */}
            {selectedDateItems.filter((item) => item.type === "timeEntry")
              .length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Tracking (
                  {
                    selectedDateItems.filter(
                      (item) => item.type === "timeEntry"
                    ).length
                  }
                  )
                </h4>
                <Link
                  href="/time-tracking"
                  className="block p-3 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.15)] transition-colors"
                >
                  <div className="text-sm text-[var(--color-text-primary)]">
                    {selectedDateItems
                      .filter((item) => item.type === "timeEntry")
                      .reduce(
                        (total, item) => total + (item.data.duration || 0),
                        0
                      )}{" "}
                    minutes tracked
                  </div>
                </Link>
              </div>
            )}

            {selectedDateItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items scheduled</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskEditor
            listId="inbox"
            onSave={handleSaveNewTask}
            onCancel={() => setIsNewTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskEditor
              task={selectedTask}
              listId={selectedTask.listId}
              onSave={(updatedTask) =>
                handleSaveTask(selectedTask.id, updatedTask)
              }
              onCancel={() => setSelectedTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
