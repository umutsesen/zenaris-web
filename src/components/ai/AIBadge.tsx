import React from 'react';
import { cn } from '../ui/utils';

export interface AIBadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'info' | 'warning' | 'danger' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

const badgeVariants = {
  neutral: 'bg-secondary text-secondary-foreground border-border',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function AIBadge({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  className 
}: AIBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}