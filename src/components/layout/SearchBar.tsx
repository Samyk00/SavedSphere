'use client';

import React from 'react';
import { Search, X, Filter, Hash, Calendar, Globe, Youtube, Instagram, Facebook, Linkedin, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import type { Platform } from '@/lib/types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  selectedPlatforms: string[];
  selectedDateFilter?: string;
  availableTags: Array<{ id: string; name: string; usageCount: number }>;
  availablePlatforms: Array<{ id: string; name: string; icon: string; count?: number }>;
  filteredLinksCount?: number;
  currentViewMode?: 'grid' | 'list';
  title?: string;
  onTagToggle: (tagId: string) => void;
  onPlatformToggle: (platformId: string) => void;
  onDateFilterChange?: (dateFilter: string) => void;
  onClearFilters: () => void;
  onPlatformQuickFilter?: (platform: Platform) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedTags,
  selectedPlatforms,
  selectedDateFilter,
  availableTags,
  availablePlatforms,
  filteredLinksCount = 0,
  currentViewMode = 'grid',
  title = 'All Links',
  onTagToggle,
  onPlatformToggle,
  onDateFilterChange,
  onClearFilters,
  onPlatformQuickFilter,
  onViewModeChange
}: SearchBarProps) {
  const activeFiltersCount = selectedTags.length + selectedPlatforms.length;

  return (
    <div className="relative bg-white px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Left side - Platform quick filters horizontal */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlatformQuickFilter?.('youtube')}
              className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                selectedPlatforms.includes('youtube') 
                  ? 'bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-300 shadow-red-200/50' 
                  : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
              title="Filter by YouTube"
            >
              <Youtube className={`h-5 w-5 transition-all duration-200 ${
                selectedPlatforms.includes('youtube') ? 'text-red-600 scale-110' : 'text-red-500'
              }`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlatformQuickFilter?.('instagram')}
              className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                selectedPlatforms.includes('instagram') 
                  ? 'bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-2 border-pink-300 shadow-pink-200/50' 
                  : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
              title="Filter by Instagram"
            >
              <Instagram className={`h-5 w-5 transition-all duration-200 ${
                selectedPlatforms.includes('instagram') ? 'text-pink-600 scale-110' : 'text-pink-500'
              }`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlatformQuickFilter?.('facebook')}
              className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                selectedPlatforms.includes('facebook') 
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 shadow-blue-200/50' 
                  : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
              title="Filter by Facebook"
            >
              <Facebook className={`h-5 w-5 transition-all duration-200 ${
                selectedPlatforms.includes('facebook') ? 'text-blue-600 scale-110' : 'text-blue-500'
              }`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlatformQuickFilter?.('linkedin')}
              className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                selectedPlatforms.includes('linkedin') 
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-400 shadow-blue-200/50' 
                  : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
              title="Filter by LinkedIn"
            >
              <Linkedin className={`h-5 w-5 transition-all duration-200 ${
                selectedPlatforms.includes('linkedin') ? 'text-blue-700 scale-110' : 'text-blue-600'
              }`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlatformQuickFilter?.('reddit')}
              className={`h-10 w-10 p-0 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                selectedPlatforms.includes('reddit') 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-300 shadow-orange-200/50' 
                  : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
              title="Filter by Reddit"
            >
              <MessageSquare className={`h-5 w-5 transition-all duration-200 ${
                selectedPlatforms.includes('reddit') ? 'text-orange-600 scale-110' : 'text-orange-500'
              }`} />
            </Button>
            
            {selectedPlatforms.length > 0 && (
              <div className="h-6 w-px bg-gray-300 mx-1"></div>
            )}
            
            {selectedPlatforms.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-6 px-2 sm:h-8 sm:px-3 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-200"
                title="Clear all platform filters"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Search input and Filter dropdown */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Search input for desktop only */}
          <div className="hidden sm:block">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 h-10 text-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 bg-gray-50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        <DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-10 w-10 p-0 rounded-lg transition-all duration-200 hover:shadow-depth-1"
            style={{ color: 'var(--accent-600)' }}
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full shadow-depth-2"
                style={{ backgroundColor: 'var(--accent-500)', color: 'white' }}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Tags Section */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center text-xs">
                <Hash className="h-3 w-3 mr-2" />
                Tags
              </DropdownMenuLabel>
              {availableTags.slice(0, 8).map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => onTagToggle(tag.id)}
                  className="text-sm"
                >
                  <span className="truncate">#{tag.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {tag.usageCount}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Platforms Section */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center text-xs">
                <Globe className="h-3 w-3 mr-2" />
                Platforms
              </DropdownMenuLabel>
              {availablePlatforms.map((platform) => (
                <DropdownMenuCheckboxItem
                  key={platform.id}
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={() => onPlatformToggle(platform.id)}
                  className="text-sm"
                >
                  <span className="mr-2">{platform.icon}</span>
                  <span className="truncate">{platform.name}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Date Section */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center text-xs">
                <Calendar className="h-3 w-3 mr-2" />
                Date Added
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === 'today'}
                onCheckedChange={() => onDateFilterChange?.('today')}
                className="text-sm"
              >
                Today
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === 'week'}
                onCheckedChange={() => onDateFilterChange?.('week')}
                className="text-sm"
              >
                This Week
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === 'month'}
                onCheckedChange={() => onDateFilterChange?.('month')}
                className="text-sm"
              >
                This Month
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedDateFilter === 'year'}
                onCheckedChange={() => onDateFilterChange?.('year')}
                className="text-sm"
              >
                This Year
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>

            {activeFiltersCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onClearFilters}
                  className="text-red-600 focus:text-red-600"
                >
                  Clear all filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>



        {/* Title and results count - positioned slightly to the right - hidden on desktop when searching */}
        <div className={`absolute top-full left-6 mt-3 z-10 ${searchQuery && !title?.includes('All Links') && !title?.includes('Favorites') && !title?.includes('Trash') && !title?.includes('Folder') ? 'sm:hidden' : ''}`}>
          <p className="text-base text-gray-800">
            <span className="font-semibold">{title}</span>
            <span className="text-gray-500 ml-2 font-normal">({filteredLinksCount})</span>
          </p>
        </div>

        {/* View toggle buttons - positioned slightly left of right */}
        <div className="absolute top-full right-4 mt-2 z-10">
          <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
              className={`h-7 w-7 p-0 transition-colors ${currentViewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
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
              className={`h-7 w-7 p-0 transition-colors ${currentViewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
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