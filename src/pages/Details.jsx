import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, Star, ChevronDown } from 'lucide-react';
import { getCatalogItemById } from '../services/db';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
};

const Details = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toggleFavorite, isFavorite } = useApp();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setExpanded(false);
    getCatalogItemById(showId)
      .then((res) => active && setItem(res || null))
      .catch(() => active && setItem(null))
      .finally(() => active && setLoading(false));
    window.scrollTo(0, 0);
    return () => { active = false; };
  }, [showId]);

  if (loading) {
    return <div className="min-h-[70svh] bg-theme-navy animate-pulse" />;
  }

  if (!item) {
    return (
      <div className="min-h-[60svh] flex flex-col items-center justify-center gap-4 text-theme-coffee dark:text-theme-darkText">
        <p className="font-bold">Title not found</p>
        <Link to="/" className="px-5 py-2 rounded-full bg-theme-accent text-white font-bold">{t('common.home')}</Link>
      </div>
    );
  }

  const isTamil = (i18n.language || 'en').startsWith('ta');
  const title = isTamil && item.titleTa ? item.titleTa : item.title;
  const description = isTamil && item.descriptionTa ? item.descriptionTa : item.description;
  const isFav = isFavorite(item.id);
  const filledStars = Math.max(0, Math.min(5, Math.round(parseFloat(item.rating) / 2) || 0));
  const episodes = item.episodes || [];
  const firstEpId = episodes[0]?.id;
  const watchPath =
    item.type === 'movie' || !firstEpId ? `/watch/${item.id}` : `/watch/${item.id}/${firstEpId}`;

  const meta = [
    item.year,
    item.genres?.[0],
    item.type === 'movie' && item.duration
      ? formatDuration(item.duration)
      : `${episodes.length} ${t('common.episodes')}`,
  ].filter(Boolean);

  return (
    <div className="relative w-full min-h-[calc(100svh-4rem)] overflow-hidden bg-theme-navy text-white">
      {/* Poster (portrait on phones, wide on larger screens) */}
      <div className="absolute inset-x-0 top-0 h-[62svh] md:h-[66svh]">
        <img
          src={optimizeImageUrl(item.thumbnail, 'hero')}
          alt=""
          className="md:hidden w-full h-full object-cover object-top"
        />
        <img
          src={optimizeImageUrl(item.banner || item.thumbnail, 'hero')}
          alt=""
          className="hidden md:block w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-navy/30 to-theme-navy" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-[46svh] md:pt-[42svh] pb-32 lg:pb-16 max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg"
        >
          {title}
        </motion.h1>

        <p className="mt-2 text-sm sm:text-base font-semibold text-white/85">{meta.join('  |  ')}</p>

        <div className="mt-3 flex items-center gap-1" aria-label={`Rating ${item.rating}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={20} className={i < filledStars ? 'fill-theme-sun stroke-none' : 'fill-white/30 stroke-none'} />
          ))}
          <span className="ml-2 text-sm font-bold text-white/85">{item.rating}</span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => toggleFavorite(item)}
            aria-label={isFav ? t('common.addedToList') : t('common.addToList')}
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isFav ? <Check size={20} className="text-green-300" /> : <Plus size={20} />}
          </button>

          <button
            onClick={() => navigate(watchPath)}
            aria-label={t('common.watchNow')}
            className="w-20 h-20 rounded-full bg-white/30 hover:bg-white/40 active:scale-95 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-2xl shadow-blue-950/40 transition-all cursor-pointer"
          >
            <Play size={34} className="fill-white ml-1" />
          </button>

          <div className="w-12 h-12" aria-hidden="true" />
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-6 flex flex-col items-center gap-0.5 text-sm font-semibold text-white/85 cursor-pointer"
          aria-expanded={expanded}
        >
          {expanded ? t('common.showLess', { defaultValue: 'Show Less' }) : t('common.showMore', { defaultValue: 'Show More' })}
          <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden text-left"
            >
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/80">{description}</p>

              {item.type !== 'movie' && episodes.length > 0 && (
                <div className="mt-5 flex flex-col gap-2">
                  <h2 className="text-base font-extrabold">{t('common.episodes')}</h2>
                  {episodes.map((ep, i) => (
                    <Link
                      key={ep.id}
                      to={`/watch/${item.id}/${ep.id}`}
                      className="flex items-center gap-3 p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black/30 shrink-0">
                        {ep.thumbnail && <img src={optimizeImageUrl(ep.thumbnail, 'card')} alt="" className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{ep.number || i + 1}. {ep.title}</p>
                        {ep.duration ? <p className="text-xs text-white/60">{Math.round(ep.duration / 60)} min</p> : null}
                      </div>
                      <span className="w-8 h-8 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
                        <Play size={13} className="fill-white ml-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Details;
