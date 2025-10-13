'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Star,
  Trash2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebarState, useSidebarNavigation } from '@/contexts/SidebarContext';
import StorageManager from '@/lib/storage';
import SidebarSection from '@/components/sidebar/SidebarSection';
import SidebarItem from '@/components/sidebar/SidebarItem';
import PlatformFolder from '@/components/sidebar/PlatformFolder';
import FolderTree from '@/components/sidebar/FolderTree';
import type { Link, Folder as FolderType } from '@/lib/types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCreateFolder?: (parentId?: string) => void;
  onEditFolder?: (folder: FolderType) => void;
  onDeleteFolder?: (folderId: string) => void;
}

// Platform icons are now centralized in @/lib/platformIcons

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder
}: SidebarProps) {
  const { state, actions } = useSidebarState();
  const { selectedView, selectView } = useSidebarNavigation();
  
  // Local state for data
  const [links, setLinks] = useState<Link[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [deletedLinks, setDeletedLinks] = useState<Link[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      setLinks(StorageManager.getLinks());
      setFolders(StorageManager.getFolders());
      setDeletedLinks(StorageManager.getDeletedLinks());
    };

    loadData();
    
    // Listen for storage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Calculate counts
  const allLinksCount = links.length;
  const favoritesCount = links.filter(link => link.isFavorite).length;
  const trashCount = deletedLinks.length;

  // Get platform folders with counts and child folders
  const platformFolders = folders.filter(folder => folder.isPlatformFolder);
  const platformFoldersWithCounts = platformFolders.map(folder => {
    // Get child folders for this platform
    const childFolders = folders.filter(childFolder => 
      childFolder.parentId === folder.id && !childFolder.isPlatformFolder
    ).map(childFolder => ({
      ...childFolder,
      linkCount: links.filter(link => link.folderId === childFolder.id).length
    }));

    // Calculate total link count (direct links + links in child folders)
    const directLinkCount = links.filter(link => link.folderId === folder.id).length;
    const childLinkCount = childFolders.reduce((sum, child) => sum + (child.linkCount || 0), 0);
    
    return {
      ...folder,
      linkCount: directLinkCount + childLinkCount,
      childFolders
    };
  });

  return (
    <aside className={cn(
      "border-r border-gray-200 transition-all duration-300 bg-white flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and App Name */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-depth-2" style={{ backgroundColor: 'var(--accent-500)', color: 'white' }}>
              <span className="font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--neutral-800)' }}>
              SavedSphere
            </h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn("h-8 w-8 p-0", isCollapsed && "mx-auto")}
          style={{ color: 'var(--accent-600)' }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>



      {/* Content with contained scrolling */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {isCollapsed ? (
          // Collapsed view - just icons
          <div className="pt-2 px-2 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-center",
                selectedView === 'all' && "bg-accent-50 text-accent-700"
              )}
              title="All Links"
              onClick={() => selectView('all')}
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-center",
                selectedView === 'favorites' && "bg-accent-50 text-accent-700"
              )}
              title="Favorites"
              onClick={() => selectView('favorites')}
            >
              <Star className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-center",
                selectedView === 'trash' && "bg-accent-50 text-accent-700"
              )}
              title="Trash"
              onClick={() => selectView('trash')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Expanded view - full navigation
          <div className="pt-4 px-4 pb-4 space-y-6">
            {/* Main Navigation */}
            <SidebarSection>
              <SidebarItem
                icon={<Home className="h-4 w-4" />}
                label="All Links"
                count={allLinksCount}
                isActive={selectedView === 'all'}
                onClick={() => selectView('all')}
              />
              <SidebarItem
                icon={<Star className="h-4 w-4" />}
                label="Favorites"
                count={favoritesCount}
                isActive={selectedView === 'favorites'}
                onClick={() => selectView('favorites')}
              />
              <SidebarItem
                icon={<Trash2 className="h-4 w-4" />}
                label="Trash"
                count={trashCount}
                isActive={selectedView === 'trash'}
                onClick={() => selectView('trash')}
              />
            </SidebarSection>

            {/* Platform Folders */}
            <SidebarSection title="Platforms">
              {platformFoldersWithCounts.map((folder) => {
                return (
                  <PlatformFolder
                    key={folder.id}
                    platform={folder.platform || 'other'}
                    folders={folder.childFolders || []}
                    count={folder.linkCount}
                    isActive={selectedView === 'folder' && state.selectedFolderId === folder.id}
                    onClick={() => {
                      selectView('folder');
                      actions.selectFolder(folder.id);
                    }}
                    onSubFolderClick={(folderId) => {
                      selectView('folder');
                      actions.selectFolder(folderId);
                    }}
                    onCreateSubFolder={() => {
                      // Create subfolder for platform
                      onCreateFolder?.(folder.id);
                    }}
                  />
                );
              })}
            </SidebarSection>

            {/* Custom Folders */}
            <SidebarSection 
              title={
                <div className="flex items-center justify-between">
                  <span>Folders</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    title="Create Folder"
                    onClick={() => onCreateFolder?.()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              }
            >
              <FolderTree
                folders={folders.filter(folder => !folder.isPlatformFolder)}
                selectedFolderId={selectedView === 'folder' ? state.selectedFolderId : undefined}
                expandedFolders={Array.from(state.expandedFolders)}
                onFolderClick={(folderId) => {
                  selectView('folder');
                  actions.selectFolder(folderId);
                }}
                onToggleExpand={(folderId) => {
                  actions.toggleFolder(folderId);
                }}
                onCreateSubFolder={(parentId) => {
                  // Create subfolder with parent
                  onCreateFolder?.(parentId);
                }}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
              />
              {folders.filter(folder => !folder.isPlatformFolder).length === 0 && (
                <div className="text-xs text-gray-500 px-3 py-2">
                  No custom folders yet
                </div>
              )}
            </SidebarSection>
          </div>
        )}
      </div>
    </aside>
  );
}