'use client';

import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LinkCard from '@/components/links/LinkCard';
import type { Link } from '@/lib/types';

interface SearchResultsProps {
  searchQuery: string;
  filteredLinks: Link[];
  totalLinks: number;
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

export default function SearchResults({
  searchQuery,
  filteredLinks,
  totalLinks,
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
    <div className="space-y-4">
      {/* Search Results Header */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Search className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-sm text-blue-700">
              {isSearching ? (
                'Searching...'
              ) : (
                `${filteredLinks.length} of ${totalLinks} links found`
              )}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSearch}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Search
        </Button>
      </div>

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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">
            No links match your search for &ldquo;{searchQuery}&rdquo;. Try:
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-6">
            <li>• Checking your spelling</li>
            <li>• Using different keywords</li>
            <li>• Searching for broader terms</li>
            <li>• Removing filters to expand results</li>
          </ul>
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
          {/* Search Statistics */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredLinks.length} result{filteredLinks.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Search className="h-3 w-3 mr-1" />
                Search Active
              </Badge>
            </div>
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
}