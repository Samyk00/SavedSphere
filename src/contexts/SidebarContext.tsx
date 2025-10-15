'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  SidebarState, 
  SidebarContextType, 
  DEFAULT_SIDEBAR_STATE,
  STORAGE_KEYS 
} from '@/lib/types';

// Sidebar action types
type SidebarAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_COLLAPSED'; payload: boolean }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'SET_EXPANDED_FOLDERS'; payload: string[] }
  | { type: 'SELECT_FOLDER'; payload: string }
  | { type: 'SELECT_VIEW'; payload: SidebarState['selectedView'] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_MODE'; payload: boolean }
  | { type: 'TOGGLE_BULK_SELECT' }
  | { type: 'SET_BULK_SELECT_MODE'; payload: boolean }
  | { type: 'TOGGLE_LINK_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_ALL_LINKS'; payload: string[] }
  | { type: 'LOAD_STATE'; payload: Partial<SidebarState> };

// Sidebar reducer
function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, isCollapsed: !state.isCollapsed };
    
    case 'SET_COLLAPSED':
      return { ...state, isCollapsed: action.payload };
    
    case 'TOGGLE_FOLDER': {
      const newExpandedFolders = new Set(state.expandedFolders);
      if (newExpandedFolders.has(action.payload)) {
        newExpandedFolders.delete(action.payload);
      } else {
        newExpandedFolders.add(action.payload);
      }
      return { ...state, expandedFolders: newExpandedFolders };
    }
    
    case 'SET_EXPANDED_FOLDERS':
      return { ...state, expandedFolders: new Set(action.payload) };
    
    case 'SELECT_FOLDER':
      return { 
        ...state, 
        selectedFolderId: action.payload,
        selectedView: 'folder',
        searchQuery: '',
        isSearchMode: false,
        bulkSelectMode: false,
        selectedLinkIds: new Set()
      };
    
    case 'SELECT_VIEW':
      return { 
        ...state, 
        selectedView: action.payload,
        selectedFolderId: action.payload === 'folder' ? state.selectedFolderId : undefined,
        searchQuery: '',
        isSearchMode: false,
        bulkSelectMode: false,
        selectedLinkIds: new Set()
      };
    
    case 'SET_SEARCH_QUERY':
      return { 
        ...state, 
        searchQuery: action.payload,
        isSearchMode: action.payload.length > 0
      };
    
    case 'SET_SEARCH_MODE':
      return { ...state, isSearchMode: action.payload };
    
    case 'TOGGLE_BULK_SELECT':
      return { 
        ...state, 
        bulkSelectMode: !state.bulkSelectMode,
        selectedLinkIds: new Set() // Clear selection when toggling mode
      };
    
    case 'SET_BULK_SELECT_MODE':
      return { 
        ...state, 
        bulkSelectMode: action.payload,
        selectedLinkIds: action.payload ? state.selectedLinkIds : new Set()
      };
    
    case 'TOGGLE_LINK_SELECTION': {
      const newSelectedLinkIds = new Set(state.selectedLinkIds);
      if (newSelectedLinkIds.has(action.payload)) {
        newSelectedLinkIds.delete(action.payload);
      } else {
        newSelectedLinkIds.add(action.payload);
      }
      
      // Auto-exit bulk select mode if no items are selected
      const shouldExitBulkMode = newSelectedLinkIds.size === 0 && state.bulkSelectMode;
      
      return { 
        ...state, 
        selectedLinkIds: newSelectedLinkIds,
        bulkSelectMode: shouldExitBulkMode ? false : state.bulkSelectMode
      };
    }
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedLinkIds: new Set() };
    
    case 'SELECT_ALL_LINKS':
      return { ...state, selectedLinkIds: new Set(action.payload) };
    
    case 'LOAD_STATE':
      return { 
        ...state, 
        ...action.payload,
        // Convert arrays back to Sets for client-side state
        expandedFolders: new Set(action.payload.expandedFolders || []),
        selectedLinkIds: new Set(action.payload.selectedLinkIds || [])
      };
    
    default:
      return state;
  }
}

// Create context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Utility functions for localStorage operations
function loadSidebarState(): Partial<SidebarState> {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        // Don't persist search state and bulk selection
        searchQuery: '',
        isSearchMode: false,
        bulkSelectMode: false,
        selectedLinkIds: new Set(),
      };
    }
  } catch (error) {
    console.error('Error loading sidebar state:', error);
  }
  
  return {};
}

function saveSidebarState(state: SidebarState): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Convert Sets to arrays for storage
    const stateToSave = {
      isCollapsed: state.isCollapsed,
      expandedFolders: Array.from(state.expandedFolders),
      selectedFolderId: state.selectedFolderId,
      selectedView: state.selectedView,
      // Don't persist search state and bulk selection
    };
    
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving sidebar state:', error);
  }
}

// Provider component
interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [state, dispatch] = useReducer(sidebarReducer, DEFAULT_SIDEBAR_STATE);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadSidebarState();
    if (Object.keys(savedState).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);

  // Save state to localStorage when it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSidebarState(state);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Context actions
  const actions: SidebarContextType['actions'] = {
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    
    toggleFolder: (folderId: string) => 
      dispatch({ type: 'TOGGLE_FOLDER', payload: folderId }),
    
    selectFolder: (folderId: string) => 
      dispatch({ type: 'SELECT_FOLDER', payload: folderId }),
    
    selectView: (view: SidebarState['selectedView']) => 
      dispatch({ type: 'SELECT_VIEW', payload: view }),
    
    setSearchQuery: (query: string) => 
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    
    toggleBulkSelect: () => dispatch({ type: 'TOGGLE_BULK_SELECT' }),
    
    toggleLinkSelection: (linkId: string) => 
      dispatch({ type: 'TOGGLE_LINK_SELECTION', payload: linkId }),
    
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    
    selectAllLinks: (linkIds: string[]) => 
      dispatch({ type: 'SELECT_ALL_LINKS', payload: linkIds }),
  };

  const contextValue: SidebarContextType = {
    state,
    actions,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook to use sidebar context
export function useSidebarState(): SidebarContextType {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebarState must be used within a SidebarProvider');
  }
  
  return context;
}

// Additional utility hooks
export function useSidebarActions() {
  const { actions } = useSidebarState();
  return actions;
}

export function useSidebarSelection() {
  const { state, actions } = useSidebarState();
  
  return {
    bulkSelectMode: state.bulkSelectMode,
    selectedLinkIds: state.selectedLinkIds,
    selectedCount: state.selectedLinkIds.size,
    toggleBulkSelect: actions.toggleBulkSelect,
    toggleLinkSelection: actions.toggleLinkSelection,
    clearSelection: actions.clearSelection,
    selectAllLinks: actions.selectAllLinks,
  };
}

export function useSidebarNavigation() {
  const { state, actions } = useSidebarState();
  
  return {
    selectedView: state.selectedView,
    selectedFolderId: state.selectedFolderId,
    searchQuery: state.searchQuery,
    isSearchMode: state.isSearchMode,
    selectView: actions.selectView,
    selectFolder: actions.selectFolder,
    setSearchQuery: actions.setSearchQuery,
  };
}