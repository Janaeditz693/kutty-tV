import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, Check, Star, Info, Heart } from 'lucide-react';
import { getCatalogItemById, getAllCatalogItems } from '../services/db';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';
import { formatRuntime } from '../utils/genre';
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
  const [seeAll, setSeeAll] = useState(false);

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

  if (loading) return <div className="min-h-[70svh] bg-theme-beige dark:bg-theme-darkCard animate-pulse" />;

  if (!item) {
    return (
      <div className="min-h-[60svh] flex flex-col items-center justify-center gap-4 text-theme-coffee dark:text-theme-darkText">
        <p className="font-bold">Title not found</p>
        <Link to="/" className="px-5 py-2 rounded-full bg-theme-accent text-theme-onaccent font-bold">{t('common.home')}</Link>
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

  const chip = 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-theme-coffee/8 dark:bg-white/10 text-theme-coffee dark:text-white';
  const stars = Math.round((parseFloat(item.rating) || 0) / 2);

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-theme-coffee dark:bg-theme-darkBg">
      <div className="max-w-3xl mx-auto relative">
        {/* Full-bleed image */}
        <div className="relative h-[52svh] max-h-[560px]">
          <img src={optimizeImageUrl(item.thumbnail, 'hero')} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white text-theme-coffee shadow-lg flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleShare}
            aria-label={copied ? 'Link copied' : 'Share'}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white text-theme-coffee shadow-lg flex items-center justify-center cursor-pointer"
          >
            {copied ? <Check size={20} /> : <Info size={20} />}
          </button>
        </div>

        {/* Bottom sheet */}
        <div className="relative -mt-10 rounded-t-[2.5rem] bg-theme-cream dark:bg-theme-darkBg text-theme-coffee dark:text-theme-darkText px-5 pt-6 pb-12 min-h-[50svh]">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-theme-coffee/55 dark:text-white/55">{[item.year, item.languages?.[0]].filter(Boolean).join(' · ')}</p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight leading-tight">{title}</h1>
            </div>
            <button
              onClick={() => navigate(watchPath)}
              aria-label={t('common.watchNow')}
              className="shrink-0 w-16 h-16 rounded-full bg-theme-accent active:scale-95 flex items-center justify-center shadow-xl shadow-black/20 transition-all cursor-pointer"
            >
              <Play size={26} className="fill-theme-onaccent text-theme-onaccent ml-1" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={chip}>{isMovie ? (formatRuntime(item.duration) || 'Movie') : `${episodes.length} ${t('common.episodes')}`}</span>
            {item.genres?.slice(0, 2).map((g) => <span key={g} className={chip}>{g}</span>)}
            <span className={chip}>{isMovie ? t('common.movie', { defaultValue: 'Movie' }) : t('common.show', { defaultValue: 'Show' })}</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div>
              <p className="text-3xl font-black leading-none">{item.rating}<span className="text-sm font-bold text-theme-coffee/50 dark:text-white/50">/10</span></p>
              <div className="mt-1.5 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} className={n <= stars ? 'fill-theme-sun stroke-theme-sun' : 'stroke-theme-coffee/25 dark:stroke-white/25'} />
                ))}
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(item)}
              className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-colors ${isFav ? 'bg-red-500 text-white' : 'bg-theme-coffee/8 dark:bg-white/10'}`}
            >
              <Heart size={16} className={isFav ? 'fill-white' : ''} />
              {t('common.watchlist', { defaultValue: 'Watchlist' })}
            </button>
          </div>

          <h2 className="mt-7 text-lg font-extrabold">
            {t('common.aboutThis', { defaultValue: 'About this' })} {isMovie ? t('common.movie', { defaultValue: 'Movie' }) : t('common.show', { defaultValue: 'Show' })}
          </h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-theme-coffee/75 dark:text-white/75">{description}</p>

          {!isMovie && episodes.length > 0 && (
            <>
              <div className="mt-7 flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{t('common.episodes')}</h2>
                {episodes.length > 3 && (
                  <button onClick={() => setSeeAll((v) => !v)} className="text-sm font-bold text-theme-coffee/60 dark:text-white/60 cursor-pointer">
                    {seeAll ? 'Show less' : 'See all'}
                  </button>
                )}
              </div>
              <div className={seeAll ? 'mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3' : 'mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1'}>
                {episodes.map((ep, i) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${item.id}/${ep.id}`}
                    className={`relative block ${seeAll ? '' : 'w-40 shrink-0'} aspect-[4/3] rounded-2xl overflow-hidden bg-theme-beige dark:bg-theme-darkCard`}
                  >
                    {ep.thumbnail && <img src={optimizeImageUrl(ep.thumbnail, 'card')} alt="" className="w-full h-full object-cover" loading="lazy" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-2.5 right-2.5 text-xs font-bold text-white truncate">{ep.number || i + 1}. {ep.title}</span>
                    {ep.duration ? <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-theme-accent text-theme-onaccent text-[10px] font-extrabold">{Math.round(ep.duration / 60)} min</span> : null}
                  </Link>
                ))}
              </div>
            </>
          )}

          {related.length > 0 && (
            <>
              <h2 className="mt-8 text-lg font-extrabold">{t('common.moreLikeThis', { defaultValue: 'More like this' })}</h2>
              <div className="mt-3 -mx-5 flex gap-4 overflow-x-auto no-scrollbar px-5 pb-2">
                {related.map((r) => (
                  <div key={r.id} className="w-36 sm:w-40 shrink-0"><CartoonCard item={r} /></div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
