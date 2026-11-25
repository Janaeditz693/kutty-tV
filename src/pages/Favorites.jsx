import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, PlusCircle, Star, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';
import { genreColor, formatRuntime } from '../utils/genre';

const Favorites = () => {
  const { t, i18n } = useTranslation();
  const { favorites, toggleFavorite } = useApp();
  const isTamil = (i18n.language || 'en').startsWith('ta');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 min-h-[80vh] flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText flex items-center gap-2.5">
          <Bookmark size={24} className="fill-theme-accent-text stroke-theme-accent-text" />
          <span>{t('profile.myFavorites')}</span>
        </h1>
        <p className="text-sm text-theme-coffee/60 dark:text-theme-darkText/55 font-medium">{t('profile.loginToSave')}</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {favorites.map((item) => {
            const title = isTamil && item.titleTa ? item.titleTa : item.title;
            const genre = item.genres?.[0];
            // Saved items may not carry episode/duration data, so only show what we know
            const meta = item.type === 'movie'
              ? (item.duration ? formatRuntime(item.duration) : null)
              : (item.episodes?.length ? `${item.episodes.length} ${t('common.epsShort', { defaultValue: 'Eps' })}` : null);
            return (
              <div key={item.id} className="flex items-stretch gap-3 p-3 rounded-2xl bg-white dark:bg-theme-darkCard border border-theme-coffee/5 dark:border-theme-darkBorder shadow-[0_8px_20px_-14px_rgba(39,24,126,0.6)] dark:shadow-none">
                <Link to={`/details/${item.id}`} className="w-20 shrink-0 aspect-[3/4] rounded-xl overflow-hidden bg-theme-beige dark:bg-theme-darkBg">
                  <img src={optimizeImageUrl(item.thumbnail, 'card')} alt={title} className="w-full h-full object-cover" loading="lazy" />
                </Link>

                <Link to={`/details/${item.id}`} className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex flex-col gap-1.5 items-start">
                    <h3 className="font-bold text-theme-coffee dark:text-theme-darkText truncate max-w-full">{title}</h3>
                    {genre && <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white ${genreColor(genre)}`}>{genre}</span>}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-theme-coffee/55 dark:text-theme-darkText/55">
                    {meta && (
                      <>
                        {meta}
                        <span className="text-theme-accent-text">•</span>
                      </>
                    )}
                    {item.year}
                    <span className="text-theme-accent-text">•</span>
                    <Star size={11} className="fill-theme-sun stroke-none" />
                    {item.rating}
                  </p>
                </Link>

                <button
                  onClick={() => toggleFavorite(item)}
                  aria-label={t('common.remove', { defaultValue: 'Remove' })}
                  className="self-center p-2.5 rounded-full text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-accent-text hover:bg-theme-accent/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-theme-coffee/10 dark:border-theme-darkBorder rounded-3xl px-4">
          <div className="p-4 rounded-full bg-theme-accent/10 text-theme-accent-text mb-4">
            <Bookmark size={36} className="stroke-[2]" />
          </div>
          <h3 className="text-xl font-bold text-theme-coffee dark:text-theme-darkText">{t('profile.favoritesEmpty')}</h3>
          <p className="text-xs text-theme-coffee/55 dark:text-theme-darkText/45 mt-1.5 max-w-sm leading-relaxed">
            Find your favourite shows on the homepage and tap the heart or "Add to List" to keep them here.
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
