"use client";

import { useState } from "react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { useLists } from "@/src/hooks/useLists";
import { useTasks } from "@/src/hooks/useTasks";
import { useEisenhower } from "@/src/hooks/useEisenhower";
import { EisenhowerTask, EisenhowerQuadrant } from "@/src/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NewListModal } from "@/src/components/lists/NewListModal";
import { TikkuChat } from "@/src/components/ai/TikkuChat";
import { Checkbox } from "@/components/ui/checkbox";

const QUADRANTS = [
  {
    id: "urgent-important" as EisenhowerQuadrant,
    title: "Do First",
    subtitle: "Urgent & Important",
    color: "bg-red-500/10 border-red-500",
    description: "Critical tasks requiring immediate attention",
  },
  {
    id: "not-urgent-important" as EisenhowerQuadrant,
    title: "Schedule",
    subtitle: "Not Urgent & Important",
    color: "bg-blue-500/10 border-blue-500",
    description: "Long-term development and strategic planning",
  },
  {
    id: "urgent-not-important" as EisenhowerQuadrant,
    title: "Delegate",
    subtitle: "Urgent & Not Important",
    color: "bg-yellow-500/10 border-yellow-500",
    description: "Tasks that need to be done but can be delegated",
  },
  {
    id: "not-urgent-not-important" as EisenhowerQuadrant,
    title: "Eliminate",
    subtitle: "Not Urgent & Not Important",
    color: "bg-gray-500/10 border-gray-500",
    description: "Low-value activities to minimize",
  },
];

export default function EisenhowerPage() {
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const {
    tasks: matrixTasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
  } = useEisenhower();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] =
    useState<EisenhowerQuadrant>("urgent-important");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    await addTask({
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      quadrant: selectedQuadrant,
      completed: false,
    });

    setNewTask({ title: "", description: "" });
    setIsNewTaskModalOpen(false);
  };

  const handleToggleTask = async (id: string) => {
    const task = matrixTasks.find((t) => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleMoveTask = async (
    taskId: string,
    newQuadrant: EisenhowerQuadrant
  ) => {
    await updateTask(taskId, { quadrant: newQuadrant });
  };

  const getTasksByQuadrant = (quadrant: EisenhowerQuadrant) => {
    return matrixTasks.filter((task) => task.quadrant === quadrant);
  };

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === "inbox").length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter((t) => t.done).length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="eisenhower"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-2">Eisenhower Matrix</h2>
          <p className="text-muted-foreground">
            Prioritize tasks by urgency and importance
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full">
              {QUADRANTS.map((quadrant) => {
                const quadrantTasks = getTasksByQuadrant(quadrant.id);
                const activeTasks = quadrantTasks.filter((t) => !t.completed);
                const completedTasks = quadrantTasks.filter((t) => t.completed);

                return (
                  <div
                    key={quadrant.id}
                    className={cn(
                      "rounded-lg border-2 p-4 flex flex-col",
                      quadrant.color
                    )}
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg">{quadrant.title}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedQuadrant(quadrant.id);
                            setIsNewTaskModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {quadrant.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {quadrant.description}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                      {/* Active Tasks */}
                      {activeTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-card border rounded-lg p-3 group hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleToggleTask(task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 shrink-0"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Quick Move Buttons */}
                          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {QUADRANTS.filter((q) => q.id !== quadrant.id).map(
                              (q) => (
                                <button
                                  key={q.id}
                                  onClick={() => handleMoveTask(task.id, q.id)}
                                  className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                                >
                                  → {q.title}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Completed Tasks */}
                      {completedTasks.length > 0 && (
                        <>
                          <div className="text-xs font-medium text-muted-foreground pt-2 border-t">
                            Completed ({completedTasks.length})
                          </div>
                          {completedTasks.map((task) => (
                            <div
                              key={task.id}
                              className="bg-muted/50 border rounded-lg p-3 opacity-60"
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() =>
                                    handleToggleTask(task.id)
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm line-through">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-through">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {quadrantTasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No tasks in this quadrant
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Task to{" "}
              {QUADRANTS.find((q) => q.id === selectedQuadrant)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Add details..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
