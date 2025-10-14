'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import LinkGrid from '@/components/links/LinkGrid';
import LinkList from '@/components/links/LinkList';
import SearchResults from '@/components/search/SearchResults';
import AddLinkModal from '@/components/modals/AddLinkModal';
import EditLinkModal from '@/components/modals/EditLinkModal';
import FolderModal from '@/components/modals/FolderModal';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import BulkActions from '@/components/ui/BulkActions';
import DeletedLinkCard from '@/components/links/DeletedLinkCard';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import StorageManager from '@/lib/storage';
import { useLinkFilters } from '@/hooks/useLinkFilters';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { PLATFORM_ICONS } from '@/lib/platformIcons';
import { useSidebarNavigation } from '@/contexts/SidebarContext';
import type { Folder, Platform, Link, UserPreferences, LinkFormData, FolderFormData } from '@/lib/types';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isEditLinkModalOpen, setIsEditLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    gridSize: 'medium',
    defaultView: 'grid',
    showThumbnails: true,
    autoDetectPlatform: true,
    sortBy: 'newest',
    sidebarCollapsed: false,
    expandedFolders: []
  });

  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { addToast } = useToast();

  // Use the new real-time updates hook
  const {
    links,
    folders,
    tags,
    deletedLinks,
    refreshData,
    saveLink: saveNewLink,
    updateLink: updateExistingLink,
    deleteLink: deleteExistingLink,
    undoDeleteLink,
    toggleFavorite: toggleLinkFavorite,
    restoreLink: restoreDeletedLink,
    permanentlyDeleteLink: permanentlyDeleteExistingLink,
  } = useRealTimeUpdates();

  // Get sidebar navigation state
  const { selectedView, selectedFolderId: sidebarSelectedFolderId, searchQuery: sidebarSearchQuery, isSearchMode, setSearchQuery: setSidebarSearchQuery, selectView } = useSidebarNavigation();

  // Load data on mount
  useEffect(() => {
    // Initialize platform folders on first load
    StorageManager.initializePlatformFolders();
    
    // Load all data using the hook
    refreshData();
    setPreferences(StorageManager.getPreferences());
  }, [refreshData]);

  // Handle mobile detection and sidebar management
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarCollapsed(false); // Keep sidebar expanded on mobile for full view
        setIsMobileSidebarOpen(false);
      } else {
        setSidebarCollapsed(false);
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mobile sidebar toggle
  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Handle click outside sidebar on mobile
  const handleSidebarOverlayClick = () => {
    setIsMobileSidebarOpen(false);
  };

  // Determine the current view based on sidebar state
  const effectiveView = isSearchMode ? 'all' : (selectedView === 'folder' ? 'all' : selectedView);
  const effectiveFolderId = selectedView === 'folder' ? sidebarSelectedFolderId : undefined;

  // Use the link filters hook with sidebar integration
  const {
    searchQuery,
    selectedFolderId,
    selectedTags,
    selectedPlatforms,
    showOnlyFavorites,
    filteredLinks,
    setSearchQuery,
    setSelectedFolderId,
    setSelectedTags,
    setSelectedPlatforms,
    setShowOnlyFavorites,
    clearFilters,
    toggleTag,
    togglePlatform
  } = useLinkFilters({
    links: effectiveView === 'trash' ? deletedLinks : links,
    preferences,
    folders
  });

  // Sync sidebar search with main search
  useEffect(() => {
    if (sidebarSearchQuery !== searchQuery) {
      setSearchQuery(sidebarSearchQuery);
    }
  }, [sidebarSearchQuery, searchQuery, setSearchQuery]);

  // Sync sidebar folder selection with main filters
  useEffect(() => {
    if (effectiveFolderId !== selectedFolderId) {
      setSelectedFolderId(effectiveFolderId);
    }
  }, [effectiveFolderId, selectedFolderId, setSelectedFolderId]);

  // Sync sidebar view with main filters
  useEffect(() => {
    const shouldShowFavorites = selectedView === 'favorites';
    if (shouldShowFavorites !== showOnlyFavorites) {
      setShowOnlyFavorites(shouldShowFavorites);
    }
  }, [selectedView, showOnlyFavorites, setShowOnlyFavorites]);

  // Handle search with loading state
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // Also update sidebar search to keep them in sync
    setSidebarSearchQuery(query);
  };

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>();

  const handleViewChange = (view: 'all' | 'favorites' | 'trash' | 'platform') => {
    // Use sidebar context for view changes
    selectView(view === 'platform' ? 'all' : view);
    setSelectedFolderId(undefined);
    setSelectedTags([]);
    setShowOnlyFavorites(view === 'favorites');
  };

  const handleClearFilters = () => {
    clearFilters();
    setSelectedDateFilter(undefined);
    handleViewChange('all');
  };

  const handleDateFilterChange = (dateFilter: string) => {
    setSelectedDateFilter(dateFilter === selectedDateFilter ? undefined : dateFilter);
  };

  const handleSettingsClick = () => {
    // TODO: Open settings modal - implementation pending
  };

  const handleAddLinkClick = () => {
    setIsAddLinkModalOpen(true);
  };

  const handleMobileFilterToggle = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const handleFolderCreate = (parentId?: string) => {
    setEditingFolder(null);
    setParentFolderId(parentId || null);
    setIsFolderModalOpen(true);
  };

  const handleFolderEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setIsFolderModalOpen(true);
  };

  const handleFolderDelete = (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder? All links in this folder will be moved to the root.')) {
      StorageManager.deleteFolder(folderId);
      // Refresh data using the hook
      refreshData();
    }
  };

  // Create available tags and platforms for dropdown
  const availableTags = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    usageCount: tag.usageCount
  }));

  // Calculate platform counts
  const platformCounts = links.reduce((acc, link) => {
    acc[link.platform] = (acc[link.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const availablePlatforms = Object.entries(PLATFORM_ICONS).map(([platformId, config]) => ({
    id: platformId,
    name: config.name,
    icon: config.icon.name || 'Globe', // Fallback to Globe if icon name is not available
    count: platformCounts[platformId] || 0
  }));

  const handleSaveLink = async (linkData: LinkFormData) => {
    try {
      await saveNewLink(linkData);
      setIsAddLinkModalOpen(false);
    } catch (error) {
      // Don't close modal on error - let the modal handle the error display
      throw error; // Re-throw to let the modal handle the error notification
    }
  };

  const handleUpdateLink = async (linkData: LinkFormData) => {
    if (!editingLink) return;

    try {
      await updateExistingLink(editingLink.id, linkData);
      setIsEditLinkModalOpen(false);
      setEditingLink(null);
    } catch (error) {
      console.error('Error updating link:', error);
      // Don't close modal on error - let the modal handle the error display
      throw error; // Re-throw to let the modal handle the error notification
    }
  };

  const handleSaveFolder = async (folderData: FolderFormData) => {
    try {
      if (editingFolder) {
        // Update existing folder
        StorageManager.updateFolder(editingFolder.id, folderData);
      } else {
        // Create new folder
        StorageManager.saveFolder(folderData);
      }
      // Refresh data using the hook
      refreshData();
      setIsFolderModalOpen(false);
      setEditingFolder(null);
    } catch (error) {
      console.error('Error saving folder:', error);
      // Handle error silently or show user notification
    }
  };

  // Bulk operation handlers
  const handleBulkDelete = async (linkIds: string[]) => {
    try {
      await Promise.all(linkIds.map(id => deleteExistingLink(id)));

      // Show undo toast for bulk deletion
      addToast({
        type: 'success',
        title: 'Links Deleted',
        description: `${linkIds.length} link${linkIds.length > 1 ? 's' : ''} moved to trash`,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await Promise.all(linkIds.map(id => undoDeleteLink(id)));
              addToast({
                type: 'success',
                title: 'Links Restored',
                description: `${linkIds.length} link${linkIds.length > 1 ? 's' : ''} restored`
              });
            } catch (error) {
              console.error('Error restoring links:', error);
              addToast({
                type: 'error',
                title: 'Restore Failed',
                description: 'Failed to restore some links. Please try again.'
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('Error bulk deleting links:', error);
    }
  };

  const handleBulkMove = async (linkIds: string[], folderId: string) => {
    try {
      const results = await Promise.allSettled(linkIds.map(linkId => {
        const link = links.find(l => l.id === linkId);
        if (link) {
          return updateExistingLink(linkId, { ...link, folderId });
        }
        return Promise.resolve();
      }));

      const failures = results.filter(result => result.status === 'rejected').length;
      const successes = results.length - failures;

      if (failures > 0) {
        addToast({
          type: 'error',
          title: 'Bulk Move Partially Failed',
          description: `${successes} links moved successfully, ${failures} failed`
        });
      } else {
        addToast({
          type: 'success',
          title: 'Links Moved',
          description: `${successes} link${successes > 1 ? 's' : ''} moved successfully`
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to move links'
      });
    }
  };

  const handleBulkToggleFavorite = async (linkIds: string[]) => {
    try {
      const results = await Promise.allSettled(linkIds.map(linkId => {
        const link = links.find(l => l.id === linkId);
        if (link) {
          return updateExistingLink(linkId, { ...link, isFavorite: !link.isFavorite });
        }
        return Promise.resolve();
      }));

      const failures = results.filter(result => result.status === 'rejected').length;
      const successes = results.length - failures;

      if (failures > 0) {
        addToast({
          type: 'error',
          title: 'Bulk Favorite Toggle Partially Failed',
          description: `${successes} links updated successfully, ${failures} failed`
        });
      } else {
        addToast({
          type: 'success',
          title: 'Links Updated',
          description: `${successes} link${successes > 1 ? 's' : ''} updated successfully`
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to update favorites'
      });
    }
  };

  const handleEmptyTrash = () => {
    if (confirm(`Are you sure you want to permanently delete all ${deletedLinks.length} items in trash? This action cannot be undone.`)) {
      StorageManager.emptyTrash();
      // Refresh data using the hook
      refreshData();
    }
  };

  // Custom delete handler with undo functionality
  const handleDeleteWithUndo = async (id: string) => {
    const linkToDelete = links.find(link => link.id === id);
    if (!linkToDelete) return;

    // Perform the deletion
    await deleteExistingLink(id);

    // Show undo toast
    addToast({
      type: 'success',
      title: 'Link Deleted',
      description: `"${linkToDelete.title}" moved to trash`,
      action: {
        label: 'Undo',
        onClick: async () => {
          try {
            await undoDeleteLink(id);
            addToast({
              type: 'success',
              title: 'Link Restored',
              description: `"${linkToDelete.title}" has been restored`
            });
          } catch (error) {
            console.error('Error restoring link:', error);
            addToast({
              type: 'error',
              title: 'Restore Failed',
              description: 'Failed to restore the link. Please try again.'
            });
          }
        }
      }
    });
  };

  // Calculate dynamic counts - these functions are defined but not used
  // Keeping for potential future use or removal if confirmed unnecessary

  // Get current page title
  const getCurrentPageTitle = () => {
    if (isSearchMode && sidebarSearchQuery) {
      return `Search: "${sidebarSearchQuery}"`;
    }

    if (selectedView === 'folder' && sidebarSelectedFolderId) {
      const folder = folders.find(f => f.id === sidebarSelectedFolderId);
      return folder ? folder.name : 'Folder';
    }

    switch (selectedView) {
      case 'favorites':
        return 'Favorites';
      case 'trash':
        return 'Trash';
      case 'folder':
        return 'Folder';
      default:
        return 'All Links';
    }
  };

  return (
    <div className={`h-screen flex bg-white text-gray-900 ${isMobile ? 'mobile-app-container' : ''}`}>
      {/* Mobile sidebar overlay */}
      {isMobile && (
        <div 
          className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`}
          onClick={handleSidebarOverlayClick}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileToggle={handleMobileSidebarToggle}
        onCreateFolder={handleFolderCreate}
        onEditFolder={handleFolderEdit}
        onDeleteFolder={handleFolderDelete}
      />

      {/* Right side content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          onSettingsClick={handleSettingsClick} 
          onAddLinkClick={handleAddLinkClick}
          isMobile={isMobile}
          onMobileSidebarToggle={handleMobileSidebarToggle}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onFilterClick={handleMobileFilterToggle}
        />

        {/* Search Bar */}
        <div className={`${isMobile && !isMobileFilterOpen ? 'hidden' : ''}`}>
          <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedTags={selectedTags}
          selectedPlatforms={selectedPlatforms}
          selectedDateFilter={selectedDateFilter}
          availableTags={availableTags}
          availablePlatforms={availablePlatforms}
          filteredLinksCount={filteredLinks.length}
          currentViewMode={currentViewMode}
          title={getCurrentPageTitle()}
          onTagToggle={toggleTag}
          onPlatformToggle={(platformId: string) => togglePlatform(platformId as Platform)}
          onDateFilterChange={handleDateFilterChange}
          onClearFilters={handleClearFilters}
          onPlatformQuickFilter={(platform: Platform) => {
            // Toggle platform filter - allow multiple selections
            if (selectedPlatforms.includes(platform)) {
              // Remove this platform from selection
              const newPlatforms = selectedPlatforms.filter(p => p !== platform);
              setSelectedPlatforms(newPlatforms);
            } else {
              // Add this platform to selection
              setSelectedPlatforms([...selectedPlatforms, platform]);
              setSelectedTags([]);
              setSelectedDateFilter(undefined);
            }
          }}
          onViewModeChange={setCurrentViewMode}
        />
        </div>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-11 mobile-main-content mobile-scroll-container' : 'pt-8'} bg-white`}>
          {/* Bulk Actions */}
          <BulkActions
            folders={folders}
            onBulkDelete={handleBulkDelete}
            onBulkMove={handleBulkMove}
            onBulkToggleFavorite={handleBulkToggleFavorite}
          />
          
          {selectedView === 'trash' ? (
            // Trash view - show deleted links with restore options
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deleted Links</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {deletedLinks.length} deleted link{deletedLinks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {deletedLinks.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleEmptyTrash}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Empty Trash
                  </Button>
                )}
              </div>

              {deletedLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px]">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-depth-2" style={{ background: 'linear-gradient(to bottom right, var(--neutral-50) 0%, var(--neutral-100) 100%)' }}>
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--neutral-400)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    No deleted links
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
                    Deleted links will appear here. You can restore them or permanently delete them.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {deletedLinks.map((link) => (
                    <DeletedLinkCard
                      key={link.id}
                      link={link}
                      onRestore={restoreDeletedLink}
                      onPermanentDelete={permanentlyDeleteExistingLink}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Normal links view - show SearchResults if there's a search query, otherwise show regular grid/list
            searchQuery.trim() ? (
              <SearchResults
                searchQuery={searchQuery}
                filteredLinks={filteredLinks}
                isSearching={false}
                onClearSearch={() => setSearchQuery('')}
                currentViewMode={currentViewMode}
                onLinkEdit={(link: Link) => {
                  setEditingLink(link);
                  setIsEditLinkModalOpen(true);
                }}
                onLinkDelete={(id: string) => {
                  deleteExistingLink(id);
                }}
                onLinkToggleFavorite={(id: string) => {
                  toggleLinkFavorite(id);
                }}
              />
            ) : (
              // Regular view without search
              currentViewMode === 'grid' ? (
                <LinkGrid
                  links={filteredLinks}
                  isLoading={false}
                  onEditLink={(link: Link) => {
                    setEditingLink(link);
                    setIsEditLinkModalOpen(true);
                  }}
                  onDeleteLink={handleDeleteWithUndo}
                  onToggleFavorite={(id: string) => {
                    toggleLinkFavorite(id);
                  }}
                  onOpenLink={(url: string) => window.open(url, '_blank', 'noopener,noreferrer')}
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                />
              ) : (
                <LinkList
                  links={filteredLinks}
                  isLoading={false}
                  onEditLink={(link: Link) => {
                    setEditingLink(link);
                    setIsEditLinkModalOpen(true);
                  }}
                  onDeleteLink={handleDeleteWithUndo}
                  onToggleFavorite={(id: string) => {
                    toggleLinkFavorite(id);
                  }}
                  onOpenLink={(url: string) => window.open(url, '_blank', 'noopener,noreferrer')}
                />
              )
            )
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={handleAddLinkClick} 
        className={isMobile ? 'mobile-fab mobile-gpu-accelerated mobile-touch-target' : ''}
      />

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isAddLinkModalOpen}
        onClose={() => setIsAddLinkModalOpen(false)}
        onSave={handleSaveLink}
        folders={folders}
        availableTags={availableTags.map(tag => tag.name)}
      />

      {/* Edit Link Modal */}
      <EditLinkModal
        isOpen={isEditLinkModalOpen}
        onClose={() => {
          setIsEditLinkModalOpen(false);
          setEditingLink(null);
        }}
        onSave={handleUpdateLink}
        link={editingLink}
        folders={folders}
        availableTags={availableTags.map(tag => tag.name)}
      />

      {/* Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
          setParentFolderId(null);
        }}
        onSave={handleSaveFolder}
        folder={editingFolder}
        parentFolderId={parentFolderId}
      />
    </div>
  );
}
