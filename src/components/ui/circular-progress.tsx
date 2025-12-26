'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value?: number;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <svg
        ref={ref}
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className={cn('transform -rotate-90', className)}
        {...props}
      >
        <circle
          className="text-secondary"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className="text-primary transition-all duration-500"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
