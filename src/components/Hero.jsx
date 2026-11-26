import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';

// Featured card: image, badge, title, meta, blurb, Play Now + My List
const Hero = ({ items = [] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => { setIndex(0); }, [n]);
  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n, paused]);

  if (!n) return null;
  const active = index % n;
  const item = items[active];
  const isTamil = (i18n.language || 'en').startsWith('ta');
  const title = isTamil && item.titleTa ? item.titleTa : item.title;
  const description = isTamil && item.descriptionTa ? item.descriptionTa : item.description;
  const isFav = isFavorite(item.id);
  const firstEp = item.episodes?.[0]?.id;
  const watchPath = item.type === 'movie' || !firstEp ? `/watch/${item.id}` : `/watch/${item.id}/${firstEp}`;
  const meta = [...(item.genres || []).slice(0, 2), item.year].filter(Boolean).join('  •  ');

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div
        onClick={() => navigate(`/details/${item.id}`)}
        className="relative overflow-hidden rounded-[1.75rem] h-[440px] sm:h-[460px] lg:h-[520px] bg-theme-darkCard border border-white/10 shadow-xl shadow-black/30 cursor-pointer text-white"
      >
        <img key={item.id} src={optimizeImageUrl(item.thumbnail, 'hero')} alt="" className="sm:hidden absolute inset-0 w-full h-full object-cover object-top" />
        <img key={`${item.id}-b`} src={optimizeImageUrl(item.banner || item.thumbnail, 'hero')} alt="" className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#150F1C] via-[#150F1C]/55 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col gap-2 sm:max-w-xl">
          <span className="self-start px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/15 text-[11px] font-bold">
            {item.type === 'movie' ? t('common.movie', { defaultValue: 'Movie' }) : t('home.newEpisode', { defaultValue: 'New Episode' })}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">{title}</h2>
          {meta && <p className="text-xs sm:text-sm font-semibold text-white/70">{meta}</p>}
          {description && <p className="text-sm text-white/65 line-clamp-3">{description}</p>}

          <div className="mt-3 flex items-center gap-2.5">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(watchPath); }}
              className="flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 py-3 rounded-2xl bg-theme-accent/80 hover:bg-theme-accent text-theme-onaccent font-extrabold text-sm active:scale-95 transition cursor-pointer"
            >
              <Play size={16} className="fill-current" />
              {t('common.watchNow', { defaultValue: 'Play Now' })}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
              className="flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 font-bold text-sm active:scale-95 transition cursor-pointer"
            >
              {isFav ? <Check size={16} /> : <Plus size={16} />}
              {t('home.myList', { defaultValue: 'My List' })}
            </button>
          </div>
        </div>
      </div>

      {n > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-5 bg-theme-accent' : 'w-1.5 bg-theme-coffee/25 dark:bg-white/25'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
