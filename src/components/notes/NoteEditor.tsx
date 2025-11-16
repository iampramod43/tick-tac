"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Note } from "@/src/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  X,
  Pin,
  PinOff,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Strikethrough,
  CheckSquare,
  Table as TableIcon,
  Minus,
  Eye,
  Save,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/src/lib/utils";
import TurndownService from "turndown";
import { marked } from "marked";
import { useTasks } from "@/src/hooks/useTasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#AF52DE",
  "#5AC8FA",
];
const CATEGORIES = ["Work", "Personal", "Ideas", "Reference", "Other"];

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState(note?.category || CATEGORIES[0]);
  const [color, setColor] = useState(note?.color || PRESET_COLORS[0]);
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [previewMode, setPreviewMode] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>(
    note?.linkedTaskId
  );
  const [lastSavedTitle, setLastSavedTitle] = useState(note?.title || "");
  const [lastSavedContent, setLastSavedContent] = useState(note?.content || "");

  // Get all tasks for selection
  const { tasks } = useTasks();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Convert markdown to HTML for Tiptap
  const getInitialContent = (content?: string) => {
    if (!content) return "";
    try {
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder: "Write your note here...",
      }),
      Underline,
      Strike,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: getInitialContent(note?.content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[200px] sm:min-h-[300px] md:min-h-[400px] p-4 overflow-y-auto",
      },
    },
    onUpdate: () => {
      // Content updated - handled by hasUnsavedChanges
    },
  });

  // Update editor content and fields when note changes
  useEffect(() => {
    if (!editor) return;

    if (note?.content) {
      const htmlContent = getInitialContent(note.content);
      if (editor.getHTML() !== htmlContent) {
        editor.commands.setContent(htmlContent);
      }
    } else if (!note) {
      editor.commands.clearContent();
    }

    // Update all fields when note changes
    if (note) {
      setTitle(note.title || "");
      setTags(note.tags || []);
      setCategory(note.category || CATEGORIES[0]);
      setColor(note.color || PRESET_COLORS[0]);
      setPinned(note.pinned || false);
      setLinkedTaskId(note.linkedTaskId);
      setLastSavedTitle(note.title || "");
      setLastSavedContent(note.content || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, note?.id]); // Only update when note ID changes to avoid infinite loops

  // Check if there are unsaved changes
  const getCurrentContent = () => {
    if (!editor) return "";
    const html = editor.getHTML();
    return turndownService.turndown(html);
  };

  const hasUnsavedChanges =
    (editor && getCurrentContent() !== lastSavedContent) ||
    title !== lastSavedTitle;

  const handleSave = () => {
    if (!title.trim() || !editor) return;

    const markdownContent = turndownService.turndown(editor.getHTML());

    const noteData: Omit<Note, "id" | "createdAt" | "updatedAt"> = {
      title: title.trim(),
      content: markdownContent,
      tags: tags.length > 0 ? tags : undefined,
      category,
      color,
      pinned,
      archived: note?.archived || false,
      linkedTaskId: linkedTaskId || undefined,
      linkedHabitId: note?.linkedHabitId,
    };

    setLastSavedContent(markdownContent);
    setLastSavedTitle(title.trim());
    onSave(noteData);
  };

  const linkedTask = tasks.find((t) => t.id === linkedTaskId);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!isMounted || !editor) {
    return (
      <div className="space-y-3 md:space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  const currentContent = getCurrentContent();

  return (
    <div className="space-y-3 md:space-y-4 h-full flex flex-col">
      {/* Header Actions - Responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPinned(!pinned)}
            className={cn(pinned && "text-primary")}
            title="Pin note"
          >
            {pinned ? (
              <Pin className="h-4 w-4" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            title="Toggle preview"
          >
            <Eye className="h-4 w-4 mr-1" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/30 rounded-lg">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
            {title || "Untitled"}
          </h1>
          <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <MarkdownRenderer content={currentContent || "*No content*"} />
          </div>
        </div>
      ) : (
        <>
          {/* Title Input */}
          <div>
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base md:text-lg font-semibold"
              autoFocus
            />
          </div>

          {/* Tiptap Toolbar */}
          <div className="border rounded-lg p-2 bg-muted/50">
            <div className="flex flex-wrap gap-1">
              {/* Headings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={cn(
                  "h-8 px-2",
                  editor.isActive("heading", { level: 1 }) && "bg-muted"
                )}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={cn(
                  "h-8 px-2",
                  editor.isActive("heading", { level: 2 }) && "bg-muted"
                )}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={cn(
                  "h-8 px-2",
                  editor.isActive("heading", { level: 3 }) && "bg-muted"
                )}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              {/* Text Formatting */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("bold") && "bg-muted"
                )}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("italic") && "bg-muted"
                )}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("underline") && "bg-muted"
                )}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("strike") && "bg-muted"
                )}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("code") && "bg-muted"
                )}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              {/* Lists */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("bulletList") && "bg-muted"
                )}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("orderedList") && "bg-muted"
                )}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("taskList") && "bg-muted"
                )}
                title="Checklist"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              {/* Advanced */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = window.prompt("Enter URL:");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("link") && "bg-muted"
                )}
                title="Link (Ctrl+K)"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = window.prompt("Enter image URL:");
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }}
                title="Image"
                className="h-8 px-2"
              >
                <ImageIcon className="h-4 w-4" aria-label="Insert image" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("blockquote") && "bg-muted"
                )}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
                className="h-8 px-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  "h-8 px-2",
                  editor.isActive("codeBlock") && "bg-muted"
                )}
                title="Code Block"
              >
                <Code className="h-4 w-4" />
                <span className="ml-1 text-xs">Block</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
                title="Table"
                className="h-8 px-2"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tiptap Editor Content */}
          <div className="flex-1 border rounded-lg overflow-y-auto bg-background">
            <EditorContent editor={editor} />
          </div>

          {/* Category and Color - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm md:text-base">Category</Label>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-background mt-1 text-sm md:text-base"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm md:text-base">Color</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => setColor(presetColor)}
                    className={cn(
                      "h-8 w-8 md:h-10 md:w-10 rounded-full border-2 transition-transform hover:scale-110",
                      color === presetColor
                        ? "border-primary scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: presetColor }}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Attached Task */}
          <div>
            <Label className="text-sm md:text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Attach to Task
            </Label>
            <div className="mt-1">
              <Select
                value={linkedTaskId || "none"}
                onValueChange={(value) =>
                  setLinkedTaskId(value === "none" ? undefined : value)
                }
              >
                <SelectTrigger className="w-full text-sm md:text-base">
                  <SelectValue placeholder="Select a task (optional)">
                    {linkedTask ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4",
                            linkedTask.done
                              ? "text-muted-foreground"
                              : "text-primary"
                          )}
                        />
                        <span
                          className={cn(
                            linkedTask.done &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {linkedTask.title}
                        </span>
                      </div>
                    ) : (
                      "No task attached"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No task</span>
                  </SelectItem>
                  {tasks
                    .filter((task) => !task.done)
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span>{task.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  {tasks.filter((task) => task.done).length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Completed Tasks
                      </div>
                      {tasks
                        .filter((task) => task.done)
                        .map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                              <span className="line-through text-muted-foreground">
                                {task.title}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {linkedTask && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Link2 className="h-3 w-3" />
                  <span>
                    Linked to:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        linkedTask.done && "line-through"
                      )}
                    >
                      {linkedTask.title}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags - Responsive layout */}
          <div>
            <Label className="text-sm md:text-base">Tags</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1 mb-2">
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
                className="flex-1 text-sm md:text-base"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="w-full sm:w-auto"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs md:text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
