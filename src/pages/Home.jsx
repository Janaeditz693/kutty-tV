import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import CartoonCard from '../components/CartoonCard';
import ContinueWatchingCard from '../components/ContinueWatchingCard';
import { getAllCatalogItems } from '../services/db';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t } = useTranslation();
  const { continueWatching } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState('foryou');
  
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const itemsResult = await getAllCatalogItems();
        setCatalogItems(itemsResult);
      } catch (err) {
        console.error("Error loading homepage catalogs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter lists for shelves
  const featuredItems = catalogItems.filter(item => item.featured);
  const cartoonShows = catalogItems.filter(item => item.type === 'show');
  const fullMovies = catalogItems.filter(item => item.type === 'movie');
  
  // Trending Items: ratings >= 8.0 or explicit trending property, fallback to top items so it is never empty
  const highRated = catalogItems.filter(item => item.trending || parseFloat(item.rating) >= 8.0);
  const trendingItems = highRated.length > 0 ? highRated : catalogItems.slice(0, 8);

  const [query, setQuery] = useState('');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || t('home.guest', { defaultValue: 'Cartoon Fan' });

  const byDate = [...catalogItems].sort((x, y) => (parseInt(y.year) || 0) - (parseInt(x.year) || 0));
  const chipItems = {
    foryou: featuredItems.length > 0 ? featuredItems : catalogItems.slice(0, 5),
    trending: trendingItems,
    new: byDate,
    movies: fullMovies,
    series: cartoonShows,
  };
  const heroItems = (chipItems[activeChip] || []).slice(0, 6);

  return (
    <div className="flex flex-col w-full pb-12">

      {/* Greeting */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 flex items-center gap-3">
        <Link to={currentUser ? '/profile' : '/login'} className="w-12 h-12 rounded-full bg-theme-accent text-theme-onaccent flex items-center justify-center font-extrabold text-lg shadow ring-2 ring-white">
          {name.charAt(0).toUpperCase()}
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-theme-coffee/60 dark:text-white/60">{greeting}</p>
          <p className="font-extrabold text-lg text-theme-coffee dark:text-theme-darkText truncate">{name}</p>
        </div>
        <Link to="/favorites" aria-label="Favorites" className="w-11 h-11 rounded-full bg-white dark:bg-theme-darkCard shadow flex items-center justify-center text-theme-coffee dark:text-white">
          <Bell size={20} />
        </Link>
      </div>

      {/* Search pill */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white dark:bg-theme-darkCard shadow-md">
          <Search size={18} className="text-theme-coffee/50 dark:text-white/50 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('home.searchPlaceholder', { defaultValue: 'Search cartoons' })}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm font-semibold text-theme-coffee dark:text-theme-darkText placeholder:text-theme-coffee/40 dark:placeholder:text-white/40"
          />
          <button type="submit" aria-label="Search" className="w-10 h-10 rounded-full bg-theme-accent text-theme-onaccent flex items-center justify-center cursor-pointer active:scale-95">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </form>

      {/* Filter chips */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {[
            { key: 'trending', label: t('home.trending', { defaultValue: 'Trending' }) },
            { key: 'new', label: t('home.new', { defaultValue: 'New' }) },
            { key: 'movies', label: t('common.movies', { defaultValue: 'Movies' }) },
            { key: 'series', label: t('home.series', { defaultValue: 'Series' }) },
          ].map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveChip(activeChip === chip.key ? 'foryou' : chip.key)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
                activeChip === chip.key
                  ? 'bg-theme-accent text-theme-onaccent shadow'
                  : 'bg-white dark:bg-theme-darkCard text-theme-coffee dark:text-white/80'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fan carousel */}
      {loading ? (
        <div className="max-w-3xl mx-auto w-full px-4"><div className="h-[330px] rounded-[2rem] bg-theme-beige dark:bg-theme-darkCard animate-pulse" /></div>
      ) : (
        <Hero items={heroItems} />
      )}

      {/* Grid wrapper for shelves */}
      <div className="flex flex-col gap-1 mt-3">
        
        {/* 2. Cartoon Series Catalog */}
        <Carousel title={t('home.popularSeries', { defaultValue: 'Popular Series' })} loading={loading} seeAllTo="/shows">
          {cartoonShows.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

        {/* 3. Cartoon Movies & Films */}
        <Carousel title={t('common.movies')} loading={loading} seeAllTo="/movies">
          {fullMovies.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

        {/* 4. Continue Watching (Visible when logged in and content has watch progress) */}
        {currentUser && continueWatching && continueWatching.length > 0 && (
          <Carousel title={t('common.continueWatching')} loading={loading} wide>
            {continueWatching.map((record) => (
              <ContinueWatchingCard key={record.showId} record={record} />
            ))}
          </Carousel>
        )}

        {/* 5. Trending Now Shelf */}
        {trendingItems.length > 0 && (
          <Carousel id="row-trending" title={t('home.trending')} loading={loading}>
            {trendingItems.map((item) => (
              <CartoonCard key={item.id} item={item} />
            ))}
          </Carousel>
        )}

      </div>
    </div>
  );
};

export default Home;
