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
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-depth-3 hover:shadow-depth-3-hover transition-all duration-300 hover:scale-110 animate-pulse-slow gradient-accent ${className}`}
      style={{
        color: 'white',
        zIndex: 50
      }}
      aria-label="Add new link"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}