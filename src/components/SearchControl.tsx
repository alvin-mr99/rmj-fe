import { createSignal } from 'solid-js';
import type { SearchControlProps } from '../types';
import './SearchControl.css';

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
    <div class="search-control">
      <form onSubmit={handleSearch} class="search-form">
        <input
          type="text"
          value={searchQuery()}
          onInput={handleInputChange}
          placeholder="Search for a location..."
          class="search-input"
          disabled={isSearching()}
          aria-label="Location search"
        />
        <button
          type="submit"
          class="search-button"
          disabled={isSearching() || !searchQuery().trim()}
          aria-label="Search"
        >
          {isSearching() ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {/* Error message display */}
      {errorMessage() && (
        <div class="search-error" role="alert">
          {errorMessage()}
        </div>
      )}
    </div>
  );
}
