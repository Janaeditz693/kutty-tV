import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tv, Film, Heart, Search } from 'lucide-react';
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

  return (
    <div className="flex flex-col w-full pb-12">
      
      {/* 1. Cinematic Featured Hero Banner Carousel */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5"><div className="h-[230px] sm:h-[340px] lg:h-[440px] rounded-[28px] bg-theme-beige dark:bg-theme-darkCard animate-pulse" /></div>
      ) : (
        <Hero items={featuredItems.length > 0 ? featuredItems : catalogItems.slice(0, 3)} />
      )}

      {/* Browse shortcuts */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <h2 className="text-lg sm:text-xl font-extrabold text-theme-coffee dark:text-theme-darkText tracking-tight mb-3">
          {t('common.browse', { defaultValue: 'Browse' })}
        </h2>
        <div className="grid grid-cols-4 lg:grid-cols-[repeat(4,10rem)] gap-3 sm:gap-4">
          {[
            { to: '/shows', icon: Tv, label: t('common.shows') },
            { to: '/movies', icon: Film, label: t('common.movies') },
            { to: '/favorites', icon: Heart, label: t('common.favorites') },
            { to: '/search', icon: Search, label: t('common.searchLabel', { defaultValue: 'Search' }) },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-white dark:bg-theme-darkCard shadow-[0_6px_18px_-10px_rgba(15,27,61,0.3)] dark:shadow-none border border-transparent dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText hover:text-theme-accent transition-colors"
            >
              <Icon size={22} className="text-theme-accent" />
              <span className="text-[11px] sm:text-sm font-bold truncate max-w-full px-1">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Grid wrapper for shelves */}
      <div className="flex flex-col gap-1 mt-4">
        
        {/* 2. Cartoon Series Catalog */}
        <Carousel title={t('common.shows')} loading={loading} seeAllTo="/shows">
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
          <Carousel title={t('home.trending')} loading={loading}>
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
