import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { optimizeImageUrl } from '../utils/image';

const ContinueWatchingCard = ({ record }) => {
  const { t } = useTranslation();
  const { removeFromContinueWatching } = useApp();
  const navigate = useNavigate();

  const percentage = record.duration > 0 ? (record.progress / record.duration) * 100 : 0;

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromContinueWatching(record.showId);
  };

  const handleResume = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(record.episodeNumber ? `/watch/${record.showId}/${record.episodeId}` : `/watch/${record.showId}`);
  };

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const hoverAnimation = isTouch ? {} : { scale: 1.03, y: -4 };

  return (
    <motion.div
      whileHover={hoverAnimation}
      transition={{ duration: 0.2 }}
      className="relative w-full h-full rounded-premium bg-theme-cream border border-theme-coffee/10 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro overflow-hidden group select-none cursor-pointer flex flex-col justify-between"
    >
      <Link to={record.episodeNumber ? `/watch/${record.showId}/${record.episodeId}` : `/watch/${record.showId}`}>
        {/* Thumbnail Area */}
        <div className="relative aspect-[16/10] overflow-hidden bg-theme-coffee/5">
          <img
            src={optimizeImageUrl(record.showThumbnail, 'card')}
            alt={record.showTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 z-30 p-1 rounded-full bg-black/55 text-theme-cream hover:bg-black/80 hover:scale-105 transition-all duration-200"
            title="Remove from row"
          >
            <X size={14} />
          </button>

          {/* Play/Resume Hover overlay */}
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-25">
            <button
              onClick={handleResume}
              className="p-3 bg-theme-orange text-theme-cream rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200"
              title="Resume Episode"
            >
              <Play size={18} className="fill-theme-cream ml-0.5" />
            </button>
          </div>

          {/* Thin Netflix/Prime Video style orange progress bar along the bottom of thumbnail */}
          <div className="absolute bottom-0 inset-x-0 h-1 z-30 bg-black/60">
            <div 
              className="h-full bg-theme-orange transition-all duration-300"
              style={{ width: `${Math.max(5, Math.min(100, percentage))}%` }}
            />
          </div>
        </div>

        {/* Details Area */}
        <div className="p-3 flex flex-col gap-0.5 bg-theme-cream dark:bg-theme-darkCard">
          <h3 className="font-extrabold text-sm text-theme-coffee dark:text-theme-darkText truncate">
            {record.showTitle}
          </h3>
          {record.episodeNumber ? (
            <p className="text-[11px] text-theme-orange font-bold uppercase tracking-wider">
              {t('common.episodes')} {record.episodeNumber}
            </p>
          ) : (
            <p className="text-[11px] text-theme-orange font-bold uppercase tracking-wider">
              Movie
            </p>
          )}
          <p className="text-[11px] text-theme-coffee/50 dark:text-theme-darkText/40 truncate font-semibold">
            {record.episodeNumber ? record.episodeTitle : 'Resume Movie'}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ContinueWatchingCard;
