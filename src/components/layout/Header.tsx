'use client';

import { Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  title?: string;
  onSettingsClick: () => void;
  onAddLinkClick: () => void;
}

export default function Header({ title = "All Links", onSettingsClick, onAddLinkClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
      {/* Page Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--neutral-800)' }}>
          {title}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={onAddLinkClick}
          className="hidden sm:flex text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: 'var(--accent-500)' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>

        <Button
          onClick={onAddLinkClick}
          size="sm"
          className="sm:hidden text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: 'var(--accent-500)' }}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="transition-all duration-200 hover:shadow-depth-1"
          style={{ color: 'var(--neutral-600)' }}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Avatar className="h-8 w-8 shadow-depth-2 ring-2" style={{ '--tw-ring-color': 'var(--accent-200)' } as React.CSSProperties}>
          <AvatarFallback className="font-medium shadow-depth-1" style={{ backgroundColor: 'var(--secondary-100)', color: 'var(--secondary-800)' }}>
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}