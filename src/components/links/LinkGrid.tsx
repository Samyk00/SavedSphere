'use client';

import React from 'react';
import Image from 'next/image';
import LinkCard from './LinkCard';
import LinkCardSkeleton from '@/components/ui/LinkCardSkeleton';
import type { Link as LinkType, Folder } from '@/lib/types';

import { useSidebarSelection } from '@/contexts/SidebarContext';

interface LinkGridProps {
  links: LinkType[];
  isLoading?: boolean;
  onEditLink: (link: LinkType) => void;
  onDeleteLink: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenLink: (url: string) => void;
  folders?: Folder[];
  selectedFolderId?: string;
}

export default function LinkGrid({
  links,
  isLoading = false,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onOpenLink,
  folders = [],
  selectedFolderId
}: LinkGridProps) {
  const { bulkSelectMode, selectedLinkIds, toggleLinkSelection, toggleBulkSelect } = useSidebarSelection();
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px]">
        <div className="w-64 h-64 mb-8 flex items-center justify-center relative">
          <Image
            src="/Emptystate.svg"
            alt="No links found"
            fill
            className="object-contain"
          />
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
    <div className="p-6 bg-white">
      {/* Results count - hidden since it's now shown in SearchBar */}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {isLoading ? (
          // Show skeleton loading
          Array.from({ length: 12 }).map((_, index) => (
            <LinkCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          links.map((link) => {
            // Find the folder this link belongs to
            const linkFolder = folders.find(f => f.id === link.folderId);
            
            // Show folder origin if we're viewing a platform folder and the link is from a sub-folder
            const selectedFolder = folders.find(f => f.id === selectedFolderId);
            const showFolderOrigin = selectedFolder?.isPlatformFolder &&
                                   linkFolder &&
                                   linkFolder.id !== selectedFolderId;
            
            return (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={(link) => onEditLink(link as LinkType)}
                onDelete={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
                onOpenLink={onOpenLink}
                folderName={showFolderOrigin ? linkFolder?.name : undefined}
                showFolderOrigin={showFolderOrigin}
                isSelected={selectedLinkIds.has(link.id)}
                onToggleSelect={toggleLinkSelection}
                showSelectCheckbox={bulkSelectMode}
                onEnterBulkMode={toggleBulkSelect}
              />
            );
          })
        )}
      </div>
    </div>
  );
}