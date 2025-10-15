'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface MobileTitleViewProps {
  title: string;
  filteredLinksCount: number;
  currentViewMode: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function MobileTitleView({
  title,
  filteredLinksCount,
  currentViewMode,
  onViewModeChange
}: MobileTitleViewProps) {
  return (
    <div className="mobile-sticky-title-view px-6 pb-2">
      <div className="flex items-center justify-between">
        {/* Platform count */}
        <div className="flex-1 ml-3">
          <p className="text-base text-gray-800 dark:text-gray-200">
            <span className="font-semibold">{title}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2 font-normal">({filteredLinksCount})</span>
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center -ml-6 mt-1">
          <div className="flex items-center p-1 hover-lift transition-smooth">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
              className={`h-7 w-7 p-0 transition-colors ${
                currentViewMode === 'grid' 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Grid view"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange?.('list')}
              className={`h-7 w-7 p-0 transition-colors ${
                currentViewMode === 'list' 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="List view"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}