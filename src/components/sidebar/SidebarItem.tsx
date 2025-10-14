'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  showCount?: boolean;
}

export default function SidebarItem({
  icon,
  label,
  count,
  isActive = false,
  onClick,
  className,
  showCount = true
}: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start rounded-lg transition-all duration-200 hover:shadow-depth-1 cursor-pointer px-3 py-2.5",
        isActive && "bg-accent-50 border-l-4 border-accent-500",
        className
      )}
      style={{
        color: isActive ? 'var(--accent-700)' : 'var(--neutral-700)',
        fontSize: '16px',
        fontWeight: isActive ? '600' : '500'
      }}
      onClick={onClick}
    >
      <span className="mr-3 flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {showCount && count !== undefined && count > 0 && (
        <span className="ml-auto text-sm opacity-60">({count})</span>
      )}
    </Button>
  );
}