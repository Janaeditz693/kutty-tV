import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, Plus, Check, Star, Share2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('episodes');

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

  if (loading) return <div className="min-h-[70svh] bg-theme-darkCard animate-pulse" />;

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

  const tabs = [
    ...(!isMovie && episodes.length > 0 ? [{ key: 'episodes', label: t('common.episodes') }] : []),
    { key: 'more', label: t('common.moreLikeThis', { defaultValue: 'More Like This' }) },
    { key: 'details', label: t('common.details', { defaultValue: 'Details' }) },
  ];
  const tab = tabs.some((x) => x.key === activeTab) ? activeTab : tabs[0].key;
  const badge = 'px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[11px] font-bold text-white/85';
  const meta = [item.year, isMovie ? formatRuntime(item.duration) : `${episodes.length} ${t('common.episodes')}`, item.genres?.[0]].filter(Boolean).join('  •  ');

  const Action = ({ icon: Icon, label, onClick, on }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-xs font-semibold text-white/80 cursor-pointer min-w-16">
      <Icon size={22} className={on ? 'text-theme-accent' : ''} />
      {label}
    </button>
  );

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-theme-darkBg text-theme-darkText">
      <div className="max-w-3xl mx-auto relative pb-12">
        {/* Backdrop */}
        <div className="relative h-[52svh] max-h-[540px]">
          <img src={optimizeImageUrl(item.thumbnail, 'hero')} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-theme-darkBg via-theme-darkBg/30 to-black/30" />
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 flex items-center gap-2 px-4 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-sm font-semibold cursor-pointer"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Copied' : t('common.share', { defaultValue: 'Share' })}
          </button>
          <button
            onClick={() => navigate(watchPath)}
            aria-label={t('common.watchNow')}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 w-16 h-16 rounded-full bg-theme-accent/85 backdrop-blur-md active:scale-95 flex items-center justify-center shadow-xl shadow-black/40 cursor-pointer"
          >
            <Play size={26} className="fill-theme-onaccent text-theme-onaccent ml-1" />
          </button>
        </div>

        <div className="px-5">
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm font-semibold text-white/55">{meta}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.languages?.slice(0, 2).map((l) => <span key={l} className={badge}>{l}</span>)}
            <span className={badge}>HD</span>
            <span className={badge}>★ {item.rating}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/65 line-clamp-4">{description}</p>

          <div className="mt-5 flex items-center justify-around">
            <Action icon={isFav ? Check : Plus} label={t('home.myList', { defaultValue: 'My List' })} onClick={() => toggleFavorite(item)} on={isFav} />
            <Action icon={Star} label={`${item.rating}/10`} onClick={() => {}} />
            <Action icon={Share2} label={t('common.share', { defaultValue: 'Share' })} onClick={handleShare} />
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 border-b border-white/10">
            {tabs.map((x) => (
              <button
                key={x.key}
                onClick={() => setActiveTab(x.key)}
                className={`pb-2.5 text-sm font-bold -mb-px border-b-2 cursor-pointer transition-colors ${tab === x.key ? 'border-theme-accent text-white' : 'border-transparent text-white/45'}`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'episodes' && (
            <div className="mt-4 flex flex-col gap-4">
              {episodes.map((ep, i) => (
                <Link key={ep.id} to={`/watch/${item.id}/${ep.id}`} className="flex items-center gap-3">
                  <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-theme-darkCard shrink-0">
                    {ep.thumbnail && <img src={optimizeImageUrl(ep.thumbnail, 'card')} alt="" className="w-full h-full object-cover" loading="lazy" />}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="w-9 h-9 rounded-full bg-black/45 border border-white/40 flex items-center justify-center">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                      </span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{ep.number || i + 1}. {ep.title}</p>
                    {ep.duration ? <p className="text-xs text-white/50 mt-0.5">{Math.round(ep.duration / 60)}m</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === 'more' && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {related.map((r) => <CartoonCard key={r.id} item={r} />)}
            </div>
          )}

          {tab === 'details' && (
            <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-3 text-sm">
              <dt className="text-white/45">About</dt><dd className="text-white/80">{description}</dd>
              <dt className="text-white/45">Type</dt><dd>{isMovie ? 'Movie' : 'Show'}</dd>
              <dt className="text-white/45">Year</dt><dd>{item.year}</dd>
              <dt className="text-white/45">Genres</dt><dd>{(item.genres || []).join(', ')}</dd>
              <dt className="text-white/45">Languages</dt><dd>{(item.languages || []).join(', ')}</dd>
              <dt className="text-white/45">Rating</dt><dd>{item.rating}/10</dd>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
