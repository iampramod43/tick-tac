'use client';

import { useState } from 'react';
import { FocusCompassWidget } from '@/src/components/focus-compass/FocusCompassWidget';
import { DailyPlanView } from '@/src/components/focus-compass/DailyPlanView';
import { Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { useLists } from '@/src/hooks/useLists';
import { useTasks } from '@/src/hooks/useTasks';
import { isToday, parseISO, addDays, isBefore, startOfDay } from 'date-fns';
import { TikkuChat } from '@/src/components/ai/TikkuChat';

export default function FocusCompassPage() {
  const [activeTab, setActiveTab] = useState<'recommendation' | 'plan'>('recommendation');
  const { lists } = useLists();
  const { tasks } = useTasks();

  const taskCounts = {
    inbox: tasks.filter((t) => !t.done && t.listId === 'inbox').length,
    today: tasks.filter((t) => !t.done && t.due && isToday(parseISO(t.due))).length,
    upcoming: tasks.filter((t) => {
      if (!t.done && t.due) {
        const today = startOfDay(new Date());
        const nextWeek = addDays(today, 7);
        return isBefore(parseISO(t.due), nextWeek) && !isToday(parseISO(t.due));
      }
      return false;
    }).length,
    completed: tasks.filter((t) => t.done).length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="focus-compass"
        onListSelect={() => {}}
        onNewList={() => {}}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8 text-[var(--color-accent-mint)]" />
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                  Focus Compass
                </h1>
              </div>
              <p className="text-[var(--color-text-secondary)]">
                Get AI-powered task recommendations based on your energy, time, and priorities
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-6 glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-1 w-fit">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('recommendation')}
                className={cn(
                  'flex items-center gap-2',
                  activeTab === 'recommendation'
                    ? 'bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90'
                    : 'text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                )}
              >
                <Sparkles className="h-4 w-4" />
                Recommendation
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('plan')}
                className={cn(
                  'flex items-center gap-2',
                  activeTab === 'plan'
                    ? 'bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90'
                    : 'text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                )}
              >
                <Calendar className="h-4 w-4" />
                Daily Plan
              </Button>
            </div>

            {/* Content */}
            {activeTab === 'recommendation' && (
              <div className="max-w-2xl mx-auto">
                <FocusCompassWidget />
              </div>
            )}

            {activeTab === 'plan' && <DailyPlanView />}
          </div>
        </div>
      </div>

      <TikkuChat />
    </div>
  );
}

