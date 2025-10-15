import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2 } from 'lucide-react';
import { PLATFORM_ICONS } from '@/lib/platformIcons';
import { useToast } from '@/components/ui/toast';

interface DeletedLinkCardProps {
  link: Link;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export default function DeletedLinkCard({ link, onRestore, onPermanentDelete }: DeletedLinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { addToast } = useToast();

  const platformConfig = PLATFORM_ICONS[link.platform] || PLATFORM_ICONS.other;

  const handleRestore = () => {
    onRestore(link.id);
    addToast({
      type: 'success',
      title: 'Link Restored',
      description: `"${link.title}" has been restored`
    });
  };

  const handlePermanentDelete = () => {
    if (confirm('Are you sure you want to permanently delete this link? This action cannot be undone.')) {
      onPermanentDelete(link.id);
      addToast({
        type: 'success',
        title: 'Link Permanently Deleted',
        description: `"${link.title}" has been permanently deleted`
      });
    }
  };

  const formatDeletedDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-depth-1 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-depth-2"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Deleted overlay */}
      <div className="absolute inset-0 bg-gray-900/20 z-10 pointer-events-none" />
      
      {/* Card content with reduced opacity */}
      <div className="opacity-60 p-4">
        {/* Thumbnail */}
        <div className="relative w-full h-32 mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {!imageError && link.thumbnail ? (
            <Image
              src={link.thumbnail}
              alt={link.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <platformConfig.icon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2 text-gray-900 dark:text-white">
              {link.title}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {platformConfig.name}
            </span>
          </div>

          {link.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {link.description}
            </p>
          )}

          {/* Tags */}
          {link.tags && link.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {link.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {link.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{link.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Deleted timestamp */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Deleted {link.deletedAt ? formatDeletedDate(link.deletedAt) : 'Unknown'}
            </span>
            {link.folderId && (
              <span className="text-xs opacity-60">
                From folder
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons overlay */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleRestore}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handlePermanentDelete}
            className="shadow-lg"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}