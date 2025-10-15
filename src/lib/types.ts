// Core data types for SavedSphere application

export type Platform =
  | 'youtube'
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'pinterest'
  | 'reddit'
  | 'github'
  | 'medium'
  | 'blog'
  | 'other';

export interface Link {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  platform: Platform;
  tags: string[];
  folderId?: string;
  folderPath?: string; // Full folder path for nested hierarchy
  isFavorite: boolean;
  duration?: string; // Video duration in MM:SS format
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean; // For soft delete functionality
  deletedAt?: Date; // Timestamp when moved to trash
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string; // For nested folder hierarchy
  platform?: Platform; // For platform-specific folders
  isSystemFolder?: boolean; // For read-only platform folders
  isPlatformFolder?: boolean; // Specifically for the 5 main platform folders
  path?: string; // Full folder path for breadcrumbs
  depth?: number; // Folder nesting depth (0 = root level)
  childrenIds?: string[]; // IDs of child folders
  linkCount?: number; // Cached count of links in this folder
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  usageCount: number;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  gridSize: 'small' | 'medium' | 'large';
  defaultView: 'grid' | 'list';
  showThumbnails: boolean;
  autoDetectPlatform: boolean;
  sortBy: 'newest' | 'oldest' | 'title' | 'platform';
  sidebarCollapsed: boolean; // Sidebar state preference
  expandedFolders: string[]; // IDs of expanded folders
}

// Sidebar-specific types
export interface SidebarState {
  isCollapsed: boolean;
  expandedFolders: Set<string>;
  selectedFolderId?: string;
  selectedView: 'all' | 'favorites' | 'trash' | 'folder';
  searchQuery: string;
  isSearchMode: boolean;
  bulkSelectMode: boolean;
  selectedLinkIds: Set<string>;
}

export interface SidebarContextType {
  state: SidebarState;
  actions: {
    toggleSidebar: () => void;
    toggleFolder: (folderId: string) => void;
    selectFolder: (folderId: string) => void;
    selectView: (view: SidebarState['selectedView']) => void;
    setSearchQuery: (query: string) => void;
    toggleBulkSelect: () => void;
    toggleLinkSelection: (linkId: string) => void;
    clearSelection: () => void;
    selectAllLinks: (linkIds: string[]) => void;
  };
}

export interface NavigationItem {
  id: string;
  type: 'view' | 'folder' | 'platform';
  label: string;
  icon: string;
  count?: number;
  isActive?: boolean;
  isExpanded?: boolean;
  children?: NavigationItem[];
  platform?: Platform;
  folderId?: string;
}

export interface PlatformFolderData {
  platform: Platform;
  name: string;
  color: string;
  icon: string;
  isSystemFolder: true;
  isPlatformFolder: true;
}

export interface AppState {
  links: Link[];
  folders: Folder[];
  tags: Tag[];
  preferences: UserPreferences;
  searchQuery: string;
  selectedFolderId?: string;
  selectedTags: string[];
  selectedPlatforms: Platform[];
  isLoading: boolean;
  deletedLinks: Link[];
  sidebarState: SidebarState; // Add sidebar state to app state
}

// Form types for creating/editing
export interface LinkFormData {
  url: string;
  title: string;
  description?: string;
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
}

export interface FolderFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string; // For creating nested folders
  platform?: Platform; // For platform-specific folders
}

// Filter and search types
export interface SearchFilters {
  query: string;
  folderId?: string;
  tags: string[];
  platforms: Platform[];
  isFavorite?: boolean;
  sortBy: UserPreferences['sortBy'];
  includeDeleted?: boolean; // For trash view
}

// Bulk operations types
export interface BulkOperation {
  type: 'move' | 'delete' | 'favorite' | 'unfavorite' | 'restore' | 'permanentDelete';
  linkIds: string[];
  targetFolderId?: string; // For move operations
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  message: string;
}

// UI component props
export interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showSelectCheckbox?: boolean;
}

