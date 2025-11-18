'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Play, SkipForward, Info, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnergySelector } from './EnergySelector';
import { useFocusCompass, EnergyLevel, RecommendationResult } from '@/src/hooks/useFocusCompass';
import { useFlowModeContext } from '@/src/context/FlowModeContext';
import { FlowStartModal } from '@/src/components/flow/FlowStartModal';
import { cn } from '@/src/lib/utils';

export function FocusCompassWidget() {
  const router = useRouter();
  const {
    getRecommendation,
    startSession,
    updateEnergy,
    isStartingSession,
    isUpdatingEnergy,
    dailyContext,
  } = useFocusCompass();
  const { startFlow, isActive } = useFlowModeContext();

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel>(dailyContext?.energy || 'medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skippedTaskIds, setSkippedTaskIds] = useState<string[]>([]);
  const [flowModalOpen, setFlowModalOpen] = useState(false);

  // Load recommendation when energy changes
  useEffect(() => {
    loadRecommendation();
  }, [energy]);

  // Update energy when daily context changes
  useEffect(() => {
    if (dailyContext?.energy) {
      setEnergy(dailyContext.energy);
    }
  }, [dailyContext]);

  const loadRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendation({
        energy,
        skipTaskIds: skippedTaskIds.length > 0 ? skippedTaskIds : undefined,
        availableMinutes: dailyContext?.availableMinutes,
      });
      setRecommendation(result);
    } catch (err) {
      setError('Failed to load recommendation. Please try again.');
      console.error('Failed to load recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnergyChange = async (newEnergy: EnergyLevel) => {
    setEnergy(newEnergy);
    try {
      await updateEnergy(newEnergy);
    } catch (err) {
      console.error('Failed to update energy:', err);
    }
  };

  const handleStartSession = async () => {
    if (!recommendation?.recommendedTask) return;

    try {
      const session = await startSession({
        taskId: recommendation.recommendedTask.task._id || recommendation.recommendedTask.task.id,
        duration: recommendation.suggestedPomodoroMinutes || 25,
        energy,
      });

      // Navigate to Pomodoro page
      router.push('/pomodoro');
    } catch (err) {
      setError('Failed to start session. Please try again.');
      console.error('Failed to start session:', err);
    }
  };

  const handleSkip = async () => {
    if (!recommendation?.recommendedTask || loading) return;

    const taskId = recommendation.recommendedTask.task._id || recommendation.recommendedTask.task.id;
    setSkippedTaskIds((prev) => [...prev, taskId]);
    await loadRecommendation();
  };

  const handleViewDetails = () => {
    if (!recommendation?.recommendedTask) return;
    const taskId = recommendation.recommendedTask.task._id || recommendation.recommendedTask.task.id;
    router.push(`/?view=inbox&task=${taskId}`);
  };

  if (loading) {
    return (
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent-mint)]" />
          <span className="text-[var(--color-text-muted)]">Loading recommendation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="text-center py-4">
          <p className="text-[var(--color-danger)] text-sm mb-3">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRecommendation}
            className="border-[var(--color-glass-outline)]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!recommendation?.recommendedTask) {
    return (
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="text-center py-6">
          <Sparkles className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            No tasks available
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            No tasks match your current energy and time. Try adjusting your energy level or creating new tasks.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/?view=inbox')}
            className="border-[var(--color-glass-outline)]"
          >
            Create Task
          </Button>
        </div>
      </div>
    );
  }

  const { recommendedTask, suggestedPomodoroMinutes, reason } = recommendation;
  const task = recommendedTask.task;

  return (
    <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-[var(--color-accent-mint)]" />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Focus Compass
        </h3>
      </div>

      {/* Recommended Task */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Next Best Action
          </p>
          <h4 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            {task.title}
          </h4>
          {task.notes && (
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
              {task.notes}
            </p>
          )}
        </div>

        {/* Reason */}
        {reason && (
          <div className="bg-[rgba(94,247,166,0.1)] border border-[var(--color-accent-mint)]/20 rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-accent-mint)] font-medium">
              💡 {reason}
            </p>
          </div>
        )}

        {/* Task Metadata */}
        {recommendedTask.metadata && (
          <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
            {recommendedTask.metadata.durationEstimate && (
              <span className="px-2 py-1 bg-[rgba(255,255,255,0.02)] rounded">
                ⏱️ {recommendedTask.metadata.durationEstimate}m
              </span>
            )}
            {recommendedTask.metadata.difficulty && (
              <span className="px-2 py-1 bg-[rgba(255,255,255,0.02)] rounded capitalize">
                📊 {recommendedTask.metadata.difficulty}
              </span>
            )}
            {recommendedTask.totalScore && (
              <span className="px-2 py-1 bg-[rgba(255,255,255,0.02)] rounded">
                ⭐ {Math.round(recommendedTask.totalScore * 100)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Energy Selector */}
      <div className="pt-2 border-t border-[var(--color-glass-outline)]">
        <EnergySelector
          currentEnergy={energy}
          onEnergyChange={handleEnergyChange}
          disabled={isUpdatingEnergy}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleStartSession}
          disabled={isStartingSession}
          className="flex-1 bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90"
        >
          {isStartingSession ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start {suggestedPomodoroMinutes || 25}m
            </>
          )}
        </Button>
        <Button
          onClick={() => setFlowModalOpen(true)}
          variant="outline"
          className="border-violet-600/30 hover:bg-violet-600/10 text-violet-400"
          disabled={isActive}
        >
          <Zap className="h-4 w-4 mr-2" />
          Flow Mode
        </Button>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={loading}
          className="border-[var(--color-glass-outline)]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SkipForward className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleViewDetails}
          className="border-[var(--color-glass-outline)]"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* Alternatives */}
      {recommendation.alternatives && recommendation.alternatives.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-glass-outline)]">
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
            Alternatives:
          </p>
          <div className="space-y-1">
            {recommendation.alternatives.slice(0, 2).map((alt, index) => (
              <button
                key={alt.task._id || alt.task.id || index}
                onClick={() => {
                  setSkippedTaskIds([]);
                  setRecommendation({
                    ...recommendation,
                    recommendedTask: alt,
                    alternatives: recommendation.alternatives.filter(
                      (a) => (a.task._id || a.task.id) !== (alt.task._id || alt.task.id)
                    ),
                  });
                }}
                className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-sm"
              >
                <span className="text-[var(--color-text-primary)]">{alt.task.title}</span>
                {alt.reason && (
                  <span className="text-xs text-[var(--color-text-muted)] block mt-0.5">
                    {alt.reason}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Flow Mode Modal */}
      <FlowStartModal
        open={flowModalOpen}
        onOpenChange={setFlowModalOpen}
        onStart={async (duration, energyLevel) => {
          await startFlow(duration, energyLevel);
          router.push('/flow');
        }}
        loading={false}
      />
    </div>
  );
}

