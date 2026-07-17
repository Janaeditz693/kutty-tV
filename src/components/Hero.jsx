import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Hero = ({ items = [] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 7000); // Change hero slide every 7 seconds
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const currentItem = items[index];
  const isFav = isFavorite(currentItem.id);
  const currentLang = i18n.language || 'en';

  const displayTitle = currentLang.startsWith('ta') && currentItem.titleTa ? currentItem.titleTa : currentItem.title;
  const displayDesc = currentLang.startsWith('ta') && currentItem.descriptionTa ? currentItem.descriptionTa : currentItem.description;

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const handlePlay = () => {
    if (currentItem.type === 'movie') {
      navigate(`/watch/${currentItem.id}`);
    } else {
      const firstEpId = currentItem.episodes && currentItem.episodes.length > 0 ? currentItem.episodes[0].id : '';
      navigate(`/watch/${currentItem.id}${firstEpId ? `/${firstEpId}` : ''}`);
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[400px] max-h-[700px] overflow-hidden bg-theme-coffee/10 dark:bg-theme-darkBg transition-colors duration-300">
      
      {/* Background Images with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Main Slide Image */}
          <img
            src={currentItem.banner}
            alt={displayTitle}
            className="w-full h-full object-cover object-center"
          />

          
          {/* Gradient Overlay bottom to top */}
          <div className="absolute inset-0 bg-gradient-to-t from-theme-cream via-theme-cream/45 to-transparent dark:from-theme-darkBg dark:via-theme-darkBg/50 dark:to-transparent transition-all duration-300" />
          
          {/* Left vertical gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-theme-cream/80 via-theme-cream/20 to-transparent dark:from-theme-darkBg/85 dark:via-theme-darkBg/20 dark:to-transparent hidden md:block transition-all duration-300" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md text-theme-cream hover:scale-105 transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md text-theme-cream hover:scale-105 transition-all duration-200"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Carousel Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-24 right-8 z-30 hidden md:flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-theme-orange' : 'w-2.5 bg-theme-coffee/35 dark:bg-theme-cream/35'
              }`}
            />
          ))}
        </div>
      )}

      {/* Hero Content Overlays */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-8 sm:px-8 sm:pb-12 md:pb-16 max-w-7xl mx-auto flex flex-col justify-end h-full">
        <div className="max-w-xl md:max-w-2xl flex flex-col gap-3">
          
          {/* Metadata badges (Rating, Year, Language, Genres) */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-theme-coffee/80 dark:text-theme-cream/80">
            <span className="px-2 py-0.5 bg-amber-500 rounded-md text-black flex items-center gap-1 font-extrabold shadow-sm">
              <Star size={11} className="fill-black stroke-none" />
              {currentItem.rating}
            </span>
            <span className="px-2 py-0.5 bg-theme-coffee/10 dark:bg-theme-darkCard rounded-md border border-theme-coffee/15 dark:border-theme-darkBorder">
              {currentItem.year}
            </span>
            <span className="px-2 py-0.5 bg-theme-coffee/10 dark:bg-theme-darkCard rounded-md border border-theme-coffee/15 dark:border-theme-darkBorder text-theme-orange">
              {currentItem.languages?.includes('தமிழ்') ? 'ENG | தமிழ்' : 'ENGLISH'}
            </span>
            <span className="hidden sm:inline text-theme-coffee/40 dark:text-theme-cream/40">|</span>
            <span className="hidden sm:inline">{currentItem.genres?.join(', ')}</span>
          </div>

          {/* Large Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText font-sans drop-shadow-md">
            {displayTitle}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-theme-coffee/70 dark:text-theme-darkText/75 line-clamp-3 leading-relaxed drop-shadow-sm font-medium">
            {displayDesc}
          </p>

          {/* Play & Favorite Actions */}
          <div className="flex items-center gap-3 mt-2 sm:mt-4">
            
            {/* Watch Now Button */}
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-6 py-3 bg-theme-orange hover:bg-theme-orange-light active:scale-95 text-theme-cream font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-200 cursor-pointer"
            >
              <Play size={18} className="fill-theme-cream ml-0.5" />
              <span>{t('common.watchNow')}</span>
            </button>

            {/* List Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(currentItem);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-theme-coffee/5 hover:bg-theme-coffee/10 dark:bg-theme-darkCard dark:hover:bg-theme-darkBorder border border-theme-coffee/15 dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText font-bold text-sm sm:text-base rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {isFav ? (
                <>
                  <Check size={18} className="text-green-600 dark:text-green-500" />
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

        </div>
      </div>

    </div>
  );
};

export default Hero;
