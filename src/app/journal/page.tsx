"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { useJournal } from "@/src/hooks/useNotes";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Smile,
  Frown,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NewListModal } from "@/src/components/lists/NewListModal";
import { TikkuChat } from "@/src/components/ai/TikkuChat";
import { MarkdownRenderer } from "@/src/components/notes/MarkdownRenderer";
import { format, addDays, subDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/src/lib/utils";
import { JournalEntry } from "@/src/lib/types";

const MOODS: Array<{
  value: JournalEntry["mood"];
  emoji: string;
  label: string;
}> = [
  { value: "great", emoji: "😄", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "bad", emoji: "😔", label: "Bad" },
  { value: "terrible", emoji: "😢", label: "Terrible" },
];

export default function JournalPage() {
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const { entries, getEntryByDate, addOrUpdateEntry } = useJournal();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter((t) => t.done).length,
  };

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const currentEntry = getEntryByDate(dateStr);

  // Load entry when date changes
  useEffect(() => {
    if (currentEntry) {
      setContent(currentEntry.content);
      setMood(currentEntry.mood);
      setTags(currentEntry.tags || []);
    } else {
      setContent("");
      setMood(undefined);
      setTags([]);
    }
  }, [selectedDate, currentEntry]);

  const handleSave = async () => {
    await addOrUpdateEntry(
      dateStr,
      content,
      mood,
      tags.length > 0 ? tags : undefined
    );
  };

  const loadEntryForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = getEntryByDate(dateStr);
    if (entry) {
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags || []);
    } else {
      setContent("");
      setMood(undefined);
      setTags([]);
    }
  };

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    setSelectedDate(newDate);
    loadEntryForDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
    loadEntryForDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    loadEntryForDate(today);
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

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="journal"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Journal</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week Calendar */}
          <div className="flex gap-2">
            {weekDays.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const entry = getEntryByDate(dayStr);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={dayStr}
                  onClick={() => {
                    setSelectedDate(day);
                    loadEntryForDate(day);
                  }}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border",
                    isToday && !isSelected && "border-primary/30"
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-bold mb-1",
                      isToday && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  {entry && (
                    <div className="text-xs">
                      {entry.mood &&
                        MOODS.find((m) => m.value === entry.mood)?.emoji}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              {isSameDay(selectedDate, new Date()) && (
                <p className="text-sm text-muted-foreground">Today</p>
              )}
            </div>

            {/* Mood Selector */}
            <div>
              <Label>How was your day?</Label>
              <div className="flex gap-2 mt-2">
                {MOODS.map((moodOption) => (
                  <button
                    key={moodOption.value}
                    onClick={() => setMood(moodOption.value)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105",
                      mood === moodOption.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl mb-1">{moodOption.emoji}</span>
                    <span className="text-xs">{moodOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Entry */}
            <div>
              <Label>Journal Entry</Label>
              <Textarea
                placeholder="Write about your day... (Supports Markdown)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] mt-2 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supports Markdown: **bold**, *italic*, `code`, lists, links,
                etc.
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2 mb-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background"
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
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
                      <button onClick={() => handleRemoveTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            {content && (
              <div>
                <Label>Preview</Label>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} size="lg">
                Save Entry
              </Button>
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
