'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebarState } from '@/contexts/SidebarContext';
import type { Platform, Folder } from '@/lib/types';
import { getPlatformConfig } from '@/lib/platformIcons';

interface PlatformFolderProps {
  platform: Platform;
  folders: Folder[];
  count: number;
  isActive?: boolean;
  onClick?: () => void;
  onCreateSubFolder?: () => void;
  onSubFolderClick?: (folderId: string) => void;
}

export default function PlatformFolder({
  platform,
  folders,
  count,
  isActive = false,
  onClick,
  onCreateSubFolder,
  onSubFolderClick
}: PlatformFolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const { state, actions } = useSidebarState();
  
  const isExpanded = state.expandedFolders.has(platform);
  const platformConfig = getPlatformConfig(platform);
  const { name, icon: IconComponent } = platformConfig;
  const icon = <IconComponent className="h-4 w-4" />;

  return (
    <div className="relative">
      {/* Main Platform Item */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          // Only hide if not hovering over menu
          if (!isMenuHovered) {
            setIsHovered(false);
            setShowMenu(false);
          }
        }}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start rounded-lg transition-all duration-200 hover:shadow-depth-1 cursor-pointer px-3 py-2.5",
            isActive && "bg-accent-50 border-l-4 border-accent-500",
            isHovered && !isActive && "bg-gray-50",
            // Adjust right padding based on what buttons are visible
            (folders.length > 0 || isHovered) && isHovered ? "pr-14" : 
            (folders.length > 0 || isHovered) ? "pr-8" : "pr-3"
          )}
          style={{
            color: isActive ? 'var(--accent-700)' : 'var(--neutral-700)',
            fontSize: '16px',
            fontWeight: isActive ? '600' : '500'
          }}
          onClick={onClick}
        >
          <span className="mr-3 flex-shrink-0 text-lg">{icon}</span>
          <span className="flex-1 text-left truncate">{name}</span>
          {count > 0 && (
            <span className="ml-auto text-sm opacity-60">({count})</span>
          )}
        </Button>

        {/* Expand/Collapse Button */}
        {(folders.length > 0 || isHovered) && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-60 hover:opacity-100",
              isHovered ? "right-8" : "right-2"
            )}
            onClick={(e) => {
              e.stopPropagation();
              actions.toggleFolder(platform);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Menu Button - Show on hover or when menu is open */}
        {(isHovered || showMenu) && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        )}

        {/* Dropdown Menu */}
        {showMenu && (
          <div 
            className="absolute right-1 top-full z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => {
              setIsMenuHovered(false);
              setShowMenu(false);
              setIsHovered(false);
            }}
          >
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubFolder?.();
                setShowMenu(false);
              }}
            >
              <Plus className="h-3 w-3 mr-2" />
              Add folder
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                // Handle platform deletion
                setShowMenu(false);
              }}
            >
              <MoreVertical className="h-3 w-3 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Sub-folders */}
      {isExpanded && folders.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-depth-1 cursor-pointer"
              style={{
                color: 'var(--neutral-600)',
                fontSize: '14px',
                fontWeight: '400'
              }}
              onClick={() => onSubFolderClick?.(folder.id)}
            >
              <span className="w-2 h-2 rounded-full mr-3 bg-accent-400"></span>
              {folder.name}
              {(folder.linkCount ?? 0) > 0 && (
                <span className="ml-auto text-xs opacity-60">({folder.linkCount})</span>
              )}
            </Button>
          ))}


        </div>
      )}
    </div>
  );
}