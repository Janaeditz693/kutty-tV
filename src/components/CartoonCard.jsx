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

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const meta =
    item.type === 'movie'
      ? `${Math.floor((item.duration || 0) / 3600)}h ${String(Math.round(((item.duration || 0) % 3600) / 60)).padStart(2, '0')}m`
      : `${item.episodes?.length || 0} ${t('common.epsShort', { defaultValue: 'Eps' })}`;

  return (
    <motion.div
      whileHover={isTouch ? {} : { y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full select-none"
    >
      <Link
        to={`/details/${item.id}`}
        className="block p-2 rounded-3xl bg-white dark:bg-theme-darkCard shadow-[0_6px_18px_-8px_rgba(15,27,61,0.25)] dark:shadow-none border border-transparent dark:border-theme-darkBorder hover:shadow-[0_14px_30px_-10px_rgba(31,111,235,0.35)] transition-shadow duration-300"
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-theme-beige dark:bg-theme-darkBg">
          <img
            src={optimizeImageUrl(item.thumbnail, 'card')}
            alt={displayTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <button
            onClick={(e) => { stop(e); toggleFavorite(item); }}
            aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
            className={`absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 transition-colors cursor-pointer ${
              isFav ? 'text-red-500' : 'text-white hover:text-red-400'
            }`}
          >
            <Heart size={14} className={isFav ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="px-2 pt-2.5 pb-1.5">
          <h3 className="font-bold text-sm text-theme-coffee dark:text-theme-darkText truncate">{displayTitle}</h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-xs font-bold text-theme-coffee dark:text-theme-darkText">{meta}</span>
            <button
              onClick={(e) => { stop(e); navigate(watchPath); }}
              aria-label={t('common.play')}
              className="w-8 h-8 shrink-0 rounded-full bg-theme-accent hover:bg-theme-accent-light text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-colors cursor-pointer"
            >
              <Play size={13} className="fill-white ml-0.5" />
            </button>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-theme-coffee dark:text-theme-darkText">
              {item.rating}
              <Star size={12} className="fill-theme-sun stroke-none" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CartoonCard;
