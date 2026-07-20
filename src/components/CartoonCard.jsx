import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Heart, Star, Film, Tv } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CartoonCard = ({ item }) => {
  const { t, i18n } = useTranslation();
  const { toggleFavorite, isFavorite, continueWatching } = useApp();
  const navigate = useNavigate();
  
  const isFav = isFavorite(item.id);
  const currentLang = i18n.language || 'en';

  const watchRecord = (continueWatching || []).find(c => c.showId === item.id);
  const percentage = watchRecord && watchRecord.duration > 0 ? (watchRecord.progress / watchRecord.duration) * 100 : 0;
  
  const displayTitle = currentLang.startsWith('ta') && item.titleTa ? item.titleTa : item.title;
  const displayDesc = currentLang.startsWith('ta') && item.descriptionTa ? item.descriptionTa : item.description;

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item);
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // For shows, navigate to the first episode, for movies navigate to the player directly
    if (item.type === 'movie') {
      navigate(`/watch/${item.id}`);
    } else {
      const firstEpId = item.episodes && item.episodes.length > 0 ? item.episodes[0].id : '';
      navigate(`/watch/${item.id}${firstEpId ? `/${firstEpId}` : ''}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-full h-full rounded-premium bg-theme-cream border border-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro hover:shadow-retro-hover overflow-hidden group select-none flex flex-col justify-between"
    >
      {/* Link surrounding the card */}
      <Link to={item.type === 'movie' ? `/watch/${item.id}` : `/watch/${item.id}/${item.episodes?.[0]?.id || ''}`}>
        
        {/* Card Thumbnail Area */}
        <div className="relative aspect-[16/10] overflow-hidden bg-theme-coffee/5">
          {/* Main Thumbnail */}
          <img 
            src={item.thumbnail} 
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Type Badge (Show / Movie) */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/65 backdrop-blur-md rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-theme-cream uppercase tracking-wider">
            {item.type === 'movie' ? <Film size={11} /> : <Tv size={11} />}
            <span>{item.type === 'movie' ? t('common.movies') : t('common.shows')}</span>
          </div>

          {/* Star Rating Badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/90 backdrop-blur-md rounded-lg flex items-center gap-1 text-[10px] font-extrabold text-black">
            <Star size={11} className="fill-black stroke-none" />
            <span>{item.rating}</span>
          </div>

          {/* Thin Netflix/Prime Video style orange progress bar along the bottom of thumbnail */}
          {percentage > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-1 z-30 bg-black/60 backdrop-blur-xs">
              <div 
                className="h-full bg-theme-orange rounded-r-full transition-all duration-300 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                style={{ width: `${Math.max(10, Math.min(100, percentage))}%` }}
              />
            </div>
          )}

          {/* Hover Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
            {/* Play Button */}
            <button 
              onClick={handlePlayClick}
              className="p-3 bg-theme-orange hover:bg-theme-orange-light text-theme-cream rounded-full shadow-lg transform scale-90 hover:scale-105 transition-all duration-200"
              title={t('common.play')}
            >
              <Play size={20} className="fill-theme-cream ml-0.5" />
            </button>

            {/* Favorite Button */}
            <button 
              onClick={handleFavClick}
              className={`p-3 bg-black/55 hover:bg-black/80 rounded-full border border-theme-cream/20 shadow-lg transition-colors duration-200 ${
                isFav ? 'text-red-500' : 'text-theme-cream'
              }`}
              title={isFav ? t('common.addedToList') : t('common.addToList')}
            >
              <Heart size={20} className={isFav ? 'fill-current stroke-current' : ''} />
            </button>
          </div>
        </div>

        {/* Card Details Area */}
        <div className="p-4 flex flex-col gap-1 bg-theme-cream dark:bg-theme-darkCard">
          {/* Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-theme-coffee dark:text-theme-darkText truncate tracking-wide">
            {displayTitle}
          </h3>

          {/* Meta text line */}
          <div className="flex items-center gap-2 text-[11px] text-theme-coffee/50 dark:text-theme-darkText/40 font-semibold uppercase tracking-wider">
            <span>{item.year}</span>
            <span className="w-1 h-1 rounded-full bg-theme-coffee/20 dark:bg-theme-darkBorder" />
            <span>
              {item.type === 'movie' 
                ? `${Math.round(item.duration / 60)} min` 
                : `${item.episodes?.length || 0} ${t('common.episodes')}`
              }
            </span>
            <span className="w-1 h-1 rounded-full bg-theme-coffee/20 dark:bg-theme-darkBorder" />
            <span className="text-[10px] text-theme-orange font-bold">
              {item.languages?.includes('தமிழ்') ? 'TAM' : 'ENG'}
            </span>
          </div>

          {/* Localized short description snippet */}
          <p className="text-[11px] text-theme-coffee/60 dark:text-theme-darkText/50 line-clamp-2 mt-1 leading-normal leading-relaxed">
            {displayDesc}
          </p>
        </div>

      </Link>
    </motion.div>
  );
};

export default CartoonCard;
