import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';

const Hero = ({ items = [] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % items.length), 6500);
    return () => clearInterval(interval);
  }, [items, isPaused]);

  if (!items || items.length === 0) return null;

  const active = index % items.length;
  const currentItem = items[active];
  const isFav = isFavorite(currentItem.id);
  const isTamil = (i18n.language || 'en').startsWith('ta');
  const displayTitle = isTamil && currentItem.titleTa ? currentItem.titleTa : currentItem.title;

  const go = (e, next) => { e.stopPropagation(); setIndex((next + items.length) % items.length); };

  const handlePlay = (e) => {
    e.stopPropagation();
    const firstEpId = currentItem.episodes?.[0]?.id;
    navigate(currentItem.type === 'movie' || !firstEpId ? `/watch/${currentItem.id}` : `/watch/${currentItem.id}/${firstEpId}`);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
        onClick={() => navigate(`/details/${currentItem.id}`)}
        className="relative overflow-hidden rounded-3xl h-[420px] sm:h-[400px] lg:h-[480px] bg-theme-navy text-white shadow-xl shadow-indigo-950/25 cursor-pointer"
        aria-roledescription="carousel"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img src={optimizeImageUrl(currentItem.thumbnail, 'hero')} alt="" className="sm:hidden w-full h-full object-cover object-top" />
            <img src={optimizeImageUrl(currentItem.banner || currentItem.thumbnail, 'hero')} alt="" className="hidden sm:block w-full h-full object-cover object-center" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-theme-navy via-theme-navy/40 to-transparent" />

        {/* Trending badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-theme-sun text-black text-xs font-extrabold shadow">
          {t('home.trendingBadge', { defaultValue: 'Trending' })} <span className="text-sm">#{active + 1}</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(currentItem); }}
          aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
        >
          {isFav ? <Check size={16} className="text-green-400" /> : <Plus size={16} />}
        </button>

        {/* Title + Watch Now */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-10 sm:pb-9 flex flex-col items-center sm:items-start text-center sm:text-left gap-3"
          >
            <p className="text-sm sm:text-base font-semibold text-white/90 max-w-full truncate">
              {displayTitle} <span className="text-white/60">·</span>{' '}
              <span className="font-bold">{currentItem.type === 'movie' ? t('common.movie', { defaultValue: 'Movie' }) : t('common.show', { defaultValue: 'Show' })}</span>
            </p>
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-theme-accent hover:bg-theme-accent-light active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-rose-500/30 transition-all cursor-pointer"
            >
              <Play size={16} className="fill-white" />
              {t('common.watchNow')}
            </button>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <>
            <button onClick={(e) => go(e, active - 1)} aria-label="Previous slide" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <button onClick={(e) => go(e, active + 1)} aria-label="Next slide" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Dots under the card */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-5 bg-theme-accent' : 'w-1.5 bg-theme-coffee/25 dark:bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
