import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

export interface AIAlertProps {
  variant?: 'info' | 'warning' | 'danger';
  title: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const alertVariants = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-600',
    IconComponent: Info,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    icon: 'text-yellow-600',
    IconComponent: AlertTriangle,
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-600',
    IconComponent: AlertTriangle,
  },
};

export function AIAlert({ 
  variant = 'info', 
  title, 
  children, 
  action,
  onDismiss,
  className 
}: AIAlertProps) {
  const { container, icon, IconComponent } = alertVariants[variant];

  return (
    <div
      className={cn(
        'relative rounded-md border p-4',
        container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('h-5 w-5 flex-shrink-0 mt-0.5', icon)} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium mb-1">{title}</h3>
          <div className="text-sm opacity-90">{children}</div>
          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant={variant === 'danger' ? 'destructive' : 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}