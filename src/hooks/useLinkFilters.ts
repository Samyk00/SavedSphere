'use client';

import { useState, useMemo } from 'react';
import type { Link, Platform, UserPreferences, Folder } from '@/lib/types';

interface UseLinkFiltersProps {
  links: Link[];
  preferences: UserPreferences;
  folders?: Folder[];
  showFavorites?: boolean;
}

export function useLinkFilters({ links, preferences, folders = [], showFavorites = false }: UseLinkFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter links based on current criteria
  const filteredLinks = useMemo(() => {
    let filtered = [...links];

    // Favorites filter (takes precedence)
    if (showFavorites || showOnlyFavorites) {
      filtered = filtered.filter(link => link.isFavorite);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Folder filter - include sub-folder cards when viewing parent platform folder
    if (selectedFolderId) {
      const selectedFolder = folders.find(f => f.id === selectedFolderId);
      
      if (selectedFolder?.isPlatformFolder) {
        // For platform folders, include links from the folder itself and all its sub-folders
        const subFolderIds = folders
          .filter(f => f.parentId === selectedFolderId)
          .map(f => f.id);
        
        filtered = filtered.filter(link => 
          link.folderId === selectedFolderId || 
          subFolderIds.includes(link.folderId || '')
        );
      } else {
        // For regular folders, only show links directly in that folder
        filtered = filtered.filter(link => link.folderId === selectedFolderId);
      }
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(link =>
        selectedTags.some(tag => link.tags.includes(tag))
      );
    }

    // Platforms filter
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(link =>
        selectedPlatforms.includes(link.platform)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (preferences.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'platform':
          return a.platform.localeCompare(b.platform);
        default:
          return 0;
      }
    });

    return filtered;
  }, [links, searchQuery, selectedFolderId, selectedTags, selectedPlatforms, preferences.sortBy, showFavorites, showOnlyFavorites, folders]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFolderId(undefined);
    setSelectedTags([]);
    setSelectedPlatforms([]);
    setShowOnlyFavorites(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() ||
    selectedFolderId ||
    selectedTags.length > 0 ||
    selectedPlatforms.length > 0 ||
    showOnlyFavorites;

  return {
    // State
    searchQuery,
    selectedFolderId,
    selectedTags,
    selectedPlatforms,
    showOnlyFavorites,

    // Computed
    filteredLinks,
    hasActiveFilters,

    // Actions
    setSearchQuery,
    setSelectedFolderId,
    setSelectedTags,
    setSelectedPlatforms,
    setShowOnlyFavorites,
    clearFilters,

    // Tag actions
    addTag: (tagId: string) => {
      setSelectedTags(prev => prev.includes(tagId) ? prev : [...prev, tagId]);
    },

    removeTag: (tagId: string) => {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    },

    toggleTag: (tagId: string) => {
      setSelectedTags(prev =>
        prev.includes(tagId)
          ? prev.filter(id => id !== tagId)
          : [...prev, tagId]
      );
    },

    // Platform actions
    addPlatform: (platform: Platform) => {
      setSelectedPlatforms(prev => prev.includes(platform) ? prev : [...prev, platform]);
    },

    removePlatform: (platform: Platform) => {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    },

    togglePlatform: (platform: Platform) => {
      setSelectedPlatforms(prev =>
        prev.includes(platform)
          ? prev.filter(p => p !== platform)
          : [...prev, platform]
      );
    }
  };
}