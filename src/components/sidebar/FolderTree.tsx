'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Folder as FolderType } from '@/lib/types';

interface FolderTreeProps {
  folders: FolderType[];
  selectedFolderId?: string;
  expandedFolders: string[];
  onFolderClick: (folderId: string) => void;
  onToggleExpand: (folderId: string) => void;
  onCreateSubFolder?: (parentId: string) => void;
  onEditFolder?: (folder: FolderType) => void;
  onDeleteFolder?: (folderId: string) => void;
  depth?: number;
  maxDepth?: number;
}

interface FolderItemProps {
  folder: FolderType;
  childFolders: FolderType[];
  isSelected: boolean;
  isExpanded: boolean;
  onFolderClick: (folderId: string) => void;
  onToggleExpand: (folderId: string) => void;
  onCreateSubFolder?: (parentId: string) => void;
  onEditFolder?: (folder: FolderType) => void;
  onDeleteFolder?: (folderId: string) => void;
  depth: number;
  maxDepth: number;
}

function FolderItem({
  folder,
  childFolders,
  isSelected,
  isExpanded,
  onFolderClick,
  onToggleExpand,
  onCreateSubFolder,
  onEditFolder,
  onDeleteFolder,
  depth,
  maxDepth
}: FolderItemProps) {
  const [showAddButton, setShowAddButton] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const hasChildren = childFolders.length > 0;
  const canAddChildren = depth < maxDepth;
  const canEdit = !folder.isSystemFolder && !folder.isPlatformFolder;

  return (
    <div className="w-full">
      {/* Folder Item */}
      <div
        className={cn(
          "group flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-50 cursor-pointer relative",
          isSelected && "bg-accent-50 text-accent-700",
          depth > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onMouseEnter={() => {
          setShowAddButton(true);
        }}
        onMouseLeave={() => {
          if (!isMenuHovered) {
            setShowAddButton(false);
            setShowMenu(false);
          }
        }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 mr-2 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(folder.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Folder Icon */}
        <div
          className="w-4 h-4 rounded flex items-center justify-center text-white text-xs mr-3 flex-shrink-0"
          style={{ backgroundColor: folder.color || '#3B82F6' }}
        >
          <Folder className="h-3 w-3" />
        </div>

        {/* Folder Name and Count */}
        <div
          className="flex-1 flex items-center justify-between min-w-0"
          onClick={() => onFolderClick(folder.id)}
        >
          <span className="truncate font-medium">{folder.name}</span>
          {(folder.linkCount ?? 0) > 0 && (
            <span className="text-xs opacity-60 ml-2">({folder.linkCount})</span>
          )}
        </div>

        {/* Add Subfolder Button */}
        {canAddChildren && onCreateSubFolder && (showAddButton || isSelected) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSubFolder(folder.id);
            }}
            title="Add subfolder"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}

        {/* Context Menu Button */}
        {canEdit && (showAddButton || isSelected || showMenu) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
            title="More options"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        )}

        {/* Context Menu */}
        {showMenu && canEdit && (
          <div 
            className="absolute right-1 top-full z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => {
              setIsMenuHovered(false);
              setShowMenu(false);
              setShowAddButton(false);
            }}
          >
            {onEditFolder && (
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditFolder(folder);
                  setShowMenu(false);
                }}
              >
                <Edit2 className="h-3 w-3 mr-2" />
                Edit
              </button>
            )}
            {onDeleteFolder && (
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Child Folders */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          <FolderTree
            folders={childFolders}
            selectedFolderId={undefined}
            expandedFolders={[]}
            onFolderClick={onFolderClick}
            onToggleExpand={onToggleExpand}
            onCreateSubFolder={onCreateSubFolder}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
        </div>
      )}
    </div>
  );
}

export default function FolderTree({
  folders,
  selectedFolderId,
  expandedFolders,
  onFolderClick,
  onToggleExpand,
  onCreateSubFolder,
  onEditFolder,
  onDeleteFolder,
  depth = 0,
  maxDepth = 5
}: FolderTreeProps) {
  // Group folders by parent
  const folderMap = new Map<string, FolderType[]>();
  const rootFolders: FolderType[] = [];

  folders.forEach(folder => {
    if (!folder.parentId || depth === 0) {
      rootFolders.push(folder);
    } else {
      const parentId = folder.parentId;
      if (!folderMap.has(parentId)) {
        folderMap.set(parentId, []);
      }
      folderMap.get(parentId)!.push(folder);
    }
  });

  return (
    <div className="space-y-1">
      {rootFolders.map(folder => {
        const children = folderMap.get(folder.id) || [];
        const isSelected = selectedFolderId === folder.id;
        const isExpanded = expandedFolders.includes(folder.id);

        return (
          <FolderItem
            key={folder.id}
            folder={folder}
            childFolders={children}
            isSelected={isSelected}
            isExpanded={isExpanded}
            onFolderClick={onFolderClick}
            onToggleExpand={onToggleExpand}
            onCreateSubFolder={onCreateSubFolder}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
            depth={depth}
            maxDepth={maxDepth}
          />
        );
      })}
    </div>
  );
}