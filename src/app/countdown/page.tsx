'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { useLists } from '@/src/hooks/useLists';
import { useTasks } from '@/src/hooks/useTasks';
import { useCountdowns } from '@/src/hooks/useCountdowns';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/src/components/common/DatePicker';
import { NewListModal } from '@/src/components/lists/NewListModal';
import { TikkuChat } from '@/src/components/ai/TikkuChat';
import { format, formatDistance, isPast, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';
import { Countdown } from '@/src/lib/types';
import { formatUTCDate } from '@/src/lib/utils';

const PRESET_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA'];
const CATEGORIES = ['Work', 'Personal', 'Holiday', 'Milestone', 'Other'];

export default function CountdownPage() {
  const { lists, addList } = useLists();
  const { tasks } = useTasks();
  const { countdowns, isLoading: countdownsLoading, addCountdown, deleteCountdown } = useCountdowns();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isNewCountdownModalOpen, setIsNewCountdownModalOpen] = useState(false);

  const [newCountdown, setNewCountdown] = useState({
    title: '',
    description: '',
    targetDate: undefined as Date | undefined,
    color: PRESET_COLORS[0],
    category: CATEGORIES[0],
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddCountdown = async () => {
    if (!newCountdown.title.trim() || !newCountdown.targetDate) return;
    
    await addCountdown({
      title: newCountdown.title.trim(),
      description: newCountdown.description.trim() || undefined,
      targetDate: formatUTCDate(newCountdown.targetDate),
      color: newCountdown.color,
      category: newCountdown.category || undefined,
    });
    
    setNewCountdown({
      title: '',
      description: '',
      targetDate: undefined,
      color: PRESET_COLORS[0],
      category: CATEGORIES[0],
    });
    setIsNewCountdownModalOpen(false);
  };

  const handleDeleteCountdown = async (id: string) => {
    await deleteCountdown(id);
  };

  const getTimeRemaining = (targetDateStr: string) => {
    const targetDate = parseISO(targetDateStr);
    const now = currentTime;
    
    if (isPast(targetDate)) {
      return { expired: true, display: 'Event passed' };
    }

    const days = differenceInDays(targetDate, now);
    const hours = differenceInHours(targetDate, now) % 24;
    const minutes = differenceInMinutes(targetDate, now) % 60;
    const seconds = differenceInSeconds(targetDate, now) % 60;

    return {
      expired: false,
      days,
      hours,
      minutes,
      seconds,
      display: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    };
  };

  const taskCounts = {
    inbox: tasks.filter(t => !t.done && t.listId === 'inbox').length,
    today: 0,
    upcoming: 0,
    completed: tasks.filter(t => t.done).length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        lists={lists}
        activeListId="countdown"
        onListSelect={() => {}}
        onNewList={() => setIsNewListModalOpen(true)}
        taskCounts={taskCounts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Countdown</h2>
            <Button onClick={() => setIsNewCountdownModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Countdown
            </Button>
          </div>
          <p className="text-muted-foreground">Track important events and deadlines</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {countdownsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading countdowns...</p>
            </div>
          ) : countdowns.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No countdowns yet</p>
              <Button onClick={() => setIsNewCountdownModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Countdown
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countdowns
                .sort((a, b) => parseISO(a.targetDate).getTime() - parseISO(b.targetDate).getTime())
                .map(countdown => {
                  const timeRemaining = getTimeRemaining(countdown.targetDate);
                  const expired = timeRemaining.expired;

                  return (
                    <div
                      key={countdown.id}
                      className={cn(
                        'bg-card border rounded-lg p-6 relative overflow-hidden',
                        expired && 'opacity-60'
                      )}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: countdown.color,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          {countdown.category && (
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              {countdown.category}
                            </div>
                          )}
                          <h3 className="font-semibold text-lg">{countdown.title}</h3>
                          {countdown.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {countdown.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCountdown(countdown.id)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          {format(parseISO(countdown.targetDate), 'MMMM d, yyyy • h:mm a')}
                        </div>
                        
                        {!expired ? (
                          <>
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="bg-muted rounded-lg p-3">
                                <div className="text-2xl font-bold">{timeRemaining.days}</div>
                                <div className="text-xs text-muted-foreground">Days</div>
                              </div>
                              <div className="bg-muted rounded-lg p-3">
                                <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                                <div className="text-xs text-muted-foreground">Hours</div>
                              </div>
                              <div className="bg-muted rounded-lg p-3">
                                <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                                <div className="text-xs text-muted-foreground">Mins</div>
                              </div>
                              <div className="bg-muted rounded-lg p-3">
                                <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                                <div className="text-xs text-muted-foreground">Secs</div>
                              </div>
                            </div>
                            <div className="text-center mt-3 text-sm text-muted-foreground">
                              {formatDistance(parseISO(countdown.targetDate), currentTime, { addSuffix: true })}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <div className="text-xl font-semibold text-muted-foreground">
                              🎉 Event Passed
                            </div>
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

      {/* New Countdown Dialog */}
      <Dialog open={isNewCountdownModalOpen} onOpenChange={setIsNewCountdownModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Countdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input
                value={newCountdown.title}
                onChange={(e) => setNewCountdown({...newCountdown, title: e.target.value})}
                placeholder="e.g., Product Launch"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newCountdown.description}
                onChange={(e) => setNewCountdown({...newCountdown, description: e.target.value})}
                placeholder="Add details..."
              />
            </div>
            <div className="space-y-2">
              <Label>Target Date</Label>
              <DatePicker
                date={newCountdown.targetDate}
                onSelect={(date) => setNewCountdown({...newCountdown, targetDate: date})}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full px-3 py-2 rounded-lg border bg-background"
                value={newCountdown.category}
                onChange={(e) => setNewCountdown({...newCountdown, category: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCountdown({...newCountdown, color})}
                    className={cn(
                      'h-10 w-10 rounded-full border-2 transition-transform hover:scale-110',
                      newCountdown.color === color ? 'border-primary scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewCountdownModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCountdown} disabled={!newCountdown.title || !newCountdown.targetDate}>
              Create Countdown
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

