'use client';

import { List } from '@/src/lib/types';
import { MoreHorizontal, Edit, Trash2, Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLists } from '@/src/hooks/useLists';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ListMenuProps {
  list: List;
}

const PRESET_COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#5AC8FA', '#FFCC00', '#FF2D55',
];

export function ListMenu({ list }: ListMenuProps) {
  const { updateList, deleteList } = useLists();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [color, setColor] = useState(list.color);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async () => {
    if (title.trim() && !isSaving) {
      setIsSaving(true);
      try {
        await updateList(list.id, { title: title.trim(), color });
        setEditDialogOpen(false);
      } catch (error) {
        console.error('Error updating list:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteList(list.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting list:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setEditDialogOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit List
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>
              Update the name and color of your list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">List Name</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="List name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => setColor(presetColor)}
                    className="h-8 w-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: presetColor,
                      borderColor: color === presetColor ? '#000' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSaving || !title.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{list.title}&quot;? This action cannot be
              undone and will delete all tasks in this list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

