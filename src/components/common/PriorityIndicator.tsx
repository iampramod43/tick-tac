'use client';

import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';

interface PriorityIndicatorProps {
  priority: 1 | 2 | 3 | 4;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityIndicator({ 
  priority, 
  showLabel = false,
  size = 'md' 
}: PriorityIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn('rounded-full', sizeClasses[size])}
        style={{ backgroundColor: PRIORITY_COLORS[priority] }}
        title={PRIORITY_LABELS[priority]}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {PRIORITY_LABELS[priority]}
        </span>
      )}
    </div>
  );
}

