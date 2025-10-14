'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import { Star, MoreVertical, Edit2, Trash2, Copy, Check, CheckSquare } from 'lucide-react';
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
import { PLATFORM_METADATA, EXTENDED_PLATFORM_METADATA, ExtendedPlatform } from '@/lib/types';
import { getPlatformIcon } from '@/lib/platformIcons';

interface LinkCardProps {
  link: {
    id: string;
    title: string;
    url: string;
    description?: string;
    thumbnail?: string;
    tags?: string[];
    isFavorite: boolean;
    duration?: string;
    createdAt: Date | string;
    folderId?: string;
  };
  onEdit: (link: LinkCardProps['link']) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenLink: (url: string) => void;
  // Search highlighting props
  highlightedTitle?: React.ReactNode;
  highlightedDescription?: React.ReactNode;
  highlightedUrl?: React.ReactNode;
  highlightedTags?: React.ReactNode[];
  viewMode?: 'grid' | 'list';
  // Folder information for visual indication
  folderName?: string;
  showFolderOrigin?: boolean;
  // Selection props for bulk operations
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showSelectCheckbox?: boolean;
  onEnterBulkMode?: () => void;
}

const LinkCard = memo(function LinkCard({
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenLink,
  highlightedTitle,
  highlightedDescription,
  highlightedTags,
  folderName,
  showFolderOrigin = false,
  isSelected = false,
  onToggleSelect,
  showSelectCheckbox = false,
  onEnterBulkMode
}: LinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Detect platform from URL
  const detectPlatform = (url: string): string => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      for (const [platform, metadata] of Object.entries(PLATFORM_METADATA)) {
        if (metadata.domainRegex.test(domain)) {
          return platform;
        }
      }
    } catch {
      // Invalid URL
    }
    return 'other';
  };

  const platform = detectPlatform(link.url);
  const platformMeta = EXTENDED_PLATFORM_METADATA[platform as ExtendedPlatform] || PLATFORM_METADATA[platform as keyof typeof PLATFORM_METADATA];

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onOpenLink(link.url);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Silently handle clipboard failures - not critical
    }
  };

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
    } else if (diffDays < 14) {
      return '1w ago';
    } else {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-md cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail - Absolutely no space at top */}
      <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-t-lg overflow-hidden">
        {link.thumbnail && !imageError ? (
          <>
            <Image
              src={link.thumbnail}
              alt={link.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            {/* Video preview overlay on hover */}
            {isHovered && (platform === 'youtube' || platform === 'tiktok' || platform === 'instagram') && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300">
                <div className="bg-black/80 rounded-full p-3 animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : link.thumbnail === 'loading' ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-2xl opacity-60">{platformMeta.icon}</div>
          </div>
        )}

        {/* Selection checkbox overlaid on top-left */}
        {showSelectCheckbox && (
          <div
            className="absolute top-2 left-2 z-20"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(link.id);
            }}
          >
            <Checkbox
              checked={isSelected}
              className="h-5 w-5 bg-white border-2 border-gray-300 shadow-lg"
            />
          </div>
        )}

        {/* Favorite star button overlaid on top-left */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(link.id);
          }}
          className={`absolute top-2 h-8 w-8 p-0 shadow-depth-2 transition-all duration-200 hover:shadow-depth-3 rounded-full z-10 ${
            showSelectCheckbox ? 'left-10' : 'left-2'
          }`}
          style={{ backgroundColor: 'var(--neutral-50)', color: link.isFavorite ? 'var(--warning)' : 'var(--neutral-600)' }}
        >
          <Star className={`h-4 w-4 ${link.isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Three-dot menu button overlaid on top-right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/40 hover:bg-black/60 transition-all duration-200 rounded-full z-10"
              style={{ color: 'white' }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {/* Show Select option when not in bulk mode, or Deselect when in bulk mode and selected */}
            {(!showSelectCheckbox || (showSelectCheckbox && isSelected)) && (
              <>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showSelectCheckbox && onEnterBulkMode) {
                      // Enter bulk mode and select this item
                      onEnterBulkMode();
                      onToggleSelect?.(link.id);
                    } else if (showSelectCheckbox && onToggleSelect) {
                      // Already in bulk mode, just toggle selection
                      onToggleSelect(link.id);
                    }
                  }}
                  className="text-sm"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {showSelectCheckbox && isSelected ? 'Deselect' : 'Select'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleCopyUrl();
              }}
              className="text-sm"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(link);
              }}
              className="text-sm"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(link.id);
              }}
              className="text-red-600 focus:text-red-600 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Duration badge on bottom-left for videos/shorts */}
        {link.duration && (platform === 'youtube' || platform === 'tiktok' || platform === 'instagram') && (
          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono z-10">
            {link.duration}
          </div>
        )}
      </div>

      {/* Compact content - organized efficiently */}
      <div className="p-3 space-y-2 bg-white dark:bg-gray-800">
        {/* Folder origin badge */}
        {showFolderOrigin && folderName && (
          <div className="flex items-center">
            <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
              📁 {folderName}
            </Badge>
          </div>
        )}
        
        {/* Title - directly below thumbnail */}
        <h3 className="font-semibold text-sm line-clamp-1 leading-tight text-gray-900 dark:text-gray-100">
          {highlightedTitle || link.title}
        </h3>

        {/* Compact description and tag row */}
        <div className="flex items-center justify-between gap-2 min-h-[1rem]">
          {link.description && (
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1 flex-1">
              {highlightedDescription || link.description}
            </p>
          )}
          {link.tags && link.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-1 shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {(highlightedTags && highlightedTags[0]) || link.tags[0]}
            </Badge>
          )}
        </div>

        {/* Compact footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {formatTimestamp(link.createdAt)}
          </span>

          {/* Platform icon at bottom right */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-gray-600">
            {getPlatformIcon(platform, 'h-4 w-4 text-blue-600 dark:text-blue-400')}
          </div>

        </div>
      </div>
    </div>
  );
});

export default LinkCard;