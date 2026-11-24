import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [items, isPaused]);

  if (!items || items.length === 0) return null;

  const currentItem = items[index % items.length];
  const isFav = isFavorite(currentItem.id);
  const isTamil = (i18n.language || 'en').startsWith('ta');
  const displayTitle = isTamil && currentItem.titleTa ? currentItem.titleTa : currentItem.title;

  const handlePrev = (e) => { e.stopPropagation(); setIndex((prev) => (prev - 1 + items.length) % items.length); };
  const handleNext = (e) => { e.stopPropagation(); setIndex((prev) => (prev + 1) % items.length); };

  const handlePlay = (e) => {
    e.stopPropagation();
    const firstEpId = currentItem.episodes?.[0]?.id;
    navigate(currentItem.type === 'movie' || !firstEpId ? `/watch/${currentItem.id}` : `/watch/${currentItem.id}/${firstEpId}`);
  };

  const image = currentItem.banner || currentItem.thumbnail;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
        onClick={() => navigate(`/details/${currentItem.id}`)}
        className="relative overflow-hidden rounded-[28px] h-[230px] sm:h-[340px] lg:h-[440px] bg-theme-darkBg text-white shadow-xl shadow-blue-900/20 cursor-pointer"
        aria-roledescription="carousel"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentItem.id}
            src={optimizeImageUrl(image, 'hero')}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/55 to-transparent" />

        {/* Bottom-left: play + title */}
        <div className="absolute left-4 right-24 bottom-4 sm:left-8 sm:bottom-8 flex items-end gap-3 sm:gap-5">
          <button
            onClick={handlePlay}
            aria-label={t('common.watchNow')}
            className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/25 hover:bg-theme-accent backdrop-blur-md border border-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Play size={20} className="fill-white ml-0.5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="min-w-0"
            >
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-white/85 mb-0.5">
                <span className="inline-flex items-center gap-1">
                  <Star size={11} className="fill-theme-sun stroke-none" />
                  {currentItem.rating}
                </span>
                <span>· {currentItem.year}</span>
                {currentItem.genres?.[0] && <span className="hidden sm:inline">· {currentItem.genres[0]}</span>}
              </div>
              <h1 className="text-lg sm:text-3xl lg:text-4xl font-black leading-tight truncate drop-shadow">{displayTitle}</h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Add to list */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(currentItem); }}
          aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2.5 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
        >
          {isFav ? <Check size={16} className="text-green-400" /> : <Plus size={16} />}
        </button>

        {items.length > 1 && (
          <>
            <button onClick={handlePrev} aria-label="Previous slide" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} aria-label="Next slide" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white cursor-pointer">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-5 right-4 sm:bottom-9 sm:right-8 flex items-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === index % items.length ? 'w-6 bg-white' : 'w-1.5 bg-white/45'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Hero;
