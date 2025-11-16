"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TaskTable } from "@/src/components/tasks/TaskTable";
import { TaskQuickAdd } from "@/src/components/tasks/TaskQuickAdd";
import { TaskDetailPanel } from "@/src/components/tasks/TaskDetailPanel";
import { NewListModal } from "@/src/components/lists/NewListModal";
import { TikkuChat } from "@/src/components/ai/TikkuChat";
import { useTasks } from "@/src/hooks/useTasks";
import { useLists } from "@/src/hooks/useLists";
import { useReminders } from "@/src/hooks/useReminders";
import { useActiveTimeTracking } from "@/src/hooks/useActiveTimeTracking";
import { Task, TaskFilter } from "@/src/lib/types";
import { isToday, parseISO, addDays, isBefore, startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskEditor } from "@/src/components/tasks/TaskEditor";

interface MainLayoutProps {
  initialView?: string;
}

export function MainLayout({ initialView = "inbox" }: MainLayoutProps) {
  const { tasks, updateTask, deleteTask, addTask } = useTasks();
  const { lists, addList } = useLists();

  // Initialize reminders system
  useReminders();

  // Time tracking
  const {
    activeTaskId,
    elapsedTime,
    trackingState,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
  } = useActiveTimeTracking();

  const [activeListId, setActiveListId] = useState(initialView);

  // Update activeListId when initialView changes (from URL)
  useEffect(() => {
    setActiveListId(initialView);
  }, [initialView]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<TaskFilter>({});

  const getListTitle = useCallback(() => {
    const defaultTitles: Record<string, string> = {
      inbox: "Inbox",
      today: "Today",
      upcoming: "Upcoming",
      completed: "Completed",
    };

    if (defaultTitles[activeListId]) {
      return defaultTitles[activeListId];
    }

    const list = lists.find((l) => l.id === activeListId);
    return list?.title || "Tasks";
  }, [activeListId, lists]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by view
    if (activeListId === "today") {
      filtered = filtered.filter(
        (task) => !task.done && task.due && isToday(parseISO(task.due))
      );
    } else if (activeListId === "upcoming") {
      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 7);
      filtered = filtered.filter(
        (task) =>
          !task.done &&
          task.due &&
          isBefore(parseISO(task.due), nextWeek) &&
          !isToday(parseISO(task.due))
      );
    } else if (activeListId === "completed") {
      filtered = filtered.filter((task) => task.done);
    } else if (activeListId === "inbox") {
      filtered = filtered.filter(
        (task) => !task.done && task.listId === "inbox"
      );
    } else {
      filtered = filtered.filter(
        (task) => !task.done && task.listId === activeListId
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply priority filter
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter((task) =>
        filter.priority!.includes(task.priority)
      );
    }

    // Apply due date filter
    if (filter.due) {
      const today = startOfDay(new Date());
      filtered = filtered.filter((task) => {
        if (!task.due) return false;
        const dueDate = parseISO(task.due);

        if (filter.due === "today") {
          return isToday(dueDate);
        } else if (filter.due === "overdue") {
          return isBefore(dueDate, today);
        } else if (filter.due === "next7days") {
          const nextWeek = addDays(today, 7);
          return isBefore(dueDate, nextWeek) && !isBefore(dueDate, today);
        }
        return true;
      });
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(
        (task) =>
          task.tags && task.tags.some((tag) => filter.tags!.includes(tag))
      );
    }

    return filtered;
  }, [tasks, activeListId, searchQuery, filter]);

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Count tasks by list
    lists.forEach((list) => {
      counts[list.id] = tasks.filter(
        (task) => !task.done && task.listId === list.id
      ).length;
    });

    // Special views
    counts.inbox = tasks.filter(
      (task) => !task.done && task.listId === "inbox"
    ).length;
    counts.today = tasks.filter(
      (task) => !task.done && task.due && isToday(parseISO(task.due))
    ).length;

    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);
    counts.upcoming = tasks.filter(
      (task) =>
        !task.done &&
        task.due &&
        isBefore(parseISO(task.due), nextWeek) &&
        !isToday(parseISO(task.due))
    ).length;

    counts.completed = tasks.filter((task) => task.done).length;

    return counts;
  }, [tasks, lists]);

  const handleToggleTask = async (id: string, done: boolean) => {
    await updateTask(id, { done });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSaveTask = async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
  };

  const handleMoveTaskToList = async (taskId: string, listId: string) => {
    await updateTask(taskId, { listId });
  };

  const handleAddTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    await addTask(task);
  };

  const handleCreateList = async (title: string, color: string) => {
    await addList({ title, color });
  };

  const handleNewTaskClick = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleNewTaskSave = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    await addTask(task);
    setIsNewTaskModalOpen(false);
  };

  const handleStartTimer = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await startTracking(taskId, task.title, task.listId);
    }
  };

  const handleStopTimer = async () => {
    await stopTracking();
  };

  const handlePauseTimer = () => {
    pauseTracking();
  };

  const handleResumeTimer = () => {
    resumeTracking();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onListSelect={setActiveListId}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getListTitle()}
          onSearch={setSearchQuery}
          onNewTask={handleNewTaskClick}
          filter={filter}
          onFilterChange={setFilter}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <TaskTable
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onTaskClick={handleTaskClick}
            onMoveToList={handleMoveTaskToList}
            activeTaskId={activeTaskId}
            elapsedTime={elapsedTime}
            trackingState={trackingState}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResumeTimer={handleResumeTimer}
            onStopTimer={handleStopTimer}
          />
        </main>

        <TaskQuickAdd
          listId={
            activeListId === "today" ||
            activeListId === "upcoming" ||
            activeListId === "completed"
              ? "inbox"
              : activeListId
          }
          onAdd={handleAddTask}
        />
      </div>

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
      />

      <NewListModal
        open={isNewListModalOpen}
        onOpenChange={setIsNewListModalOpen}
        onCreateList={handleCreateList}
      />

      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskEditor
            listId={
              activeListId === "today" ||
              activeListId === "upcoming" ||
              activeListId === "completed"
                ? "inbox"
                : activeListId
            }
            onSave={handleNewTaskSave}
            onCancel={() => setIsNewTaskModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Tikku Chat Bot */}
      <TikkuChat />
    </div>
  );
}
