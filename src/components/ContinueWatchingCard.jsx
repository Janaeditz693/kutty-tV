import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';

const ContinueWatchingCard = ({ record }) => {
  const { t } = useTranslation();
  const { removeFromContinueWatching } = useApp();

  const percentage = record.duration > 0 ? (record.progress / record.duration) * 100 : 0;
  const minsLeft = record.duration > 0 ? Math.max(1, Math.round((record.duration - record.progress) / 60)) : null;
  const to = record.episodeNumber ? `/watch/${record.showId}/${record.episodeId}` : `/watch/${record.showId}`;

  const dismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromContinueWatching(record.showId);
  };

  return (
    <Link to={to} className="block w-full select-none group">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-theme-darkCard border border-white/10">
        <img src={optimizeImageUrl(record.showThumbnail, 'card')} alt={record.showTitle} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/25" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Play size={18} className="fill-white text-white ml-0.5" />
          </span>
        </span>
        <button
          onClick={dismiss}
          aria-label="Remove from row"
          className="absolute top-2 right-2 p-1 rounded-full bg-black/55 text-white hover:bg-black/80 cursor-pointer"
        >
          <X size={14} />
        </button>
        <div className="absolute bottom-2.5 inset-x-3 h-1.5 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-theme-accent to-pink-400" style={{ width: `${Math.max(5, Math.min(100, percentage))}%` }} />
        </div>
      </div>
      <p className="mt-2 text-sm font-bold text-theme-coffee dark:text-theme-darkText truncate">{record.showTitle}</p>
      <p className="text-xs font-semibold text-theme-coffee/55 dark:text-theme-darkText/55 truncate">
        {[record.episodeNumber ? `${t('common.episodes')} ${record.episodeNumber}` : t('common.movie', { defaultValue: 'Movie' }), minsLeft ? `${minsLeft}m left` : null].filter(Boolean).join(' · ')}
      </p>
    </Link>
  );
};

export default ContinueWatchingCard;
