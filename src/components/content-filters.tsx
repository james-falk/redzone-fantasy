'use client';

import { useState } from 'react';
import { ContentFilters } from '@/lib/types';
import { Search, X } from 'lucide-react';

interface ContentFiltersProps {
  filters: ContentFilters;
  sources: string[];
  onFiltersChange: (filters: ContentFilters) => void;
}

export default function ContentFiltersComponent({ 
  filters, 
  sources, 
  onFiltersChange
}: ContentFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleFilterChange = (key: keyof ContentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ContentFilters];
    return value !== undefined && value !== '' && value !== null;
  });

  return (
    <div className="mb-8">
      {/* Filters Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => handleFilterChange('type', undefined)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !filters.type
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        <button
          onClick={() => handleFilterChange('type', 'video')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'video'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Videos
        </button>
        
        <button
          onClick={() => handleFilterChange('type', 'article')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'article'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Articles
        </button>
        
        <button
          onClick={() => handleFilterChange('type', 'podcast')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.type === 'podcast'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Podcasts
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Source Filter Dropdown */}
      {sources.length > 0 && (
        <div className="mb-6">
          <select
            value={filters.sourceName || ''}
            onChange={(e) => handleFilterChange('sourceName', e.target.value || undefined)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
