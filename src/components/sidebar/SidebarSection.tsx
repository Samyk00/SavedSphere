'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  title?: string | ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <div className={cn("mb-4", className)}>
      {title && (
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--accent-600)' }}>
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}