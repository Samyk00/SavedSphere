'use client';

import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLATFORM_METADATA } from '@/lib/types';
import type { LinkFormData, Folder as FolderType, Platform } from '@/lib/types';
import { useToast } from '@/components/ui/toast';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LinkFormData) => void;
  folders: FolderType[];
  availableTags: string[];
}

export default function AddLinkModal({
  isOpen,
  onClose,
  onSave,
  folders,
  availableTags
}: AddLinkModalProps) {
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
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
        title: 'Link Added',
        description: 'Your link has been saved successfully!'
      });
      onClose();
    } catch (error) {
      console.error('Error saving link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save link';
      addToast({
        type: 'error',
        title: 'Duplicate Link',
        description: errorMessage
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Link
          </DialogTitle>
          <DialogDescription>
            Save a link to your collection. We&apos;ll automatically detect the platform and generate a preview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              URL *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
            {formData.url && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: platformMeta.color }}
                >
                  {platformMeta.icon}
                </div>
                Detected: {platformMeta.name}
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="pl-10"
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
              className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <label htmlFor="favorite" className="text-sm font-medium cursor-pointer">
              Mark as favorite
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.url.trim() || !formData.title.trim()}>
              {isLoading ? 'Saving...' : 'Save Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}