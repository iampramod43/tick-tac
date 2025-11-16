'use client';

import { Task } from '@/src/lib/types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskEditor } from './TaskEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}

export function TaskDetailPanel({ task, onClose, onSave }: TaskDetailPanelProps) {
  const handleSave = (updatedTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (task) {
      onSave(task.id, updatedTask);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-background border-l shadow-lg z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Task Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <TaskEditor
                task={task}
                listId={task.listId}
                onSave={handleSave}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

