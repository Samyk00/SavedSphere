'use client';

import { useState } from 'react';
import { Trash2, FolderPlus, Star, X, Check, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSidebarSelection } from '@/contexts/SidebarContext';
import { useToast } from '@/components/ui/toast';
import type { Folder, Link } from '@/lib/types';

interface BulkActionsProps {
  folders: Folder[];
  currentLinks: Link[];
  onBulkDelete: (linkIds: string[]) => void;
  onBulkMove: (linkIds: string[], folderId: string) => void;
  onBulkToggleFavorite: (linkIds: string[]) => void;
}

export default function BulkActions({
  folders,
  currentLinks,
  onBulkDelete,
  onBulkMove,
  onBulkToggleFavorite
}: BulkActionsProps) {
  const { 
    bulkSelectMode, 
    selectedLinkIds, 
    selectedCount, 
    clearSelection, 
    toggleBulkSelect,
    selectAllLinks
  } = useSidebarSelection();
  const { addToast } = useToast();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  if (!bulkSelectMode) {
    return null;
  }

  // Check if all current links are selected
  const currentLinkIds = currentLinks.map(link => link.id);
  const allSelected = currentLinkIds.length > 0 && currentLinkIds.every(id => selectedLinkIds.has(id));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all and exit bulk select mode
      clearSelection();
      toggleBulkSelect();
    } else {
      // Select all current links
      selectAllLinks(currentLinkIds);
    }
  };

  const handleBulkDelete = () => {
    const linkIds = Array.from(selectedLinkIds);
    onBulkDelete(linkIds);
    addToast({
      type: 'success',
      title: 'Links Deleted',
      description: `${selectedCount} link${selectedCount > 1 ? 's' : ''} moved to trash`
    });
    clearSelection();
    toggleBulkSelect(); // Exit bulk select mode
    setShowDeleteDialog(false);
  };

  const handleBulkMove = () => {
    if (!selectedFolderId) {
      addToast({
        type: 'error',
        title: 'No Folder Selected',
        description: 'Please select a folder to move the links to'
      });
      return;
    }

    const linkIds = Array.from(selectedLinkIds);
    onBulkMove(linkIds, selectedFolderId);
    
    const folderName = folders.find(f => f.id === selectedFolderId)?.name || 'Unknown';
    addToast({
      type: 'success',
      title: 'Links Moved',
      description: `${selectedCount} link${selectedCount > 1 ? 's' : ''} moved to ${folderName}`
    });
    clearSelection();
    toggleBulkSelect(); // Exit bulk select mode
    setSelectedFolderId('');
  };

  const handleBulkToggleFavorite = () => {
    const linkIds = Array.from(selectedLinkIds);
    onBulkToggleFavorite(linkIds);
    
    addToast({
      type: 'success',
      title: 'Links Updated',
      description: `${selectedCount} link${selectedCount > 1 ? 's' : ''} updated`
    });
    clearSelection();
    toggleBulkSelect(); // Exit bulk select mode
  };

  // Don't render if not in bulk select mode or no items selected
  if (!bulkSelectMode || selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/50 rounded-md sm:rounded-lg p-2 flex items-center gap-2 backdrop-blur-sm sm:max-w-fit sm:mx-auto">
            {/* Left side: Selection count and actions */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Select all toggle */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="h-7 w-7 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
              >
                {allSelected ? (
                  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline sm:ml-1">
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </Button>

              {/* Selection count - mobile shows only number, desktop shows "X selected" */}
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs sm:text-sm px-2 py-1 flex-shrink-0">
                <span className="sm:hidden">{selectedCount}</span>
                <span className="hidden sm:inline">{selectedCount} selected</span>
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                {/* Move to folder */}
                <div className="flex items-center gap-1">
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger className="w-20 sm:w-32 text-xs sm:text-sm h-7 sm:h-9">
                      <SelectValue placeholder="Move..." />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <FolderPlus className="h-4 w-4" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleBulkMove}
                    disabled={!selectedFolderId}
                    className="h-7 w-7 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline sm:ml-1">Move</span>
                  </Button>
                </div>

                {/* Toggle favorite */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkToggleFavorite}
                  className="h-7 w-7 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
                >
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline sm:ml-1">Favorite</span>
                </Button>

                {/* Delete */}
                 <Button
                   size="sm"
                   variant="destructive"
                   onClick={() => setShowDeleteDialog(true)}
                   className="h-7 w-7 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
                 >
                   <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                   <span className="hidden sm:inline sm:ml-1">Delete</span>
                 </Button>

                 {/* Divider - desktop only */}
                 <div className="hidden sm:block w-px h-6 bg-gray-300 mx-1"></div>

                 {/* Clear button - desktop shows text, mobile shows icon */}
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={toggleBulkSelect}
                   className="h-7 w-7 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
                 >
                   <X className="h-3 w-3 sm:h-4 sm:w-4 sm:hidden" />
                   <span className="hidden sm:inline">Clear</span>
                 </Button>
               </div>
             </div>

             {/* Right side: Close button - mobile only */}
             <Button
               size="sm"
               variant="ghost"
               onClick={toggleBulkSelect}
               className="h-7 w-7 p-0 flex-shrink-0 sm:hidden"
             >
               <X className="h-3 w-3" />
             </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Links</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} link{selectedCount > 1 ? 's' : ''}? 
              This action will move them to trash and can be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}