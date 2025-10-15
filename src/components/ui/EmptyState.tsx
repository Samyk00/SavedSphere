import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-20'
  };

  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center max-w-md mx-auto',
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn(
          'rounded-full flex items-center justify-center mb-6 shadow-depth-2',
          iconSizes[size],
          'bg-gradient-to-br from-orange-50 to-orange-100'
        )} style={{ color: 'var(--accent-500)' }}>
          {icon}
        </div>
      )}

      <h3 className={cn(
        'font-bold text-gray-900 dark:text-white mb-3',
        titleSizes[size]
      )}>
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 hover:scale-105"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}