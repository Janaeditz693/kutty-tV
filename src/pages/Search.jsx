import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, X, Sparkles, Tag, HelpCircle } from 'lucide-react';
import { getAllCatalogItems } from '../services/db';
import CartoonCard from '../components/CartoonCard';
import Skeleton from '../components/Skeleton';

const Search = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  // Popular quick tags to search
  const quickTags = [
    { label: '90s Kids', query: '90s' },
    { label: 'Comedy', query: 'Comedy' },
    { label: 'Super Heroes', query: 'Super Heroes' },
    { label: 'Sci-Fi', query: 'Sci-Fi' },
    { label: 'Adventure', query: 'Adventure' },
    { label: 'Dr. Hugo', query: 'Hugo' },
    { label: 'Timid', query: 'Timid' }
  ];

  // Fetch catalog items on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await getAllCatalogItems();
        setItems(data);
      } catch (err) {
        console.error("Error loading search catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Sync state with URL parameter changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Execute filtering & build typing suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems([]);
      setSuggestions([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();

    // Filter Items
    const results = items.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q) || (item.titleTa && item.titleTa.toLowerCase().includes(q));
      const matchDesc = item.description.toLowerCase().includes(q) || (item.descriptionTa && item.descriptionTa.toLowerCase().includes(q));
      const matchGenres = item.genres?.some(g => g.toLowerCase().includes(q));
      const matchCharacters = item.characters?.some(c => c.toLowerCase().includes(q));
      const matchYear = item.year.includes(q);
      
      // Check individual episode titles
      const matchEpisodes = item.episodes?.some(ep => 
        ep.title.toLowerCase().includes(q) || (ep.titleTa && ep.titleTa.toLowerCase().includes(q))
      );

      return matchTitle || matchDesc || matchGenres || matchCharacters || matchYear || matchEpisodes;
    });
    setFilteredItems(results);

    // Build suggestions (matching characters, titles, genres)
    const sug = [];
    items.forEach(item => {
      if (item.title.toLowerCase().includes(q) && !sug.includes(item.title)) {
        sug.push(item.title);
      }
      item.characters?.forEach(char => {
        if (char.toLowerCase().includes(q) && !sug.includes(char)) {
          sug.push(char);
        }
      });
      item.genres?.forEach(gen => {
        if (gen.toLowerCase().includes(q) && !sug.includes(gen)) {
          sug.push(gen);
        }
      });
    });
    setSuggestions(sug.slice(0, 5)); // Limit to 5 live suggestions
  }, [searchQuery, items]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Debounce or update URL params instantly
    if (!val) {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleSuggestionClick = (sugText) => {
    setSearchQuery(sugText);
    setSearchParams({ q: sugText });
    setSuggestions([]);
  };

  const handleClear = () => {
    setSearchQuery('');
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const handleTagClick = (tagQuery) => {
    setSearchQuery(tagQuery);
    setSearchParams({ q: tagQuery });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col gap-6">
      
      {/* Header Title */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText flex items-center gap-2">
          <SearchIcon size={24} className="text-theme-orange" />
          <span>{t('common.search')}</span>
        </h1>
        <p className="text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium">
          {t('common.searchPlaceholder')}
        </p>
      </div>

      {/* Main Search Input Container */}
      <div className="relative w-full max-w-2xl">
        <form onSubmit={handleSearchSubmit} className="relative z-20">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-5 py-4 pl-12 pr-12 text-base rounded-premium bg-theme-cream border-2 border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText shadow-retro placeholder-theme-coffee/30 dark:placeholder-theme-darkText/30 focus:outline-none focus:ring-2 focus:ring-theme-orange/40 focus:border-theme-orange transition-all duration-300"
          />
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-coffee/40 dark:text-theme-darkText/40" />
          
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-theme-coffee/10 dark:hover:bg-theme-darkBorder text-theme-coffee/50 dark:text-theme-darkText/50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Live typing suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-2xl overflow-hidden py-1">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="w-full text-left px-5 py-2.5 text-sm font-semibold hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBorder text-theme-coffee/85 dark:text-theme-darkText/80 flex items-center gap-2.5 transition-colors duration-150"
              >
                <Sparkles size={13} className="text-theme-orange" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Autocomplete Quick Tag Chips */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-coffee/40 dark:text-theme-darkText/30 flex items-center gap-1">
          <Tag size={12} />
          <span>Quick Tags:</span>
        </span>
        {quickTags.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => handleTagClick(tag.query)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 ${
              searchQuery.toLowerCase() === tag.query.toLowerCase()
                ? 'bg-theme-orange border-theme-orange text-theme-cream'
                : 'bg-theme-cream border-theme-coffee/10 hover:border-theme-coffee/30 dark:bg-theme-darkCard dark:border-theme-darkBorder text-theme-coffee/80 dark:text-theme-darkText/80'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Results grid */}
      <div className="mt-4 flex-grow">
        {loading ? (
          // Grid loading skeleton placeholders
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : searchQuery.trim() ? (
          filteredItems.length > 0 ? (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-coffee/40 dark:text-theme-darkText/30">
                Found {filteredItems.length} Match{filteredItems.length > 1 ? 'es' : ''}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <CartoonCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            // No Results Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-theme-coffee/10 dark:border-theme-darkBorder rounded-premium bg-theme-beige/10 dark:bg-theme-darkCard/25 px-4">
              <HelpCircle size={44} className="text-theme-coffee/30 dark:text-theme-darkText/30 animate-pulse mb-3" />
              <h3 className="text-lg font-bold text-theme-coffee dark:text-theme-darkText">
                {t('common.noResults')}
              </h3>
              <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-1 max-w-sm">
                Try searching for other words like 'Hugo', 'Timid', 'Comedy', '90s', or click one of the quick tags above!
              </p>
            </div>
          )
        ) : (
          // Pre-Search state (Show curated recommendations or browsing categories)
          <div className="flex flex-col justify-center items-center py-16 border-2 border-dashed border-theme-coffee/10 dark:border-theme-darkBorder rounded-premium bg-theme-beige/5 text-center">
            <SearchIcon size={40} className="text-theme-coffee/20 dark:text-theme-darkText/20 mb-3" />
            <h3 className="text-base font-bold text-theme-coffee/70 dark:text-theme-darkText/70 uppercase tracking-wider">
              Ready to travel back in time?
            </h3>
            <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-1 max-w-sm">
              Type the name of a character (like 'Hiro'), a theme, or year above to retrieve your childhood cartoons.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Search;
