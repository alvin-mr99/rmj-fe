import { createSignal } from 'solid-js';
import type { SearchControlProps } from '../types';

/**
 * SearchControl Component
 * 
 * Provides location search functionality using Nominatim geocoding API.
 * Allows users to search for locations and center the map on results.
 * 
 * Requirements: 6.3, 6.4
 */
export function SearchControl(props: SearchControlProps) {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [isSearching, setIsSearching] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  /**
   * Handle search query submission
   * Requirements: 6.3, 6.4, 8.5
   */
  const handleSearch = async (e: Event) => {
    e.preventDefault();
    
    const query = searchQuery().trim();
    if (!query) {
      setErrorMessage('Please enter a location to search');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      // Use Nominatim API for geocoding (free, no API key required)
      // Graceful degradation for optional API feature - Requirement 8.5
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'UndergroundCableMap/1.0' // Nominatim requires User-Agent
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }

      const results = await response.json();

      // Handle "no results found" case gracefully - Requirements 6.3, 6.4, 8.5
      if (!results || results.length === 0) {
        setErrorMessage('No results found. Try a different search term.');
        setIsSearching(false);
        return;
      }

      // Validate result data
      const result = results[0];
      if (!result.lon || !result.lat) {
        throw new Error('Invalid search result data');
      }

      // Get first result coordinates
      const coordinates: [number, number] = [
        parseFloat(result.lon),
        parseFloat(result.lat)
      ];

      // Validate coordinates
      if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        throw new Error('Invalid coordinates in search result');
      }

      // Center map on search result - Requirement 6.3
      // Add temporary marker at result location - Requirement 6.4
      props.onLocationSelect(coordinates);

      // Clear search query after successful search
      setSearchQuery('');
      setIsSearching(false);
    } catch (error) {
      // Graceful API degradation - Requirement 8.5
      // Log errors to console for debugging
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Search error:', errorMsg);
      
      // Display user-friendly error message
      setErrorMessage('Search is temporarily unavailable. Please try again later.');
      setIsSearching(false);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
    // Clear error message when user starts typing
    if (errorMessage()) {
      setErrorMessage(null);
    }
  };

  return (
    <div class="absolute top-2.5 left-2.5 right-2.5 z-[1000] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)] p-3 w-auto max-w-none md:max-w-[380px] md:right-auto lg:max-w-[420px] lg:p-3.5">
      <form onSubmit={handleSearch} class="flex flex-col gap-2.5 items-stretch md:flex-row md:gap-2 lg:flex-row lg:gap-2.5">
        <input
          type="text"
          value={searchQuery()}
          onInput={handleInputChange}
          placeholder="Search for a location..."
          class="flex-1 px-3.5 py-3 border border-gray-300 rounded text-base outline-none transition-colors duration-200 w-full min-h-[44px] appearance-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(74,144,226,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 md:min-h-[40px] md:text-[15px] lg:min-h-[38px] lg:text-sm lg:px-3 lg:py-2.5"
          disabled={isSearching()}
          aria-label="Location search"
        />
        <button
          type="submit"
          class="px-5 py-3 bg-blue-500 text-white border-none rounded text-base font-medium cursor-pointer transition-all duration-200 whitespace-nowrap w-full min-h-[44px] [-webkit-tap-highlight-color:transparent] hover:bg-blue-600 active:bg-blue-700 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 md:w-auto md:min-w-[100px] md:min-h-[40px] md:text-[15px] lg:w-auto lg:min-w-[100px] lg:min-h-[38px] lg:text-sm lg:px-5 lg:py-2.5 lg:hover:-translate-y-px lg:hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] lg:active:translate-y-0"
          disabled={isSearching() || !searchQuery().trim()}
          aria-label="Search"
        >
          {isSearching() ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {/* Error message display */}
      {errorMessage() && (
        <div class="mt-2 p-2.5 px-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm leading-[1.4] md:text-[13px] lg:text-[13px]" role="alert">
          {errorMessage()}
        </div>
      )}
    </div>
  );
}