export interface FolderItemProps {
  folder: Folder;
  linkCount: number;
  isSelected: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  onEdit: (folder: Folder) => void;
  onDelete: (id: string) => void;
  onToggleExpand?: () => void;
  depth?: number; // For nested folder indentation
}

export interface SidebarItemProps {
  item: NavigationItem;
  isSelected: boolean;
  onClick: () => void;
  onToggleExpand?: () => void;
  depth?: number;
}

// Modal and dialog types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface AddLinkModalProps extends ModalProps {
  onSave: (data: LinkFormData) => void;
  initialData?: Partial<LinkFormData>;
}

export interface AddFolderModalProps extends ModalProps {
  onSave: (data: FolderFormData) => void;
  initialData?: Partial<FolderFormData>;
  parentFolderId?: string; // For creating nested folders
  platform?: Platform; // For platform-specific folders
}

export interface BulkOperationModalProps extends ModalProps {
  operation: BulkOperation;
  onConfirm: (operation: BulkOperation) => void;
  folders?: Folder[]; // For move operations
}

// LocalStorage keys
export const STORAGE_KEYS = {
  LINKS: 'savedsphere_links',
  FOLDERS: 'savedsphere_folders',
  TAGS: 'savedsphere_tags',
  PREFERENCES: 'savedsphere_preferences',
  DELETED_LINKS: 'savedsphere_deleted_links',
  SIDEBAR_STATE: 'savedsphere_sidebar_state',
  PLATFORM_FOLDERS_INITIALIZED: 'savedsphere_platform_folders_init',
} as const;

// Platform detection and metadata
export interface PlatformMetadata {
  name: string;
  color: string;
  icon: string;
  domainRegex: RegExp;
}

// The 5 main platforms for pre-population as specified in sidebarsprint.md
export const MAIN_PLATFORMS: Platform[] = ['youtube', 'instagram', 'linkedin', 'github', 'reddit'];

export const PLATFORM_METADATA: Record<Platform, PlatformMetadata> = {
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: 'Play',
    domainRegex: /youtube\.com|youtu\.be/
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: 'Camera',
    domainRegex: /instagram\.com/
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    icon: 'Twitter',
    domainRegex: /twitter\.com|x\.com/
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: 'Facebook',
    domainRegex: /facebook\.com/
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    icon: 'Linkedin',
    domainRegex: /linkedin\.com/
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: 'Music',
    domainRegex: /tiktok\.com/
  },
  pinterest: {
    name: 'Pinterest',
    color: '#E60023',
    icon: 'Pin',
    domainRegex: /pinterest\.com/
  },
  reddit: {
    name: 'Reddit',
    color: '#FF4500',
    icon: 'MessageSquare',
    domainRegex: /reddit\.com/
  },
  github: {
    name: 'GitHub',
    color: '#181717',
    icon: 'Github',
    domainRegex: /github\.com/
  },
  medium: {
    name: 'Medium',
    color: '#000000',
    icon: 'BookOpen',
    domainRegex: /medium\.com/
  },
  blog: {
    name: 'Blog',
    color: '#6B7280',
    icon: 'FileText',
    domainRegex: /blog|article|news|post|story/i
  },
  other: {
    name: 'Other',
    color: '#6B7280',
    icon: 'Link',
    domainRegex: /.*/
  }
};

// Add Threads platform
export type ExtendedPlatform = Platform | 'threads';

export const EXTENDED_PLATFORM_METADATA: Record<ExtendedPlatform, PlatformMetadata> = {
  ...PLATFORM_METADATA,
  threads: {
    name: 'Threads',
    color: '#000000',
    icon: 'MessageCircle',
    domainRegex: /threads\.net/
  }
};

// Trash retention configuration
export const TRASH_RETENTION_DAYS = 15;

// Default sidebar state
export const DEFAULT_SIDEBAR_STATE: SidebarState = {
  isCollapsed: false,
  expandedFolders: new Set<string>(),
  selectedView: 'all',
  searchQuery: '',
  isSearchMode: false,
  bulkSelectMode: false,
  selectedLinkIds: new Set<string>(),
};