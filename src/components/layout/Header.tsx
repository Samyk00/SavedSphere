'use client';

import { Settings, Plus, Menu, Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  isMobile?: boolean;
  onSettingsClick: () => void;
  onAddLinkClick: () => void;
  onMobileSidebarToggle?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFilterClick?: () => void;
}

export default function Header({ 
  isMobile = false, 
  onSettingsClick, 
  onAddLinkClick,
  onMobileSidebarToggle,
  searchQuery = '',
  onSearchChange,
  onFilterClick
}: HeaderProps) {
  return (
    <header className={`h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white ${isMobile ? 'mobile-header mobile-safe-area-top' : ''}`}>
      {/* Left side */}
      <div className="flex items-center space-x-3">
        {/* Mobile sidebar toggle button */}
        {isMobile && onMobileSidebarToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileSidebarToggle}
            className="h-8 w-8 p-0"
            style={{ color: 'var(--accent-600)' }}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Center - Search input (mobile only) */}
      {isMobile && onSearchChange && (
        <div className="flex-1 max-w-none mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-16 h-9 text-xs rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 bg-gray-50"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {onFilterClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFilterClick}
                  className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                >
                  <Filter className="h-3 w-3 text-gray-500" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {/* Hide Add Link buttons on mobile - FAB will handle this */}
        <Button
          onClick={onAddLinkClick}
          className={`hidden sm:flex text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 hover:scale-105 ${isMobile ? 'mobile-hide-add-button' : ''}`}
          style={{ backgroundColor: 'var(--accent-500)' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>

        <Button
          onClick={onAddLinkClick}
          size="sm"
          className={`sm:hidden text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 hover:scale-105 ${isMobile ? 'mobile-hide-add-button' : ''}`}
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