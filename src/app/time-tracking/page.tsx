"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { useTimeTracking } from "@/src/hooks/useTimeTracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Play,
  Trash2,
  Edit,
  Download,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { TimeEntry } from "@/src/lib/types";
import { DatePicker } from "@/src/components/common/DatePicker";
import { NewListModal } from "@/src/components/lists/NewListModal";
import { TikkuChat } from "@/src/components/ai/TikkuChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TimeTrackingPage() {
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const {
    timeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    isLoading,
  } = useTimeTracking();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [taskId, setTaskId] = useState<string>("");
  const [listId, setListId] = useState<string>("");
  const [duration, setDuration] = useState<string>(""); // in minutes
  const [billable, setBillable] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "week" | "all">("today");

  // Filter time entries based on view mode
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const weekStart = format(startOfWeek(now), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(now), "yyyy-MM-dd");

    switch (viewMode) {
      case "today":
        return timeEntries.filter((entry) => entry.date === today);
      case "week":
        return timeEntries.filter(
          (entry) => entry.date >= weekStart && entry.date <= weekEnd
        );
      default:
        return timeEntries;
    }
  }, [timeEntries, viewMode]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMinutes = filteredEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMinutesRemainder = totalMinutes % 60;
    const billableMinutes = filteredEntries
      .filter((e) => e.billable)
      .reduce((sum, entry) => sum + entry.duration, 0);
    const billableHours = Math.floor(billableMinutes / 60);

    return {
      totalMinutes,
      totalHours,
      totalMinutesRemainder,
      billableMinutes,
      billableHours,
      entryCount: filteredEntries.length,
    };
  }, [filteredEntries]);

  const handleAddTimeEntry = async () => {
    if (!description.trim() || !duration.trim()) return;

    const minutes = parseInt(duration);
    if (isNaN(minutes) || minutes <= 0) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startTime = new Date(selectedDate);
    startTime.setHours(9, 0, 0, 0); // Default to 9 AM
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + minutes);

    await addTimeEntry({
      taskId: taskId || undefined,
      listId: listId || undefined,
      description: description.trim(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: minutes,
      date: dateStr,
      tags: tags.length > 0 ? tags : undefined,
      billable,
    });

    // Reset form
    setDescription("");
    setTaskId("");
    setListId("");
    setDuration("");
    setBillable(false);
    setTags([]);
    setTagInput("");
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setDescription(entry.description);
    setTaskId(entry.taskId || "");
    setListId(entry.listId || "");
    setDuration(entry.duration.toString());
    setBillable(entry.billable || false);
    setTags(entry.tags || []);
    setSelectedDate(parseISO(entry.startTime));
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !description.trim() || !duration.trim()) return;

    const minutes = parseInt(duration);
    if (isNaN(minutes) || minutes <= 0) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startTime = parseISO(editingEntry.startTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + minutes);

    await updateTimeEntry(editingEntry.id, {
      description: description.trim(),
      taskId: taskId || undefined,
      listId: listId || undefined,
      duration: minutes,
      endTime: endTime.toISOString(),
      date: dateStr,
      tags: tags.length > 0 ? tags : undefined,
      billable,
    });

    setEditingEntry(null);
    setDescription("");
    setTaskId("");
    setListId("");
    setDuration("");
    setBillable(false);
    setTags([]);
    setTagInput("");
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      await deleteTimeEntry(id);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (isoString: string): string => {
    return format(parseISO(isoString), "h:mm a");
  };

  const handleExport = () => {
    const csv = [
      [
        "Date",
        "Description",
        "Task",
        "List",
        "Duration (minutes)",
        "Billable",
        "Tags",
      ].join(","),
      ...filteredEntries.map((entry) => {
        const task = entry.taskId
          ? tasks.find((t) => t.id === entry.taskId)
          : null;
        const list = entry.listId
          ? lists.find((l) => l.id === entry.listId)
          : null;
        return [
          entry.date,
          `"${entry.description}"`,
          task ? `"${task.title}"` : "",
          list ? `"${list.title}"` : "",
          entry.duration,
          entry.billable ? "Yes" : "No",
          entry.tags ? `"${entry.tags.join(", ")}"` : "",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-tracking-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter((t) => t.done).length,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        lists={lists}
        activeListId="time-tracking"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Time Tracking
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your time and analyze productivity
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExport} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="text-2xl font-bold">
                      {stats.totalHours}h {stats.totalMinutesRemainder}m
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary opacity-50" />
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Billable Time
                    </p>
                    <p className="text-2xl font-bold">{stats.billableHours}h</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Entries</p>
                    <p className="text-2xl font-bold">{stats.entryCount}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">
                      {stats.entryCount > 0
                        ? formatDuration(
                            Math.round(stats.totalMinutes / stats.entryCount)
                          )
                        : "0m"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Entry Form */}
              <div className="lg:col-span-1">
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h2 className="text-lg font-semibold">
                    {editingEntry ? "Edit Time Entry" : "Log Time"}
                  </h2>

                  <div>
                    <Label>Date</Label>
                    <DatePicker
                      date={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      placeholder="Select date"
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      placeholder="What did you work on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Task (optional)</Label>
                    <Select
                      value={taskId || "none"}
                      onValueChange={(value) =>
                        setTaskId(value === "none" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No task</SelectItem>
                        {tasks
                          .filter((t) => !t.done)
                          .map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>List/Project (optional)</Label>
                    <Select
                      value={listId || "none"}
                      onValueChange={(value) =>
                        setListId(value === "none" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a list" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No list</SelectItem>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                          >
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)}>
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={billable}
                      onCheckedChange={(checked) =>
                        setBillable(checked === true)
                      }
                    />
                    <Label className="cursor-pointer">Billable</Label>
                  </div>

                  <div className="flex gap-2">
                    {editingEntry ? (
                      <>
                        <Button
                          onClick={handleUpdateEntry}
                          disabled={!description.trim() || !duration.trim()}
                          className="flex-1"
                        >
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingEntry(null);
                            setDescription("");
                            setTaskId("");
                            setListId("");
                            setDuration("");
                            setBillable(false);
                            setTags([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleAddTimeEntry}
                        disabled={!description.trim() || !duration.trim()}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Log Time
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Entries List */}
              <div className="lg:col-span-2">
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Time Entries</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "today" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("today")}
                      >
                        Today
                      </Button>
                      <Button
                        variant={viewMode === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("week")}
                      >
                        This Week
                      </Button>
                      <Button
                        variant={viewMode === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("all")}
                      >
                        All
                      </Button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading...
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No time entries found. Start logging your time!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredEntries.map((entry) => {
                        const task = entry.taskId
                          ? tasks.find((t) => t.id === entry.taskId)
                          : null;
                        const list = entry.listId
                          ? lists.find((l) => l.id === entry.listId)
                          : null;

                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {entry.description}
                                </h3>
                                {entry.billable && (
                                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded">
                                    Billable
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(
                                    parseISO(entry.startTime),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(entry.startTime)} -{" "}
                                  {formatTime(entry.endTime!)}
                                </span>
                                {task && (
                                  <span className="text-primary">
                                    Task: {task.title}
                                  </span>
                                )}
                                {list && (
                                  <span className="text-muted-foreground">
                                    List: {list.title}
                                  </span>
                                )}
                              </div>
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {entry.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">
                                {formatDuration(entry.duration)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditEntry(entry)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewListModal
        open={isNewListModalOpen}
        onOpenChange={setIsNewListModalOpen}
        onCreateList={async (title, color) => {
          await addList({ title, color });
        }}
      />

      <TikkuChat />
    </div>
  );
}
