'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value?: number;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const radius = 42; // Adjusted radius
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <svg
        ref={ref}
        width="90"  // Adjusted size
        height="90" // Adjusted size
        viewBox="0 0 90 90" // Adjusted viewBox
        className={cn('transform -rotate-90', className)}
        {...props}
      >
        <circle
          className="text-secondary"
          stroke="currentColor"
          strokeWidth="6" // Adjusted stroke width
          fill="transparent"
          r={radius}
          cx="45" // Centered
          cy="45" // Centered
        />
        <circle
          className="text-primary transition-all duration-500"
          stroke="currentColor"
          strokeWidth="6" // Adjusted stroke width
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="45" // Centered
          cy="45" // Centered
        />
      </svg>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
