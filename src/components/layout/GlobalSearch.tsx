"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, CheckSquare, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTasks } from "@/src/hooks/useTasks";
import { useNotes } from "@/src/hooks/useNotes";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  type: "task" | "habit" | "countdown" | "eisenhower" | "note" | "journal";
  subtitle?: string;
  href: string;
  icon: React.ReactNode;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const router = useRouter();

  // Open search with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Compute search results using useMemo to avoid infinite loops
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const searchLower = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search tasks
    const taskResults: SearchResult[] = tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.notes?.toLowerCase().includes(searchLower)
      )
      .slice(0, 3)
      .map((task) => ({
        id: task.id,
        title: task.title,
        type: "task" as const,
        subtitle: task.notes?.slice(0, 60),
        href: `/?view=${task.listId}`,
        icon: <CheckSquare className="h-4 w-4" />,
      }));

    // Search notes
    const noteResults: SearchResult[] = notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, 3)
      .map((note) => ({
        id: note.id,
        title: note.title,
        type: "note" as const,
        subtitle: note.content.slice(0, 60),
        href: "/notes",
        icon: <FileText className="h-4 w-4" />,
      }));

    allResults.push(...taskResults, ...noteResults);
    return allResults.slice(0, 8);
  }, [query, tasks, notes]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.04)] transition-colors w-full max-w-md"
      >
        <Search className="h-4 w-4" />
        <span>Search everything...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-1.5 font-mono text-[10px] font-medium text-[var(--color-text-muted)] opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0" title="Search">
          <div className="flex items-center border-b border-[var(--color-glass-outline)] px-4 py-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.06)] bg-transparent mr-3">
              <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, habits, countdowns..."
              className="border-0 shadow-none focus-visible:ring-0 focus-visible:shadow-none bg-transparent px-0 py-0 h-auto"
              autoFocus
            />
          </div>

          {results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto p-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.href)}
                  className="w-full flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                >
                  <div className="mt-0.5 text-[var(--color-text-muted)]">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-sm text-[var(--color-text-muted)] truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] capitalize">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              No results found
            </div>
          ) : (
            <div className="p-8">
              <p className="mb-4 text-center text-[var(--color-text-muted)]">
                Quick Links
              </p>
              <div className="flex flex-col gap-2 items-center">
                <button
                  onClick={() => handleSelect("/?view=today")}
                  className="w-full max-w-xs px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-pill)] text-sm text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => handleSelect("/calendar")}
                  className="w-full max-w-xs px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-pill)] text-sm text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  Calendar
                </button>
                <button
                  onClick={() => handleSelect("/notes")}
                  className="w-full max-w-xs px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-pill)] text-sm text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  Notes
                </button>
                <button
                  onClick={() => handleSelect("/journal")}
                  className="w-full max-w-xs px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-pill)] text-sm text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  Journal
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
