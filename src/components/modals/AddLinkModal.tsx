'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Link as LinkIcon, Tag, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PLATFORM_METADATA } from '@/lib/types';
import type { LinkFormData, Folder as FolderType, Platform } from '@/lib/types';
import { useToast } from '@/components/ui/toast';
import { getPlatformIcon } from '@/lib/platform-utils';

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
    isFavorite: false, // Always false for new links
  });

  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [titleFetched, setTitleFetched] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { addToast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        url: '',
        title: '',
        description: '',
        tags: [],
        folderId: undefined,
        isFavorite: false, // Always false for new links
      });
      setTagInput('');
      setTitleFetched(false);
      setShowDescription(false); // Reset description toggle
      
      // Mobile viewport management
      if (typeof window !== 'undefined') {
        const isMobileDevice = window.innerWidth <= 768;
        setIsMobile(isMobileDevice);
        
        if (isMobileDevice) {
          // Prevent zoom on input focus for iOS
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }
          
          // Scroll to top when modal opens
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }
      }
    } else {
      // Restore normal viewport behavior
      if (typeof window !== 'undefined') {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }
    }
  }, [isOpen]);

  // YouTube-only title fetching
  const fetchYouTubeTitle = useCallback(async (url: string) => {
    if (!url || titleFetched) return;

    const platform = detectPlatform(url);
    
    // Only fetch titles for YouTube videos
    if (platform !== 'youtube') {
      return;
    }

    try {
      setIsFetchingTitle(true);
      let title = '';
      
      // Use YouTube oEmbed API for title fetching
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (response.ok) {
          const data = await response.json();
          title = data.title || '';
        }
      } catch {
        // Fallback: try to extract video ID and use a simpler approach
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (videoIdMatch) {
          title = `YouTube Video (${videoIdMatch[1]})`;
        }
      }

      if (title && title.length > 0) {
        setFormData(prev => ({ ...prev, title }));
        setTitleFetched(true);
        addToast({
          title: 'Title fetched',
          description: 'Video title has been automatically fetched.',
          type: 'success'
        });
      }
    } catch {
      // Silent fail for title fetching
    } finally {
      setIsFetchingTitle(false);
    }
  }, [titleFetched, addToast]);

  // Platform detection function
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

  // Debounced URL processing for YouTube title fetching
  useEffect(() => {
    if (!formData.url) {
      setTitleFetched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (formData.url && !titleFetched) {
        fetchYouTubeTitle(formData.url);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData.url, fetchYouTubeTitle, titleFetched]);

  const detectedPlatform = detectPlatform(formData.url);

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to save link';
      
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
          title: 'Save Failed',
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

  // Auto-expanding textarea handler
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setFormData(prev => ({ ...prev, description: textarea.value }));
    
    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height of 200px
  };

  const platformMeta = PLATFORM_METADATA[detectedPlatform];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto mobile-modal add-link-modal p-0">
        <div className="mobile-modal-content">
          {/* Custom header with title and close button on same line - optimized for mobile */}
          <div className="flex items-center justify-between sm:p-6 sm:pb-4 p-3 pb-2 mobile-modal-header border-b border-border/10">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Plus className="h-5 w-5 text-orange-500" />
              Add Link
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
            >
              <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Add a new link to your collection with URL, title, and optional description and tags.
          </DialogDescription>

        <div className="sm:px-6 px-4">
          <form onSubmit={handleSubmit} className="sm:space-y-4 space-y-2">
          {/* URL Input */}
          <div className="sm:space-y-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="url" className="text-sm font-medium">
                URL *
              </label>
              {formData.url && detectedPlatform !== 'other' && (
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
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => {
                setFormData({ ...formData, url: e.target.value });
                setTitleFetched(false); // Reset title fetched state when URL changes
              }}
              className="h-12 pl-11 pr-4 sm:pl-11 pl-12 mobile-modal-input mobile-prevent-zoom"
              required
            />
            </div>
          </div>

          {/* Title Input */}
          <div className="sm:space-y-2 space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              Title *
              {isFetchingTitle && <Loader2 className="h-3 w-3 animate-spin" />}
            </label>
            <Input
              id="title"
              placeholder={titleFetched ? "Title fetched automatically" : "Enter title (auto-fetch for YouTube only)"}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="h-12 mobile-modal-input mobile-prevent-zoom"
              required
            />
          </div>

          {/* Description Toggle (Mobile Only) */}
          {isMobile && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Add Description</span>
              </div>
              <Switch
                checked={showDescription}
                onCheckedChange={setShowDescription}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
            </div>
          )}

          {/* Description Input */}
          {(showDescription || !isMobile) && (
            <div className="sm:space-y-2 space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Add a note or description (optional)"
                value={formData.description}
                onChange={handleDescriptionChange}
                className="min-h-[80px] max-h-[200px] resize-none transition-all duration-200 mobile-modal-textarea mobile-prevent-zoom"
                style={{ 
                  height: 'auto',
                  minHeight: '80px'
                }}
              />
            </div>
          )}

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
              <SelectTrigger className="h-12 touch-manipulation mobile-modal-select">
                <SelectValue placeholder="Choose folder (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="none" className="h-12 touch-manipulation">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    <span>No folder</span>
                  </div>
                </SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id} className="h-12 touch-manipulation">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="truncate">{folder.name}</span>
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
            <div className="sm:space-y-3 space-y-2">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter or comma to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="pl-11 pr-4 sm:pl-11 pl-12 h-12 touch-manipulation mobile-modal-input mobile-prevent-zoom"
                />
              </div>

              {/* Tag Suggestions */}
              {tagInput && availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {availableTags
                    .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(tag))
                    .slice(0, 5)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-200 h-8 px-3 touch-manipulation"
                        onClick={() => addTag(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                </div>
              )}

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-2 h-8 px-3 touch-manipulation mobile-tag-badge">
                      #{tag}
                      <X
                        className="h-4 w-4 cursor-pointer hover:text-red-500 touch-manipulation"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Link'
                )}
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