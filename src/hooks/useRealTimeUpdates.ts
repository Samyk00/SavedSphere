'use client';

import { useState, useCallback, useEffect } from 'react';
import StorageManager from '@/lib/storage';
import type { Link, Folder, Tag, LinkFormData } from '@/lib/types';

interface UseRealTimeUpdatesReturn {
  // State
  links: Link[];
  folders: Folder[];
  tags: Tag[];
  deletedLinks: Link[];
  isLoading: boolean;

  // Actions
  refreshData: () => void;
  saveLink: (linkData: LinkFormData) => Promise<Link>;
  updateLink: (id: string, linkData: LinkFormData) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  undoDeleteLink: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  restoreLink: (id: string) => Promise<boolean>;
  permanentlyDeleteLink: (id: string) => Promise<boolean>;
}

export function useRealTimeUpdates(): UseRealTimeUpdatesReturn {
  const [links, setLinks] = useState<Link[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [deletedLinks, setDeletedLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(() => {
    setLinks(StorageManager.getLinks());
    setFolders(StorageManager.getFolders());
    setTags(StorageManager.getTags());
    setDeletedLinks(StorageManager.getDeletedLinks());
  }, []);

  // Listen for storage changes across browser tabs
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;

    const handleStorageChange = (e: StorageEvent) => {
      // Only refresh if the changed key is one of our data keys
      if (e.key && ['links', 'folders', 'tags', 'deletedLinks'].some(key => e.key?.includes(key))) {
        // Debounce the refresh to avoid excessive updates
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          refreshData();
        }, 100);
      }
    };

    // Listen for custom events from other tabs
    const handleCustomStorageChange = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        refreshData();
      }, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleCustomStorageChange);

    return () => {
      clearTimeout(debounceTimeout);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [refreshData]);

  const saveLink = useCallback(async (linkData: LinkFormData): Promise<Link> => {
    setIsLoading(true);
    const originalLinks = [...links];
    const originalFolders = [...folders];
    const originalTags = [...tags];

    try {
      const newLink = StorageManager.saveLink(linkData);

      // Optimistic update - add the new link immediately
      setLinks(prev => [...prev, newLink]);

      // Update related data
      setFolders(StorageManager.getFolders());
      setTags(StorageManager.getTags());

      return newLink;
    } catch (error) {
      // Revert optimistic update on error with proper error handling
      setLinks(originalLinks);
      setFolders(originalFolders);
      setTags(originalTags);

      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to save link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [links, folders, tags]);

  const updateLink = useCallback(async (id: string, linkData: LinkFormData): Promise<boolean> => {
    setIsLoading(true);
    const originalLinks = [...links];
    const originalFolders = [...folders];
    const originalTags = [...tags];

    try {
      const updatedLink = StorageManager.updateLink(id, linkData);

      if (updatedLink) {
        // Optimistic update - update the link immediately
        setLinks(prev => prev.map(link =>
          link.id === id
            ? { ...link, ...linkData, updatedAt: new Date() }
            : link
        ));

        // Update related data
        setTags(StorageManager.getTags());
      }

      return !!updatedLink;
    } catch (error) {
      // Revert optimistic update on error
      setLinks(originalLinks);
      setFolders(originalFolders);
      setTags(originalTags);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [links, folders, tags]);

  const deleteLink = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    const originalLinks = [...links];
    const originalFolders = [...folders];
    const originalDeletedLinks = [...deletedLinks];

    try {
      const linkToDelete = links.find(link => link.id === id);
      if (!linkToDelete) return false;

      const success = StorageManager.deleteLink(id);

      if (success) {
        // Optimistic update - remove from links and add to deleted
        setLinks(prev => prev.filter(link => link.id !== id));
        setDeletedLinks(prev => [...prev, { ...linkToDelete, isDeleted: true, deletedAt: new Date() }]);

        // Update folder counts
        setFolders(StorageManager.getFolders());
      }

      return success;
    } catch (error) {
      // Revert optimistic update on error
      setLinks(originalLinks);
      setFolders(originalFolders);
      setDeletedLinks(originalDeletedLinks);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [links, folders, deletedLinks]);

  const undoDeleteLink = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    const originalLinks = [...links];
    const originalFolders = [...folders];
    const originalDeletedLinks = [...deletedLinks];

    try {
      const success = StorageManager.restoreLink(id);

      if (success) {
        // Find the link in deleted links
        const linkToRestore = deletedLinks.find(link => link.id === id);
        if (linkToRestore) {
          // Optimistic update - move from deleted to active
          setDeletedLinks(prev => prev.filter(link => link.id !== id));
          setLinks(prev => [...prev, { ...linkToRestore, isDeleted: false, deletedAt: undefined }]);

          // Update folder counts
          setFolders(StorageManager.getFolders());
        }
      }

      return success;
    } catch (error) {
      // Revert optimistic update on error
      setLinks(originalLinks);
      setFolders(originalFolders);
      setDeletedLinks(originalDeletedLinks);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [links, folders, deletedLinks]);

  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    const originalLinks = [...links];

    try {
      const success = StorageManager.toggleFavorite(id);

      if (success) {
        // Optimistic update - toggle favorite immediately
        setLinks(prev => prev.map(link =>
          link.id === id
            ? { ...link, isFavorite: !link.isFavorite, updatedAt: new Date() }
            : link
        ));
      }

      return success;
    } catch (error) {
      // Revert optimistic update on error
      setLinks(originalLinks);
      throw error;
    }
  }, [links]);

  const restoreLink = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    const originalLinks = [...links];
    const originalFolders = [...folders];
    const originalDeletedLinks = [...deletedLinks];

    try {
      const linkToRestore = deletedLinks.find(link => link.id === id);
      if (!linkToRestore) return false;

      const success = StorageManager.restoreLink(id);

      if (success) {
        // Optimistic update - move from deleted to active
        setDeletedLinks(prev => prev.filter(link => link.id !== id));
        setLinks(prev => [...prev, { ...linkToRestore, isDeleted: false, deletedAt: undefined }]);

        // Update folder counts
        setFolders(StorageManager.getFolders());
      }

      return success;
    } catch (error) {
      // Revert optimistic update on error
      setLinks(originalLinks);
      setFolders(originalFolders);
      setDeletedLinks(originalDeletedLinks);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [links, folders, deletedLinks]);

  const permanentlyDeleteLink = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    const originalDeletedLinks = [...deletedLinks];
    const originalTags = [...tags];

    try {
      const success = StorageManager.permanentlyDeleteLink(id);

      if (success) {
        // Optimistic update - remove from deleted links
        setDeletedLinks(prev => prev.filter(link => link.id !== id));

        // Update tags
        setTags(StorageManager.getTags());
      }

      return success;
    } catch (error) {
      // Revert optimistic update on error
      setDeletedLinks(originalDeletedLinks);
      setTags(originalTags);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deletedLinks, tags]);

  return {
    // State
    links,
    folders,
    tags,
    deletedLinks,
    isLoading,

    // Actions
    refreshData,
    saveLink,
    updateLink,
    deleteLink,
    undoDeleteLink,
    toggleFavorite,
    restoreLink,
    permanentlyDeleteLink,
  };
}