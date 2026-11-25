"use client";

import React from "react";

interface ReputationGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ReputationGauge({
  score,
  size = 180,
  strokeWidth = 14,
  showLabel = true,
}: ReputationGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Score is 0 - 1000
  const normalized = Math.min(1000, Math.max(0, score));
  const progress = (normalized / 1000) * circumference;
  const dashoffset = circumference - progress;

  // Determine stroke color
  let strokeColor = "#EF4444"; // Red (Critical)
  if (normalized >= 800) strokeColor = "#06B6D4"; // Cyan/Excellent
  else if (normalized >= 600) strokeColor = "#10B981"; // Emerald/Low
  else if (normalized >= 400) strokeColor = "#EAB308"; // Amber/Moderate
  else if (normalized >= 200) strokeColor = "#F97316"; // Orange/High

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {normalized}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 -mt-0.5">
            / 1000
          </span>
        </div>
      )}
    </div>
  );
}
