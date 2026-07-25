import React from 'react';

interface GaugeProps {
  value: number; // Score from 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function Gauge({ value, size = 180, strokeWidth = 10, label = 'Health Score' }: GaugeProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  // Calculate dynamic mock previous score for display consistency
  const lastMonth = clampedValue >= 50 
    ? Math.max(clampedValue - 8, 30) 
    : Math.min(clampedValue + 6, 95);
  
  const diff = clampedValue - lastMonth;
  const isUp = diff >= 0;
  
  // 240-degree radial arc math
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (clampedValue / 100) * arcLength;

  // Theme color maps
  let strokeColor = 'stroke-accent-danger';
  if (clampedValue >= 75) {
    strokeColor = 'stroke-accent-success';
  } else if (clampedValue >= 50) {
    strokeColor = 'stroke-accent-primary';
  } else if (clampedValue >= 30) {
    strokeColor = 'stroke-accent-warning';
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Radial arc gauge wrapper */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.8 }}>
        <svg 
          className="transform rotate-[150deg]" 
          width={size} 
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Base gray path */}
          <circle
            className="text-border-color"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active progress path */}
          <circle
            className={`transition-all duration-1000 ease-out ${strokeColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        
        {/* Core text overlay */}
        <div className="absolute top-[35%] flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-text-primary">
            {clampedValue}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary mt-1">
            {label}
          </span>
        </div>
      </div>

      {/* Dynamic delta logs */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card-sec rounded-xl border border-border-color text-xs text-text-secondary font-medium mt-1">
        <div>
          <span className="text-[10px] text-text-secondary">Last Month</span>
          <span className="block text-sm font-semibold text-text-primary mt-0.5">{lastMonth}</span>
        </div>
        <div className="w-[1px] h-6 bg-border-color" />
        <div>
          <span className="text-[10px] text-text-secondary">Current</span>
          <span className="block text-sm font-semibold text-text-primary mt-0.5">{clampedValue}</span>
        </div>
        <div className="w-[1px] h-6 bg-border-color" />
        <div>
          <span className="text-[10px] text-text-secondary">Trend</span>
          <span className={`block text-sm font-semibold mt-0.5 ${isUp ? 'text-accent-success' : 'text-accent-danger'}`}>
            {isUp ? `↑ +${diff}` : `↓ ${diff}`}
          </span>
        </div>
      </div>
    </div>
  );
}
