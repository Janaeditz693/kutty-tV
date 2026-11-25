import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';
import { formatRuntime } from '../utils/genre';

// tone="dark" forces light text for use on the dark details page
const CartoonCard = ({ item, tone }) => {
  const { t, i18n } = useTranslation();
  const { toggleFavorite, isFavorite } = useApp();

  const isFav = isFavorite(item.id);
  const isTamil = (i18n.language || 'en').startsWith('ta');
  const displayTitle = isTamil && item.titleTa ? item.titleTa : item.title;
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const meta =
    item.type === 'movie'
      ? (item.duration ? formatRuntime(item.duration) : '')
      : (item.episodes?.length ? `${item.episodes.length} ${t('common.epsShort', { defaultValue: 'Eps' })}` : '');

  const titleColor = tone === 'dark' ? 'text-white' : 'text-theme-coffee dark:text-theme-darkText';
  const metaColor = tone === 'dark' ? 'text-white/55' : 'text-theme-coffee/55 dark:text-theme-darkText/55';

  return (
    <motion.div whileHover={isTouch ? {} : { y: -4 }} transition={{ duration: 0.2 }} className="w-full select-none">
      <Link to={`/details/${item.id}`} className="block group">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-theme-beige dark:bg-theme-darkCard shadow-[0_8px_20px_-10px_rgba(39,24,126,0.5)] group-hover:shadow-[0_16px_30px_-10px_rgba(225,29,92,0.45)] transition-shadow duration-300">
          <img
            src={optimizeImageUrl(item.thumbnail, 'card')}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-white">
            <Star size={11} className="fill-theme-sun stroke-none" />
            {item.rating}
          </span>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item); }}
            aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
            className={`absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 transition-colors cursor-pointer ${
              isFav ? 'text-theme-accent' : 'text-white hover:text-theme-accent-light'
            }`}
          >
            <Heart size={14} className={isFav ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="pt-2.5 px-0.5">
          <h3 className={`font-bold text-sm truncate ${titleColor}`}>{displayTitle}</h3>
          <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${metaColor}`}>
            {[item.year, meta].filter(Boolean).join(' · ')}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default CartoonCard;
