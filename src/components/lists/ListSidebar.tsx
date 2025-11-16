"use client";

import { useState } from "react";
import { List } from "@/src/lib/types";
import {
  Inbox,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Plus,
  CalendarDays,
  Timer,
  Repeat,
  Clock,
  Grid3x3,
  FileText,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ListMenu } from "./ListMenu";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { GlobalSearch } from "@/src/components/layout/GlobalSearch";

interface ListSidebarProps {
  lists: List[];
  activeListId: string;
  onListSelect: (listId: string) => void;
  onNewList: () => void;
  taskCounts: Record<string, number>;
  isCollapsed?: boolean;
}

export function ListSidebar({
  lists,
  activeListId,
  onListSelect, // eslint-disable-line @typescript-eslint/no-unused-vars
  onNewList,
  taskCounts,
  isCollapsed = false,
}: ListSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    productivity: true,
    notesAndJournal: true,
    customLists: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev: typeof expandedSections) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const taskViews = [
    {
      id: "inbox",
      title: "Inbox",
      icon: Inbox,
      count: taskCounts.inbox || 0,
      href: "/?view=inbox",
    },
    {
      id: "today",
      title: "Today",
      icon: Calendar,
      count: taskCounts.today || 0,
      href: "/?view=today",
    },
    {
      id: "upcoming",
      title: "Upcoming",
      icon: CalendarCheck,
      count: taskCounts.upcoming || 0,
      href: "/?view=upcoming",
    },
    {
      id: "completed",
      title: "Completed",
      icon: CheckCircle2,
      count: taskCounts.completed || 0,
      href: "/?view=completed",
    },
  ];

  const productivityTools = [
    {
      id: "focus-compass",
      title: "Focus Compass",
      icon: Sparkles,
      href: "/focus-compass",
    },
    {
      id: "calendar",
      title: "Calendar",
      icon: CalendarDays,
      href: "/calendar",
    },
    { id: "pomodoro", title: "Pomodoro", icon: Timer, href: "/pomodoro" },
    { id: "habits", title: "Habits", icon: Repeat, href: "/habits" },
    { id: "countdown", title: "Countdown", icon: Clock, href: "/countdown" },
    {
      id: "eisenhower",
      title: "Eisenhower Matrix",
      icon: Grid3x3,
      href: "/eisenhower",
    },
    {
      id: "time-tracking",
      title: "Time Tracking",
      icon: Clock,
      href: "/time-tracking",
    },
  ];

  const notesAndJournal = [
    { id: "notes", title: "Notes", icon: FileText, href: "/notes" },
    { id: "journal", title: "Journal", icon: BookOpen, href: "/journal" },
  ];

  const analytics = [
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
  ];

  return (
    <div className="flex flex-col bg-muted/30">
      {/* Global Search */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <GlobalSearch />
        </div>
      )}

      {/* Tasks Section */}
      <div className={cn("p-4", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <button
            onClick={() => toggleSection("tasks")}
            className="w-full flex items-center justify-between mb-2 group"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tasks
            </h2>
            {expandedSections.tasks ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        )}
        {(!isCollapsed ? expandedSections.tasks : true) && (
          <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
            {taskViews.map((view) => {
              const Icon = view.icon;
              const isActive = activeListId === view.id;

              if (isCollapsed) {
                return (
                  <Link
                    key={view.id}
                    href={view.href}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-lg transition-colors relative group",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    title={view.title}
                  >
                    <Icon className="h-5 w-5" />
                    {view.count > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                        {view.count > 9 ? "9+" : view.count}
                      </span>
                    )}
                  </Link>
                );
              }

              const content = (
                <>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{view.title}</span>
                  </div>
                  {view.count > 0 && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {view.count}
                    </span>
                  )}
                </>
              );

              const className = cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              );

              return (
                <Link key={view.id} href={view.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Productivity Tools Section */}
      <div className={cn("px-4 pb-4", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <button
            onClick={() => toggleSection("productivity")}
            className="w-full flex items-center justify-between mb-2 group"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Productivity
            </h2>
            {expandedSections.productivity ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        )}
        {(!isCollapsed ? expandedSections.productivity : true) && (
          <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
            {productivityTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeListId === tool.id;

              if (isCollapsed) {
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    title={tool.title}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              }

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tool.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes & Journal Section */}
      <div className={cn("px-4 pb-4", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <button
            onClick={() => toggleSection("notesAndJournal")}
            className="w-full flex items-center justify-between mb-2 group"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notes & Journal
            </h2>
            {expandedSections.notesAndJournal ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        )}
        {(!isCollapsed ? expandedSections.notesAndJournal : true) && (
          <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
            {notesAndJournal.map((item) => {
              const Icon = item.icon;
              const isActive = activeListId === item.id;

              if (isCollapsed) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    title={item.title}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className={cn("px-4 pb-4", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Analytics
          </h2>
        )}
        <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
          {analytics.map((item) => {
            const Icon = item.icon;
            const isActive = activeListId === item.id;

            if (isCollapsed) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                  title={item.title}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={cn("px-4 pb-4", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => toggleSection("customLists")}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Custom Lists
              </h2>
              {expandedSections.customLists ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onNewList}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onNewList}
              title="New List"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        {(!isCollapsed ? expandedSections.customLists : true) && (
          <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
            {lists
              .filter(
                (list) => !["inbox", "today", "upcoming"].includes(list.id)
              )
              .map((list) => {
                const isActive = activeListId === list.id;

                if (isCollapsed) {
                  return (
                    <Link
                      key={list.id}
                      href={`/?view=${list.id}`}
                      className={cn(
                        "w-full flex items-center justify-center p-2 rounded-lg transition-colors relative group",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      title={list.title}
                    >
                      <div
                        className="h-5 w-5 rounded-full shrink-0"
                        style={{ backgroundColor: list.color }}
                      />
                      {(taskCounts[list.id] || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                          {taskCounts[list.id] > 9 ? "9+" : taskCounts[list.id]}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={list.id}
                    href={`/?view=${list.id}`}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: list.color }}
                      />
                      <span className="truncate">{list.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {(taskCounts[list.id] || 0) > 0 && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {taskCounts[list.id]}
                        </span>
                      )}
                      <div onClick={(e) => e.preventDefault()}>
                        <ListMenu list={list} />
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
