import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  colorClass?: string;
}

export function Progress({ value, className = '', colorClass = 'bg-accent-primary' }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`w-full bg-card-sec rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${colorClass}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
