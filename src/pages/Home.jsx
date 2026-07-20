import React, { useState, useEffect } from 'react';
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
        <div className="w-full aspect-[16/9] md:aspect-[21/9] min-h-[400px] bg-theme-coffee/5 dark:bg-theme-darkCard animate-pulse" />
      ) : (
        <Hero items={featuredItems.length > 0 ? featuredItems : catalogItems.slice(0, 3)} />
      )}

      {/* Grid wrapper for shelves */}
      <div className="flex flex-col gap-2 mt-4 sm:mt-6">
        
        {/* 2. Cartoon Series Catalog */}
        <Carousel title={t('common.shows')} loading={loading}>
          {cartoonShows.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

        {/* 3. Cartoon Movies & Films */}
        <Carousel title={t('common.movies')} loading={loading}>
          {fullMovies.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

        {/* 4. Continue Watching (Visible when logged in and content has watch progress) */}
        {currentUser && continueWatching && continueWatching.length > 0 && (
          <Carousel title={t('common.continueWatching')} loading={loading}>
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
