"use client";

import { useState, useEffect } from "react";
import { List } from "@/src/lib/types";
import { ListSidebar } from "@/src/components/lists/ListSidebar";
import { ThemeToggle } from "@/src/components/common/ThemeToggle";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";

interface SidebarProps {
  lists: List[];
  activeListId: string;
  onListSelect: (listId: string) => void;
  onNewList: () => void;
  taskCounts: Record<string, number>;
}

export function Sidebar({
  lists,
  activeListId,
  onListSelect,
  onNewList,
  taskCounts,
}: SidebarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkMode = resolvedTheme === "dark";

  // Initialize state from localStorage using lazy initializer
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Handle theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "border-r border-[var(--color-glass-outline)] glass-1 flex flex-col h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-[var(--color-glass-outline)] flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/" className="block">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src={mounted && isDarkMode ? "/DB.svg" : "/WB.svg"}
                alt="tickTac"
                width={48}
                height={48}
              />
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <ListSidebar
          lists={lists}
          activeListId={activeListId}
          onListSelect={onListSelect}
          onNewList={onNewList}
          taskCounts={taskCounts}
          isCollapsed={isCollapsed}
        />
      </div>

      <div
        className={cn(
          "p-4 border-t border-[var(--color-glass-outline)] flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <div
          className={cn("flex items-center gap-2", isCollapsed && "flex-col")}
        >
          <ThemeToggle />
          <SignedIn>
            <div className="flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10 border-2 border-border",
                    userButtonPopoverCard: "shadow-lg",
                    userButtonTrigger: "focus:shadow-none",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>
          <SignedOut>
            <Button variant="ghost" size="icon" asChild>
              <a href="/auth/login">
                <Settings className="h-5 w-5" />
              </a>
            </Button>
          </SignedOut>
        </div>
      </div>
    </aside>
  );
}
