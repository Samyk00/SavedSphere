'use client';

import { useState } from 'react';
import { Trash2, FolderPlus, Star, X, Check } from 'lucide-react';
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
import type { Folder } from '@/lib/types';

interface BulkActionsProps {
  folders: Folder[];
  onBulkDelete: (linkIds: string[]) => void;
  onBulkMove: (linkIds: string[], folderId: string) => void;
  onBulkToggleFavorite: (linkIds: string[]) => void;
}

export default function BulkActions({
  folders,
  onBulkDelete,
  onBulkMove,
  onBulkToggleFavorite
}: BulkActionsProps) {
  const { 
    bulkSelectMode, 
    selectedLinkIds, 
    selectedCount, 
    clearSelection, 
    toggleBulkSelect 
  } = useSidebarSelection();
  const { addToast } = useToast();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  if (!bulkSelectMode) {
    return null;
  }

  const handleBulkDelete = () => {
    const linkIds = Array.from(selectedLinkIds);
    onBulkDelete(linkIds);
    addToast({
      type: 'success',
      title: 'Links Deleted',
      description: `${selectedCount} link${selectedCount > 1 ? 's' : ''} moved to trash`
    });
    clearSelection();
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
  };

  // Don't render if not in bulk select mode or no items selected
  if (!bulkSelectMode || selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px]">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedCount} selected
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-1">
            {/* Move to folder */}
            <div className="flex items-center gap-2">
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Move to..." />
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
                className="whitespace-nowrap"
              >
                <Check className="h-4 w-4 mr-1" />
                Move
              </Button>
            </div>

            {/* Toggle favorite */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkToggleFavorite}
              className="whitespace-nowrap"
            >
              <Star className="h-4 w-4 mr-1" />
              Favorite
            </Button>

            {/* Delete */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>

          {/* Close button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleBulkSelect}
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
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