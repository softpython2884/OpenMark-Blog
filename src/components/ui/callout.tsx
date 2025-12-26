'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  Info,
  AlertTriangle,
  Zap,
  Flame,
  type LucideIcon,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const calloutVariants = cva(
  'my-6 flex items-start gap-4 rounded-lg border p-4',
  {
    variants: {
      variant: {
        note: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950 dark:text-blue-200',
        tip: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-200',
        success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950 dark:text-green-200',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-200',
        danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950 dark:text-red-200',
        question: 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-gray-950 dark:text-gray-200',
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
      success: 'text-green-500',
      warning: 'text-amber-500',
      danger: 'text-red-500',
      question: 'text-gray-500',
    },
  },
  defaultVariants: {
    variant: 'note',
  },
});

type CalloutVariant = VariantProps<typeof calloutVariants>['variant'];

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof calloutVariants> {
  icon?: string;
}

const ICONS: Record<string, LucideIcon> = {
    note: Info,
    info: Info,
    tip: Zap,
    zap: Zap,
    success: CheckCircle,
    checkcircle: CheckCircle,
    warning: AlertTriangle,
    alerttriangle: AlertTriangle,
    danger: Flame,
    flame: Flame,
    question: HelpCircle,
    helpcircle: HelpCircle,
};

function Callout({ children, className, variant, icon, ...props }: CalloutProps) {
  const Icon = icon ? (ICONS[icon] || ICONS[variant as string] || Info) : (ICONS[variant as string] || Info);

  return (
    <div className={cn(calloutVariants({ variant }), className)} {...props}>
      <Icon className={cn(iconVariants({ variant }))} />
      <div className="w-full [&_p]:my-0">{children}</div>
    </div>
  );
}

export { Callout, calloutVariants };
