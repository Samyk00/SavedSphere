import {
  Link,
  Folder,
  Tag,
  UserPreferences,
  STORAGE_KEYS,
  LinkFormData,
  FolderFormData,
  Platform,
  PLATFORM_METADATA,
  EXTENDED_PLATFORM_METADATA,
  MAIN_PLATFORMS,
  TRASH_RETENTION_DAYS,
  BulkOperation,
  BulkOperationResult
} from './types';

// Utility functions for LocalStorage operations
class StorageManager {
  // Generic storage helpers
  private static getFromStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      // Silently handle localStorage read failures
      return null;
    }
  }

  private static setToStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Dispatch custom event for cross-tab synchronization
      window.dispatchEvent(new CustomEvent('customStorageChange', { detail: { key } }));
    } catch {
      // Silently handle localStorage write failures
    }
  }

  private static removeFromStorage(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch {
      // Silently handle localStorage remove failures
    }
  }

  // Platform folder initialization
  static initializePlatformFolders(): void {
    const isInitialized = this.getFromStorage<boolean>(STORAGE_KEYS.PLATFORM_FOLDERS_INITIALIZED);
    
    if (isInitialized) return;

    const existingFolders = this.getFolders();
    const now = new Date();

    // Create the 5 main platform folders
    const platformFolders: Folder[] = MAIN_PLATFORMS.map(platform => {
      const metadata = PLATFORM_METADATA[platform];
      return {
        id: `platform-${platform}`,
        name: metadata.name,
        description: `Links from ${metadata.name}`,
        color: metadata.color,
        icon: metadata.icon,
        platform,
        isSystemFolder: true,
        isPlatformFolder: true,
        depth: 0,
        childrenIds: [],
        linkCount: 0,
        createdAt: now,
        updatedAt: now,
      };
    });

    // Add platform folders to existing folders
    const allFolders = [...existingFolders, ...platformFolders];
    this.setToStorage(STORAGE_KEYS.FOLDERS, allFolders);
    this.setToStorage(STORAGE_KEYS.PLATFORM_FOLDERS_INITIALIZED, true);
  }

  // Links CRUD operations
  static getLinks(): Link[] {
    const links = this.getFromStorage<Link[]>(STORAGE_KEYS.LINKS) || [];
    // Convert date strings back to Date objects
    return links.map(link => ({
      ...link,
      createdAt: new Date(link.createdAt),
      updatedAt: new Date(link.updatedAt),
      deletedAt: link.deletedAt ? new Date(link.deletedAt) : undefined
    }));
  }

  static getDeletedLinks(): Link[] {
    const links = this.getFromStorage<Link[]>(STORAGE_KEYS.DELETED_LINKS) || [];
    // Convert date strings back to Date objects and filter expired ones
    const now = new Date();
    const validLinks = links.filter(link => {
      if (!link.deletedAt) return true;
      const deletedDate = new Date(link.deletedAt);
      const daysSinceDeleted = (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceDeleted <= TRASH_RETENTION_DAYS;
    });

    // Update storage if we filtered out expired links
    if (validLinks.length !== links.length) {
      this.setToStorage(STORAGE_KEYS.DELETED_LINKS, validLinks);
    }

    return validLinks.map(link => ({
      ...link,
      createdAt: new Date(link.createdAt),
      updatedAt: new Date(link.updatedAt),
      deletedAt: link.deletedAt ? new Date(link.deletedAt) : undefined
    }));
  }

  static saveLink(linkData: LinkFormData): Link {
    const links = this.getLinks();
    const now = new Date();

    // Check for duplicate URLs with conflict resolution
    const existingLink = links.find(link => link.url === linkData.url);
    if (existingLink) {
      // If the link exists but is deleted, restore it instead
      if (existingLink.isDeleted) {
        this.restoreLink(existingLink.id);
        return existingLink;
      }
      throw new Error(`Link already exists in ${existingLink.folderId ? 'folder' : 'All Links'}`);
    }

    // Detect platform from URL
    const platform = this.detectPlatform(linkData.url);

    // Auto-assign to platform folder if no folder specified and platform is one of the main 5
    let folderId = linkData.folderId;
    let folderPath = '';
    
    if (!folderId && MAIN_PLATFORMS.includes(platform)) {
      folderId = `platform-${platform}`;
    }

    // Calculate folder path
    if (folderId) {
      folderPath = this.calculateFolderPath(folderId);
    }

    const newLink: Link = {
      id: crypto.randomUUID(),
      url: linkData.url,
      title: linkData.title,
      description: linkData.description,
      platform,
      tags: linkData.tags,
      folderId,
      folderPath,
      isFavorite: linkData.isFavorite,
      createdAt: now,
      updatedAt: now,
    };

    // Try to get thumbnail and duration
    newLink.thumbnail = this.generateThumbnail(linkData.url, platform);
    newLink.duration = this.extractVideoDuration(linkData.url, platform);

    // For Instagram, try to fetch thumbnail asynchronously
    if (platform === 'instagram' && !newLink.thumbnail) {
      this.fetchInstagramThumbnail(linkData.url).then(thumbnail => {
        if (thumbnail) {
          const updatedLinks = this.getLinks();
          const linkToUpdate = updatedLinks.find(l => l.id === newLink.id);
          if (linkToUpdate) {
            linkToUpdate.thumbnail = thumbnail;
            linkToUpdate.updatedAt = new Date();
            this.setToStorage(STORAGE_KEYS.LINKS, updatedLinks);
          }
        }
      });
    }

    links.push(newLink);
    this.setToStorage(STORAGE_KEYS.LINKS, links);

    // Update tag usage
    this.updateTagUsage(linkData.tags);

    // Update folder link count
    if (folderId) {
      this.updateFolderLinkCount(folderId);
    }

    return newLink;
  }

  static updateLink(id: string, updates: Partial<LinkFormData>): Link | null {
    const links = this.getLinks();
    const linkIndex = links.findIndex(link => link.id === id);

    if (linkIndex === -1) return null;

    const oldLink = links[linkIndex];
    const oldFolderId = oldLink.folderId;

    // Check for duplicate URLs if URL is being updated
    if (updates.url && updates.url !== oldLink.url) {
      const existingLink = links.find(link => link.url === updates.url && link.id !== id);
      if (existingLink) {
        throw new Error(`Link already exists in ${existingLink.folderId ? 'folder' : 'All Links'}`);
      }
    }

    // Calculate new folder path if folder changed
    let folderPath = oldLink.folderPath;
    if (updates.folderId !== undefined && updates.folderId !== oldFolderId) {
      folderPath = updates.folderId ? this.calculateFolderPath(updates.folderId) : '';
    }

    links[linkIndex] = {
      ...oldLink,
      ...updates,
      folderPath,
      updatedAt: new Date()
    };

    this.setToStorage(STORAGE_KEYS.LINKS, links);

    // Update tag usage
    if (updates.tags) {
      this.updateTagUsage(updates.tags, oldLink.tags);
    }

    // Update folder link counts
    if (oldFolderId !== updates.folderId) {
      if (oldFolderId) this.updateFolderLinkCount(oldFolderId);
      if (updates.folderId) this.updateFolderLinkCount(updates.folderId);
    }

    return links[linkIndex];
  }

  static deleteLink(id: string): boolean {
    const links = this.getLinks();
    const linkIndex = links.findIndex(link => link.id === id);

    if (linkIndex === -1) return false;

    const linkToDelete = links[linkIndex];
    const now = new Date();

    // Mark as deleted and move to trash
    linkToDelete.isDeleted = true;
    linkToDelete.deletedAt = now;
    linkToDelete.updatedAt = now;

    // Remove from main links array
    links.splice(linkIndex, 1);
    this.setToStorage(STORAGE_KEYS.LINKS, links);

    // Add to deleted links
    const deletedLinks = this.getDeletedLinks();
    deletedLinks.push(linkToDelete);
    this.setToStorage(STORAGE_KEYS.DELETED_LINKS, deletedLinks);

    // Update folder link count
    if (linkToDelete.folderId) {
      this.updateFolderLinkCount(linkToDelete.folderId);
    }

    return true;
  }

  static restoreLink(id: string): boolean {
    const deletedLinks = this.getDeletedLinks();
    const linkIndex = deletedLinks.findIndex(link => link.id === id);

    if (linkIndex === -1) return false;

    const linkToRestore = deletedLinks[linkIndex];
    
    // Remove deleted flags
    delete linkToRestore.isDeleted;
    delete linkToRestore.deletedAt;
    linkToRestore.updatedAt = new Date();

    // Remove from deleted links
    deletedLinks.splice(linkIndex, 1);
    this.setToStorage(STORAGE_KEYS.DELETED_LINKS, deletedLinks);

    // Add back to main links
    const links = this.getLinks();
    links.push(linkToRestore);
    this.setToStorage(STORAGE_KEYS.LINKS, links);

    // Update folder link count
    if (linkToRestore.folderId) {
      this.updateFolderLinkCount(linkToRestore.folderId);
    }

    return true;
  }

  static permanentlyDeleteLink(id: string): boolean {
    const deletedLinks = this.getDeletedLinks();
    const linkIndex = deletedLinks.findIndex(link => link.id === id);

    if (linkIndex === -1) return false;

    const permanentlyDeletedLink = deletedLinks[linkIndex];
    deletedLinks.splice(linkIndex, 1);
    this.setToStorage(STORAGE_KEYS.DELETED_LINKS, deletedLinks);

    // Update tag usage
    this.updateTagUsage([], permanentlyDeletedLink.tags);

    return true;
  }

  static emptyTrash(): boolean {
    const deletedLinks = this.getDeletedLinks();

    // Decrease tag usage counts for all deleted links
    deletedLinks.forEach(link => {
      this.updateTagUsage([], link.tags);
    });

    this.setToStorage(STORAGE_KEYS.DELETED_LINKS, []);
    return true;
  }

  static toggleFavorite(id: string): boolean {
    const links = this.getLinks();
    const link = links.find(link => link.id === id);

    if (!link) return false;

    link.isFavorite = !link.isFavorite;
    link.updatedAt = new Date();

    this.setToStorage(STORAGE_KEYS.LINKS, links);
    return true;
  }

  // Bulk operations
  static performBulkOperation(operation: BulkOperation): BulkOperationResult {
    const result: BulkOperationResult = {
      success: false,
      processedCount: 0,
      errors: [],
      message: ''
    };

    try {
      switch (operation.type) {
        case 'move':
          if (!operation.targetFolderId) {
            throw new Error('Target folder ID is required for move operation');
          }
          operation.linkIds.forEach(linkId => {
            try {
              this.updateLink(linkId, { folderId: operation.targetFolderId });
              result.processedCount++;
            } catch (error) {
              result.errors.push(`Failed to move link ${linkId}: ${error}`);
            }
          });
          break;

        case 'delete':
          operation.linkIds.forEach(linkId => {
            try {
              this.deleteLink(linkId);
              result.processedCount++;
            } catch (error) {
              result.errors.push(`Failed to delete link ${linkId}: ${error}`);
            }
          });
          break;

        case 'favorite':
        case 'unfavorite':
          const isFavorite = operation.type === 'favorite';
          operation.linkIds.forEach(linkId => {
            try {
              this.updateLink(linkId, { isFavorite });
              result.processedCount++;
            } catch (error) {
              result.errors.push(`Failed to ${operation.type} link ${linkId}: ${error}`);
            }
          });
          break;

        case 'restore':
          operation.linkIds.forEach(linkId => {
            try {
              this.restoreLink(linkId);
              result.processedCount++;
            } catch (error) {
              result.errors.push(`Failed to restore link ${linkId}: ${error}`);
            }
          });
          break;

        case 'permanentDelete':
          operation.linkIds.forEach(linkId => {
            try {
              this.permanentlyDeleteLink(linkId);
              result.processedCount++;
            } catch (error) {
              result.errors.push(`Failed to permanently delete link ${linkId}: ${error}`);
            }
          });
          break;

        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      result.success = result.errors.length === 0;
      result.message = result.success 
        ? `Successfully processed ${result.processedCount} links`
        : `Processed ${result.processedCount} links with ${result.errors.length} errors`;

    } catch (error) {
      result.errors.push(`Bulk operation failed: ${error}`);
      result.message = `Bulk operation failed: ${error}`;
    }

    return result;
  }

  // Folders CRUD operations
  static getFolders(): Folder[] {
    const folders = this.getFromStorage<Folder[]>(STORAGE_KEYS.FOLDERS) || [];
    return folders.map(folder => ({
      ...folder,
      createdAt: new Date(folder.createdAt),
      updatedAt: new Date(folder.updatedAt),
      childrenIds: folder.childrenIds || [],
      linkCount: folder.linkCount || 0,
      depth: folder.depth || 0
    }));
  }

  static saveFolder(folderData: FolderFormData): Folder {
    const folders = this.getFolders();
    const now = new Date();

    // Calculate depth and path
    let depth = 0;
    let path = folderData.name;
    
    if (folderData.parentId) {
      const parentFolder = folders.find(f => f.id === folderData.parentId);
      if (parentFolder) {
        depth = (parentFolder.depth || 0) + 1;
        path = `${parentFolder.path || parentFolder.name}/${folderData.name}`;
      }
    }

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: folderData.name,
      description: folderData.description,
      color: folderData.color || '#6B7280',
      icon: folderData.icon || 'Folder',
      parentId: folderData.parentId,
      platform: folderData.platform,
      isSystemFolder: false,
      isPlatformFolder: false,
      path,
      depth,
      childrenIds: [],
      linkCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    folders.push(newFolder);

    // Update parent folder's children
    if (folderData.parentId) {
      const parentFolder = folders.find(f => f.id === folderData.parentId);
      if (parentFolder) {
        parentFolder.childrenIds = parentFolder.childrenIds || [];
        parentFolder.childrenIds.push(newFolder.id);
        parentFolder.updatedAt = now;
      }
    }

    this.setToStorage(STORAGE_KEYS.FOLDERS, folders);
    return newFolder;
  }

  static updateFolder(id: string, updates: Partial<FolderFormData>): Folder | null {
    const folders = this.getFolders();
    const folderIndex = folders.findIndex(folder => folder.id === id);

    if (folderIndex === -1) return null;

    const folder = folders[folderIndex];
    
    // Don't allow updating system folders
    if (folder.isSystemFolder) {
      throw new Error('Cannot update system folders');
    }

    // Update folder
    folders[folderIndex] = {
      ...folder,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate path if name changed
    if (updates.name) {
      this.updateFolderPaths(folders, id);
    }

    this.setToStorage(STORAGE_KEYS.FOLDERS, folders);
    return folders[folderIndex];
  }

  static deleteFolder(id: string): boolean {
    const folders = this.getFolders();
    const folderIndex = folders.findIndex(folder => folder.id === id);

    if (folderIndex === -1) return false;

    const folder = folders[folderIndex];
    
    // Don't allow deleting system folders
    if (folder.isSystemFolder) {
      throw new Error('Cannot delete system folders');
    }

    // Move child folders to parent or root
    const childFolders = folders.filter(f => f.parentId === id);
    childFolders.forEach(childFolder => {
      childFolder.parentId = folder.parentId;
      childFolder.updatedAt = new Date();
    });

    // Move links in this folder to parent or root
    const links = this.getLinks();
    links.forEach(link => {
      if (link.folderId === id) {
        link.folderId = folder.parentId;
        link.folderPath = folder.parentId ? this.calculateFolderPath(folder.parentId) : '';
        link.updatedAt = new Date();
      }
    });
    this.setToStorage(STORAGE_KEYS.LINKS, links);

    // Remove from parent's children
    if (folder.parentId) {
      const parentFolder = folders.find(f => f.id === folder.parentId);
      if (parentFolder && parentFolder.childrenIds) {
        parentFolder.childrenIds = parentFolder.childrenIds.filter(childId => childId !== id);
        parentFolder.updatedAt = new Date();
      }
    }

    folders.splice(folderIndex, 1);
    this.setToStorage(STORAGE_KEYS.FOLDERS, folders);

    return true;
  }

  // Helper methods for folder management
  private static calculateFolderPath(folderId: string): string {
    const folders = this.getFolders();
    const folder = folders.find(f => f.id === folderId);
    
    if (!folder) return '';
    
    if (folder.path) return folder.path;
    
    // Build path from hierarchy
    const pathParts: string[] = [];
    let currentFolder: Folder | null = folder;
    
    while (currentFolder) {
        pathParts.unshift(currentFolder.name);
        if (currentFolder.parentId) {
           const parentId: string = currentFolder.parentId;
           currentFolder = folders.find(f => f.id === parentId) || null;
        } else {
          currentFolder = null;
        }
      }
    
    return pathParts.join('/');
  }

  private static updateFolderPaths(folders: Folder[], changedFolderId: string): void {
    const changedFolder = folders.find(f => f.id === changedFolderId);
    if (!changedFolder) return;

    // Update the changed folder's path
    changedFolder.path = this.calculateFolderPath(changedFolderId);

    // Update all descendant folders' paths
    const updateDescendants = (parentId: string) => {
      const children = folders.filter(f => f.parentId === parentId);
      children.forEach(child => {
        child.path = this.calculateFolderPath(child.id);
        child.updatedAt = new Date();
        updateDescendants(child.id);
      });
    };

    updateDescendants(changedFolderId);

    // Update links in affected folders
    const links = this.getLinks();
    let linksUpdated = false;
    
    links.forEach(link => {
      if (link.folderId && (link.folderId === changedFolderId || 
          folders.find(f => f.id === link.folderId && f.path?.startsWith(changedFolder.path || '')))) {
        link.folderPath = this.calculateFolderPath(link.folderId);
        link.updatedAt = new Date();
        linksUpdated = true;
      }
    });

    if (linksUpdated) {
      this.setToStorage(STORAGE_KEYS.LINKS, links);
    }
  }

  private static updateFolderLinkCount(folderId: string): void {
    const folders = this.getFolders();
    const links = this.getLinks();
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    // Count links in this folder
    const linkCount = links.filter(link => link.folderId === folderId).length;
    folder.linkCount = linkCount;
    folder.updatedAt = new Date();

    this.setToStorage(STORAGE_KEYS.FOLDERS, folders);
  }

  // Tags operations
  static getTags(): Tag[] {
    const tags = this.getFromStorage<Tag[]>(STORAGE_KEYS.TAGS) || [];
    return tags.map(tag => ({
      ...tag,
      createdAt: new Date(tag.createdAt)
    }));
  }

  private static updateTagUsage(newTags: string[], oldTags: string[] = []): void {
    const tags = this.getTags();

    // Decrease usage for old tags
    oldTags.forEach(tagName => {
      const tag = tags.find(t => t.name === tagName);
      if (tag) {
        tag.usageCount = Math.max(0, tag.usageCount - 1);
      }
    });

    // Increase usage for new tags
    newTags.forEach(tagName => {
      let tag = tags.find(t => t.name === tagName);
      if (!tag) {
        tag = {
          id: crypto.randomUUID(),
          name: tagName,
          color: '#6B7280',
          usageCount: 0,
          createdAt: new Date()
        };
        tags.push(tag);
      }
      tag.usageCount += 1;
    });

    // Remove tags with 0 usage
    const filteredTags = tags.filter(tag => tag.usageCount > 0);
    this.setToStorage(STORAGE_KEYS.TAGS, filteredTags);
  }

  // Preferences operations
  static getPreferences(): UserPreferences {
    return this.getFromStorage<UserPreferences>(STORAGE_KEYS.PREFERENCES) || {
      theme: 'system',
      gridSize: 'medium',
      defaultView: 'grid',
      showThumbnails: true,
      autoDetectPlatform: true,
      sortBy: 'newest',
      sidebarCollapsed: false,
      expandedFolders: []
    };
  }

  static updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    this.setToStorage(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  }

  // Utility functions
  private static detectPlatform(url: string): Platform {
    try {
      const domain = new URL(url).hostname.toLowerCase();

      // Check extended platforms first (includes Threads)
      for (const [platform, metadata] of Object.entries(EXTENDED_PLATFORM_METADATA)) {
        if (metadata.domainRegex.test(domain)) {
          return platform as Platform;
        }
      }
    } catch {
      // Invalid URL, return 'other'
    }

    return 'other';
  }

  private static generateThumbnail(url: string, platform: Platform): string | undefined {
    // For YouTube, extract video ID and create thumbnail URL
    if (platform === 'youtube') {
      const videoId = this.extractYouTubeVideoId(url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    // For Instagram, return undefined initially - will be fetched asynchronously
    if (platform === 'instagram') {
      return undefined; // Will be updated asynchronously
    }

    // For other platforms, we could implement thumbnail generation
    // For now, return undefined to use a default icon
    return undefined;
  }

  private static async fetchInstagramThumbnail(url: string): Promise<string | undefined> {
    try {
      // Try Instagram's oEmbed endpoint
      const oEmbedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oEmbedUrl);
      if (response.ok) {
        const data = await response.json();
        return data.thumbnail_url;
      }
    } catch {
      // Silently handle Instagram thumbnail fetch failures
    }

    // Fallback: try to extract media ID and construct thumbnail URL
    try {
      const mediaId = this.extractInstagramMediaId(url);
      if (mediaId) {
        // This is a common pattern, though Instagram may block it
        return `https://instagram.com/p/${mediaId}/media/?size=l`;
      }
    } catch {
      // Silently handle Instagram media ID extraction failures
    }

    return undefined;
  }

  private static extractInstagramMediaId(url: string): string | null {
    // Extract media ID from Instagram URL
    const patterns = [
      /instagram\.com\/p\/([^/?]+)/,
      /instagram\.com\/reel\/([^/?]+)/,
      /instagram\.com\/tv\/([^/?]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private static async fetchThreadsThumbnail(): Promise<string | undefined> {
    try {
      // Threads (Meta) doesn't have a public oEmbed API yet, but we can try similar approaches
      // For now, return undefined - in a real implementation, you'd need to use Meta's Graph API
      return undefined;
    } catch {
      // Silently handle Threads thumbnail fetch failures - no public oEmbed API
      return undefined;
    }
  }

  private static extractVideoDuration(url: string, platform: Platform): string | undefined {
    // This would typically fetch from APIs, but for demo purposes we'll simulate
    if (platform === 'youtube') {
      // Simulate different video lengths
      const lengths = ['3:24', '12:45', '8:12', '1:30', '25:18'];
      return lengths[Math.floor(Math.random() * lengths.length)];
    } else if (platform === 'tiktok') {
      // TikTok videos are typically short
      const lengths = ['0:15', '0:23', '0:45', '1:12', '0:08'];
      return lengths[Math.floor(Math.random() * lengths.length)];
    } else if (platform === 'instagram') {
      // Instagram Reels
      const lengths = ['0:30', '0:45', '1:00', '0:15', '0:59'];
      return lengths[Math.floor(Math.random() * lengths.length)];
    }
    return undefined;
  }

  private static extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  // Data export/import
  static exportData() {
    return {
      links: this.getLinks(),
      folders: this.getFolders(),
      tags: this.getTags(),
      preferences: this.getPreferences(),
      exportedAt: new Date().toISOString()
    };
  }

  static importData(data: { links?: Link[]; folders?: Folder[]; tags?: string[]; preferences?: UserPreferences }): boolean {
    try {
      if (data.links) this.setToStorage(STORAGE_KEYS.LINKS, data.links);
      if (data.folders) this.setToStorage(STORAGE_KEYS.FOLDERS, data.folders);
      if (data.tags) this.setToStorage(STORAGE_KEYS.TAGS, data.tags);
      if (data.preferences) this.setToStorage(STORAGE_KEYS.PREFERENCES, data.preferences);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeFromStorage(key);
    });
  }
}

export default StorageManager;