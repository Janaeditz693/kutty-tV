import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';
import { formatRuntime } from '../utils/genre';

// Poster with duration chip + title overlay (cartoon-app style).
const CartoonCard = ({ item }) => {
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
  const sub = [item.year, item.genres?.[0]].filter(Boolean).join(' · ');

  return (
    <motion.div whileHover={isTouch ? {} : { y: -4 }} transition={{ duration: 0.2 }} className="w-full select-none">
      <Link to={`/details/${item.id}`} className="block group">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-theme-beige dark:bg-theme-darkCard shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300 group-hover:shadow-[0_16px_30px_-10px_rgba(139,92,246,0.45)]">
          <img
            src={optimizeImageUrl(item.thumbnail, 'card')}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

          {meta && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-theme-accent text-theme-onaccent text-[10px] font-extrabold shadow">
              {meta}
            </span>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item); }}
            aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
          >
            <Heart size={14} className={isFav ? 'fill-red-500 stroke-red-500' : ''} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="font-extrabold text-sm text-white truncate">{displayTitle}</h3>
            {sub && <p className="mt-0.5 text-[11px] font-semibold text-white/75 truncate">{sub}</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CartoonCard;
