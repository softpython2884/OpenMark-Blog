'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  Info,
  AlertTriangle,
  Zap,
  Flame,
  type LucideIcon,
  Activity,
  AlarmClock,
  Album,
  Angry,
  Annoyed,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const calloutVariants = cva(
  'my-6 flex items-start gap-4 rounded-lg border p-4',
  {
    variants: {
      variant: {
        note: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950 dark:text-blue-200',
        tip: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-200',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-200',
        danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'note',
    },
  }
);

const iconVariants = cva('mt-1 h-5 w-5 shrink-0', {
  variants: {
    variant: {
      note: 'text-blue-500',
      tip: 'text-emerald-500',
      warning: 'text-amber-500',
      danger: 'text-red-500',
    },
  },
  defaultVariants: {
    variant: 'note',
  },
});

type CalloutVariant = VariantProps<typeof calloutVariants>['variant'];

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof calloutVariants> {
  icon?: string;
}

const ICONS: Record<string, LucideIcon> = {
    info: Info,
    tip: Zap,
    warning: AlertTriangle,
    danger: Flame,
    activity: Activity,
    alarm: AlarmClock,
    album: Album,
    angry: Angry,
    annoyed: Annoyed,
    zap: Zap,
    flame: Flame,
    alerttriangle: AlertTriangle,
};

function Callout({ children, className, variant, icon, ...props }: CalloutProps) {
  const Icon = icon ? (ICONS[icon] || ICONS[variant as string] || Info) : Info;

  return (
    <div className={cn(calloutVariants({ variant }), className)} {...props}>
      <Icon className={cn(iconVariants({ variant }))} />
      <div className="w-full prose-p:my-0 prose-headings:my-0">{children}</div>
    </div>
  );
}

export { Callout, calloutVariants };
