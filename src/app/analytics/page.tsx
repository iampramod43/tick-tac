"use client";

import { useMemo } from "react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { useNotes, useJournal } from "@/src/hooks/useNotes";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ListTodo,
  Target,
  Calendar,
  Award,
  Zap,
} from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { TikkuChat } from "@/src/components/ai/TikkuChat";
import { LucideIcon } from "lucide-react";

const COLORS = {
  primary: "#007AFF",
  success: "#34C759",
  warning: "#FF9500",
  danger: "#FF3B30",
  purple: "#AF52DE",
  blue: "#5AC8FA",
};

const PRIORITY_COLORS = {
  1: "#FF3B30", // Urgent
  2: "#FF9500", // High
  3: "#007AFF", // Normal
  4: "#8E8E93", // Low
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: keyof typeof COLORS;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: StatCardProps) => (
  <div className="bg-card border rounded-lg p-6">
    <div className="flex items-center justify-between mb-2">
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${COLORS[color]}20` }}
      >
        <Icon className="h-5 w-5" style={{ color: COLORS[color] }} />
      </div>
      {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className="text-sm text-muted-foreground">{title}</p>
  </div>
);

export default function AnalyticsPage() {
  const { lists } = useLists();
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { entries: journalEntries } = useJournal();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.done).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Tasks by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Tasks by list
    const tasksByList = tasks.reduce((acc, task) => {
      const list = lists.find((l) => l.id === task.listId);
      const listName = list?.title || task.listId;
      acc[listName] = (acc[listName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Overdue tasks
    const today = new Date();
    const overdueTasks = tasks.filter(
      (task) => !task.done && task.due && new Date(task.due) < today
    ).length;

    // Tasks completed in last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, "yyyy-MM-dd");
    });

    const tasksCompletedByDay = last7Days.map((date) => {
      const count = tasks.filter((task) => {
        if (!task.done || !task.updatedAt) return false;
        const taskDate = format(new Date(task.updatedAt), "yyyy-MM-dd");
        return taskDate === date;
      }).length;
      return {
        date: format(new Date(date), "MMM d"),
        completed: count,
      };
    });

    // Tasks created in last 7 days
    const tasksCreatedByDay = last7Days.map((date) => {
      const count = tasks.filter((task) => {
        if (!task.createdAt) return false;
        const taskDate = format(new Date(task.createdAt), "yyyy-MM-dd");
        return taskDate === date;
      }).length;
      return {
        date: format(new Date(date), "MMM d"),
        created: count,
      };
    });

    // Notes statistics
    const totalNotes = notes.length;
    const pinnedNotes = notes.filter((n) => n.pinned).length;
    const notesByCategory = notes.reduce((acc, note) => {
      const category = note.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Notes with task attachments
    const notesWithTasks = notes.filter((n) => n.linkedTaskId).length;

    // Journal entries
    const totalJournalEntries = journalEntries.length;

    // Weekly completion trend
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({
      start: thisWeekStart,
      end: thisWeekEnd,
    });

    const weeklyCompletion = weekDays.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const completed = tasks.filter((task) => {
        if (!task.done || !task.updatedAt) return false;
        const taskDate = format(new Date(task.updatedAt), "yyyy-MM-dd");
        return taskDate === dayStr;
      }).length;
      return {
        day: format(day, "EEE"),
        completed,
      };
    });

    // Additional insights
    const avgTasksPerDay =
      last7Days.length > 0
        ? Math.round(
            tasksCompletedByDay.reduce((sum, day) => sum + day.completed, 0) /
              last7Days.length
          )
        : 0;

    const mostProductiveDay = tasksCompletedByDay.reduce(
      (max, day) => (day.completed > max.completed ? day : max),
      { date: "", completed: 0 }
    );

    // Tasks with subtasks
    const tasksWithSubtasks = tasks.filter(
      (t) => t.subtasks && t.subtasks.length > 0
    ).length;
    const totalSubtasks = tasks.reduce(
      (sum, t) => sum + (t.subtasks?.length || 0),
      0
    );
    const completedSubtasks = tasks.reduce(
      (sum, t) => sum + (t.subtasks?.filter((st) => st.done).length || 0),
      0
    );

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      tasksByPriority,
      tasksByList,
      overdueTasks,
      tasksCompletedByDay,
      tasksCreatedByDay,
      totalNotes,
      pinnedNotes,
      notesByCategory,
      notesWithTasks,
      totalJournalEntries,
      weeklyCompletion,
      avgTasksPerDay,
      mostProductiveDay,
      tasksWithSubtasks,
      totalSubtasks,
      completedSubtasks,
    };
  }, [tasks, lists, notes, journalEntries]);

  // Prepare chart data
  const priorityData = Object.entries(stats.tasksByPriority).map(
    ([priority, count]) => ({
      name:
        priority === "1"
          ? "Urgent"
          : priority === "2"
          ? "High"
          : priority === "3"
          ? "Normal"
          : "Low",
      value: count,
      color:
        PRIORITY_COLORS[parseInt(priority) as keyof typeof PRIORITY_COLORS],
    })
  );

  const listData = Object.entries(stats.tasksByList)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const categoryData = Object.entries(stats.notesByCategory).map(
    ([name, count]) => ({
      name,
      value: count,
    })
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="analytics"
        onListSelect={() => {}}
        onNewList={() => {}}
        taskCounts={{
          inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
          today: 0,
          upcoming: 0,
          completed: tasks.filter((t) => t.done).length,
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-2">Statistics & Analytics</h1>
          <p className="text-muted-foreground">
            Track your productivity and see insights into your work patterns
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon={ListTodo}
              color="primary"
            />
            <StatCard
              title="Completed"
              value={stats.completedTasks}
              icon={CheckCircle2}
              color="success"
              trend={`${stats.completionRate}% completion rate`}
            />
            <StatCard
              title="Active Tasks"
              value={stats.activeTasks}
              icon={Clock}
              color="warning"
            />
            <StatCard
              title="Overdue"
              value={stats.overdueTasks}
              icon={Target}
              color="danger"
            />
          </div>

          {/* Notes & Journal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Notes"
              value={stats.totalNotes}
              icon={FileText}
              color="purple"
            />
            <StatCard
              title="Pinned Notes"
              value={stats.pinnedNotes}
              icon={Award}
              color="blue"
            />
            <StatCard
              title="Journal Entries"
              value={stats.totalJournalEntries}
              icon={Calendar}
              color="primary"
            />
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Average Tasks/Day
              </h3>
              <p className="text-2xl font-bold">{stats.avgTasksPerDay}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last 7 days average
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Most Productive Day
              </h3>
              <p className="text-2xl font-bold">
                {stats.mostProductiveDay.completed}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.mostProductiveDay.date || "No data"}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Subtasks Progress
              </h3>
              <p className="text-2xl font-bold">
                {stats.completedSubtasks}/{stats.totalSubtasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalSubtasks > 0
                  ? Math.round(
                      (stats.completedSubtasks / stats.totalSubtasks) * 100
                    )
                  : 0}
                % completed
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Completion Rate Over Time */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tasks Completed (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.tasksCompletedByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tasks Created Over Time */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Tasks Created (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.tasksCreatedByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" fill={COLORS.primary} name="Created" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tasks by Priority */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tasks by List */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Top Lists by Task Count
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={listData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.blue} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Completion Trend */}
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              This Week&apos;s Completion Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weeklyCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  fill={COLORS.success}
                  name="Completed Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Notes Statistics */}
          {categoryData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Notes by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            Object.values(COLORS)[
                              index % Object.values(COLORS).length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Notes Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Total Notes</span>
                    <span className="text-lg font-bold">
                      {stats.totalNotes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Pinned Notes</span>
                    <span className="text-lg font-bold">
                      {stats.pinnedNotes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      Notes with Tasks
                    </span>
                    <span className="text-lg font-bold">
                      {stats.notesWithTasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Journal Entries</span>
                    <span className="text-lg font-bold">
                      {stats.totalJournalEntries}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TikkuChat />
    </div>
  );
}
