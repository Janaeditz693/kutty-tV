import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, PlusCircle, Play, Star, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';
import { formatRuntime } from '../utils/genre';

const Favorites = () => {
  const { t, i18n } = useTranslation();
  const { favorites, toggleFavorite } = useApp();
  const isTamil = (i18n.language || 'en').startsWith('ta');

  const [filter, setFilter] = useState('all');
  const movies = favorites.filter((f) => f.type === 'movie');
  const shows = favorites.filter((f) => f.type !== 'movie');
  const list = filter === 'movies' ? movies : filter === 'shows' ? shows : favorites;
  const chips = [
    { key: 'all', label: `${t('common.all', { defaultValue: 'All' })} (${favorites.length})` },
    { key: 'movies', label: `${t('common.movies')} (${movies.length})` },
    { key: 'shows', label: `${t('common.shows')} (${shows.length})` },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 min-h-[80vh] flex flex-col gap-5">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText">
        {t('home.myList', { defaultValue: 'My List' })}
      </h1>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-bold border cursor-pointer transition-colors ${
              filter === c.key
                ? 'bg-theme-accent/25 border-theme-accent/60 text-theme-coffee dark:text-white'
                : 'border-theme-coffee/10 dark:border-white/10 text-theme-coffee/60 dark:text-white/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="flex flex-col gap-4">
          {list.map((item) => {
            const title = isTamil && item.titleTa ? item.titleTa : item.title;
            const meta = item.type === 'movie'
              ? (item.duration ? formatRuntime(item.duration) : null)
              : (item.episodes?.length ? `${item.episodes.length} ${t('common.epsShort', { defaultValue: 'Eps' })}` : null);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <Link to={`/details/${item.id}`} className="relative w-36 shrink-0 aspect-video rounded-2xl overflow-hidden bg-theme-beige dark:bg-theme-darkCard">
                  <img src={optimizeImageUrl(item.thumbnail, 'card')} alt={title} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="w-9 h-9 rounded-full bg-black/45 border border-white/40 flex items-center justify-center">
                      <Play size={14} className="fill-white text-white ml-0.5" />
                    </span>
                  </span>
                </Link>
                <Link to={`/details/${item.id}`} className="min-w-0 flex-1">
                  <h3 className="font-bold text-theme-coffee dark:text-theme-darkText truncate">{title}</h3>
                  <p className="mt-1 text-xs font-semibold text-theme-coffee/55 dark:text-theme-darkText/55">
                    {[meta, item.year, item.genres?.[0]].filter(Boolean).join(' • ')}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-theme-coffee/70 dark:text-white/70">
                    <Star size={11} className="fill-theme-sun stroke-none" /> {item.rating}
                  </span>
                </Link>
                <button
                  onClick={() => toggleFavorite(item)}
                  aria-label={t('common.remove', { defaultValue: 'Remove' })}
                  className="p-2.5 rounded-full text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-theme-coffee/15 dark:border-white/15 rounded-3xl px-4">
          <div className="p-4 rounded-full bg-theme-accent/20 text-theme-accent-text mb-4">
            <Bookmark size={36} className="stroke-[2]" />
          </div>
          <h3 className="text-xl font-bold text-theme-coffee dark:text-theme-darkText">{t('profile.favoritesEmpty')}</h3>
          <p className="text-xs text-theme-coffee/55 dark:text-theme-darkText/50 mt-1.5 max-w-sm leading-relaxed">
            Tap "My List" on any show to keep it here.
          </p>
          <Link to="/" className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-theme-accent hover:bg-theme-accent-light text-theme-onaccent font-bold text-sm rounded-full shadow-md transition-all active:scale-95">
            <PlusCircle size={15} />
            <span>Browse Cartoons</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
