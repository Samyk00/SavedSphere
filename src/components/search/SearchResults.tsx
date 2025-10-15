'use client';

import { useMemo, memo } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LinkCard from '@/components/links/LinkCard';
import type { Link } from '@/lib/types';

interface SearchResultsProps {
  searchQuery: string;
  filteredLinks: Link[];
  isSearching?: boolean;
  onClearSearch: () => void;
  currentViewMode: 'grid' | 'list';
  onLinkEdit: (link: Link) => void;
  onLinkDelete: (linkId: string) => void;
  onLinkToggleFavorite: (linkId: string) => void;
  onLinkOpen?: (url: string) => void;
}

// Function to highlight search terms in text
function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
}

const SearchResults = memo(function SearchResults({
  searchQuery,
  filteredLinks,
  isSearching = false,
  onClearSearch,
  currentViewMode,
  onLinkEdit,
  onLinkDelete,
  onLinkToggleFavorite,
  onLinkOpen = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
}: SearchResultsProps) {
  // Enhanced links with highlighted search terms
  const enhancedLinks = useMemo(() => {
    if (!searchQuery.trim()) return filteredLinks.map(link => ({ link, highlighted: null }));
    
    return filteredLinks.map(link => ({
      link,
      highlighted: {
        title: highlightSearchTerm(link.title, searchQuery),
        description: link.description ? highlightSearchTerm(link.description, searchQuery) : undefined,
        url: highlightSearchTerm(link.url, searchQuery),
        tags: link.tags.map(tag => highlightSearchTerm(tag, searchQuery))
      }
    }));
  }, [filteredLinks, searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;
  const showNoResults = hasSearchQuery && !isSearching && filteredLinks.length === 0;
  const showResults = hasSearchQuery && filteredLinks.length > 0;

  if (!hasSearchQuery) {
    return null;
  }

  return (
    <div className="space-y-4 pt-12 px-6">


      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-6">No results found</h3>
          <Button
            variant="outline"
            onClick={onClearSearch}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Search Results */}
      {showResults && !isSearching && (
        <div className="space-y-4">
          {/* Search Statistics - all screens */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredLinks.length} result{filteredLinks.length !== 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 sm:hidden"
            >
              Clear
            </Button>
          </div>

          {/* Results Grid/List */}
          <div className={
            currentViewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-3"
          }>
            {enhancedLinks.map((item) => (
              <LinkCard
                key={item.link.id}
                link={item.link}
                viewMode={currentViewMode}
                onEdit={() => onLinkEdit(item.link)}
                onDelete={() => onLinkDelete(item.link.id)}
                onToggleFavorite={() => onLinkToggleFavorite(item.link.id)}
                onOpenLink={onLinkOpen}
                // Pass highlighted content as custom props if LinkCard supports it
                highlightedTitle={item.highlighted?.title}
                highlightedDescription={item.highlighted?.description}
                highlightedUrl={item.highlighted?.url}
                highlightedTags={item.highlighted?.tags}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default SearchResults;