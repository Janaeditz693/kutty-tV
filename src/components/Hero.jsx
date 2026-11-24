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
  const displayDesc = isTamil && currentItem.descriptionTa ? currentItem.descriptionTa : currentItem.description;

  const handlePrev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);
  const handleNext = () => setIndex((prev) => (prev + 1) % items.length);

  const handlePlay = () => {
    if (currentItem.type === 'movie') {
      navigate(`/watch/${currentItem.id}`);
    } else {
      const firstEpId = currentItem.episodes && currentItem.episodes.length > 0 ? currentItem.episodes[0].id : '';
      navigate(`/watch/${currentItem.id}${firstEpId ? `/${firstEpId}` : ''}`);
    }
  };

  const image = currentItem.banner || currentItem.thumbnail;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
      className="relative w-full -mt-16 min-h-[460px] h-[78svh] max-h-[760px] overflow-hidden bg-theme-darkBg text-white"
      aria-roledescription="carousel"
    >
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={optimizeImageUrl(image, 'hero')}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Readability gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-theme-darkBg via-theme-darkBg/55 to-theme-darkBg/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-theme-darkBg/90 via-theme-darkBg/35 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl flex flex-col gap-3 sm:gap-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-theme-sun text-black font-extrabold">
                <Star size={11} className="fill-black stroke-none" />
                {currentItem.rating}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/12 backdrop-blur-sm border border-white/15">
                {currentItem.year}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/12 backdrop-blur-sm border border-white/15 text-theme-sun">
                {currentItem.languages?.includes('தமிழ்') ? 'ENG | தமிழ்' : 'ENGLISH'}
              </span>
              {currentItem.genres?.length > 0 && (
                <span className="hidden sm:inline text-white/60">{currentItem.genres.slice(0, 3).join(' · ')}</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] drop-shadow-lg">
              {displayTitle}
            </h1>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl">
              {displayDesc}
            </p>

            <div className="flex items-center gap-3 mt-1 sm:mt-2">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-theme-orange hover:bg-theme-orange-light active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-full shadow-lg shadow-orange-500/30 transition-all duration-200 cursor-pointer"
              >
                <Play size={18} className="fill-white" />
                <span>{t('common.watchNow')}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentItem);
                }}
                className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-white/12 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm sm:text-base rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
              >
                {isFav ? (
                  <>
                    <Check size={18} className="text-green-400" />
                    <span>{t('common.addedToList')}</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>{t('common.addToList')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white hover:scale-105 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-md text-white hover:scale-105 transition-all cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-5 sm:bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === index % items.length ? 'w-8 bg-theme-orange' : 'w-3 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;
