import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const tabs = [
    { key: 'foryou', label: t('home.forYou', { defaultValue: 'For You' }) },
    { key: 'series', label: t('common.shows', { defaultValue: 'TV Shows' }) },
    { key: 'movies', label: t('common.movies', { defaultValue: 'Movies' }) },
    { key: 'list', label: t('home.myList', { defaultValue: 'My List' }) },
  ];
  const tabItems = {
    foryou: featuredItems.length > 0 ? featuredItems : catalogItems.slice(0, 5),
    series: cartoonShows,
    movies: fullMovies,
  };
  const heroItems = (tabItems[activeChip] || tabItems.foryou).slice(0, 6);

  return (
    <div className="flex flex-col w-full pb-12">

      {/* Tabs */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => (tab.key === 'list' ? navigate('/favorites') : setActiveChip(tab.key))}
              className={`shrink-0 px-5 py-2 rounded-2xl text-sm font-bold border transition-colors cursor-pointer ${
                activeChip === tab.key
                  ? 'bg-theme-accent/25 border-theme-accent/60 text-theme-coffee dark:text-white'
                  : 'border-theme-coffee/10 dark:border-white/10 text-theme-coffee/60 dark:text-white/60 hover:text-theme-coffee dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured card */}
      {loading ? (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"><div className="h-[440px] rounded-[1.75rem] bg-theme-beige dark:bg-theme-darkCard animate-pulse" /></div>
      ) : (
        <Hero items={heroItems} />
      )}

      {/* Grid wrapper for shelves */}
      <div className="flex flex-col gap-1 mt-3">
        
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
          <Carousel id="row-trending" title={t('home.trending', { defaultValue: 'Trending Now' })} loading={loading}>
            {trendingItems.map((item) => (
              <CartoonCard key={item.id} item={item} />
            ))}
          </Carousel>
        )}

        {/* 2. Cartoon Series Catalog */}
        <Carousel title={t('common.shows', { defaultValue: 'TV Shows' })} loading={loading} seeAllTo="/shows">
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

      </div>
    </div>
  );
};

export default Home;
