import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Heart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';

const CartoonCard = ({ item }) => {
  const { t, i18n } = useTranslation();
  const { toggleFavorite, isFavorite } = useApp();
  const navigate = useNavigate();

  const isFav = isFavorite(item.id);
  const isTamil = (i18n.language || 'en').startsWith('ta');
  const displayTitle = isTamil && item.titleTa ? item.titleTa : item.title;

  const watchPath =
    item.type === 'movie'
      ? `/watch/${item.id}`
      : `/watch/${item.id}${item.episodes?.[0]?.id ? `/${item.episodes[0].id}` : ''}`;

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item);
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(watchPath);
  };

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const hoverAnimation = isTouch ? {} : { y: -6 };

  const meta =
    item.type === 'movie'
      ? `${Math.round((item.duration || 0) / 60)} min`
      : `${item.episodes?.length || 0} ${t('common.episodes')}`;

  return (
    <motion.div
      whileHover={hoverAnimation}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full group select-none"
    >
      <Link to={watchPath} className="block">
        {/* Poster */}
        <div className="relative aspect-[3/4] rounded-premium overflow-hidden bg-theme-beige dark:bg-theme-darkCard border border-theme-coffee/10 dark:border-theme-darkBorder poster-glow transition-shadow duration-300">
          <img
            src={optimizeImageUrl(item.thumbnail, 'card')}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Bottom fade for badge legibility */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

          {/* Rating */}
          <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-theme-sun text-black text-[11px] font-extrabold shadow">
            <Star size={10} className="fill-black stroke-none" />
            {item.rating}
          </div>

          {/* Favourite (always reachable, also on touch) */}
          <button
            onClick={handleFavClick}
            aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
            className={`absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 transition-colors cursor-pointer ${
              isFav ? 'text-red-500' : 'text-white hover:text-red-400'
            }`}
          >
            <Heart size={15} className={isFav ? 'fill-current' : ''} />
          </button>

          {/* Play on hover */}
          <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
            <button
              onClick={handlePlayClick}
              aria-label={t('common.play')}
              className="p-4 rounded-full bg-theme-orange text-white shadow-xl shadow-orange-500/40 scale-90 group-hover:scale-100 transition-transform duration-200 cursor-pointer"
            >
              <Play size={22} className="fill-white ml-0.5" />
            </button>
          </div>

          {/* Language chip */}
          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-extrabold tracking-wider text-white/90 px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm">
            {item.languages?.includes('தமிழ்') ? 'தமிழ் · ENG' : 'ENG'}
          </span>
        </div>

        {/* Title block */}
        <div className="pt-3 px-0.5">
          <h3 className="font-bold text-sm sm:text-[15px] text-theme-coffee dark:text-theme-darkText truncate">
            {displayTitle}
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-theme-coffee/50 dark:text-theme-darkText/45">
            {item.year} · {meta}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default CartoonCard;
