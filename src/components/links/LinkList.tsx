'use client';

import Image from 'next/image';
import { ExternalLink, Heart, MoreVertical, Edit, Trash2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PLATFORM_METADATA } from '@/lib/types';
import LinkListSkeleton from '@/components/ui/LinkListSkeleton';
import type { Link as LinkType } from '@/lib/types';
import { getPlatformIcon } from '@/lib/platformIcons';
import { useSidebarSelection } from '@/contexts/SidebarContext';

interface LinkListProps {
  links: LinkType[];
  isLoading?: boolean;
  onEditLink: (link: LinkType) => void;
  onDeleteLink: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenLink: (url: string) => void;
}

export default function LinkList({
  links,
  isLoading = false,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onOpenLink
}: LinkListProps) {
  const { bulkSelectMode, selectedLinkIds, toggleLinkSelection } = useSidebarSelection();
  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24) {
      if (diffHours < 1) {
        const minutes = Math.floor(diffMs / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 2) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px]">
        <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-depth-2" style={{ background: 'linear-gradient(to bottom right, var(--accent-50) 0%, var(--accent-100) 100%)' }}>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-500)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          No links found
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
          Start saving your favorite links! Try adjusting your search or filters, or add some new links to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 pt-12 bg-gray-50 dark:bg-gray-900">
      {/* Compact List */}
      <div className="space-y-3">
        {isLoading ? (
          // Show skeleton loading
          Array.from({ length: 12 }).map((_, index) => (
            <LinkListSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          links.map((link) => {
          const platformMeta = PLATFORM_METADATA[link.platform];

          return (
            <div
              key={link.id}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 ${selectedLinkIds.has(link.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Selection checkbox */}
                {bulkSelectMode && (
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={selectedLinkIds.has(link.id)}
                      onCheckedChange={() => toggleLinkSelection(link.id)}
                    />
                  </div>
                )}
                
                {/* Compact Thumbnail/Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                  {link.thumbnail ? (
                    <Image
                      src={link.thumbnail}
                      alt={link.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-lg ${link.thumbnail ? 'hidden' : ''}`}>
                    {platformMeta.icon}
                  </div>
                </div>

                {/* Compact Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1 flex-1 text-gray-900 dark:text-gray-100">
                      {link.title}
                    </h3>

                    {/* Compact Platform Icon */}
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600 flex-shrink-0">
                      {getPlatformIcon(link.platform, 'h-3 w-3 text-blue-600 dark:text-blue-400')}
                    </div>
                  </div>

                  {/* Compact Description and Tags Row */}
                  <div className="flex items-center justify-between gap-2">
                    {link.description && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1 flex-1">
                        {link.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {link.tags.length > 0 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          #{link.tags[0]}
                        </Badge>
                      )}
                      {link.isFavorite && (
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(link.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenLink(link.url)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleLinkSelection(link.id)} className="text-xs">
                        <CheckSquare className="h-3 w-3 mr-2" />
                        {selectedLinkIds.has(link.id) ? 'Deselect' : 'Select'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditLink(link)} className="text-xs">
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleFavorite(link.id)} className="text-xs">
                        <Heart className={`h-3 w-3 mr-2 ${link.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {link.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteLink(link.id)}
                        className="text-red-600 focus:text-red-600 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
}