'use client';

import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';
import { EnergyLevel } from '@/src/hooks/useFocusCompass';

interface EnergySelectorProps {
  currentEnergy: EnergyLevel;
  onEnergyChange: (energy: EnergyLevel) => void;
  disabled?: boolean;
}

export function EnergySelector({
  currentEnergy,
  onEnergyChange,
  disabled = false,
}: EnergySelectorProps) {
  const energyOptions: Array<{ value: EnergyLevel; label: string; icon: typeof Battery; color: string }> = [
    { value: 'low', label: 'Low', icon: BatteryLow, color: 'text-orange-400' },
    { value: 'medium', label: 'Medium', icon: BatteryMedium, color: 'text-yellow-400' },
    { value: 'high', label: 'High', icon: BatteryFull, color: 'text-green-400' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--color-text-muted)]">Energy:</span>
      <div className="flex gap-2">
        {energyOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentEnergy === option.value;
          
          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => !disabled && onEnergyChange(option.value)}
              disabled={disabled}
              className={cn(
                'h-9 px-3 transition-all',
                isActive
                  ? 'bg-[var(--color-accent-mint)] text-[var(--color-black)] hover:opacity-90'
                  : 'border-[var(--color-glass-outline)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)]',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className={cn('h-4 w-4 mr-1.5', isActive ? 'text-[var(--color-black)]' : option.color)} />
              <span>{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

