'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnergySelector } from './EnergySelector';
import { useFocusCompass, EnergyLevel, DailyPlan } from '@/src/hooks/useFocusCompass';
import { cn } from '@/src/lib/utils';

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

export function DailyPlanView() {
  const { getDailyPlan, updateEnergy, isUpdatingEnergy, dailyContext } = useFocusCompass();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel>(dailyContext?.energy || 'medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlan();
  }, [energy]);

  useEffect(() => {
    if (dailyContext?.energy) {
      setEnergy(dailyContext.energy);
    }
  }, [dailyContext]);

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDailyPlan({
        energy,
        availableMinutes: dailyContext?.availableMinutes,
      });
      setPlan(result);
    } catch (err) {
      setError('Failed to load daily plan. Please try again.');
      console.error('Failed to load plan:', err);
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

  if (loading) {
    return (
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent-mint)]" />
          <span className="text-[var(--color-text-muted)]">Generating your daily plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="text-center py-6">
          <p className="text-[var(--color-danger)] text-sm mb-3">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPlan}
            className="border-[var(--color-glass-outline)]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!plan || plan.tasks.length === 0) {
    return (
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="text-center py-6">
          <Calendar className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            No plan available
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            No tasks available for planning. Try creating some tasks first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--color-accent-mint)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Today's Focus Plan
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPlan}
            className="border-[var(--color-glass-outline)]"
          >
            Refresh
          </Button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Estimated Time: <span className="font-semibold text-[var(--color-text-primary)]">
                {formatMinutes(plan.estimatedTotalTime)}
              </span>
            </span>
          </div>
        </div>

        {/* Energy Selector */}
        <div className="pt-4 border-t border-[var(--color-glass-outline)]">
          <EnergySelector
            currentEnergy={energy}
            onEnergyChange={handleEnergyChange}
            disabled={isUpdatingEnergy}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Recommended Sequence
        </h3>
        <div className="space-y-3">
          {plan.tasks.map((item, index) => {
            const task = item.task;
            const duration = item.metadata?.durationEstimate || 30;
            const energyRequired = item.metadata?.energyRequired || 'medium';
            
            return (
              <div
                key={task._id || task.id || index}
                className="flex items-start gap-4 p-4 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-outline)] hover:border-[var(--color-accent-mint)]/30 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent-mint)]/20 flex items-center justify-center text-[var(--color-accent-mint)] font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--color-text-primary)] mb-1">
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                      {task.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duration}m
                    </span>
                    <span className="capitalize">
                      {energyRequired} energy
                    </span>
                    {item.totalScore && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {Math.round(item.totalScore * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Distribution */}
      {plan.energyDistribution && (
        <div className="glass-1 border border-[var(--color-glass-outline)] rounded-[var(--radius-md)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Energy Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-sm text-[var(--color-text-primary)]">Low Energy</span>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {plan.energyDistribution.low} tasks
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm text-[var(--color-text-primary)]">Medium Energy</span>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {plan.energyDistribution.medium} tasks
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-[var(--color-text-primary)]">High Energy</span>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {plan.energyDistribution.high} tasks
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

