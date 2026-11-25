import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, Plus, Check, Star, Share2 } from 'lucide-react';
import { getCatalogItemById, getAllCatalogItems } from '../services/db';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';
import { genreColor, formatRuntime } from '../utils/genre';
import CartoonCard from '../components/CartoonCard';

const Details = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toggleFavorite, isFavorite } = useApp();

  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getCatalogItemById(showId), getAllCatalogItems()])
      .then(([res, all]) => {
        if (!active) return;
        setItem(res || null);
        const others = (all || []).filter((x) => x.id !== showId);
        // same type first, then the rest
        others.sort((a, b) => Number(b.type === res?.type) - Number(a.type === res?.type));
        setRelated(others.slice(0, 10));
      })
      .catch(() => active && setItem(null))
      .finally(() => active && setLoading(false));
    window.scrollTo(0, 0);
    return () => { active = false; };
  }, [showId]);

  if (loading) return <div className="min-h-[70svh] bg-theme-navy animate-pulse" />;

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
  const isMovie = item.type === 'movie';
  const episodes = item.episodes || [];
  const firstEpId = episodes[0]?.id;
  const watchPath = isMovie || !firstEpId ? `/watch/${item.id}` : `/watch/${item.id}/${firstEpId}`;
  const genre = item.genres?.[0];

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled share */ }
  };

  const Action = ({ icon: Icon, label, onClick, active }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-xs font-semibold text-white/85 cursor-pointer">
      <span className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${active ? 'bg-theme-accent border-theme-accent' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
        <Icon size={20} />
      </span>
      {label}
    </button>
  );

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-theme-navy text-white pb-10">
      {/* Poster / backdrop */}
      <div className="relative h-[46svh] md:h-[52svh] max-h-[560px]">
        <img src={optimizeImageUrl(item.thumbnail, 'hero')} alt="" className="md:hidden w-full h-full object-cover object-top" />
        <img src={optimizeImageUrl(item.banner || item.thumbnail, 'hero')} alt="" className="hidden md:block w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-theme-navy via-theme-navy/30 to-black/30" />

        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={() => navigate(watchPath)}
          aria-label={t('common.watchNow')}
          className="absolute right-5 -bottom-7 z-10 w-16 h-16 rounded-full bg-theme-accent hover:bg-theme-accent-light active:scale-95 flex items-center justify-center shadow-xl shadow-rose-500/40 transition-all cursor-pointer"
        >
          <Play size={26} className="fill-white ml-1" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-5 -mt-2 relative">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight pr-16">{title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-semibold text-white/70">
          <span>{isMovie ? formatRuntime(item.duration) : `${episodes.length} ${t('common.episodes')}`}</span>
          <span className="text-theme-accent">•</span>
          <span>{isMovie ? t('common.movie', { defaultValue: 'Movie' }) : t('common.show', { defaultValue: 'Show' })}</span>
          {genre && (
            <>
              <span className="text-theme-accent">•</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold text-white ${genreColor(genre)}`}>{genre}</span>
            </>
          )}
          <span className="text-theme-accent">•</span>
          <span>{item.year}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm font-bold">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-theme-sun text-black text-xs font-extrabold">
            <Star size={11} className="fill-black stroke-none" /> {t('common.rating', { defaultValue: 'Rating' })}
          </span>
          <span className="text-white/80">{item.rating}/10</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-start gap-7">
          <Action
            icon={isFav ? Check : Plus}
            label={t('common.watchlist', { defaultValue: 'Watchlist' })}
            onClick={() => toggleFavorite(item)}
            active={isFav}
          />
          <Action icon={Share2} label={copied ? 'Link copied' : t('common.share', { defaultValue: 'Share' })} onClick={handleShare} />
        </div>

        <h2 className="mt-8 text-lg font-extrabold">
          {t('common.aboutThis', { defaultValue: 'About this' })} {isMovie ? t('common.movie', { defaultValue: 'Movie' }) : t('common.show', { defaultValue: 'Show' })}
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/75">{description}</p>

        {!isMovie && episodes.length > 0 && (
          <>
            <h2 className="mt-8 text-lg font-extrabold">{t('common.episodes')}</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {episodes.map((ep, i) => (
                <Link
                  key={ep.id}
                  to={`/watch/${item.id}/${ep.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-theme-darkCard hover:bg-theme-darkBorder transition-colors"
                >
                  <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black/30 shrink-0">
                    {ep.thumbnail && <img src={optimizeImageUrl(ep.thumbnail, 'card')} alt="" className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{ep.number || i + 1}. {ep.title}</p>
                    {ep.duration ? <p className="text-xs text-white/55">{Math.round(ep.duration / 60)} min</p> : null}
                  </div>
                  <span className="w-9 h-9 rounded-full bg-theme-accent flex items-center justify-center shrink-0">
                    <Play size={14} className="fill-white ml-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {related.length > 0 && (
        <div className="max-w-3xl mx-auto mt-8">
          <h2 className="px-5 text-lg font-extrabold">{t('common.moreLikeThis', { defaultValue: 'More like this' })}</h2>
          <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar px-5 pb-2">
            {related.map((r) => (
              <div key={r.id} className="w-36 sm:w-40 shrink-0">
                <CartoonCard item={r} tone="dark" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;
