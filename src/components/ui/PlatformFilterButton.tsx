import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Platform } from '@/lib/types';
import { getPlatformConfig } from '@/lib/platformIcons';

interface PlatformFilterButtonProps {
  platform: Platform;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export default function PlatformFilterButton({
  platform,
  isSelected,
  onClick,
  count,
  className,
  size = 'md',
  showCount = false
}: PlatformFilterButtonProps) {
  const config = getPlatformConfig(platform);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'h-8 w-8 sm:h-10 sm:w-10 p-0',
    md: 'h-8 w-8 sm:h-10 sm:w-10 p-0'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        'rounded-xl transition-all duration-300 shadow-sm hover:shadow-md relative group focus-ring animate-scale-in hover-lift',
        isSelected
          ? 'bg-orange-100 border-orange-300 text-orange-700 shadow-orange-200'
          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800',
        className
      )}
      aria-label={`${isSelected ? 'Remove' : 'Add'} ${platform} filter${count ? ` (${count} links)` : ''}`}
      aria-pressed={isSelected}
    >
      <IconComponent
        className={cn(
          'transition-all duration-200',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          isSelected ? 'scale-110' : 'group-hover:scale-105 transition-smooth'
        )}
      />
      {showCount && count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
}