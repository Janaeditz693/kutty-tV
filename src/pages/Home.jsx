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
  const trendingItems = catalogItems.filter(item => parseFloat(item.rating) >= 8.8);
  const cartoonShows = catalogItems.filter(item => item.type === 'show');
  const fullMovies = catalogItems.filter(item => item.type === 'movie');
  
  // Curious custom recommendation algorithm (high ratings, shuffled)
  const recommendedItems = [...catalogItems]
    .filter(item => parseFloat(item.rating) >= 8.5)
    .sort(() => 0.5 - Math.random());

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
        
        {/* 2. Continue Watching (Visible only when logged in and content has watch progress) */}
        {currentUser && continueWatching.length > 0 && (
          <Carousel title={t('common.continueWatching')} loading={loading}>
            {continueWatching.map((record) => (
              <ContinueWatchingCard key={record.showId} record={record} />
            ))}
          </Carousel>
        )}

        {/* 3. Trending Shelf */}
        <Carousel title={t('home.trending')} loading={loading}>
          {trendingItems.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>



        {/* 5. Cartoon Series Catalog */}
        <Carousel title={t('common.shows')} loading={loading}>
          {cartoonShows.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

        {/* 6. Cartoon Movies & Films */}
        <Carousel title={t('common.movies')} loading={loading}>
          {fullMovies.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

        {/* 7. Recommended for You Shelf */}
        <Carousel title={t('home.recommended')} loading={loading}>
          {recommendedItems.map((item) => (
            <CartoonCard key={item.id} item={item} />
          ))}
        </Carousel>

      </div>
    </div>
  );
};

export default Home;
