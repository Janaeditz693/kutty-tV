import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tv, SlidersHorizontal } from 'lucide-react';
import { getAllCatalogItems } from '../services/db';
import CartoonCard from '../components/CartoonCard';
import Skeleton from '../components/Skeleton';

const Shows = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLang, setSelectedLang] = useState('All');
  const [sortBy, setSortBy] = useState('rating'); // rating or year

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        const data = await getAllCatalogItems();
        const shows = data.filter(i => i.type === 'show');
        setItems(shows);
        setFiltered(shows);
      } catch (err) {
        console.error("Error fetching shows catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  // Compute filters
  useEffect(() => {
    let result = [...items];

    // 1. Genre filter
    if (selectedGenre !== 'All') {
      result = result.filter(item => item.genres?.includes(selectedGenre));
    }

    // 2. Language filter
    if (selectedLang !== 'All') {
      result = result.filter(item => item.languages?.includes(selectedLang));
    }

    // 3. Sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'year') {
      result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }

    setFiltered(result);
  }, [selectedGenre, selectedLang, sortBy, items]);

  // Extract all available genres for filter dropdown
  const genres = ['All', ...new Set(items.flatMap(i => i.genres || []))];
  const currentLang = i18n.language || 'en';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText flex items-center gap-2.5">
          <Tv size={24} className="text-theme-orange" />
          <span>{t('common.shows')}</span>
        </h1>
        <p className="text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium">
          Explore all serial cartoons from your childhood days.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-premium bg-theme-beige/25 border border-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro">
        <div className="flex items-center gap-2 text-theme-coffee/80 dark:text-theme-darkText/80 font-bold text-sm">
          <SlidersHorizontal size={16} className="text-theme-orange" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          {/* Genre select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-theme-coffee/60 dark:text-theme-darkText/50">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-theme-coffee/15 bg-theme-cream text-theme-coffee dark:bg-theme-darkBg dark:border-theme-darkBorder dark:text-theme-darkText focus:outline-none"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-theme-coffee/60 dark:text-theme-darkText/50">Language:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-theme-coffee/15 bg-theme-cream text-theme-coffee dark:bg-theme-darkBg dark:border-theme-darkBorder dark:text-theme-darkText focus:outline-none"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="தமிழ்">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-theme-coffee/60 dark:text-theme-darkText/50">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-theme-coffee/15 bg-theme-cream text-theme-coffee dark:bg-theme-darkBg dark:border-theme-darkBorder dark:text-theme-darkText focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="year">Release Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="flex-grow">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <CartoonCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-theme-coffee/15 rounded-premium bg-theme-beige/5">
            <Tv size={36} className="mx-auto text-theme-coffee/30 dark:text-theme-darkText/30 mb-2" />
            <p className="text-sm font-bold text-theme-coffee/70 dark:text-theme-darkText/70">No matching shows found.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Shows;
