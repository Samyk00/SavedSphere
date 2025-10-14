'use client';

import { useState, useEffect } from 'react';
import { Edit, Link as LinkIcon, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { PLATFORM_METADATA } from '@/lib/types';
import type { Link, LinkFormData, Folder as FolderType, Platform } from '@/lib/types';
import { getPlatformIcon } from '@/lib/platform-utils';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LinkFormData) => void;
  link: Link | null;
  folders: FolderType[];
  availableTags: string[];
}

export default function EditLinkModal({
  isOpen,
  onClose,
  onSave,
  link,
  folders,
  availableTags
}: EditLinkModalProps) {
  const [formData, setFormData] = useState<LinkFormData>({
    url: '',
    title: '',
    description: '',
    tags: [],
    folderId: undefined,
    isFavorite: false,
  });

  const [detectedPlatform, setDetectedPlatform] = useState<Platform>('other');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Populate form when link changes
  useEffect(() => {
    if (link && isOpen) {
      setFormData({
        url: link.url,
        title: link.title,
        description: link.description || '',
        tags: [...link.tags],
        folderId: link.folderId,
        isFavorite: link.isFavorite,
      });
      setDetectedPlatform(link.platform);
    }
  }, [link, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        url: '',
        title: '',
        description: '',
        tags: [],
        folderId: undefined,
        isFavorite: false,
      });
      setDetectedPlatform('other');
      setTagInput('');
    }
  }, [isOpen]);

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (formData.url) {
      const platform = detectPlatform(formData.url);
      setDetectedPlatform(platform);
    }
  }, [formData.url]);

  const detectPlatform = (url: string): Platform => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      for (const [platform, metadata] of Object.entries(PLATFORM_METADATA) as [Platform, typeof PLATFORM_METADATA[Platform]][]) {
        if (metadata.domainRegex.test(domain)) {
          return platform;
        }
      }
    } catch {
      // Invalid URL, keep as other
    }
    return 'other';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url.trim() || !formData.title.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please provide both URL and title for the link.'
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      addToast({
        type: 'success',
        title: 'Link Updated',
        description: 'Your link has been updated successfully!'
      });
      onClose();
    } catch (error) {
      console.error('Error updating link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update link';
      
      // Check if it's a duplicate link error
      if (errorMessage.includes('Link already exists')) {
        addToast({
          type: 'warning',
          title: 'Link Already Exists',
          description: 'This link has already been saved to your collection.'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const platformMeta = PLATFORM_METADATA[detectedPlatform];

  if (!link) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto mobile-modal edit-link-modal p-0">
        <div className="mobile-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between sm:p-6 sm:pb-4 p-3 pb-2 mobile-modal-header border-b border-border/10">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Edit className="h-5 w-5 text-orange-500" />
            Edit Link
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogDescription className="sm:px-6 sm:pb-4 px-3 pb-2 text-sm text-gray-600">
          Update the details of your saved link.
        </DialogDescription>

        <div className="sm:px-6 px-3">
          <form onSubmit={handleSubmit} className="sm:space-y-6 space-y-2">
            {/* URL Input */}
            <div className="sm:space-y-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="url" className="text-sm font-medium">
                URL *
              </label>
              {formData.url && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: platformMeta.color }}
                  >
                    {(() => {
                      const IconComponent = getPlatformIcon(detectedPlatform);
                      return <IconComponent className="w-2.5 h-2.5 text-white" />;
                    })()}
                  </div>
                  <span className="font-medium">{platformMeta.name}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="sm:pl-10 pl-12"
                required
              />
            </div>
          </div>

          {/* Title Input */}
          <div className="sm:space-y-2 space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description Input */}
          <div className="sm:space-y-2 space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add a note or description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Folder Selection */}
          <div className="sm:space-y-2 space-y-1.5">
            <label htmlFor="folder" className="text-sm font-medium">
              Folder
            </label>
            <Select
              value={formData.folderId || ''}
              onValueChange={(value: string) => setFormData(prev => ({
                ...prev,
                folderId: value === 'none' ? undefined : value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Input */}
          <div className="sm:space-y-2 space-y-1.5">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <div className="sm:space-y-2 space-y-1.5">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="sm:pl-10 pl-12"
                />
              </div>

              {/* Tag Suggestions */}
              {tagInput && availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md">
                  {availableTags
                    .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(tag))
                    .slice(0, 5)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => addTag(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                </div>
              )}

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="favorite" className="text-sm font-medium">
              Mark as favorite
            </label>
          </div>

            <DialogFooter className="sm:pt-6 sm:px-6 sm:pb-6 pt-4 px-4 pb-4 border-t border-gray-100 mobile-modal-footer">
              <div className="flex gap-3 w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 h-12 mobile-modal-button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.url.trim() || !formData.title.trim()} 
                  className="flex-[2] h-12 mobile-modal-button bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
         </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}