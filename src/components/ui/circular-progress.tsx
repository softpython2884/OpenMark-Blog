'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value?: number;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const radius = 48; 
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <svg
        ref={ref}
        width="112"
        height="112"
        viewBox="0 0 112 112"
        className={cn('transform -rotate-90', className)}
        {...props}
      >
        <circle
          className="text-secondary"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          r={radius}
          cx="56"
          cy="56"
        />
        <circle
          className="text-primary transition-all duration-500"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="56"
          cy="56"
        />
      </svg>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
