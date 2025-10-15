'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  className = ''
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6
        h-16 w-16
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-110
        active:scale-95
        gradient-accent
        md:hidden
        touch-manipulation
        focus-ring
        animate-pulse-slow
        hover-lift
        ${className}
      `}
      style={{
        color: 'white',
        zIndex: 50,
        minHeight: '64px',
        minWidth: '64px'
      }}
      aria-label="Add new link"
      title="Add a new link to your collection"
    >
      <Plus className="h-7 w-7" />
    </Button>
  );
}